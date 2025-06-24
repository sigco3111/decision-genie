
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { WelcomeScreen } from './components/WelcomeScreen';
import { ProblemInput } from './components/ProblemInput';
import { Questionnaire } from './components/Questionnaire';
import { DecisionResultDisplay } from './components/DecisionResultDisplay';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorDisplay } from './components/ErrorDisplay';
import { Question, DecisionData, AppStep, SavedDecision, Link } from './types';
import { generateQuestions, makeDecision, suggestDecisionProblems, generateSingleAdditionalQuestion, askFollowUpQuestion } from './services/geminiService';
import { Footer } from './components/Footer';
import { MAX_FOLLOW_UPS } from './constants';
import { ProblemSuggestionScreen } from './components/ProblemSuggestionScreen';
import { DecisionHistoryScreen } from './components/DecisionHistoryScreen';
import { DecisionHistoryDetailScreen } from './components/DecisionHistoryDetailScreen';
import { ApiKeyManager } from './components/ApiKeyManager'; // Added

const MAX_REGENERATIONS = 1;
const MAX_DYNAMIC_QUESTIONS = 2; 
const DECISION_HISTORY_KEY = 'decisionGenieHistory';

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<AppStep>(AppStep.WELCOME);
  const [problemDescription, setProblemDescription] = useState<string>('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [decisionData, setDecisionData] = useState<DecisionData | null>(null);
  const [previousDecision, setPreviousDecision] = useState<string | null>(null);
  const [regenerationCount, setRegenerationCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [isAddingQuestion, setIsAddingQuestion] = useState<boolean>(false);
  const [dynamicQuestionAddCount, setDynamicQuestionAddCount] = useState<number>(0);
  const [noMoreAdditionalQuestions, setNoMoreAdditionalQuestions] = useState<boolean>(false);

  const [followUpAnswer, setFollowUpAnswer] = useState<string | null>(null);
  const [isAskingFollowUp, setIsAskingFollowUp] = useState<boolean>(false);
  const [followUpError, setFollowUpError] = useState<string | null>(null);
  const [followUpInteractionCount, setFollowUpInteractionCount] = useState<number>(0);

  const [suggestedProblems, setSuggestedProblems] = useState<string[]>([]);

  const [decisionHistory, setDecisionHistory] = useState<SavedDecision[]>([]);
  const [selectedHistoryItemForDetail, setSelectedHistoryItemForDetail] = useState<SavedDecision | null>(null);
  const [currentDecisionSaved, setCurrentDecisionSaved] = useState<boolean>(false);
  const [historyManagementError, setHistoryManagementError] = useState<string | null>(null);

  const importFileRef = useRef<HTMLInputElement>(null);


  useEffect(() => {
    loadDecisionHistory();
  }, []);

  const loadDecisionHistory = () => {
    try {
      const storedHistory = localStorage.getItem(DECISION_HISTORY_KEY);
      if (storedHistory) {
        setDecisionHistory(JSON.parse(storedHistory));
      }
    } catch (e) {
      console.error("Error loading decision history from localStorage:", e);
      setDecisionHistory([]); 
      setHistoryManagementError("기록을 불러오는 중 오류가 발생했습니다. 기록이 손상되었을 수 있습니다.");
    }
  };

  const saveDecisionToHistory = (decisionToSave: SavedDecision) => {
    try {
      setHistoryManagementError(null);
      const updatedHistory = [...decisionHistory, decisionToSave];
      localStorage.setItem(DECISION_HISTORY_KEY, JSON.stringify(updatedHistory));
      setDecisionHistory(updatedHistory);
      setCurrentDecisionSaved(true); 
    } catch (e) {
      console.error("Error saving decision to localStorage:", e);
      setError("결정 내용을 저장하는 중 오류가 발생했습니다.");
    }
  };
  
  const handleSaveCurrentDecision = () => {
    if (!decisionData || !problemDescription || questions.length === 0 || Object.keys(answers).length === 0) {
      setError("저장할 결정 데이터가 충분하지 않습니다.");
      return;
    }
    const newSavedDecision: SavedDecision = {
      id: Date.now().toString(),
      savedAt: new Date().toISOString(),
      problemDescription,
      questions,
      answers,
      decisionData,
    };
    saveDecisionToHistory(newSavedDecision);
  };

  const deleteDecisionFromHistory = (idToDelete: string) => {
    try {
      setHistoryManagementError(null);
      const updatedHistory = decisionHistory.filter(item => item.id !== idToDelete);
      localStorage.setItem(DECISION_HISTORY_KEY, JSON.stringify(updatedHistory));
      setDecisionHistory(updatedHistory);
      if (selectedHistoryItemForDetail?.id === idToDelete) {
        setSelectedHistoryItemForDetail(null); 
        setCurrentStep(AppStep.SHOWING_HISTORY); 
      }
    } catch (e) {
      console.error("Error deleting decision from localStorage:", e);
      setHistoryManagementError("결정 기록 삭제 중 오류가 발생했습니다.");
    }
  };

  const isValidSavedDecision = (item: any): item is SavedDecision => {
    return (
      item &&
      typeof item.id === 'string' &&
      typeof item.savedAt === 'string' && (new Date(item.savedAt)).toString() !== 'Invalid Date' &&
      typeof item.problemDescription === 'string' &&
      Array.isArray(item.questions) && item.questions.every((q: any) => 
        q && typeof q.id === 'string' && typeof q.text === 'string' && Array.isArray(q.options) && q.options.every((opt: any) => typeof opt === 'string')
      ) &&
      typeof item.answers === 'object' && item.answers !== null && Object.values(item.answers).every(ans => typeof ans === 'string') &&
      item.decisionData &&
      typeof item.decisionData.decision === 'string' &&
      typeof item.decisionData.reasoning === 'string' &&
      typeof item.decisionData.decisionStrength === 'string' &&
      (!item.decisionData.additionalInfo || (
        typeof item.decisionData.additionalInfo === 'object' &&
        item.decisionData.additionalInfo !== null &&
        (item.decisionData.additionalInfo.text === undefined || typeof item.decisionData.additionalInfo.text === 'string') &&
        (item.decisionData.additionalInfo.sourceLinks === undefined || (Array.isArray(item.decisionData.additionalInfo.sourceLinks) && item.decisionData.additionalInfo.sourceLinks.every((link: any) => 
          link && typeof link.uri === 'string' && typeof link.title === 'string'
        )))
      )) &&
      (!item.decisionData.pros || (Array.isArray(item.decisionData.pros) && item.decisionData.pros.every((pro: any) => typeof pro === 'string'))) &&
      (!item.decisionData.cons || (Array.isArray(item.decisionData.cons) && item.decisionData.cons.every((con: any) => typeof con === 'string')))
    );
  };

  const handleExportHistory = () => {
    setHistoryManagementError(null);
    if (decisionHistory.length === 0) {
      setHistoryManagementError("내보낼 결정 기록이 없습니다.");
      return;
    }
    try {
      const jsonString = JSON.stringify(decisionHistory, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `decision_genie_history_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Error exporting history:", e);
      setHistoryManagementError("기록 내보내기 중 오류가 발생했습니다.");
    }
  };

  const handleImportHistory = (file: File) => {
    setHistoryManagementError(null);
    if (!file) {
      setHistoryManagementError("가져올 파일을 선택해주세요.");
      return;
    }
    if (file.type !== "application/json") {
      setHistoryManagementError("JSON 파일만 가져올 수 있습니다. (.json)");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const fileContent = event.target?.result as string;
        if (!fileContent) {
          throw new Error("파일 내용을 읽을 수 없습니다.");
        }
        const importedData = JSON.parse(fileContent);

        if (!Array.isArray(importedData)) {
          throw new Error("가져온 파일의 형식이 올바르지 않습니다. 최상위는 배열이어야 합니다.");
        }
        
        const validImportedDecisions: SavedDecision[] = [];
        const invalidItems: any[] = [];

        for (const item of importedData) {
          if (isValidSavedDecision(item)) {
            validImportedDecisions.push(item as SavedDecision);
          } else {
            invalidItems.push(item);
          }
        }

        if (invalidItems.length > 0) {
          console.warn("일부 항목이 유효하지 않아 가져오지 못했습니다:", invalidItems);
          setHistoryManagementError(`총 ${importedData.length}개 중 ${invalidItems.length}개의 항목이 유효하지 않아 가져오지 못했습니다. 파일 구조를 확인해주세요.`);
        }
        
        if (validImportedDecisions.length === 0 && importedData.length > 0) {
             throw new Error("가져온 파일에서 유효한 결정 기록을 찾을 수 없습니다. 파일 내용을 확인해주세요.");
        }
        
        if (validImportedDecisions.length === 0 && importedData.length === 0) {
             setHistoryManagementError("가져온 파일에 결정 기록이 없습니다.");
             return;
        }

        const existingIds = new Set(decisionHistory.map(d => d.id));
        const newUniqueDecisions = validImportedDecisions.filter(item => !existingIds.has(item.id));

        if (newUniqueDecisions.length === 0 && validImportedDecisions.length > 0) {
          setHistoryManagementError("가져온 모든 기록이 이미 존재합니다.");
          return;
        }
        
        const updatedHistory = [...decisionHistory, ...newUniqueDecisions];
        localStorage.setItem(DECISION_HISTORY_KEY, JSON.stringify(updatedHistory));
        setDecisionHistory(updatedHistory);
        
        let successMessage = `${newUniqueDecisions.length}개의 새로운 결정 기록을 성공적으로 가져왔습니다.`;
        if (validImportedDecisions.length > newUniqueDecisions.length) {
            successMessage += ` (중복된 ${validImportedDecisions.length - newUniqueDecisions.length}개 항목 제외)`;
        }
        setHistoryManagementError(null); 
        alert(successMessage); 

      } catch (e: any) {
        console.error("Error importing history:", e);
        setHistoryManagementError(`기록 가져오기 중 오류 발생: ${e.message}`);
      } finally {
        if (importFileRef.current) {
            importFileRef.current.value = ""; 
        }
      }
    };
    reader.onerror = () => {
      setHistoryManagementError("파일을 읽는 중 오류가 발생했습니다.");
      if (importFileRef.current) {
        importFileRef.current.value = "";
      }
    };
    reader.readAsText(file);
  };

  const resetFollowUpState = () => {
    setFollowUpAnswer(null);
    setIsAskingFollowUp(false);
    setFollowUpError(null);
    setFollowUpInteractionCount(0);
  };

  const resetAppState = (keepHistory: boolean = false) => {
    setProblemDescription('');
    setQuestions([]);
    setAnswers({});
    setDecisionData(null);
    setPreviousDecision(null);
    setRegenerationCount(0);
    setError(null);
    setIsAddingQuestion(false);
    setDynamicQuestionAddCount(0);
    setNoMoreAdditionalQuestions(false);
    resetFollowUpState();
    setSuggestedProblems([]);
    setCurrentDecisionSaved(false); 
    setHistoryManagementError(null);
    if (!keepHistory) {
        setDecisionHistory([]); 
        setSelectedHistoryItemForDetail(null);
    }
  };

  const handleStart = async () => {
    resetAppState(true); // Keep history when starting new session from welcome
    setIsLoading(true);
    setError(null);
    try {
      const fetchedSuggestions = await suggestDecisionProblems();
      if (fetchedSuggestions && fetchedSuggestions.length > 0) {
        setSuggestedProblems(fetchedSuggestions);
        setCurrentStep(AppStep.SHOWING_SUGGESTIONS);
      } else {
        setCurrentStep(AppStep.ASKING_PROBLEM);
      }
    } catch (e: any) {
      console.error("Error fetching problem suggestions on start:", e);
      const errorMessage = e.message.includes("API 키") ? e.message : "고민거리 제안을 불러오는 중 문제가 발생했어요. 직접 입력해주세요.";
      setError(errorMessage);
      setCurrentStep(AppStep.ASKING_PROBLEM); // Fallback to asking problem
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSuggestionSelected = (problem: string) => {
    handleProblemSubmit(problem);
  };

  const handleManualInputSelected = () => {
    setCurrentStep(AppStep.ASKING_PROBLEM);
  };

  const handleProblemSubmit = useCallback(async (problem: string) => {
    if (!problem.trim()) {
      setError("고민 내용을 입력해주세요.");
      return;
    }
    setProblemDescription(problem);
    setQuestions([]);
    setAnswers({});
    setDecisionData(null);
    setPreviousDecision(null);
    setRegenerationCount(0);
    setIsAddingQuestion(false);
    setDynamicQuestionAddCount(0);
    setNoMoreAdditionalQuestions(false);
    resetFollowUpState();
    setCurrentDecisionSaved(false); 
    
    setIsLoading(true);
    setError(null);
    setCurrentStep(AppStep.GENERATING_QUESTIONS);
    try {
      const fetchedQuestions = await generateQuestions(problem);
      if (fetchedQuestions.length === 0) {
        setError("질문을 생성하지 못했습니다. 다른 고민으로 다시 시도해주세요.");
        setCurrentStep(AppStep.ASKING_PROBLEM);
      } else {
        setQuestions(fetchedQuestions);
        setCurrentStep(AppStep.ANSWERING_QUESTIONS);
      }
    } catch (e: any) {
      console.error("Error generating questions:", e);
      const errorMessage = e.message.includes("API 키") ? e.message : `질문 생성 중 오류 발생: ${e.message}. 잠시 후 다시 시도해주세요.`;
      setError(errorMessage);
      setCurrentStep(AppStep.ASKING_PROBLEM);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleAddAdditionalQuestion = useCallback(async () => {
    if (dynamicQuestionAddCount >= MAX_DYNAMIC_QUESTIONS || noMoreAdditionalQuestions) {
      setNoMoreAdditionalQuestions(true); 
      return;
    }
    setIsAddingQuestion(true);
    setError(null); 
    try {
      const newQuestion = await generateSingleAdditionalQuestion(problemDescription, questions, answers, dynamicQuestionAddCount + 1);
      if (newQuestion && newQuestion.id && newQuestion.text && newQuestion.options) {
        setQuestions(prevQuestions => [...prevQuestions, newQuestion]);
        setDynamicQuestionAddCount(prevCount => prevCount + 1);
        if (dynamicQuestionAddCount + 1 >= MAX_DYNAMIC_QUESTIONS) {
            setNoMoreAdditionalQuestions(true);
        }
      } else {
        setNoMoreAdditionalQuestions(true); 
        console.info("AI could not generate further additional questions or returned null.");
      }
    } catch (e: any) {
      console.error("Error generating additional question:", e);
      const errorMessage = e.message.includes("API 키") ? e.message : `추가 질문 생성 중 오류 발생: ${e.message}.`;
      setError(errorMessage);
      setNoMoreAdditionalQuestions(true); 
    } finally {
      setIsAddingQuestion(false);
    }
  }, [problemDescription, questions, answers, dynamicQuestionAddCount, noMoreAdditionalQuestions]);

  const submitDecisionRequest = useCallback(async (
    isRegeneration: boolean,
    currentAnswersForDecision: Record<string, string>
  ) => {
    setIsLoading(true);
    setError(null);
    resetFollowUpState(); 
    setCurrentDecisionSaved(false); 
    setCurrentStep(isRegeneration ? AppStep.REGENERATING_DECISION : AppStep.GENERATING_DECISION);
    try {
      const result = await makeDecision(
        problemDescription, 
        currentAnswersForDecision, 
        questions, 
        isRegeneration,
        isRegeneration ? previousDecision : null
      );
      setDecisionData(result);
      setPreviousDecision(result.decision);
      if (isRegeneration) {
        setRegenerationCount(prev => prev + 1);
      }
      setCurrentStep(AppStep.SHOWING_DECISION);
    } catch (e: any) {
      console.error(`Error ${isRegeneration ? 'regenerating' : 'making'} decision:`, e);
      const errorMessage = e.message.includes("API 키") ? e.message : `결정 ${isRegeneration ? '재' : ''}생성 중 오류 발생: ${e.message}. 잠시 후 다시 시도해주세요.`;
      setError(errorMessage);
      setCurrentStep(AppStep.ANSWERING_QUESTIONS); 
    } finally {
      setIsLoading(false);
    }
  }, [problemDescription, questions, previousDecision]);

  const handleAnswersSubmit = useCallback(async (submittedAnswers: Record<string, string>) => {
    setAnswers(submittedAnswers);
    setPreviousDecision(null);
    setRegenerationCount(0);
    resetFollowUpState();
    setCurrentDecisionSaved(false);
    await submitDecisionRequest(false, submittedAnswers);
  }, [submitDecisionRequest]);

  const handleRegenerateDecision = useCallback(async () => {
    if (regenerationCount < MAX_REGENERATIONS) {
      resetFollowUpState();
      setCurrentDecisionSaved(false);
      await submitDecisionRequest(true, answers);
    }
  }, [regenerationCount, submitDecisionRequest, answers]);

  const handleFollowUpQuestionSubmit = useCallback(async (followUpText: string) => {
    if (!decisionData || followUpInteractionCount >= MAX_FOLLOW_UPS) return;

    setIsAskingFollowUp(true);
    setFollowUpError(null);
    setFollowUpAnswer(null); 

    try {
      const answerFromAI = await askFollowUpQuestion(
        problemDescription,
        decisionData.decision,
        decisionData.reasoning,
        followUpText
      );
      setFollowUpAnswer(answerFromAI);
      setFollowUpInteractionCount(prev => prev + 1);
    } catch (e: any) {
      console.error("Error asking follow-up question:", e);
      const errorMessage = e.message.includes("API 키") ? e.message : `후속 질문 처리 중 오류: ${e.message}`;
      setFollowUpError(errorMessage);
    } finally {
      setIsAskingFollowUp(false);
    }
  }, [decisionData, problemDescription, followUpInteractionCount]);

  const handleReset = () => {
    resetAppState(true); 
    setCurrentStep(AppStep.WELCOME); 
  };
  
  const handleBackToSuggestions = () => {
    setProblemDescription('');
    setQuestions([]);
    setAnswers({});
    setDecisionData(null);
    setPreviousDecision(null);
    setRegenerationCount(0);
    setError(null);
    setIsAddingQuestion(false);
    setDynamicQuestionAddCount(0);
    setNoMoreAdditionalQuestions(false);
    resetFollowUpState();
    setCurrentDecisionSaved(false);
    if (suggestedProblems.length > 0) {
        setCurrentStep(AppStep.SHOWING_SUGGESTIONS);
    } else {
        handleStart(); 
    }
  };

  const clearMainError = () => {
    const prevError = error;
    setError(null);
    if (prevError && prevError.includes("API 키")) { // If API key error, don't change step, let user fix in manager
      return;
    }
    if (currentStep === AppStep.GENERATING_QUESTIONS || (prevError && prevError.includes("질문 생성"))) {
        if (suggestedProblems.length > 0 && problemDescription === '') {
            setCurrentStep(AppStep.SHOWING_SUGGESTIONS);
        } else {
            setCurrentStep(AppStep.ASKING_PROBLEM);
        }
    } else if (currentStep === AppStep.GENERATING_DECISION || currentStep === AppStep.REGENERATING_DECISION || (prevError && prevError.includes("결정"))) {
        setCurrentStep(AppStep.ANSWERING_QUESTIONS);
    } else if (prevError && prevError.includes("추가 질문")) { 
        setCurrentStep(AppStep.ANSWERING_QUESTIONS);
    } else if (prevError && prevError.includes("고민거리 제안")) {
        setCurrentStep(AppStep.ASKING_PROBLEM);
    }
    else if (currentStep !== AppStep.SHOWING_HISTORY && currentStep !== AppStep.SHOWING_HISTORY_DETAIL) {
       setCurrentStep(AppStep.WELCOME); 
    }
  };

  const handleShowHistory = () => {
    setError(null); 
    setHistoryManagementError(null);
    setCurrentStep(AppStep.SHOWING_HISTORY);
  };

  const handleShowHistoryDetail = (id: string) => {
    setError(null);
    setHistoryManagementError(null);
    const item = decisionHistory.find(d => d.id === id);
    if (item) {
      setSelectedHistoryItemForDetail(item);
      setCurrentStep(AppStep.SHOWING_HISTORY_DETAIL);
    } else {
      setHistoryManagementError("선택한 기록을 찾을 수 없습니다.");
      setCurrentStep(AppStep.SHOWING_HISTORY);
    }
  };
  
  const handleBackToWelcome = () => {
    setSelectedHistoryItemForDetail(null);
    setCurrentStep(AppStep.WELCOME);
  };

  const renderContent = () => {
    if (isLoading && 
        currentStep !== AppStep.ASKING_PROBLEM && 
        currentStep !== AppStep.SHOWING_SUGGESTIONS &&
        currentStep !== AppStep.SHOWING_HISTORY && 
        currentStep !== AppStep.SHOWING_HISTORY_DETAIL &&
        !isAddingQuestion && 
        !isAskingFollowUp) { 
      return <LoadingSpinner />;
    }
    if (error && 
        currentStep !== AppStep.SHOWING_HISTORY &&
        currentStep !== AppStep.SHOWING_HISTORY_DETAIL &&
        !(isAddingQuestion && error.includes("추가 질문")) && 
        !isAskingFollowUp
        ) { 
         return <ErrorDisplay message={error} onClearError={clearMainError} />;
    }

    switch (currentStep) {
      case AppStep.WELCOME:
        return <WelcomeScreen 
                  onStart={handleStart} 
                  onShowHistory={decisionHistory.length > 0 || localStorage.getItem(DECISION_HISTORY_KEY) !== null ? handleShowHistory : undefined} 
                />;
      case AppStep.SHOWING_SUGGESTIONS:
        return <ProblemSuggestionScreen 
                  suggestions={suggestedProblems} 
                  onSelectProblem={handleSuggestionSelected}
                  onManualInput={handleManualInputSelected}
                  isLoading={isLoading && suggestedProblems.length === 0}
                  error={error && error.includes("고민거리 제안") ? error : null}
                  clearError={() => setError(null)}
                />;
      case AppStep.ASKING_PROBLEM:
        return <ProblemInput 
                  onSubmit={handleProblemSubmit} 
                  onBackToSuggestions={suggestedProblems.length > 0 ? handleBackToSuggestions : undefined}
                  // Allow ProblemInput to show API key related errors if they occur during its own suggestion generation.
                  // Main error display will handle errors from handleStart().
                />;
      case AppStep.GENERATING_QUESTIONS:
      case AppStep.GENERATING_DECISION:
      case AppStep.REGENERATING_DECISION:
        if (isLoading && !isAddingQuestion && !isAskingFollowUp) return <LoadingSpinner />;
        if (error && error.includes("API 키")) return <ErrorDisplay message={error} onClearError={clearMainError} />; // Show API key error specifically
        return <ErrorDisplay message={error || "작업 처리 중 예상치 못한 상태입니다. 시작 화면으로 돌아갑니다."} onClearError={handleReset} />;

      case AppStep.ANSWERING_QUESTIONS:
        return (
          <Questionnaire 
            questions={questions} 
            onSubmit={handleAnswersSubmit}
            onAddAdditionalQuestion={handleAddAdditionalQuestion}
            isAddingQuestion={isAddingQuestion}
            canAddMoreDynamicQuestions={dynamicQuestionAddCount < MAX_DYNAMIC_QUESTIONS && !noMoreAdditionalQuestions}
            maxDynamicQuestions={MAX_DYNAMIC_QUESTIONS}
            dynamicQuestionAddCount={dynamicQuestionAddCount}
            addQuestionError={(error && (error.includes("추가 질문") || error.includes("API 키"))) ? error : null}
            clearAddQuestionError={() => { if (error && (error.includes("추가 질문") || error.includes("API 키"))) setError(null);}}
          />
        );
      case AppStep.SHOWING_DECISION:
        return decisionData ? (
          <DecisionResultDisplay 
            decisionData={decisionData} 
            onReset={handleReset}
            onRegenerate={handleRegenerateDecision}
            canRegenerate={regenerationCount < MAX_REGENERATIONS}
            onFollowUpSubmit={handleFollowUpQuestionSubmit}
            followUpAnswer={followUpAnswer}
            isAskingFollowUp={isAskingFollowUp}
            followUpError={followUpError}
            followUpInteractionCount={followUpInteractionCount}
            maxFollowUps={MAX_FOLLOW_UPS}
            clearFollowUpError={() => setFollowUpError(null)}
            onSaveDecision={handleSaveCurrentDecision}
            isDecisionSaved={currentDecisionSaved}
          />
        ) : <ErrorDisplay message={error || "결정 데이터를 불러오지 못했습니다."} onClearError={handleReset}/>; // Show main error if decisionData is null
      
      case AppStep.SHOWING_HISTORY:
        return <DecisionHistoryScreen
                  history={decisionHistory}
                  onViewDetails={handleShowHistoryDetail}
                  onDelete={deleteDecisionFromHistory}
                  onBack={handleBackToWelcome}
                  onExport={handleExportHistory}
                  onImport={handleImportHistory}
                  importFileRef={importFileRef}
                  historyManagementError={historyManagementError}
                  clearHistoryManagementError={() => setHistoryManagementError(null)}
               />;
      case AppStep.SHOWING_HISTORY_DETAIL:
        return selectedHistoryItemForDetail ? (
          <DecisionHistoryDetailScreen
            item={selectedHistoryItemForDetail}
            onDelete={() => deleteDecisionFromHistory(selectedHistoryItemForDetail.id)}
            onBackToList={handleShowHistory}
            error={historyManagementError} 
            clearError={() => setHistoryManagementError(null)}
          />
        ) : <ErrorDisplay message="선택된 기록 상세 정보를 불러올 수 없습니다." onClearError={handleShowHistory}/>;

      default:
        return <WelcomeScreen onStart={handleStart} onShowHistory={decisionHistory.length > 0 || localStorage.getItem(DECISION_HISTORY_KEY) !== null ? handleShowHistory : undefined} />;
    }
  };

  return (
    <div className="flex flex-col min-h-full"> {/* Changed to min-h-full for better flex behavior with fixed footer */}
      <Header />
      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8 flex flex-col items-center justify-center pt-6 sm:pt-8 pb-40"> {/* Adjusted padding: pt, pb */}
        <div className="w-full max-w-2xl bg-white/80 backdrop-blur-md shadow-xl rounded-xl p-6 md:p-10">
          {renderContent()}
        </div>
      </main>
      <Footer />
      <ApiKeyManager /> {/* Render ApiKeyManager here so it's outside main scroll but fixed */}
    </div>
  );
};

export default App;