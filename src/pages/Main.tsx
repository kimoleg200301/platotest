import React, { useState } from "react";
import mammoth from "mammoth";
import Header from '../compnents/Header';
import ResultModal from "../modal/ResultModal";
import JSZip = require("jszip");
import { BaseObject } from "styled-components/dist/types";

interface Questions {
  id: number;
  question: string;
  variants: string[];
}
interface ImageFile {
  type: "image";
  content: string;
  index: number;
  data: string;
}

const Main: React.FC = () => {
  const [fileName, setFileName] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Questions []>([]);
  const [fileContent, setFileContent] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingResult, setLoadingResult] = useState<string>('');
  const [typeResult, setTypeResult] = useState<string>('');
  const [images, setImages] = useState<ImageFile[]>([]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setImages([]);
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
          /* ----- Вытаскиваем изображения с помощью JSZip ----- */
          const zip = await JSZip.loadAsync(arrayBuffer);
          const mediaFiles = zip.folder('word/media');
          const images = [];
          if (mediaFiles) {
            const filePromises: Promise<ImageFile>[] = [];
            let imageIndex = 0;

            mediaFiles.forEach((relativePath, file) => {
              filePromises.push(
                file.async("base64").then((base64Data) => ({
                  type: "image",
                  content: relativePath,
                  index: imageIndex++,
                  data: `data:image/png;base64,${base64Data}`,
                }))
              );
            });

            const resolvedImages = await Promise.all(filePromises);
            images.push(...resolvedImages);
            setImages(images);
          }
          /* -------------------- */
          /* ----- Логика формирования объекта со всеми вопросами с ответами (только текст) ----- */
          const result = await mammoth.extractRawText({ arrayBuffer });
          const text = result.value;
          if (text.includes('<question>') || text.includes('<variant>')) {
            const splitQuestions = text.split('<question>');
            const questionsResult = splitQuestions.slice(1).map((row, index) => {
              const splitVariants = row.split('<variant>');
              return {
                id: index,
                question: splitVariants[0],
                variants: splitVariants.slice(1),
              };
            });
            console.log(questionsResult);
            console.log(images);
            setQuestions(questionsResult);
          }
          else {
            openModal(`Загруженный файл не является тестом`, 'error');
          }
          /* -------------------- */   
          /* ----- Логика формирования объекта со всеми вопросами с ответами (c изображением) через метод mammoth.convertToHtml() ----- */

          /* -------------------- */ 
          setFileContent(text);
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
          <pre className="w-full mt-4 text-gray-700 bg-gray-100 p-4 rounded-lg overflow-auto max-h-[500px]">
            {questions.map((q) => (
              <div key={q.id}>
              <strong>{q.question}</strong>
              <ul>
                {q.variants.map((variant, index) => (
                  <li key={index}>{variant}</li>
                ))}
              </ul>
            </div>
            ))}
          </pre>
          {/* {images.map((q) => {
            <img src={q.data} />
          })} */}
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





