import React, { ReactNode, useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  type: string;
  content: string;
}

const ResultModal: React.FC<ModalProps> = ({ isOpen, type, content }) => {
  return (
    <div
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 transition-opacity duration-300 ${
        isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className={`p-4 text-center ${type === 'success' ? 'bg-[#e7fce3]': 'bg-[#fce3e3]'} rounded-lg shadow-md w-96`}>
        {content}
      </div>
    </div>
  );
};

export default ResultModal;
