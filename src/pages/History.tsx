import React, { useState } from "react";
import Header from '../compnents/Header';

const History: React.FC = () => {
  return(
    <>
      <Header />
      <div className="flex flex-col mt-14 items-center justify-center p-4">
        <h1 className="m-[15px] text-[25px] font-bold">История тестов</h1>
    </div>
    </>
  );
}

export default History;





