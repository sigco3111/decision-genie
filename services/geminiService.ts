
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Question, DecisionData, AdditionalInfo, Link } from '../types';
import { GEMINI_TEXT_MODEL } from '../constants';

export const USER_API_KEY_STORAGE_KEY = 'decisionGenieUserApiKey';

let ai: GoogleGenAI | null = null;
let currentApiKeyUsed: string | null = null; 

function _initializeInstance(apiKey: string): boolean {
  try {
    // Rely on the SDK for API key validation. Removed custom check:
    // if (!apiKey.trim() || apiKey.length < 30) {
    //     console.warn("Provided API key is too short or empty. Initialization aborted.");
    //     throw new Error("API 키 형식이 올바르지 않습니다.");
    // }
    if (!apiKey || !apiKey.trim()) {
        console.warn("Provided API key is empty. Initialization aborted.");
        throw new Error("API 키가 비어 있습니다.");
    }

    ai = new GoogleGenAI({ apiKey });
    currentApiKeyUsed = apiKey;
    console.log("Gemini AI Service Initialized.");
    return true;
  } catch (error: any) {
    console.error("Failed to initialize Gemini AI Service with key:", error.message);
    ai = null;
    currentApiKeyUsed = null;
    
    // If the error was due to the localStorage key, remove it as it's likely invalid.
    if (localStorage.getItem(USER_API_KEY_STORAGE_KEY) === apiKey) {
        localStorage.removeItem(USER_API_KEY_STORAGE_KEY);
        console.warn("Removed potentially invalid API key from local storage after initialization failure.");
    }

    if (error.message && (error.message.toLowerCase().includes("api key not valid") || error.message.toLowerCase().includes("invalid api key"))) {
        throw new Error("제공된 API 키가 유효하지 않습니다. 키를 확인해주세요.");
    }
    // Propagate other errors, including the "API 키가 비어 있습니다." error if that was the case.
    throw new Error(`AI 서비스 초기화 실패: ${error.message}`);
  }
}

export function initializeAiService(): boolean {
  // console.log("Attempting to initialize AI Service...");
  const envApiKey = process.env.API_KEY;
  if (envApiKey && envApiKey.trim() !== "") {
    // console.log("Using API_KEY from environment variable.");
    try {
      return _initializeInstance(envApiKey);
    } catch (e: any) { // Catching 'any' as error type from _initializeInstance is Error
      console.error("Failed to initialize with environment API key:", e.message);
      // Fall through to check local storage if env key fails
    }
  }

  const storedUserApiKey = localStorage.getItem(USER_API_KEY_STORAGE_KEY);
  if (storedUserApiKey && storedUserApiKey.trim() !== "") {
    // console.log("Using API Key from local storage.");
    try {
      return _initializeInstance(storedUserApiKey);
    } catch (e: any) {
        console.error("Failed to initialize with local storage API key:", e.message);
        // Error already handled in _initializeInstance including removing bad key if it was the source
        return false;
    }
  }
  
  // console.warn("API Key not found or invalid in environment variables or local storage. AI Service not initialized.");
  ai = null;
  currentApiKeyUsed = null;
  return false;
}

// Initialize on load
initializeAiService();

export function reInitializeAiServiceOnKeyChange(): boolean {
    // console.log("Re-initializing AI Service on key change...");
    return initializeAiService();
}

export function isAiServiceInitialized(): boolean {
  return ai !== null;
}

export function getApiKeySource(): 'env' | 'local' | 'none' {
    if (!currentApiKeyUsed && !process.env.API_KEY && !localStorage.getItem(USER_API_KEY_STORAGE_KEY)) return 'none';
    
    // Check if initialized and matches current key
    if (ai && currentApiKeyUsed) {
        if (process.env.API_KEY && currentApiKeyUsed === process.env.API_KEY) return 'env';
        const localKey = localStorage.getItem(USER_API_KEY_STORAGE_KEY);
        if (localKey && currentApiKeyUsed === localKey) return 'local';
    }

    // If not initialized or key mismatch, determine potential source
    if (process.env.API_KEY && process.env.API_KEY.trim() !== "") return 'env';
    if (localStorage.getItem(USER_API_KEY_STORAGE_KEY)) return 'local';
    
    return 'none';
}

async function ensureAiClient<T>(apiCall: (client: GoogleGenAI) => Promise<T>): Promise<T> {
  if (!ai) {
    // console.log("AI client not ready, attempting re-initialization for API call...");
    if (!reInitializeAiServiceOnKeyChange() || !ai) {
      const keySourceStatus = getApiKeySource(); 
      let message = "API 키가 설정되지 않았습니다. 화면 하단의 API 키 관리자에서 키를 설정해주세요.";
      if (keySourceStatus === 'env') { // Implies env key exists but failed
        message = "환경 변수에 설정된 API 키로 AI 서비스 초기화에 실패했습니다. 키가 올바른지 확인해주세요.";
      } else if (keySourceStatus === 'local') { // Implies local key exists but failed
        message = "저장된 API 키로 AI 서비스 초기화에 실패했습니다. API 키 관리자에서 키를 확인하거나 새로 입력해주세요.";
      }
      throw new Error(message);
    }
  }
  try {
    return await apiCall(ai);
  } catch (error: any) {
    console.error('Error during API call to Gemini:', error);
    if (error.message && (error.message.toLowerCase().includes("api key not valid") || error.message.toLowerCase().includes("invalid api key") )) {
        currentApiKeyUsed = null; 
        ai = null; 
        const source = getApiKeySource(); // Check what was supposed to be the source
        if (source === 'local' || localStorage.getItem(USER_API_KEY_STORAGE_KEY)) { // If local key was the source or exists
            localStorage.removeItem(USER_API_KEY_STORAGE_KEY);
            console.warn("Removed invalid API key from local storage due to runtime API error.");
        }
        throw new Error("API 키가 더 이상 유효하지 않습니다. API 키 관리자에서 키를 업데이트해주세요. (기존 키 삭제됨)");
    }
    // Handle other errors, e.g., quota exceeded, network issues
     if (error.message && error.message.toLowerCase().includes("quota")) {
        throw new Error("API 사용 할당량을 초과했습니다. 잠시 후 다시 시도하거나 사용량을 확인해주세요.");
    }
    if (error.message && error.message.toLowerCase().includes("network error") || error.message.toLowerCase().includes("failed to fetch")) {
        throw new Error("네트워크 오류가 발생했습니다. 인터넷 연결을 확인하고 다시 시도해주세요.");
    }
    throw new Error(`Gemini API 호출 중 오류 발생: ${error.message || '알 수 없는 오류'}`);
  }
}

const parseJsonFromText = <T,>(text: string): T | null => {
  let jsonStr = text.trim();
  const fenceRegex = /```(?:json)?\s*\n?(.*?)\n?\s*```/s; 
  const match = jsonStr.match(fenceRegex);
  if (match && match[1]) { 
    jsonStr = match[1].trim();
  }

  try {
    const parsed = JSON.parse(jsonStr);
    if (typeof parsed === 'object' && parsed !== null && Object.keys(parsed).length === 0 && jsonStr.trim() === '{}') {
        return null; 
    }
    return parsed as T;
  } catch (e) {
    console.error("Failed to parse JSON response (attempt 1):", e, "Attempted on string:", jsonStr, "Original text:", text);
    let firstBrace = jsonStr.indexOf('{');
    let lastBrace = jsonStr.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        const objectCandidate = jsonStr.substring(firstBrace, lastBrace + 1);
        try {
            const parsed = JSON.parse(objectCandidate);
            if (typeof parsed === 'object' && parsed !== null && Object.keys(parsed).length === 0 && objectCandidate.trim() === '{}') {
                return null;
            }
            return parsed as T;
        } catch (e2) {
            console.error("Secondary JSON object parsing attempt failed:", e2, "Attempted on substring:", objectCandidate);
        }
    }
    
    let firstBracket = jsonStr.indexOf('[');
    let lastBracket = jsonStr.lastIndexOf(']');
    if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
        const arrayCandidate = jsonStr.substring(firstBracket, lastBracket + 1);
        try {
            const parsed = JSON.parse(arrayCandidate);
            return parsed as T;
        } catch (e3) {
            console.error("Secondary JSON array parsing attempt failed:", e3, "Attempted on substring:", arrayCandidate);
        }
    }
    return null;
  }
};

export const generateQuestions = async (decisionProblem: string): Promise<Question[]> => {
  return ensureAiClient(async (currentAi) => {
    const prompt = `
    You are a helpful assistant AI called "결정 마법사" (Decision Genie). Your goal is to help users make decisions by asking them relevant multiple-choice questions.
    The user is facing the following decision problem: "${decisionProblem}"

    Please generate 3 to 4 distinct multiple-choice questions in Korean to gather more context about the user's situation and preferences related to this problem.
    For each question:
    1. Provide a clear and concise question text in Korean.
    2. Provide 3 to 4 distinct and relevant answer options in Korean.
    3. Ensure the options cover a reasonable range of possibilities for the question.

    Return your response as a JSON array of objects. Each object in the array should represent one question and have the following structure:
    {
      "id": "qN", // where N is the question number, e.g., "q1", "q2"
      "text": "질문 텍스트 (한국어)?",
      "options": ["답변 옵션 1 (한국어)", "답변 옵션 2 (한국어)", "답변 옵션 3 (한국어)", "답변 옵션 4 (한국어, 선택 사항)"]
    }

    Example for "오늘 저녁 뭐 먹을까요?":
    [
      {
        "id": "q1",
        "text": "오늘 저녁 식사에 가장 중요하게 생각하는 것은 무엇인가요?",
        "options": ["빠르고 간편한 것", "건강하고 영양가 있는 것", "특별하고 맛있는 것", "저렴한 것"]
      },
      {
        "id": "q2",
        "text": "선호하는 음식 스타일이 있나요?",
        "options": ["한식", "양식", "중식", "기타 아시아 음식"]
      },
      {
        "id": "q3",
        "text": "오늘 저녁 식사에 얼마의 시간을 투자할 수 있나요?",
        "options": ["30분 이내", "30분 ~ 1시간", "1시간 이상"]
      }
    ]

    Now, generate the questions for the user's problem. Output only the JSON array. Ensure all text is in Korean.
  `;
    const response: GenerateContentResponse = await currentAi.models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json", 
        temperature: 0.7, 
      },
    });
    
    const questions = parseJsonFromText<Question[]>(response.text);
    if (!questions || !Array.isArray(questions) || questions.some(q => !q.id || !q.text || !q.options || !Array.isArray(q.options))) {
        console.error("Invalid question format received:", response.text, "Parsed as: ", questions);
        throw new Error("AI로부터 유효한 형식의 질문을 받지 못했습니다. 질문 형식을 확인해주세요.");
    }
    return questions.map((q, index) => ({ ...q, id: q.id || `q${index + 1}` }));
  });
};

export const generateSingleAdditionalQuestion = async (
  decisionProblem: string,
  existingQuestions: Question[],
  currentAnswers: Record<string, string>,
  dynamicQuestionCount: number 
): Promise<Question | null> => {
 return ensureAiClient(async (currentAi) => {
    const formattedExistingQuestionsAndAnswers = existingQuestions
    .map(q => {
      const answer = currentAnswers[q.id] || "아직 답변하지 않음";
      return `질문: "${q.text}"\n사용자 답변: "${answer}"`;
    })
    .join('\n\n');

  const prompt = `
    You are an assistant AI for "결정 마법사" (Decision Genie).
    The user is facing this problem: "${decisionProblem}"

    So far, the following questions have been asked, and these are the user's answers (if any):
    --- START OF PREVIOUS Q&A ---
    ${formattedExistingQuestionsAndAnswers}
    --- END OF PREVIOUS Q&A ---

    Your task is to generate EXACTLY ONE new, highly relevant, and distinct multiple-choice question in Korean.
    This question should help gather more specific information, preferences, or constraints that are crucial for making a better final decision for the user.
    It must not significantly overlap with the existing questions. It should delve deeper.
    Provide 3-4 relevant and distinct answer options in Korean for this new question.

    The ID for this new question must be unique. Use the format "dyn_q_${dynamicQuestionCount}".

    Return your response as a single JSON object with the structure:
    {
      "id": "dyn_q_${dynamicQuestionCount}",
      "text": "새로운 질문 텍스트 (한국어)?",
      "options": ["옵션 1", "옵션 2", "옵션 3", "옵션 4 (선택 사항)"]
    }

    If you genuinely cannot think of a new, useful, and distinct question based on all the provided context, return an empty JSON object: {}. Do not explain why, just return {}.

    Example of a new question (if previous Q&A was about dinner type, and user chose "Korean food" and "quick meal"):
    {
      "id": "dyn_q_1",
      "text": "빠르게 준비할 수 있는 한식 중에서, 매운맛에 대한 선호도는 어떠신가요?",
      "options": ["매운 것 매우 선호", "약간 매콤한 정도 선호", "맵지 않은 것 선호", "상관 없음"]
    }

    Now, generate the single new question for ID "dyn_q_${dynamicQuestionCount}". Output only the JSON object for the new question, or {} if no suitable question can be generated. Ensure all text is in Korean.
  `;
    const response: GenerateContentResponse = await currentAi.models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.75, 
      },
    });

    const newQuestion = parseJsonFromText<Question>(response.text);

    if (!newQuestion) {
        console.info("AI returned no additional question or an empty object.", "Raw response text:", response.text);
        return null;
    }

    if (!newQuestion.id || !newQuestion.text || !newQuestion.options || !Array.isArray(newQuestion.options) || newQuestion.options.length < 2) {
      console.error("Invalid additional question format received:", response.text, "Parsed as:", newQuestion);
      return null; 
    }
    newQuestion.id = newQuestion.id === `dyn_q_${dynamicQuestionCount}` ? newQuestion.id : `dyn_q_${dynamicQuestionCount}`;
    return newQuestion;
  });
};

interface DecisionDataCoreFromAI {
  decision: string;
  reasoning: string;
  decisionStrength: string;
  links: Link[]; 
  pros: string[]; 
  cons: string[]; 
}

export const makeDecision = async (
  decisionProblem: string, 
  userAnswers: Record<string, string>, 
  questions: Question[],
  isRegeneration: boolean = false,
  previousDecisionText: string | null = null
): Promise<DecisionData> => {
  return ensureAiClient(async (currentAi) => {
    const formattedAnswers = questions
    .map(q => `질문: "${q.text}"\n선택한 답변: "${userAnswers[q.id] || "답변 없음"}"`)
    .join('\n\n');

  let regenerationInstruction = "";
  if (isRegeneration && previousDecisionText) {
    regenerationInstruction = `You previously suggested: "${previousDecisionText}". Please provide a DIFFERENT but still valid and specific decision and reasoning in Korean, based on the same user inputs. Avoid suggesting "${previousDecisionText}" again.`;
  }

  const prompt = `
    You are a decisive and insightful AI called "결정 마법사" (Decision Genie). You will make a final decision for the user and explain your reasoning in Korean.
    Your primary goal is to provide a clear, actionable solution or choice in Korean, not just general guidance.
    The user's original problem was: "${decisionProblem}"

    They provided the following answers (in Korean) to a series of contextual questions:
    --- START OF USER ANSWERS ---
    ${formattedAnswers}
    --- END OF USER ANSWERS ---

    ${regenerationInstruction}

    Based *only* on the original problem description and the user's answers to ALL the questions provided above, please:
    1.  Make a **highly specific, concrete, and directly actionable** decision for the user in Korean. The decision must clearly state what the user should *do*, *choose*, or *focus on* as a practical next step. Avoid vague advice. The decision should be a tangible suggestion that directly addresses their problem, informed by ALL their answers. It should be empathetic and encouraging. (Output in Korean)
    2.  Provide a clear and empathetic explanation for this decision in Korean (minimum 70 characters for reasoning). This explanation should detail:
        - How their answers to ALL questions and the original problem influenced this **specific, actionable decision**.
        - The logical steps or considerations that led to this particular choice, making it clear why it's a good fit.
        - Reassurance that this decision is based on all the information they provided. (Output in Korean)
    3.  Provide a "decisionStrength" field in Korean indicating your confidence or the nature of the decision. Examples for decisionStrength: "매우 확신해요!", "좋은 선택이 될 거예요!", "균형 잡힌 결정이에요", "분명 도움이 될 거예요!", "꽤 실용적인 제안이에요!", "한번 시도해볼 만해요!", "신중하게 고려된 제안이에요". Choose one that fits the context and the specificity of your decision. (Output in Korean)
    4.  Generate a 'links' array containing 2-3 **actionable and relevant web resources** in Korean. These links should directly help the user act on your decision or learn more. Examples:
        - If suggesting a specific recipe: a link to a similar recipe online.
        - If suggesting a type of product: a link to a search query on a major e-commerce site (e.g., "https://search.shopping.naver.com/search/all?query=PRODUCT_NAME") or a general category page.
        - If suggesting an activity: a link to a Google Maps search for relevant places (e.g., "https://www.google.com/maps/search/ACTIVITY+near+me") or an informative article about it.
        - If the decision is about learning/research: links to relevant articles or educational resources.
       Each link object in the array must have 'title' (descriptive, in Korean, e.g., "네이버 쇼핑에서 [상품명] 검색 결과 보기", "[요리명] 레시피 찾아보기") and 'uri' (a valid URL).
       **Crucially, you must always provide these 2-3 manually curated link suggestions as a primary offering or valuable supplement, even if you anticipate Google Search (which is enabled) will find information.** Aim for high utility and specific, helpful links. Titles must be in Korean.
    5.  Generate a 'pros' array containing 2-3 concise strings in Korean, outlining the main advantages or positive aspects of the decision you've made. (Output in Korean)
    6.  Generate a 'cons' array containing 2-3 concise strings in Korean, outlining potential drawbacks, considerations, or things the user should be mindful of regarding the decision. (Output in Korean)

    Return your response as a JSON object with six keys: "decision", "reasoning", "decisionStrength", "links", "pros", and "cons".

    Example (without regeneration, all text in Korean):
    User problem: "오늘 저녁 뭐 먹을까요?"
    Answers: (Formatted as above)
    ...

    Expected JSON output (output only this JSON object, ensure all textual values are in Korean):
    {
      "decision": "오늘 저녁으로는 냉장고에 있는 재료를 활용해 20분 안에 만들 수 있는 약간 매콤한 돼지고기 김치볶음밥을 추천합니다! 맛있게 드시고 에너지 넘치는 저녁 되세요!",
      "reasoning": "사용자님께서는 '빠르고 간편한 것', '한식', '30분 이내'로 저녁 식사를 원하셨고, 추가적으로 '약간 매콤한 맛'을 선호한다고 답변해주셨습니다. 돼지고기 김치볶음밥은 이러한 모든 조건들을 완벽하게 만족시키는 훌륭한 선택입니다. ... 사용자님의 모든 답변을 종합적으로 고려하여 이 구체적인 결정을 내렸습니다.",
      "decisionStrength": "매우 실용적인 제안이에요!",
      "links": [
        { "title": "백종원 김치볶음밥 레시피 검색", "uri": "https://www.google.com/search?q=백종원+김치볶음밥+레시피" },
        { "title": "네이버 쇼핑에서 간편 김치볶음밥 키트 찾아보기", "uri": "https://search.shopping.naver.com/search/all?query=간편+김치볶음밥+키트" }
      ],
      "pros": [
        "냉장고 속 재료를 활용하여 경제적입니다.",
        "20분 안에 빠르게 완성할 수 있어 시간을 절약합니다.",
        "익숙하면서도 맛있는 한 끼 식사가 됩니다."
      ],
      "cons": [
        "돼지고기나 김치가 없다면 추가 장보기가 필요할 수 있습니다.",
        "매운 음식을 잘 못 드시는 분께는 자극적일 수 있습니다.",
        "레시피에 따라 맛의 편차가 있을 수 있습니다."
      ]
    }

    Now, make the decision and provide reasoning, links, pros, and cons for the user's problem and their answers to ALL questions. Output only the JSON object. Ensure all text values are in Korean.
  `;
    const response: GenerateContentResponse = await currentAi.models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: prompt,
      config: {
        tools: [{googleSearch: {}}], 
        temperature: isRegeneration ? 0.7 : 0.5,
      },
    });
    
    const parsedAIResult = parseJsonFromText<DecisionDataCoreFromAI>(response.text);

    if (!parsedAIResult || 
        typeof parsedAIResult.decision !== 'string' || 
        typeof parsedAIResult.reasoning !== 'string' || 
        typeof parsedAIResult.decisionStrength !== 'string' ||
        parsedAIResult.decision.length < 5 || 
        parsedAIResult.reasoning.length < 20 || 
        parsedAIResult.decisionStrength.length < 2 ||
        !parsedAIResult.links || !Array.isArray(parsedAIResult.links) || 
        parsedAIResult.links.some(l => typeof l.uri !== 'string' || typeof l.title !== 'string' || !l.uri || !l.title) ||
        !parsedAIResult.pros || !Array.isArray(parsedAIResult.pros) || parsedAIResult.pros.some(p => typeof p !== 'string') ||
        !parsedAIResult.cons || !Array.isArray(parsedAIResult.cons) || parsedAIResult.cons.some(c => typeof c !== 'string')
        ) {
      console.error("Invalid core decision format or missing/malformed links, pros, or cons received:", response.text, "Parsed as:", parsedAIResult);
      throw new Error("AI로부터 유효한 형식의 결정, 이유, 결정 강도, 링크, 장점 또는 단점 정보를 받지 못했습니다. 내용이 충분히 구체적인지, 각 항목의 형식이 올바른지 확인해주세요.");
    }

    let finalLinks: Link[] = [];
    const aiSuggestedLinks = parsedAIResult.links || []; 

    const searchProvidedLinks: Link[] = [];
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;

    if (groundingChunks && Array.isArray(groundingChunks) && groundingChunks.length > 0) {
      groundingChunks.forEach((chunk: any) => {
        if (chunk.web && chunk.web.uri) {
          searchProvidedLinks.push({
            uri: chunk.web.uri,
            title: chunk.web.title || chunk.web.uri, 
          });
        }
      });
    }

    const linkUriSet = new Set<string>();

    searchProvidedLinks.forEach(link => {
      if (link.uri && !linkUriSet.has(link.uri)) {
        finalLinks.push(link);
        linkUriSet.add(link.uri);
      }
    });

    aiSuggestedLinks.forEach(link => {
      if (link.uri && !linkUriSet.has(link.uri)) {
        finalLinks.push(link);
        linkUriSet.add(link.uri);
      }
    });
    
    let additionalInfoText: string | undefined = undefined;
    if (finalLinks.length > 0) {
      if (searchProvidedLinks.length > 0 && aiSuggestedLinks.some(aiLink => !searchProvidedLinks.find(sLink => sLink.uri === aiLink.uri))) {
        additionalInfoText = "다음은 결정과 관련된 웹 검색 결과 및 추천 자료입니다 (한국어):";
      } else if (searchProvidedLinks.length > 0) {
        additionalInfoText = "다음은 결정과 관련된 웹 검색 결과입니다 (한국어):";
      } else if (aiSuggestedLinks.length > 0) {
        additionalInfoText = "다음은 결정을 뒷받침하는 추천 자료 및 정보입니다 (한국어):";
      }
    }

    const additionalInfoResult: AdditionalInfo | null = finalLinks.length > 0 ? {
      text: additionalInfoText,
      sourceLinks: finalLinks,
    } : null; 

    return {
      decision: parsedAIResult.decision,
      reasoning: parsedAIResult.reasoning,
      decisionStrength: parsedAIResult.decisionStrength,
      additionalInfo: additionalInfoResult,
      pros: parsedAIResult.pros,
      cons: parsedAIResult.cons,
    };
  });
};

export const askFollowUpQuestion = async (
  originalProblem: string,
  mainDecisionText: string,
  mainReasoningText: string,
  userFollowUpQuery: string
): Promise<string> => {
 return ensureAiClient(async (currentAi) => {
    const prompt = `
    You are "결정 마법사" (Decision Genie). The user was given a main decision and reasoning, and now they have a follow-up question.
    Original Problem (in Korean): "${originalProblem}"
    Main Decision Provided to User (in Korean): "${mainDecisionText}"
    Reasoning for Main Decision (in Korean): "${mainReasoningText}"

    User's Follow-up Question (in Korean): "${userFollowUpQuery}"

    Please provide a concise, helpful, and direct answer IN KOREAN to the user's follow-up question.
    Your answer should be consistent with the main decision and reasoning provided earlier.
    Focus solely on answering the follow-up question. Do not re-evaluate the main decision unless the question explicitly asks for an alternative.
    Keep the answer relatively brief (e.g., 1-3 sentences).
    Output only the text of your answer in Korean. Do not include any markdown or JSON formatting.
  `;
    const response: GenerateContentResponse = await currentAi.models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: prompt,
      config: {
        temperature: 0.6, 
      },
    });

    const followUpAnswerText = response.text.trim();
    if (!followUpAnswerText) {
      console.error("AI returned an empty answer for the follow-up question. Raw response:", response.text);
      throw new Error("AI가 후속 질문에 대한 답변을 제공하지 않았습니다.");
    }
    return followUpAnswerText;
  });
};

export const suggestDecisionProblems = async (): Promise<string[]> => {
  return ensureAiClient(async (currentAi) => {
    const prompt = `
    You are a helpful assistant AI called "결정 마법사" (Decision Genie).
    Your goal is to help users who are unsure what decision they want help with.
    Please suggest 3 to 5 common, everyday decision-making problems or questions that people often face.
    Phrase these suggestions as engaging questions in Korean.
    Keep each suggestion relatively concise and ensure they sound natural and empathetic.

    Return your response as a JSON array of strings. Each string should be one suggested problem in Korean.

    Example (all suggestions in Korean):
    [
      "오늘 저녁, 무엇을 먹어야 하루의 피로가 풀릴까요?",
      "새로운 취미로 일상에 작은 즐거움을 더해볼까요?",
      "이번 주말, 어떤 활동으로 재충전의 시간을 가질까요?",
      "어떤 책을 읽으며 잠시 현실을 잊고 빠져들어 볼까요?",
      "소소한 변화로 기분 전환을 하고 싶은데, 어떤 시도가 좋을까요?"
    ]

    Output only the JSON array. Make sure the output is a valid JSON array of strings, and all strings are in Korean.
  `;
    const response: GenerateContentResponse = await currentAi.models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.8,
      },
    });

    const suggestions = parseJsonFromText<string[]>(response.text);

    if (!suggestions || !Array.isArray(suggestions) || suggestions.some(s => typeof s !== 'string')) {
      console.error("Invalid suggestions format received:", response.text, "Parsed as:", suggestions);
      throw new Error("AI로부터 유효한 형식의 고민거리 제안을 받지 못했습니다.");
    }
    return suggestions;
  });
};
