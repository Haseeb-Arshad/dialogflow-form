export type FormStatus = 'active' | 'paused' | 'draft' | 'archived';

export interface FormQuestion {
  id: string;
  prompt: string;
  type: 'text' | 'multiline' | 'yes-no' | 'options' | 'rating' | 'media';
  required: boolean;
  options?: string[];
  category?: string;
}

export interface FormResponse {
  id: string;
  formId: string;
  userId?: string;
  userName?: string;
  responses: Array<{
    questionId: string;
    question: string;
    answer: string;
    category?: string;
  }>;
  startedAt: Date;
  completedAt: Date;
  completionTime: number; // in seconds
  metadata?: {
    userAgent?: string;
    ipAddress?: string;
    location?: string;
  };
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
  aiInstructions?: string;
  welcomeMessage?: string;
  thankyouMessage?: string;
  createdAt: Date;
  updatedAt: Date;
  schedule: {
    startDate: Date;
    endDate: Date | null;
    timeZone: string;
  };
  aiConfig: {
    model: string;
    temperature: number;
    maxTokens: number;
    responseInstructions?: string;
    behaviorGuidelines?: string;
  };
  status: FormStatus;
  analytics?: {
    totalViews: number;
    totalResponses: number;
    averageCompletionTime: number;
    responseHistory?: Array<{ date: string; count: number }>;
  };
  visualizations?: Array<{
    id: string;
    type: 'bar' | 'pie' | 'line' | 'area' | 'scatter';
    title: string;
    data: Array<Record<string, any>>;
    config: Record<string, any>;
  }>;
  polls?: Array<{
    id: string;
    question: string;
    options: string[];
    allowMultipleSelections: boolean;
    displayType: 'bar' | 'pie';
  }>;
}
