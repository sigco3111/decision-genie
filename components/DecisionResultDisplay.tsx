
import React, { useState } from 'react';
import { DecisionData } from '../types';
import { SparklesIcon } from './icons/SparklesIcon';
import { LinkIcon } from './icons/LinkIcon'; 
import { ChatBubbleLeftRightIcon } from './icons/ChatBubbleLeftRightIcon';
import { HandThumbUpIcon } from './icons/HandThumbUpIcon'; 
import { InformationCircleIcon } from './icons/InformationCircleIcon'; 
import { ArchiveBoxArrowDownIcon } from './icons/ArchiveBoxArrowDownIcon'; // New Icon

interface DecisionResultDisplayProps {
  decisionData: DecisionData;
  onReset: () => void;
  onRegenerate: () => void;
  canRegenerate: boolean;
  onFollowUpSubmit: (followUpText: string) => Promise<void>;
  followUpAnswer: string | null;
  isAskingFollowUp: boolean;
  followUpError: string | null;
  followUpInteractionCount: number;
  maxFollowUps: number;
  clearFollowUpError: () => void;
  onSaveDecision: () => void; // New prop
  isDecisionSaved: boolean; // New prop
}

export const DecisionResultDisplay: React.FC<DecisionResultDisplayProps> = ({ 
  decisionData, 
  onReset, 
  onRegenerate, 
  canRegenerate,
  onFollowUpSubmit,
  followUpAnswer,
  isAskingFollowUp,
  followUpError,
  followUpInteractionCount,
  maxFollowUps,
  clearFollowUpError,
  onSaveDecision,
  isDecisionSaved
}) => {
  const [followUpText, setFollowUpText] = useState('');

  const handleFollowUpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFollowUpText(e.target.value);
    if (followUpError) {
      clearFollowUpError();
    }
  };

  const handleFollowUpFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (followUpText.trim() && !isAskingFollowUp && followUpInteractionCount < maxFollowUps) {
      await onFollowUpSubmit(followUpText);
      setFollowUpText(''); 
    }
  };

  const canAskMoreFollowUps = followUpInteractionCount < maxFollowUps;

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="text-center">
        <SparklesIcon className="w-16 h-16 text-purple-500 mx-auto mb-4 animate-bounce" />
        <h2 className="text-3xl font-bold text-slate-800">마법사의 결정!</h2>
      </div>

      {decisionData.decisionStrength && (
        <div className="bg-indigo-50/70 p-4 rounded-lg shadow-md text-center">
          <p className="text-sm text-slate-600 mb-1">마법사의 확신도</p>
          <p className="text-lg font-bold text-indigo-600">{decisionData.decisionStrength}</p>
        </div>
      )}

      <div className="bg-white/50 shadow-lg p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-indigo-600 mb-3">내린 결정은...</h3>
        <p className="text-2xl text-slate-800 leading-relaxed font-medium">{decisionData.decision}</p>
      </div>

      <div className="bg-white/50 shadow-lg p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-sky-600 mb-3">결정 이유는...</h3>
        <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{decisionData.reasoning}</p>
      </div>

      {decisionData.pros && decisionData.pros.length > 0 && (
        <div className="bg-white/50 shadow-lg p-6 rounded-lg">
          <div className="flex items-center mb-3">
            <HandThumbUpIcon className="w-6 h-6 text-green-500 mr-2 flex-shrink-0" />
            <h3 className="text-xl font-semibold text-green-600">👍 이 결정의 좋은 점</h3>
          </div>
          <ul className="space-y-2 list-inside">
            {decisionData.pros.map((pro, index) => (
              <li key={`pro-${index}`} className="text-slate-700 text-sm flex">
                <span className="text-green-500 mr-2">✓</span>
                {pro}
              </li>
            ))}
          </ul>
        </div>
      )}

      {decisionData.cons && decisionData.cons.length > 0 && (
        <div className="bg-white/50 shadow-lg p-6 rounded-lg">
          <div className="flex items-center mb-3">
            <InformationCircleIcon className="w-6 h-6 text-orange-500 mr-2 flex-shrink-0" />
            <h3 className="text-xl font-semibold text-orange-600">🤔 고려할 점</h3>
          </div>
          <ul className="space-y-2 list-inside">
            {decisionData.cons.map((con, index) => (
              <li key={`con-${index}`} className="text-slate-700 text-sm flex">
                <span className="text-orange-500 mr-2">ⓘ</span>
                {con}
              </li>
            ))}
          </ul>
        </div>
      )}

      {decisionData.additionalInfo && (decisionData.additionalInfo.text || (decisionData.additionalInfo.sourceLinks && decisionData.additionalInfo.sourceLinks.length > 0)) && (
        <div className="bg-white/50 shadow-lg p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-teal-600 mb-3">✨ 추가 정보</h3>
          {decisionData.additionalInfo.text && (
            <p className="text-slate-700 mb-4 text-sm">{decisionData.additionalInfo.text}</p>
          )}
          {decisionData.additionalInfo.sourceLinks && decisionData.additionalInfo.sourceLinks.length > 0 && (
            <ul className="space-y-2">
              {decisionData.additionalInfo.sourceLinks.map((link, index) => (
                <li key={index} className="flex items-start">
                  <LinkIcon className="w-4 h-4 text-teal-500 mr-2 mt-1 flex-shrink-0" />
                  <a
                    href={link.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-500 hover:text-teal-600 hover:underline transition-colors duration-200 text-sm break-all"
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

      <div className="bg-sky-50/50 border border-sky-200/70 p-6 rounded-lg shadow-lg">
        <div className="flex items-center mb-4">
          <ChatBubbleLeftRightIcon className="w-6 h-6 text-sky-500 mr-3"/>
          <h3 className="text-xl font-semibold text-sky-600">결정에 대해 더 궁금한 점이 있나요?</h3>
        </div>
        
        {followUpAnswer && (
          <div className="mb-4 p-3 bg-sky-100/50 rounded-md">
            <p className="text-sm font-semibold text-sky-700 mb-1">마법사의 답변:</p>
            <p className="text-slate-700 text-sm whitespace-pre-wrap">{followUpAnswer}</p>
          </div>
        )}

        {isAskingFollowUp && (
          <div className="flex items-center text-sm text-slate-600 mb-3">
            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-sky-500 mr-2"></div>
            마법사가 답변을 준비 중입니다...
          </div>
        )}

        {followUpError && (
          <p role="alert" className="text-xs text-red-600 bg-red-100/70 p-2 rounded-md mb-3">
            {followUpError}
          </p>
        )}
        
        {canAskMoreFollowUps && (
          <form onSubmit={handleFollowUpFormSubmit} className="space-y-3">
            <div>
              <label htmlFor="followUpQuestion" className="sr-only">후속 질문 입력</label>
              <input
                type="text"
                id="followUpQuestion"
                value={followUpText}
                onChange={handleFollowUpChange}
                placeholder="예: 그 결정의 다른 대안은 없을까요?"
                className="w-full p-2.5 bg-white/70 border border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 text-slate-800 placeholder-slate-500 text-sm"
                disabled={isAskingFollowUp}
              />
            </div>
            <button
              type="submit"
              disabled={!followUpText.trim() || isAskingFollowUp || !canAskMoreFollowUps}
              className="w-full sm:w-auto bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white font-semibold py-2 px-5 rounded-lg shadow-md disabled:opacity-60 disabled:cursor-not-allowed text-sm transform hover:scale-105 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-50"
            >
              {isAskingFollowUp ? "질문 중..." : `질문하기 (${followUpInteractionCount}/${maxFollowUps})`}
            </button>
          </form>
        )}
         {!canAskMoreFollowUps && followUpInteractionCount > 0 && (
            <p className="text-xs text-slate-500 text-center mt-3">
                모든 후속 질문 기회를 사용했어요.
            </p>
        )}
      </div>

      <div className="border-t border-slate-200/80 pt-6 space-y-3">
        <button
            onClick={onSaveDecision}
            disabled={isDecisionSaved}
            className={`w-full flex items-center justify-center font-semibold py-3 px-6 rounded-lg shadow-md transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-opacity-50
                        ${isDecisionSaved 
                            ? 'bg-green-500 text-white cursor-default focus:ring-green-400' 
                            : 'bg-gradient-to-r from-lime-500 to-emerald-500 hover:from-lime-600 hover:to-emerald-600 text-white transform hover:scale-105 focus:ring-lime-500'}`}
        >
            <ArchiveBoxArrowDownIcon className={`w-5 h-5 mr-2 ${isDecisionSaved ? '' : 'group-hover:animate-bounce'}`} />
            {isDecisionSaved ? "이 결정 저장됨" : "이 결정 저장하기"}
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={onRegenerate}
            disabled={!canRegenerate}
            className="w-full bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-600 hover:to-sky-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
          >
            {canRegenerate ? "다른 결정 제안받기" : "더 이상 다른 제안이 없어요"}
          </button>
          <button
            onClick={onReset}
            className="w-full bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md transform hover:scale-105 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-opacity-50"
          >
            새로운 고민 상담하기
          </button>
        </div>
      </div>
       {!canRegenerate && decisionData.decisionStrength && (
         <p className="text-xs text-slate-600 text-center mt-2">
            마법사가 이미 최선을 다해 다른 제안까지 고려했어요!
         </p>
       )}
    </div>
  );
};