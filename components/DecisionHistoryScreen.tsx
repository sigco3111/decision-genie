
import React from 'react';
import { SavedDecision } from '../types';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { TrashIcon } from './icons/TrashIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { ErrorDisplay } from './ErrorDisplay';
import { ArrowDownTrayIcon } from './icons/ArrowDownTrayIcon'; // Export Icon
import { ArrowUpTrayIcon } from './icons/ArrowUpTrayIcon';   // Import Icon

interface DecisionHistoryScreenProps {
  history: SavedDecision[];
  onViewDetails: (id: string) => void;
  onDelete: (id: string) => void;
  onBack: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
  importFileRef: React.RefObject<HTMLInputElement>;
  historyManagementError: string | null;
  clearHistoryManagementError: () => void;
}

export const DecisionHistoryScreen: React.FC<DecisionHistoryScreenProps> = ({ 
    history, 
    onViewDetails, 
    onDelete, 
    onBack,
    onExport,
    onImport,
    importFileRef,
    historyManagementError,
    clearHistoryManagementError
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

  const handleImportClick = () => {
    if (historyManagementError) clearHistoryManagementError();
    importFileRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImport(file);
    }
  };


  if (history.length === 0 && !historyManagementError && !localStorage.getItem('decisionGenieHistory')) { // Check localStorage too for initial state
    return (
      <div className="text-center p-6 animate-fadeIn">
        <SparklesIcon className="w-16 h-16 text-purple-400 mx-auto mb-6" />
        <h2 className="text-2xl font-semibold mb-4 text-slate-700">나의 결정 기록</h2>
        <p className="text-slate-600 mb-6">아직 저장된 결정 기록이 없어요.<br/>고민 해결 후 '이 결정 저장하기'를 눌러 기록을 남겨보세요!</p>
        <p className="text-slate-600 mb-8">다른 곳에서 저장한 기록이 있다면 아래 '기록 가져오기'로 불러올 수 있습니다.</p>
        
        <div className="space-y-3 sm:space-y-0 sm:flex sm:flex-row-reverse sm:justify-center sm:space-x-3 sm:space-x-reverse">
           <button
            onClick={onBack}
            className="w-full sm:w-auto flex items-center justify-center bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold py-2.5 px-6 rounded-lg shadow-md transform hover:scale-105 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            시작 화면으로
          </button>
          <input 
            type="file" 
            accept=".json" 
            ref={importFileRef} 
            onChange={handleFileChange} 
            className="hidden" 
            aria-hidden="true"
          />
          <button
            onClick={handleImportClick}
            className="w-full sm:w-auto flex items-center justify-center bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold py-2.5 px-6 rounded-lg shadow-md transform hover:scale-105 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50"
          >
            <ArrowUpTrayIcon className="w-5 h-5 mr-2" />
            기록 가져오기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-slate-700">나의 결정 기록</h2>
        <button
          onClick={onBack}
          aria-label="시작 화면으로 돌아가기"
          className="p-2 rounded-full hover:bg-slate-200/70 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
        >
          <ArrowLeftIcon className="w-6 h-6 text-slate-600" />
        </button>
      </div>

      {historyManagementError && <ErrorDisplay message={historyManagementError} onClearError={clearHistoryManagementError} />}

      <div className="flex flex-col sm:flex-row sm:space-x-3 space-y-3 sm:space-y-0">
        <input 
            type="file" 
            accept=".json" 
            ref={importFileRef} 
            onChange={handleFileChange} 
            className="hidden" 
            aria-hidden="true"
        />
        <button
          onClick={handleImportClick}
          className="flex-1 flex items-center justify-center bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white font-semibold py-2.5 px-5 rounded-lg shadow-md transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-50"
          aria-label="결정 기록 가져오기"
        >
          <ArrowUpTrayIcon className="w-5 h-5 mr-2" />
          기록 가져오기 (.json)
        </button>
        <button
          onClick={() => { if (historyManagementError) clearHistoryManagementError(); onExport(); }}
          disabled={history.length === 0}
          className="flex-1 flex items-center justify-center bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white font-semibold py-2.5 px-5 rounded-lg shadow-md transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-50 disabled:opacity-60 disabled:cursor-not-allowed"
          aria-label="결정 기록 내보내기"
        >
          <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
          기록 내보내기
        </button>
      </div>
      
      {history.length > 0 ? (
        <>
          <p className="text-sm text-slate-600">총 {history.length}개의 결정 기록이 저장되어 있습니다.</p>
          <ul className="space-y-4">
            {history.slice().reverse().map((item) => ( 
              <li key={item.id} className="bg-white/60 p-4 rounded-lg shadow-lg border border-slate-200/80">
                <div className="mb-3">
                  <p className="text-xs text-slate-500 mb-1">{formatDate(item.savedAt)}</p>
                  <h3 className="text-lg font-semibold text-indigo-700 truncate" title={item.problemDescription}>
                    고민: {item.problemDescription}
                  </h3>
                  <p className="text-sm text-slate-600 mt-1 truncate" title={item.decisionData.decision}>
                    마법사의 결정: <span className="font-medium">{item.decisionData.decision}</span>
                  </p>
                </div>
                <div className="flex items-center justify-end space-x-2 border-t border-slate-200/70 pt-3 mt-3">
                  <button
                    onClick={() => { if (historyManagementError) clearHistoryManagementError(); onDelete(item.id);}}
                    className="text-red-500 hover:text-red-700 p-1.5 rounded-md hover:bg-red-100/70 transition-colors text-sm flex items-center focus:outline-none focus:ring-1 focus:ring-red-400"
                    aria-label={`'${item.problemDescription}' 기록 삭제`}
                  >
                    <TrashIcon className="w-4 h-4 mr-1" /> 삭제
                  </button>
                  <button
                    onClick={() => { if (historyManagementError) clearHistoryManagementError(); onViewDetails(item.id);}}
                    className="text-indigo-600 hover:text-indigo-800 bg-indigo-100/70 hover:bg-indigo-200/70 font-medium py-1.5 px-3 rounded-md transition-colors text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400"
                  >
                    자세히 보기
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </>
      ) : (
         <p className="text-center text-slate-500 py-8">
            {historyManagementError ? "오류를 해결한 후 다시 시도해주세요." : "표시할 결정 기록이 없습니다. 먼저 기록을 저장하거나 가져오세요."}
         </p>
      )}
       <button
          onClick={onBack}
          className="mt-6 w-full sm:w-auto flex items-center justify-center bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 text-white font-semibold py-2.5 px-6 rounded-lg shadow-md transform hover:scale-105 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-opacity-50"
        >
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          시작 화면으로 돌아가기
        </button>
    </div>
  );
};
