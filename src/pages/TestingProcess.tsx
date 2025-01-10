import React, { useState } from "react";

interface Questions {
  id: number;
  question: string;
  variants: string[];
}

interface MassQuestions {
  readyQuestions: Questions[];
}

const TestingProcess: React.FC<MassQuestions> = ({ readyQuestions }) => {
  const [selectedQuestion, setSelectedQuestion] = useState<number>(0);
  const [selectedVariant, setSelectedVariant] = useState<number>(0);

  const handleSelectQuestion = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedQuestion(parseInt(event.target.value));
  }
  const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedVariant(parseInt(event.target.value));
  }

  return (
    <>
      <div>
        <select id="selectQuestion" onChange={handleSelectQuestion}>
          {readyQuestions.map((el, index) => (
            <option key={index} value={index}>Вопрос {index}</option>
          ))}
        </select>
      </div>
      <div>
        {readyQuestions.map((question, questionIndex) => questionIndex === selectedQuestion && (
          <div key={questionIndex}>
            <h1 className="text-[23px] font-bold">
              {question.question.includes("<img") ? (
                <span dangerouslySetInnerHTML={{ __html: question.question }}></span>
              ) : (
                question.question
              )}
            </h1>
            {question.variants.map((variant, variantIndex) => (
              <>
                <div key={variantIndex} className="m-[4px]">
                  <input type="radio" id={variantIndex+""} value={variantIndex} onChange={handleRadioChange} checked={selectedVariant === variantIndex} className="m-[5px]" />
                  <label htmlFor={variantIndex+""}>
                    {variant.includes("<img") ? (
                      <span dangerouslySetInnerHTML={{ __html: variant }}></span>
                    ) : (
                      variant
                    )}
                  </label>
                </div>
              </>
            ))}
          </div>
        ))}
      </div>
      {/* {fileContent && (
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
          )} */}
    </>
  )
}

export default TestingProcess;