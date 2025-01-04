import React, { useState } from "react";
import mammoth from "mammoth";
import Header from '../compnents/Header';
import ResultModal from "../modal/ResultModal";

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
  const [fileName, setFileName] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Questions []>([]);
  const [fileContent, setFileContent] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingResult, setLoadingResult] = useState<string>('');
  const [typeResult, setTypeResult] = useState<string>('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFileName('');
    setFileContent('');
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      if (file?.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        openModal(`Файл ${file.name} был успешно загружен`, 'success');
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
            openModal(`Загруженный файл не является тестом`, 'error');
          }
          setFileContent(textWithImages);
          /* -------------------- */ 
        }
        reader.readAsArrayBuffer(file);
      }
      else {
        openModal('Загрузите файл типа .docx', 'error');
        setFileContent('');
      }
    }
  };
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
  return(
    <>
      <Header />
      <div className="flex flex-col mt-14 items-center justify-center p-4">
        <h1 className="m-[15px] text-[25px] font-bold">Загрузить .docx</h1>
        <label
          htmlFor="file-input"
          className="cursor-pointer px-6 py-3 text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:ring focus:ring-blue-300">
            Выбрать файл
        </label>
        <input id="file-input" type="file" accept=".docx" className="hidden" onChange={handleFileChange}
        />
        {fileContent && (
          <>
          <p className="mt-4 text-gray-700">
            Выбранный файл: <span className="font-bold">{fileName}</span>
          </p>
          {questions.map((q) => (
            <div key={q.id} className="w-full mt-4 text-gray-700 bg-gray-100 p-4 rounded-lg overflow-auto max-h-[500px]">
            <strong>
              {q.question.includes("<img")
              ? (
                <span dangerouslySetInnerHTML={{ __html: q.question }}></span>
              ) : (
                q.question
              )}
            </strong>
            <ul>
              {q.variants.map((variant, index) => (
                <li key={index}>
                  {variant.includes("<img") 
                  ? (
                    <span dangerouslySetInnerHTML={{ __html: variant }}></span>  
                  ) : (
                    variant
                  )}
                </li>
              ))}
            </ul>
          </div>
          ))}
          </>
        )}
    </div>
    {isModalOpen &&
      <ResultModal isOpen={isModalOpen} type={typeResult} content={loadingResult}/>
    }
    </>
  );
}

export default Main;





