
import React from 'react';
import { LightbulbIcon } from './icons/LightbulbIcon';
import { LoadingSpinner } from './LoadingSpinner'; 
import { ErrorDisplay } from './ErrorDisplay'; // Added

interface ProblemSuggestionScreenProps {
  suggestions: string[];
  onSelectProblem: (problem: string) => void;
  onManualInput: () => void;
  isLoading?: boolean; 
  error?: string | null; // Added
  clearError?: () => void; // Added
}

export const ProblemSuggestionScreen: React.FC<ProblemSuggestionScreenProps> = ({ 
    suggestions, 
    onSelectProblem, 
    onManualInput,
    isLoading,
    error,
    clearError
}) => {
  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error && clearError) {
    return <ErrorDisplay message={error} onClearError={clearError} />
  }

  if (!suggestions || suggestions.length === 0) {
    return (
      <div className="animate-fadeIn text-center">
        <LightbulbIcon className="w-16 h-16 text-purple-500 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold mb-4 text-slate-700">이런 고민은 어때요?</h2>
        <p className="text-slate-600 mb-6">제안할 고민거리를 찾지 못했어요. 직접 입력해주시겠어요?</p>
        <button
          onClick={onManualInput}
          className="w-full sm:w-auto bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold py-3 px-8 rounded-lg shadow-md transform hover:scale-105 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
        >
          직접 고민 입력하기
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      <div className="text-center mb-8">
        <LightbulbIcon className="w-16 h-16 text-purple-500 mx-auto mb-4 animate-pulse" />
        <h2 className="text-2xl font-semibold text-slate-700">이런 고민은 어때요?</h2>
        <p className="text-sm text-slate-600 mt-1">마음에 드는 고민을 선택하거나, 직접 입력할 수도 있어요.</p>
      </div>
      
      <div className="space-y-3 mb-8">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSelectProblem(suggestion)}
            className="w-full text-left p-4 bg-white/70 hover:bg-indigo-50/70 border border-slate-300 rounded-lg shadow-sm transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75 group"
          >
            <p className="text-slate-700 group-hover:text-indigo-600 transition-colors">{suggestion}</p>
          </button>
        ))}
      </div>

      <button
        onClick={onManualInput}
        className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transform hover:scale-105 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-50"
      >
        ✍️ 직접 고민 입력하기
      </button>
    </div>
  );
};