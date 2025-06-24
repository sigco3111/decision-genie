
import React, { useState, useEffect, useRef } from 'react';
import { Question } from '../types';
import { CheckIcon } from './icons/CheckIcon';
import { ProgressBar } from './ProgressBar';
import { PlusCircleIcon } from './icons/PlusCircleIcon';

interface QuestionnaireProps {
  questions: Question[];
  onSubmit: (answers: Record<string, string>) => void;
  onAddAdditionalQuestion: () => Promise<void>;
  isAddingQuestion: boolean;
  canAddMoreDynamicQuestions: boolean;
  maxDynamicQuestions: number;
  dynamicQuestionAddCount: number;
  addQuestionError: string | null;
  clearAddQuestionError: () => void;
}

export const Questionnaire: React.FC<QuestionnaireProps> = ({ 
  questions, 
  onSubmit,
  onAddAdditionalQuestion,
  isAddingQuestion,
  canAddMoreDynamicQuestions,
  maxDynamicQuestions,
  dynamicQuestionAddCount,
  addQuestionError,
  clearAddQuestionError
}) => {
  const [currentAnswers, setCurrentAnswers] = useState<Record<string, string>>({});
  const [answeredCount, setAnsweredCount] = useState(0);
  const lastQuestionRef = useRef<HTMLFieldSetElement>(null);
  const isInitialRenderDoneRef = useRef(false); 
  const prevQuestionsLengthRef = useRef(0);

  useEffect(() => {
    const initialAnswers: Record<string, string> = {};
    questions.forEach(q => {
      if (currentAnswers[q.id]) {
        initialAnswers[q.id] = currentAnswers[q.id];
      }
    });
    setCurrentAnswers(initialAnswers);
    const count = questions.filter(q => initialAnswers[q.id] !== undefined && initialAnswers[q.id] !== '').length;
    setAnsweredCount(count);
  // eslint-disable-next-line react-hooks/exhaustive-deps 
  }, [questions]);

  useEffect(() => {
    const count = Object.keys(currentAnswers).filter(key => currentAnswers[key] !== '').length;
    setAnsweredCount(count);
  }, [currentAnswers]);

  useEffect(() => {
    if (lastQuestionRef.current && questions.length > 0) {
      if (isInitialRenderDoneRef.current && questions.length > prevQuestionsLengthRef.current) {
        setTimeout(() => {
          lastQuestionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }, 100);
      }
    }
    if (!isInitialRenderDoneRef.current && questions.length > 0) {
      isInitialRenderDoneRef.current = true;
    }
    prevQuestionsLengthRef.current = questions.length;
  }, [questions.length]);

  const handleAnswerChange = (questionId: string, answer: string) => {
    setCurrentAnswers(prev => ({ ...prev, [questionId]: answer }));
    if (addQuestionError) clearAddQuestionError();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (answeredCount === questions.length) {
      onSubmit(currentAnswers);
    }
  };
  
  const handleAddQuestionClick = async () => {
    if (addQuestionError) clearAddQuestionError();
    await onAddAdditionalQuestion();
  };

  if (!questions || questions.length === 0) {
    return <p className="text-center text-slate-600">질문을 불러오는 중이거나, 생성된 질문이 없습니다.</p>;
  }

  const allAnswered = answeredCount === questions.length;
  
  return (
    <div className="animate-fadeIn">
      <h2 className="text-2xl font-semibold mb-2 text-center text-slate-700">몇 가지 질문에 답해주세요</h2>
      <p className="text-sm text-slate-600 text-center mb-6">결정 마법사가 최적의 선택을 할 수 있도록 도와주세요.</p>
      
      <ProgressBar current={answeredCount} total={questions.length} />

      <form onSubmit={handleSubmit} className="space-y-8 mt-8">
        {questions.map((question, index) => (
          <fieldset 
            key={question.id} 
            className="p-4 border border-slate-300 rounded-lg shadow-sm bg-white/30"
            ref={index === questions.length - 1 ? lastQuestionRef : null}
          >
            <legend className="text-lg font-medium text-slate-700 px-2">
              질문 {index + 1}: {question.text}
            </legend>
            <div className="mt-4 space-y-3">
              {question.options.map((option, optionIndex) => {
                const isSelected = currentAnswers[question.id] === option;
                return (
                  <label
                    key={optionIndex}
                    className={`group flex items-center p-3 rounded-md border transition-all duration-200 cursor-pointer ${
                      isSelected
                      ? 'bg-indigo-600 border-indigo-500 ring-2 ring-indigo-300 shadow-lg'
                      : 'bg-slate-100 border-slate-300 hover:bg-indigo-50 hover:border-indigo-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name={question.id}
                      value={option}
                      checked={isSelected}
                      onChange={() => handleAnswerChange(question.id, option)}
                      className="opacity-0 w-0 h-0 absolute"
                      aria-labelledby={`${question.id}-option-${optionIndex}`}
                    />
                    {isSelected && <CheckIcon className="w-5 h-5 text-white mr-3 flex-shrink-0" />}
                    {!isSelected && <span className="w-5 h-5 mr-3 border-2 border-slate-400 rounded-full flex-shrink-0 inline-block group-hover:border-indigo-500"></span>}
                    <span id={`${question.id}-option-${optionIndex}`} className={`text-sm ${isSelected ? 'text-white font-semibold' : 'text-slate-700'}`}>{option}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        ))}

        <div className="border-t border-slate-300 pt-6 space-y-4">
          {canAddMoreDynamicQuestions && (
            <button
              type="button"
              onClick={handleAddQuestionClick}
              disabled={isAddingQuestion}
              className="flex items-center justify-center w-full text-sm font-medium text-indigo-600 hover:text-indigo-700 py-2.5 px-4 rounded-md hover:bg-indigo-100/70 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 disabled:opacity-60 disabled:cursor-not-allowed group"
              aria-live="polite"
            >
              <PlusCircleIcon className={`w-5 h-5 mr-2 ${isAddingQuestion ? 'animate-spin' : 'group-hover:scale-110 transition-transform'}`} />
              {isAddingQuestion ? "맞춤 질문 생성 중..." : `더 자세한 맞춤 질문 받기 (${dynamicQuestionAddCount}/${maxDynamicQuestions})`}
            </button>
          )}
          { !canAddMoreDynamicQuestions && dynamicQuestionAddCount > 0 && (
             <p className="text-xs text-slate-500 text-center">
                {dynamicQuestionAddCount >= maxDynamicQuestions ? "모든 추가 질문을 받았습니다." : "더 이상 제공할 맞춤 질문이 없습니다."}
             </p>
          )}
          {addQuestionError && (
            <p role="alert" className="text-xs text-red-700 text-center bg-red-100/70 p-2 rounded-md">
              {addQuestionError}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={!allAnswered || isAddingQuestion}
          className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-50"
        >
          {isAddingQuestion ? "질문 추가 중..." : "결정 보기"}
        </button>
      </form>
    </div>
  );
};