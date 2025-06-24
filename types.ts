
export interface Question {
  id: string;
  text: string;
  options: string[];
}

export interface Link {
  title: string;
  uri: string; 
}

export interface AdditionalInfo {
  text?: string;
  sourceLinks?: Link[]; 
}

// Structure for the core data provided by the AI for a decision
export interface DecisionData {
  decision: string;
  reasoning: string;
  decisionStrength: string; 
  additionalInfo?: AdditionalInfo | null; 
  pros?: string[]; 
  cons?: string[]; 
}

// Structure for storing a complete decision record in history (localStorage, import/export)
export interface SavedDecision {
  id: string; // Must be unique string, typically a timestamp or UUID
  savedAt: string; // Must be an ISO date string
  problemDescription: string; // User's problem
  questions: Question[]; // Array of Question objects asked
  answers: Record<string, string>; // Key-value store of question.id to selected answer string
  decisionData: DecisionData; // The AI's decision output
}

export enum AppStep {
  WELCOME,
  SHOWING_SUGGESTIONS, 
  ASKING_PROBLEM,
  GENERATING_QUESTIONS,
  ANSWERING_QUESTIONS,
  GENERATING_DECISION,
  REGENERATING_DECISION, 
  SHOWING_DECISION,
  SHOWING_HISTORY, 
  SHOWING_HISTORY_DETAIL, 
  ERROR,
}
