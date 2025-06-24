
import React, { useState } from 'react';
import { ArrowUturnLeftIcon } from './icons/ArrowUturnLeftIcon'; 
import { LightbulbIcon } from './icons/LightbulbIcon'; // For suggestion button
import { suggestDecisionProblems } from '../services/geminiService'; // Import the service

interface ProblemInputProps {
  onSubmit: (problem: string) => void;
  onBackToSuggestions?: () => void; 
}

export const ProblemInput: React.FC<ProblemInputProps> = ({ onSubmit, onBackToSuggestions }) => {
  const [problem, setProblem] = useState('');
  const [isGeneratingSuggestion, setIsGeneratingSuggestion] = useState(false);
  const [suggestionError, setSuggestionError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (problem.trim()) {
      onSubmit(problem);
    }
  };

  const handleGenerateSuggestion = async () => {
    setIsGeneratingSuggestion(true);
    setSuggestionError(null);
    try {
      const suggestions = await suggestDecisionProblems();
      if (suggestions && suggestions.length > 0) {
        setProblem(suggestions[0]); // Use the first suggestion
      } else {
        setSuggestionError("제안할 고민을 생성하지 못했어요. 직접 입력해주세요.");
      }
    } catch (e: any) {
      console.error("Error generating problem suggestion:", e);
      setSuggestionError(`고민 제안 생성 중 오류: ${e.message}`);
    } finally {
      setIsGeneratingSuggestion(false);
    }
  };

  return (
    <div className="animate-fadeIn">
      <h2 className="text-2xl font-semibold mb-6 text-center text-slate-700">어떤 고민이 있으신가요?</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="problem" className="block text-sm font-medium text-slate-600 mb-1">
            해결하고 싶은 고민을 자세히 적어주세요:
          </label>
          <textarea
            id="problem"
            value={problem}
            onChange={(e) => {
              setProblem(e.target.value);
              if (suggestionError) setSuggestionError(null); // Clear error on typing
            }}
            rows={4}
            className="w-full p-3 bg-white/70 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800 placeholder-slate-400 transition-colors duration-200"
            placeholder="예: 오늘 저녁 뭐 먹을지, 주말에 뭐 할지, 어떤 선물을 살지 등"
            required
            aria-describedby={suggestionError ? "suggestion-error-message" : undefined}
          />
        </div>

        <button
          type="button"
          onClick={handleGenerateSuggestion}
          disabled={isGeneratingSuggestion}
          className="flex items-center justify-center w-full text-sm font-medium text-purple-600 hover:text-purple-700 py-2.5 px-4 rounded-lg hover:bg-purple-100/70 border border-purple-300/70 hover:border-purple-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 disabled:opacity-60 disabled:cursor-not-allowed group shadow"
        >
          <LightbulbIcon className={`w-5 h-5 mr-2 ${isGeneratingSuggestion ? 'animate-spin' : 'group-hover:scale-110 transition-transform'}`} />
          {isGeneratingSuggestion ? "고민 생성 중..." : "✨ 고민 자동 생성"}
        </button>
        
        {suggestionError && (
            <p id="suggestion-error-message" className="text-xs text-red-600 mt-1 text-center bg-red-50/50 p-2 rounded-md">{suggestionError}</p>
        )}
        
        <div className="space-y-3 pt-2">
          <button
            type="submit"
            disabled={!problem.trim() || isGeneratingSuggestion}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
          >
            질문 받기
          </button>
          
          {onBackToSuggestions && (
             <button
              type="button"
              onClick={onBackToSuggestions}
              className="flex items-center justify-center w-full text-sm font-medium text-slate-600 hover:text-indigo-600 py-2.5 px-4 rounded-lg hover:bg-slate-100/80 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 group"
            >
              <ArrowUturnLeftIcon className="w-4 h-4 mr-2 group-hover:text-indigo-500 transition-colors" />
              다른 고민 제안 보기
            </button>
          )}
        </div>
      </form>
       <p className="text-slate-500 mt-6 text-xs text-center">
        고민을 자세히 적을수록 마법사가 더 정확한 질문을 할 수 있어요!
      </p>
    </div>
  );
};
