export type FormStatus = 'active' | 'paused' | 'expired';

export interface FormQuestion {
  id: string;
  prompt: string;
  type: 'text' | 'multiline' | 'options' | 'yes-no' | 'rating' | 'email' | 'number';
  options?: string[];
  required: boolean;
}

export interface FormResponse {
  questionId: string;
  answer: string;
}

export interface FormSubmission {
  id: string;
  formId: string;
  responses: FormResponse[];
  submittedAt: Date;
}

export interface FormSchedule {
  startDate: Date;
  endDate: Date | null; // null means no expiration
  timeZone: string;
}

export interface FormAnalytics {
  totalViews: number;
  totalResponses: number;
  averageCompletionTime: number;
  lastResponseDate?: Date;
}

export interface FormAIConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  responseInstructions: string;
  behaviorGuidelines: string;
}

export interface ConversationalForm {
  id: string;
  title: string;
  description: string;
  questions: FormQuestion[];
  createdAt: Date;
  updatedAt: Date;
  shareLink: string;
  aiInstructions?: string;
  welcomeMessage?: string;
  thankyouMessage?: string;
  isPublished: boolean;
  status: FormStatus;
  schedule: FormSchedule;
  analytics: FormAnalytics;
  aiConfig: FormAIConfig;
  lastPausedAt?: Date;
  lastResumedAt?: Date;
}
