import React, { useRef, useState } from "react";
import mammoth from "mammoth";
import Header from '../compnents/Header';
import ResultModal from "../modal/ResultModal";
import TestingProcess from "./TestingProcess";

interface Questions {
  id: number;
  question: string;
  variants: string[];
}

interface MammothImage {
    contentType: string; // MIME-тип изображения, например, "image/png"
    readAsArrayBuffer(): Promise<ArrayBuffer>; // Чтение изображения как ArrayBuffer
    readAsBuffer(): Promise<Buffer>; // Чтение изображения как Buffer (Node.js)
    readAsBase64String(): Promise<string>; // Чтение изображения как Base64-строка
    read(encoding?: string): Promise<string | Buffer>; // Устаревший метод
}

const Main: React.FC = () => {
  const [questions, setQuestions] = useState<Questions []>([]);
  const [readyQuestions, setReadyQuestions] = useState<Questions []>([]);
  const [fileContent, setFileContent] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingResult, setLoadingResult] = useState<string>('');
  const [typeResult, setTypeResult] = useState<string>('');
  const [selectCount, setSelectCount] = useState<number>(20);
  const [entryCount, setEntryCount] = useState(false);
  const inputCountRef = useRef<HTMLInputElement | null>(null);
  const [testReady, setTestReady] = useState(false);

  const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEntryCount(false);
    setSelectCount(parseInt(event.target.value));
  }
  const handleEntryCount = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEntryCount(true);
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFileContent('');
    const file = event.target.files?.[0];
    if (file) {
      if (file?.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        openModal(`Файл "${file.name}" был успешно загружен`, 'success');
        const reader = new FileReader();
        reader.onload = async (e) => {
          const arrayBuffer = reader.result as ArrayBuffer;
          /* ----- Логика формирования объекта со всеми вопросами с ответами (c изображением) через метод mammoth.convertToHtml() ----- */
          const imageHandler = async (image: MammothImage) => {
            return image.readAsBase64String().then((imageBuffer: string) => {
              return {
                src: `data:${image.contentType};base64,${imageBuffer}`,
                alt: "Embedded image"
              }
            })
          }
          const result = await mammoth.convertToHtml({ arrayBuffer }, { convertImage: mammoth.images.imgElement(imageHandler) });
          const text = result.value;
          const textWithImages = text.replace(/<p>\s*<\/p>/g, "").replace(/<(?!img\b)[^>]*>/g, "").replace(/&(gt|lt);/g, (match, p1) => {
            return p1 === "gt" ? ">" : "<";
          });
          console.log(textWithImages); // &lt;question&gt; | &lt;variant&gt;
          if (textWithImages.includes('<question>') || textWithImages.includes('<variant>')) {
            const splitQuestions = textWithImages.split('<question>');
            const questionsResult = splitQuestions.slice(1).map((row, index) => {
              const splitVariants = row.split('<variant>');
              return {
                id: index,
                question: splitVariants[0],
                variants: splitVariants.slice(1),
              };
            });
            console.log(questionsResult);
            setQuestions(questionsResult);
          }
          else {
            return openModal(`Загруженный файл не является тестом, либо данный тип теста не поддерживается системой`, 'error');
          }
          setFileContent(textWithImages);
          /* -------------------- */ 
        }
        reader.readAsArrayBuffer(file);
      }
      else {
        return openModal('Загрузите файл типа .docx', 'error');
      }
    }
  };
  /* ----- Функция подготовки вопросов с вариантами ответов ----- */
  const startTest = () => {
    let _selectCount = selectCount;
    /* ----- Проверка на корректный диапазон введенного кол-во ----- */
    if (entryCount) {
      if (inputCountRef.current) {
        if (parseInt(inputCountRef.current.value) > questions.length) {
          return openModal('Введенное кол-во превышает общее кол-во вопросов в тесте', 'error');
        }
        else {
          _selectCount = parseInt(inputCountRef.current.value);
        }
      }
      else {
        return openModal('Ошибка при определении элемента в методе startTest', 'error');
      }
    }
    /* -------------------- */ 
    if (questions) {
      let selectedQuestion = [];
      /* ----- Функция перемешивания элементов массива ----- */
      const shuffleArray = (array: string[]) => {
        for (let i = array.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1)); // случайный индекс от 0 до i
          [array[i], array[j]] = [array[j], array[i]]; // меняем местами элементы
        }
        return array;
      }
      /* -------------------- */
      for (let i = 0; i < _selectCount; i++) {
        selectedQuestion.push(questions[Math.floor(Math.random() * (questions.length + 1))])
      }
      const createReadyQuestions = selectedQuestion.map((el) => {
        if (!el || !el.variants) {
          console.error("Неккоректный объект вопросов", el);
        }
        return {...el, variants: shuffleArray(el.variants)}
      });
      setReadyQuestions(createReadyQuestions);
      console.log(createReadyQuestions);
      setTestReady(true);
    }
    else {
      return openModal('Ошибка при формировании вопросов, либо данный тип теста не поддерживается системой', 'error');
    }
  }
  /* -------------------- */
  /* ----- Логика отображения модального окна ----- */
  const openModal = (mess: | string, type: | string) => {
    setTypeResult(type);
    setLoadingResult(mess);
    setIsModalOpen(true);
    setTimeout(() => {
      setIsModalOpen(false);
    }, 5000);
  }
  /* -------------------- */
  const uploadFile = () => {
    return (
      <input id="file-input" type="file" accept=".docx" className="hidden" onChange={handleFileChange} />
    )
  }
  return(
    <>
      <Header />
      <div className="flex flex-col mt-14 items-center justify-center p-4">
      {(!fileContent && testReady === false) ? (
        <>
        <div className="h-50 pr-2 bg-black bg-opacity-5 transition-colors rounded-xl overflow-auto max-h-[500px]">
          <h1 className="m-[15px] text-[25px] font-bold">Загрузить .docx</h1>
          <label
            htmlFor="file-input"
            className="cursor-pointer px-6 py-3 text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:ring focus:ring-blue-300">
              Выбрать файл
          </label>
          {uploadFile()}
        </div>
        </>
        ) : (fileContent && testReady === false) ? (
          <>
          <div className="h-50 pr-2 bg-black bg-opacity-5 transition-colors rounded-xl overflow-auto max-h-[500px]">
            <h1 className="m-[15px] text-[25px] font-bold">Выберите кол-во вопросов</h1>
            <div className="p-[6px] text-[18px]">
              <div className="m-[4px]">
                <input type="radio" name="selectCount" id="10" value={10} onChange={handleRadioChange} checked={(selectCount === 10) && !entryCount} className="m-[5px]" />
                <label htmlFor="10">10 вопросов</label>
              </div>
              <div className="m-[4px]">
                <input type="radio" name="selectCount" id="20" value={20} onChange={handleRadioChange} checked={(selectCount === 20) && !entryCount} className="m-[5px]" />
                <label htmlFor="20">20 вопросов</label>
              </div>
              <div className="m-[4px]">
                <input type="radio" name="selectCount" id="30" value={30} onChange={handleRadioChange} checked={(selectCount === 30) && !entryCount} className="m-[5px]" />
                <label htmlFor="30">30 вопросов</label>
              </div>
              <div className="m-[4px]">
                <input type="radio" name="selectCount" id="40" value={40} onChange={handleRadioChange} checked={(selectCount === 40) && !entryCount} className="m-[5px]" />
                <label htmlFor="40">40 вопросов</label>
              </div>
              <div className="m-[4px]">
                <input type="radio" name="selectCount" id="inputCount" onChange={handleEntryCount} checked={entryCount} className="m-[5px]" />
                <label htmlFor="inputCount">Своё кол-во: </label>
                <input type="number" id="inputCount" ref={inputCountRef} className="m-[5px] border border-gray-300 rounded p-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 outline-none disabled:bg-gray-100 disabled:border-gray-400 disabled:text-gray-500 disabled:cursor-not-allowed transition-all duration-300 ease-in-out" disabled={!entryCount} />
              </div>
              <div className="m-[4px]">
                <input type="radio" name="selectCount" id={questions.length+""} value={questions.length} onChange={handleRadioChange} checked={(selectCount === questions.length) && !entryCount} className="m-[5px]" />
                <label htmlFor={questions.length+""}>Все вопросы ({questions.length})</label>
              </div>
            </div>
            <div className="m-[10px]">
              <button onClick={startTest} className="mb-[15px] w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold py-2 px-6 rounded-lg shadow-lg transform transition duration-300 hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-indigo-300">Начать тест</button>
              <label htmlFor="file-input" className="mt-[15px] w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold py-2 px-6 rounded-lg shadow-lg transform transition duration-300 hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-indigo-300">Перевыбрать .docx</label>
              {uploadFile()}
            </div>
          </div>
          </>
        ) : (fileContent && testReady === true) ? (
          <div className="w-full mt-4 text-gray-700 bg-black bg-opacity-5 p-4 rounded-xl overflow-auto max-h-[500px]">
            <TestingProcess readyQuestions={readyQuestions} />
          </div>
        ) : (
          <span>Вернитесь на главную страницу для загрузки теста</span>
        )
    }
    </div>
    {isModalOpen &&
      <ResultModal isOpen={isModalOpen} type={typeResult} content={loadingResult}/>
    }
    </>
  );
}

export default Main;