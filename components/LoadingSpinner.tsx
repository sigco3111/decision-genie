
import React, { useState, useEffect } from 'react';

const loadingMessages = [
  "마법사가 열심히 생각하고 있어요! 🤔",
  "마법 구슬을 들여다보는 중... ✨",
  "별들의 속삭임을 듣고 있어요... 🌠",
  "운명의 실타래를 푸는 중... 엮엮",
  "결정의 묘약을 만들고 있어요... 🧪",
  "지혜의 바람을 모으는 중... 🌬️"
];

export const LoadingSpinner: React.FC = () => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentMessageIndex((prevIndex) => (prevIndex + 1) % loadingMessages.length);
    }, 2500); 

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="flex flex-col justify-center items-center p-10 text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500 mb-6"></div>
      <p className="text-lg text-slate-700 mb-2">잠시만 기다려주세요...</p>
      <p className="text-sm text-slate-600 min-h-[20px]">{loadingMessages[currentMessageIndex]}</p>
    </div>
  );
};