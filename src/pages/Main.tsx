import React, { useState } from "react";
import Header from '../compnents/Header';

const Main: React.FC = () => {
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFileName(event.target.files[0].name);
    }
  };
  return(
    <>
      <Header />
      <div className="flex flex-col mt-14 items-center justify-center p-4">
        <h1 className="m-[15px] text-[25px] font-bold">Загрузить docx</h1>
        <label
          htmlFor="file-input"
          className="cursor-pointer px-6 py-3 text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:ring focus:ring-blue-300"
        >
          Выбрать файл
        </label>
        <input
          id="file-input"
          type="file"
          className="hidden"
          onChange={handleFileChange}
        />
        {fileName && (
          <p className="mt-4 text-gray-700">
            Выбранный файл: <span className="font-bold">{fileName}</span>
          </p>
        )}
    </div>
    </>
  );
}

export default Main;





