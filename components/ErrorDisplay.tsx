
import React from 'react';

interface ErrorDisplayProps {
  message: string;
  onClearError?: () => void;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message, onClearError }) => {
  return (
    <div className="bg-red-100/70 border border-red-300 text-red-700 px-6 py-4 rounded-lg relative animate-fadeIn" role="alert">
      <strong className="font-bold block mb-2">앗, 문제가 발생했어요!</strong>
      <span className="block sm:inline">{message}</span>
      {onClearError && (
        <button
          onClick={onClearError}
          className="mt-4 w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200"
        >
          확인 및 다시 시도
        </button>
      )}
    </div>
  );
};