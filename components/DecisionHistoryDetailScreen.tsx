
import React from 'react';
import { SavedDecision, Question as QuestionType } from '../types'; // Ensure Question is imported if used directly here
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { TrashIcon } from './icons/TrashIcon';
import { LinkIcon } from './icons/LinkIcon';
import { HandThumbUpIcon } from './icons/HandThumbUpIcon';
import { InformationCircleIcon } from './icons/InformationCircleIcon';
import { ErrorDisplay } from './ErrorDisplay';

interface DecisionHistoryDetailScreenProps {
  item: SavedDecision;
  onDelete: () => void;
  onBackToList: () => void;
  error: string | null;
  clearError: () => void;
}

export const DecisionHistoryDetailScreen: React.FC<DecisionHistoryDetailScreenProps> = ({ 
    item, 
    onDelete, 
    onBackToList,
    error,
    clearError
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="animate-fadeIn space-y-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-700">결정 기록 상세보기</h2>
        <button
          onClick={onBackToList}
          aria-label="기록 목록으로 돌아가기"
          className="p-2 rounded-full hover:bg-slate-200/70 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
        >
          <ArrowLeftIcon className="w-6 h-6 text-slate-600" />
        </button>
      </div>

      {error && <ErrorDisplay message={error} onClearError={clearError} />}

      <div className="bg-white/50 p-4 sm:p-6 rounded-lg shadow-md border border-slate-200/70">
        <p className="text-xs text-slate-500 mb-1">저장일: {formatDate(item.savedAt)}</p>
        <h3 className="text-xl font-semibold text-indigo-700 mb-3">
          고민 내용:
        </h3>
        <p className="text-slate-700 whitespace-pre-wrap">{item.problemDescription}</p>
      </div>

      <div className="bg-white/50 p-4 sm:p-6 rounded-lg shadow-md border border-slate-200/70">
        <h3 className="text-xl font-semibold text-sky-700 mb-4">질문 및 답변:</h3>
        <ul className="space-y-4">
          {item.questions.map((q: QuestionType) => (
            <li key={q.id} className="text-sm">
              <p className="font-medium text-slate-600">{q.text}</p>
              <p className="text-indigo-600 pl-2">↪ {item.answers[q.id] || <span className="italic text-slate-400">답변 없음</span>}</p>
            </li>
          ))}
        </ul>
      </div>
      
      {/* Reusing parts of DecisionResultDisplay's structure for consistency */}
      <div className="bg-purple-50/40 p-4 sm:p-6 rounded-lg shadow-lg border border-purple-200/60">
        <h3 className="text-xl font-semibold text-purple-700 mb-3 text-center">마법사의 최종 결정</h3>
        
        {item.decisionData.decisionStrength && (
            <div className="bg-indigo-50/70 p-3 rounded-md shadow-sm text-center mb-4">
            <p className="text-xs text-slate-500 mb-0.5">마법사의 확신도</p>
            <p className="text-md font-semibold text-indigo-600">{item.decisionData.decisionStrength}</p>
            </div>
        )}

        <div className="bg-white/50 shadow-md p-4 rounded-md mb-4">
            <h4 className="text-lg font-medium text-indigo-600 mb-2">내린 결정은...</h4>
            <p className="text-slate-800 leading-relaxed">{item.decisionData.decision}</p>
        </div>

        <div className="bg-white/50 shadow-md p-4 rounded-md">
            <h4 className="text-lg font-medium text-sky-600 mb-2">결정 이유는...</h4>
            <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{item.decisionData.reasoning}</p>
        </div>

        {item.decisionData.pros && item.decisionData.pros.length > 0 && (
            <div className="bg-white/50 shadow-md p-4 rounded-md mt-4">
            <div className="flex items-center mb-2">
                <HandThumbUpIcon className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                <h4 className="text-lg font-medium text-green-600">👍 이 결정의 좋은 점</h4>
            </div>
            <ul className="space-y-1 list-inside text-sm">
                {item.decisionData.pros.map((pro, index) => (
                <li key={`pro-${index}`} className="text-slate-700 flex">
                    <span className="text-green-500 mr-1.5">✓</span>{pro}
                </li>
                ))}
            </ul>
            </div>
        )}

        {item.decisionData.cons && item.decisionData.cons.length > 0 && (
            <div className="bg-white/50 shadow-md p-4 rounded-md mt-4">
            <div className="flex items-center mb-2">
                <InformationCircleIcon className="w-5 h-5 text-orange-500 mr-2 flex-shrink-0" />
                <h4 className="text-lg font-medium text-orange-600">🤔 고려할 점</h4>
            </div>
            <ul className="space-y-1 list-inside text-sm">
                {item.decisionData.cons.map((con, index) => (
                <li key={`con-${index}`} className="text-slate-700 flex">
                    <span className="text-orange-500 mr-1.5">ⓘ</span>{con}
                </li>
                ))}
            </ul>
            </div>
        )}
        
        {item.decisionData.additionalInfo && (item.decisionData.additionalInfo.text || (item.decisionData.additionalInfo.sourceLinks && item.decisionData.additionalInfo.sourceLinks.length > 0)) && (
            <div className="bg-white/50 shadow-md p-4 rounded-md mt-4">
            <h4 className="text-lg font-medium text-teal-600 mb-2">✨ 추가 정보</h4>
            {item.decisionData.additionalInfo.text && (
                <p className="text-slate-700 mb-3 text-sm">{item.decisionData.additionalInfo.text}</p>
            )}
            {item.decisionData.additionalInfo.sourceLinks && item.decisionData.additionalInfo.sourceLinks.length > 0 && (
                <ul className="space-y-1.5 text-sm">
                {item.decisionData.additionalInfo.sourceLinks.map((link, index) => (
                    <li key={index} className="flex items-start">
                    <LinkIcon className="w-4 h-4 text-teal-500 mr-1.5 mt-0.5 flex-shrink-0" />
                    <a
                        href={link.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-teal-500 hover:text-teal-600 hover:underline transition-colors duration-200 break-all"
                        aria-label={`외부 링크: ${link.title || link.uri}`}
                    >
                        {link.title || link.uri}
                    </a>
                    </li>
                ))}
                </ul>
            )}
            </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0 sm:space-x-3 mt-6 pt-4 border-t border-slate-300/70">
        <button
          onClick={() => { if (error) clearError(); onDelete();}}
          className="w-full sm:w-auto flex items-center justify-center bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white font-semibold py-2.5 px-6 rounded-lg shadow-md transform hover:scale-105 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
        >
          <TrashIcon className="w-5 h-5 mr-2" />
          이 기록 삭제하기
        </button>
        <button
          onClick={onBackToList}
          className="w-full sm:w-auto flex items-center justify-center bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 text-white font-semibold py-2.5 px-6 rounded-lg shadow-md transform hover:scale-105 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-opacity-50"
        >
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          목록으로 돌아가기
        </button>
      </div>
    </div>
  );
};
