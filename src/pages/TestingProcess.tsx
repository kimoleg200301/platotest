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
    </>
  )
}

export default TestingProcess;