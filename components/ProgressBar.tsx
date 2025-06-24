
import React from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ current, total }) => {
  const percentage = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className="w-full px-1">
      <div className="flex justify-between mb-1 text-xs sm:text-sm">
        <span className="font-medium text-indigo-600">진행률</span>
        <span className="font-medium text-slate-500">{current} / {total}</span>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-2.5 shadow-inner">
        <div
          className="bg-gradient-to-r from-indigo-500 to-fuchsia-500 h-2.5 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={current}
          aria-valuemin={0}
          aria-valuemax={total}
          aria-label={`질문 ${current}개 중 ${total}개 답변 완료`}
        ></div>
      </div>
    </div>
  );
};