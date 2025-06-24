
import React from 'react';
import { SparklesIcon } from './icons/SparklesIcon';
import { APP_TITLE } from '../constants';
import { ClockHistoryIcon } from './icons/ClockHistoryIcon'; // New Icon

interface WelcomeScreenProps {
  onStart: () => void;
  onShowHistory?: () => void; // Optional: To show history button
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart, onShowHistory }) => {
  return (
    <div className="text-center p-6 rounded-lg animate-fadeIn">
      <SparklesIcon className="w-20 h-20 text-purple-500 mx-auto mb-6 animate-pulse" />
      <h2 className="text-4xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
        {APP_TITLE}
      </h2>
      <p className="text-slate-700 mb-8 text-lg">
        혼자 결정하기 어려운 고민이 있나요? <br />
        제가 몇 가지 질문을 통해 당신에게 꼭 맞는 결정을 내려줄게요!
      </p>
      <div className="space-y-4 flex flex-col items-center">
        <button
          onClick={onStart}
          className="w-full max-w-xs bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold py-3 px-8 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 text-lg"
          aria-label="결정 마법 시작하기"
        >
          마법 시작하기 ✨
        </button>
        {onShowHistory && (
          <button
            onClick={onShowHistory}
            className="w-full max-w-xs mt-3 flex items-center justify-center bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold py-3 px-8 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50 text-lg"
            aria-label="나의 결정 기록 보기"
          >
            <ClockHistoryIcon className="w-5 h-5 mr-2" />
            나의 결정 기록 보기
          </button>
        )}
      </div>
       <p className="text-slate-600 mt-8 text-sm">
        먼저 어떤 고민인지 알려주세요. <br/> 마법사가 질문을 준비해드릴게요!
      </p>
    </div>
  );
};