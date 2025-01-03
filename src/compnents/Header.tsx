import React from "react";

const Header: React.FC = () => {
  return(
    <div className="fixed top-0 left-0 w-full h-14 flex items-center justify-between bg-white p-4 shadow-md z-40 select-none">
      {/* Логотип */}
      <div className='p-[6px] animate-fadeIn text-black text-xl font-bold h-50 pr-2 bg-black bg-opacity-0 hover:bg-opacity-5 transition-colors duration-150 cursor-pointer rounded-[10px]'>
        <a href='/'><span>Platotest</span></a>
      </div>

      {/* User */}
      <div>
        <a className='text-gray-500 text-md font-bold inline-block m-[15px]' href="/">Главная</a>
        <a className='text-gray-500 text-md font-bold inline-block m-[15px]' href="/history">История тестов</a>
      </div>
    </div>
  );
}

export default Header;







