
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
}
