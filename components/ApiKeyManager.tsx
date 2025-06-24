
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { USER_API_KEY_STORAGE_KEY, reInitializeAiServiceOnKeyChange, isAiServiceInitialized, getApiKeySource } from '../services/geminiService';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';
import { ShieldExclamationIcon } from './icons/ShieldExclamationIcon';
import { EyeIcon } from './icons/EyeIcon';
import { EyeSlashIcon } from './icons/EyeSlashIcon';

export const ApiKeyManager: React.FC = () => {
  const [userApiKeyInput, setUserApiKeyInput] = useState<string>('');
  const [apiKeyStatus, setApiKeyStatus] = useState<'LOADING' | 'SET' | 'NOT_SET'>('LOADING');
  const [currentSource, setCurrentSource] = useState<'env' | 'local' | 'none' | 'loading'>('loading');
  
  const [isManuallyVisible, setIsManuallyVisible] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const prevIsInitializedRef = useRef<boolean | null>(null);


  const updateStatusDisplay = useCallback(() => {
    const initialized = isAiServiceInitialized();
    const source = getApiKeySource();
    const envKeyPresent = process.env.API_KEY !== undefined && process.env.API_KEY !== "";

    setApiKeyStatus(initialized ? 'SET' : 'NOT_SET');
    setCurrentSource(source);

    // On the very first render/check, if there's no env key
    // AND the service isn't initialized (either no local key or local key failed),
    // then show the input section by default to guide the user.
    // Otherwise, `isManuallyVisible` is controlled by the user's toggle.
    if (prevIsInitializedRef.current === null) { 
        if (!envKeyPresent && !initialized && (source === 'none' || (source === 'local' && !initialized))) {
            setIsManuallyVisible(true);
        }
    }
    prevIsInitializedRef.current = initialized;

  }, []); // isManuallyVisible is intentionally not a dependency.

  useEffect(() => {
    // Initial status check with a slight delay for geminiService to initialize
    const timer = setTimeout(() => {
      updateStatusDisplay();
    }, 200);
    return () => clearTimeout(timer);
  }, [updateStatusDisplay]);


  const handleApiKeySave = () => {
    if (!userApiKeyInput.trim()) {
      setError("API 키를 입력해주세요.");
      setSuccessMessage(null);
      return;
    }
    setError(null);
    setSuccessMessage(null);
    localStorage.setItem(USER_API_KEY_STORAGE_KEY, userApiKeyInput.trim());
    
    if (reInitializeAiServiceOnKeyChange()) {
      setSuccessMessage("API 키가 저장되고 서비스가 활성화되었습니다.");
      setUserApiKeyInput(''); 
      // setIsManuallyVisible(false); // User can manually hide it if they want
    } else {
      setError("입력된 API 키로 서비스 초기화에 실패했습니다. 키가 유효한지, Gemini API가 활성화되어 있는지 확인해주세요.");
    }
    updateStatusDisplay(); // Refresh status after attempting to save
  };

  const handleApiKeyClear = () => {
    setError(null);
    localStorage.removeItem(USER_API_KEY_STORAGE_KEY);
    reInitializeAiServiceOnKeyChange(); 
    setSuccessMessage("저장된 API 키가 삭제되었습니다.");
    setUserApiKeyInput('');
    updateStatusDisplay(); // Refresh status after clearing
    setIsManuallyVisible(true); 
  };

  const toggleManualVisibility = () => {
    setIsManuallyVisible(prev => !prev);
    setError(null); 
    setSuccessMessage(null);
  };
  
  const envKeyIsPresent = process.env.API_KEY !== undefined && process.env.API_KEY !== "";
  // Input section visibility is now solely controlled by isManuallyVisible state
  const showInputSection = isManuallyVisible; 

  let statusText = "API 키 상태 확인 중...";
  let statusIcon = <ShieldExclamationIcon className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-300 mr-2 flex-shrink-0" />;

  if (apiKeyStatus !== 'LOADING') {
    if (apiKeyStatus === 'SET') {
      statusIcon = <ShieldCheckIcon className="w-5 h-5 sm:w-6 sm:h-6 text-green-300 mr-2 flex-shrink-0" />;
      statusText = currentSource === 'env' ? '활성 (환경 변수)' : '활성 (로컬 저장됨)';
    } else { // NOT_SET
      statusIcon = <ShieldExclamationIcon className="w-5 h-5 sm:w-6 sm:h-6 text-orange-300 mr-2 flex-shrink-0" />;
      if (currentSource === 'env') {
        statusText = '오류 (환경 변수 키 확인 필요)';
      } else if (currentSource === 'local' && localStorage.getItem(USER_API_KEY_STORAGE_KEY)) {
        statusText = '오류 (저장된 키 확인 필요)';
      } else {
        statusText = '설정 필요';
      }
    }
  }


  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-800/95 backdrop-blur-sm text-white shadow-lg z-[100] border-t border-slate-700/50 transition-all duration-300 ease-in-out">
      <div className="container mx-auto px-3 py-2 sm:px-4 sm:py-2.5">
        <div className="flex flex-col sm:flex-row items-center justify-between">
          <div className="flex items-center mb-1.5 sm:mb-0">
            {statusIcon}
            <span className={`text-xs sm:text-sm font-medium ${apiKeyStatus === 'SET' ? 'text-green-300' : 'text-orange-300'}`}>
              API 키: {statusText}
            </span>
            {/* Toggle button is now always shown if status is not loading */}
            {apiKeyStatus !== 'LOADING' && (
               <button 
                  onClick={toggleManualVisibility} 
                  className="ml-2 sm:ml-3 text-xs text-slate-400 hover:text-white underline focus:outline-none focus:ring-1 focus:ring-slate-500 rounded px-1 py-0.5"
                  aria-expanded={showInputSection}
                  aria-controls="api-key-form-section"
              >
                  {showInputSection ? '입력창 숨기기' : '키 관리'}
              </button>
            )}
          </div>
        </div>

        {showInputSection && (
          <div id="api-key-form-section" className="mt-2 pt-2 border-t border-slate-700/70 animate-fadeInUp">
            {envKeyIsPresent && (
                 <p className="text-xs text-yellow-300 mb-2 leading-tight bg-slate-700 p-2 rounded-md shadow">
                    ⚠️ **주의:** 환경 변수(<code>process.env.API_KEY</code>)에 API 키가 설정되어 활성화된 상태입니다. 여기에 키를 저장해도 **환경 변수 키가 항상 우선적으로 사용됩니다.** 로컬 저장 키는 환경 변수가 설정되지 않았을 때의 대체용입니다.
                 </p>
            )}
            {!envKeyIsPresent && (
              <p className="text-xs text-slate-400 mb-1.5 leading-tight">
                앱을 사용하려면 Gemini API 키를 입력하고 저장해주세요. 
                { localStorage.getItem(USER_API_KEY_STORAGE_KEY) && apiKeyStatus !== 'SET' && " 현재 저장된 로컬 키가 유효하지 않은 것 같습니다."}
              </p>
            )}
            <div className="flex flex-col sm:flex-row items-stretch gap-1.5 sm:gap-2">
              <div className="relative flex-grow">
                <input
                  type={showPassword ? "text" : "password"}
                  value={userApiKeyInput}
                  onChange={(e) => { setUserApiKeyInput(e.target.value); setError(null); setSuccessMessage(null); }}
                  placeholder="Gemini API 키 입력"
                  className="w-full p-2 pr-10 rounded bg-slate-700 text-white placeholder-slate-500 border border-slate-600 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  aria-label="Gemini API 키 입력"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-400 hover:text-slate-200"
                  aria-label={showPassword ? "API 키 숨기기" : "API 키 보기"}
                >
                  {showPassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                </button>
              </div>
              <button
                onClick={handleApiKeySave}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-3 sm:px-4 rounded text-xs sm:text-sm transition-colors shadow-sm"
              >
                키 저장
              </button>
              {localStorage.getItem(USER_API_KEY_STORAGE_KEY) && (
                <button
                    onClick={handleApiKeyClear}
                    className="bg-rose-600 hover:bg-rose-700 text-white font-semibold py-2 px-3 sm:px-4 rounded text-xs sm:text-sm transition-colors shadow-sm"
                >
                    저장된 키 삭제
                </button>
              )}
            </div>
            {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
            {successMessage && <p className="text-xs text-green-400 mt-1">{successMessage}</p>}
          </div>
        )}
      </div>
    </div>
  );
};
