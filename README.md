
# 🌟 고민 결정 마법사 (Decision Genie) 🌟

**AI가 당신의 고민 해결을 도와드립니다.**

"고민 결정 마법사"는 사용자의 고민에 대해 객관식 질문을 통해 정보를 수집하고, Google Gemini AI를 활용하여 맞춤형 결정과 그 이유, 장단점, 관련 정보 링크까지 제공하는 의사결정 보조 웹 애플리케이션입니다.

실행 주소 : https://dev-canvas-pi.vercel.app/

## 🎯 주요 기능

*   **🤔 고민 입력 및 제안:**
    *   사용자가 직접 고민 내용을 입력할 수 있습니다.
    *   AI가 흔한 고민거리를 제안하여 사용자가 선택할 수 있도록 돕습니다.
*   **❓ AI 기반 질문 생성:**
    *   입력된 고민을 바탕으로 AI가 3-4개의 맥락 파악용 객관식 질문을 생성합니다.
    *   사용자의 답변에 따라 AI가 최대 2개의 추가 맞춤형 질문을 동적으로 생성하여 더 깊이 있는 정보를 수집합니다.
*   **✨ AI 의사결정 및 상세 분석:**
    *   수집된 답변을 종합하여 AI가 구체적이고 실행 가능한 결정을 제안합니다.
    *   결정에 대한 명확한 이유, AI의 확신도, 예상되는 장점(Pros) 및 단점(Cons)을 함께 제공합니다.
    *   결정과 관련된 유용한 웹 링크 (AI 추천 및 Google Search 결과)를 제공하여 사용자가 추가 정보를 탐색하거나 행동을 취하는 데 도움을 줍니다.
*   **🔄 결정 재검토 및 추가 질문:**
    *   제시된 결정이 만족스럽지 않을 경우, 다른 결정 제안을 요청할 수 있습니다 (최대 1회).
    *   AI가 내린 결정에 대해 사용자가 궁금한 점을 추가로 질문하고 답변을 받을 수 있습니다 (최대 20회).
*   **💾 결정 기록 관리:**
    *   내려진 결정을 문제 내용, 질문과 답변, AI의 최종 결정 데이터와 함께 로컬에 저장할 수 있습니다.
    *   저장된 결정 기록을 목록으로 확인하고, 각 항목의 상세 내용을 다시 볼 수 있습니다.
    *   결정 기록을 삭제할 수 있습니다.
    *   전체 결정 기록을 JSON 파일로 내보내거나, 외부 JSON 파일을 가져와 기존 기록에 병합할 수 있습니다. (유효성 검사 및 중복 방지 기능 포함)
*   **🔑 API 키 관리:**
    *   애플리케이션은 먼저 `process.env.API_KEY` 환경 변수를 통해 Gemini API 키를 사용합니다.
    *   환경 변수가 설정되지 않은 경우, 사용자가 직접 UI 하단의 API 키 관리자를 통해 로컬 저장소에 API 키를 입력하고 관리할 수 있습니다.
    *   API 키 상태(활성, 설정 필요, 오류)를 실시간으로 표시하고, 키 유효성 검증을 시도합니다.
*   **📱 반응형 디자인 및 사용자 경험:**
    *   데스크톱 및 모바일 환경에 최적화된 반응형 UI를 제공합니다.
    *   애니메이션 효과와 로딩 스피너, 상세한 오류 메시지를 통해 사용자 경험을 향상시킵니다.
    *   API 키 유무 및 유효성에 따라 적절한 안내 메시지를 제공합니다.

## 🛠️ 기술 스택

*   **Frontend:**
    *   [React](https://reactjs.org/) (v19)
    *   [TypeScript](https://www.typescriptlang.org/)
    *   [Tailwind CSS](https://tailwindcss.com/)
*   **AI Service:**
    *   [Google Gemini API](https://ai.google.dev/docs/gemini_api_overview) (`@google/genai` SDK)
*   **Module Loading:**
    *   ESM via `esm.sh` for browser-based module resolution.

## 🧠 Gemini API 활용 서비스

본 애플리케이션은 다음과 같은 주요 기능에 Google Gemini API를 사용합니다:

*   **고민거리 제안 (`suggestDecisionProblems`):** 사용자가 시작 시 선택할 수 있는 일반적인 고민거리 목록을 생성합니다.
*   **맥락 파악용 질문 생성 (`generateQuestions`):** 사용자가 입력한 고민에 대해 초기 객관식 질문 세트를 생성합니다.
*   **동적 추가 질문 생성 (`generateSingleAdditionalQuestion`):** 기존 질문과 답변을 바탕으로 더 구체적인 추가 질문을 생성합니다.
*   **의사결정 및 분석 (`makeDecision`):**
    *   사용자의 모든 답변을 종합하여 최종 결정을 내립니다.
    *   결정에 대한 상세한 이유를 설명합니다.
    *   AI의 결정 확신도를 제공합니다.
    *   결정의 장점(Pros)과 단점(Cons)을 제시합니다.
    *   AI가 직접 관련된 웹 링크를 제안하고, Google Search 도구를 활용하여 추가적인 관련 웹사이트 정보를 수집하여 제공합니다.
*   **후속 질문 답변 (`askFollowUpQuestion`):** AI가 내린 결정에 대한 사용자의 추가 질문에 답변합니다.

## 🚀 시작하기

### 사전 준비물

1.  **웹 브라우저:** 최신 버전의 Chrome, Firefox, Safari, Edge 등
2.  **Google Gemini API 키:**
    *   Google AI Studio ([https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey))에서 API 키를 발급받아야 합니다.
    *   API 키는 애플리케이션이 Gemini 모델과 통신하는 데 필수적입니다.

### API 키 설정

애플리케이션은 다음 두 가지 방법으로 API 키를 인식합니다 (환경 변수가 우선):

1.  **환경 변수 (권장):**
    *   프로젝트 실행 환경에서 `API_KEY`라는 이름으로 Gemini API 키를 설정합니다. (예: `.env` 파일을 사용하거나 서버 환경 변수로 설정)
    *   이 방법은 코드에 직접 키를 노출하지 않아 더 안전합니다.
    *   `process.env.API_KEY`로 접근합니다. (현재 애플리케이션은 클라이언트 사이드에서 직접 `process.env`를 정의하지 않으므로, 이 방식은 빌드 시스템이나 서버를 통해 주입될 때 유효합니다. 정적 HTML/TSX 배포 시에는 아래 로컬 저장소 방식을 사용하게 됩니다.)

2.  **인앱 API 키 관리자 (로컬 저장소):**
    *   만약 환경 변수 `API_KEY`가 설정되어 있지 않다면, 애플리케이션 하단에 API 키 관리 섹션이 나타납니다.
    *   이곳에 발급받은 Gemini API 키를 직접 입력하고 "키 저장" 버튼을 누르면 브라우저의 로컬 저장소에 안전하게 저장됩니다.
    *   "저장된 키 삭제" 버튼으로 언제든지 로컬 키를 제거할 수 있습니다.
    *   환경 변수 키가 존재할 경우, 로컬 저장소 키는 사용되지 않습니다.

### 애플리케이션 실행

1.  프로젝트 파일을 다운로드하거나 클론합니다.
2.  `index.html` 파일을 웹 브라우저에서 직접 엽니다.
    *   별도의 빌드 과정이나 서버 실행 없이 바로 동작합니다 (모든 의존성은 `esm.sh`를 통해 CDN에서 로드됩니다).
3.  API 키가 올바르게 설정되었다면, "마법 시작하기" 버튼을 눌러 서비스를 이용할 수 있습니다.

## 📂 파일 구조

```
.
├── index.html                # 메인 HTML 파일, 앱의 진입점
├── index.tsx                 # React 애플리케이션의 루트 렌더링
├── App.tsx                   # 메인 애플리케이션 컴포넌트 (상태 관리, 주요 로직)
├── metadata.json             # 애플리케이션 메타데이터 (이름, 설명 등)
├── README.md                 # 현재 보고 있는 파일
├── constants.ts              # 앱 전반에 사용되는 상수 (API 모델명, 제목 등)
├── types.ts                  # TypeScript 타입 정의
├── services/
│   └── geminiService.ts      # Google Gemini API와 통신하는 로직
├── components/               # UI 컴포넌트
│   ├── Header.tsx            # 페이지 상단 헤더
│   ├── Footer.tsx            # 페이지 하단 푸터
│   ├── WelcomeScreen.tsx     # 시작 화면
│   ├── ProblemSuggestionScreen.tsx # 고민거리 제안 화면
│   ├── ProblemInput.tsx      # 사용자 고민 입력 화면
│   ├── Questionnaire.tsx     # 질문-답변 진행 화면
│   ├── DecisionResultDisplay.tsx # 최종 결정 표시 화면
│   ├── DecisionHistoryScreen.tsx # 결정 기록 목록 화면
│   ├── DecisionHistoryDetailScreen.tsx # 결정 기록 상세 화면
│   ├── LoadingSpinner.tsx    # 로딩 상태 표시
│   ├── ErrorDisplay.tsx      # 오류 메시지 표시
│   ├── ProgressBar.tsx       # 질문 진행도 표시
│   ├── ApiKeyManager.tsx     # API 키 입력 및 관리 UI (화면 하단 고정)
│   └── icons/                # SVG 아이콘 컴포넌트들
│       ├── SparklesIcon.tsx
│       ├── CheckIcon.tsx
│       └── ... (기타 아이콘)
└── tailwind.config.js        # (존재한다면) Tailwind CSS 설정 파일 (현재는 CDN 사용으로 불필요)
```

## 🔄 애플리케이션 흐름

1.  **시작 화면 (`WelcomeScreen`):**
    *   사용자는 "마법 시작하기" 버튼을 클릭하여 고민 해결 과정을 시작하거나, "나의 결정 기록 보기"를 통해 이전 기록을 확인할 수 있습니다.
2.  **고민 제안 또는 입력:**
    *   **고민 제안 (`ProblemSuggestionScreen`):** AI가 제안하는 고민 목록에서 하나를 선택할 수 있습니다.
    *   **직접 입력 (`ProblemInput`):** "직접 고민 입력하기"를 선택하여 자신의 고민을 텍스트로 입력합니다. "고민 자동 생성" 버튼으로 AI에게 고민 생성을 요청할 수도 있습니다.
3.  **질문 생성 및 답변 (`Questionnaire`):**
    *   입력된 고민을 바탕으로 AI가 객관식 질문들을 생성합니다.
    *   사용자는 각 질문에 대해 하나의 옵션을 선택합니다.
    *   진행률 바를 통해 답변 현황을 확인할 수 있습니다.
    *   필요에 따라 "더 자세한 맞춤 질문 받기" 버튼을 통해 AI에게 추가적인 동적 질문 생성을 요청할 수 있습니다 (최대 `MAX_DYNAMIC_QUESTIONS`개).
4.  **결정 확인 (`DecisionResultDisplay`):**
    *   모든 질문에 답변하면, AI가 답변 내용을 종합하여 최종 결정을 제시합니다.
    *   결정과 함께 결정 이유, AI의 확신도, 장점, 단점, 관련 링크(AI 추천 및 웹 검색 결과)가 표시됩니다.
    *   사용자는 "다른 결정 제안받기"를 통해 새로운 결정을 요청하거나(최대 `MAX_REGENERATIONS`회), "결정에 대해 더 궁금한 점이 있나요?" 섹션을 통해 AI에게 후속 질문을 할 수 있습니다(최대 `MAX_FOLLOW_UPS`회).
    *   "이 결정 저장하기" 버튼으로 현재 결정을 로컬 기록에 저장할 수 있습니다.
5.  **새로운 고민 시작 또는 기록 관리:**
    *   "새로운 고민 상담하기"를 통해 처음부터 다시 시작할 수 있습니다.
    *   **결정 기록 (`DecisionHistoryScreen`, `DecisionHistoryDetailScreen`):**
        *   저장된 결정 목록을 보고, 각 항목의 상세 내용을 확인할 수 있습니다.
        *   기록을 삭제하거나, JSON 파일로 내보내고 가져올 수 있습니다.

## ⚠️ 주의사항

*   이 애플리케이션은 Google Gemini API를 사용하며, API 사용량에 따라 비용이 발생할 수 있습니다. API 키 관리에 유의해주십시오.
*   AI가 제공하는 결정과 정보는 참고용이며, 중요한 결정은 사용자 본인의 충분한 검토와 판단 하에 이루어져야 합니다. 개발자는 AI 결정의 결과에 대해 어떠한 책임도 지지 않습니다.

## ✨ 기여하기

개선 아이디어나 버그 리포트는 언제나 환영합니다! GitHub Issues를 통해 참여해주세요.

---

이 README가 "고민 결정 마법사"를 이해하고 사용하는 데 도움이 되기를 바랍니다!
