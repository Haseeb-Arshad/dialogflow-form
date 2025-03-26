interface Window {
  SpeechRecognition: any;
  webkitSpeechRecognition: any;
}

interface FormQuestion {
  id: string;
  prompt: string;
  type: string;
  required: boolean;
  helpText?: string;
} 