import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useFormStore } from '@/utils/formStore';
import { ConversationalForm as FormType, FormResponse, FormQuestion } from '@/utils/formTypes';
import { toast } from 'sonner';
import { Send, Loader2, ThumbsUp, Mic, MicOff, Image, HelpCircle, Smile, Frown, Meh, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader } from '@progress/kendo-react-indicators';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import VoiceInput from '@/components/VoiceInput';

interface ConversationalFormProps {
  formId: string;
}

interface Message {
  id: string;
  content: string;
  sender: 'ai' | 'user';
  questionId?: string;
  mediaUrl?: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
}

// Simple sentiment analysis function
const analyzeSentiment = (text: string): 'positive' | 'neutral' | 'negative' => {
  const positiveWords = ['good', 'great', 'excellent', 'amazing', 'happy', 'love', 'like', 'yes', 'agree'];
  const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'dislike', 'no', 'disagree', 'poor', 'worst'];
  
  const lowerText = text.toLowerCase();
  
  let positiveScore = 0;
  let negativeScore = 0;
  
  positiveWords.forEach(word => {
    if (lowerText.includes(word)) positiveScore++;
  });
  
  negativeWords.forEach(word => {
    if (lowerText.includes(word)) negativeScore++;
  });
  
  if (positiveScore > negativeScore) return 'positive';
  if (negativeScore > positiveScore) return 'negative';
  return 'neutral';
};

const ConversationalForm: React.FC<ConversationalFormProps> = ({ formId }) => {
  const { getForm, addSubmission } = useFormStore();
  const [form, setForm] = useState<FormType | null>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1);
  const [currentQuestion, setCurrentQuestion] = useState<FormQuestion | null>(null);
  const [formResponses, setFormResponses] = useState<FormResponse[]>([]);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [formComplete, setFormComplete] = useState(false);
  const [formStarted, setFormStarted] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [mediaAttachment, setMediaAttachment] = useState<string | null>(null);
  const [theme, setTheme] = useState<'default' | 'positive' | 'negative' | 'neutral'>('default');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Load form data
  useEffect(() => {
    const loadForm = () => {
      const formData = getForm(formId);
      if (formData) {
        setForm(formData);
        // Add welcome message if available
        if (formData.welcomeMessage) {
          setMessages([
            {
              id: 'welcome',
              content: formData.welcomeMessage,
              sender: 'ai',
            },
          ]);
        }
      } else {
        toast.error('Form not found');
      }
      setLoading(false);
    };
    
    loadForm();
  }, [formId, getForm]);
  
  // Handle starting the form
  const startForm = () => {
    if (!form) return;
    
    setFormStarted(true);
    
    // Move to the first question
    if (form.questions.length > 0) {
      const firstQuestion = form.questions[0];
      setCurrentQuestionIndex(0);
      setCurrentQuestion(firstQuestion);
      
      // Add the first question as a message
      setMessages((prev) => [
        ...prev,
        {
          id: `q-${firstQuestion.id}`,
          content: firstQuestion.prompt,
          sender: 'ai',
          questionId: firstQuestion.id,
        },
      ]);
    }
  };
  
  // Handle speech result from VoiceInput
  const handleSpeechResult = (text: string) => {
    setCurrentInput(text);
  };
  
  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file type and size
    if (!file.type.startsWith('image/')) {
      toast.error('Only image files are supported');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error('File size should be less than 5MB');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setMediaAttachment(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };
  
  // Handle asking for clarification
  const askForClarification = () => {
    if (!currentQuestion) return;
    
    setProcessing(true);
    
    // Simulate AI thinking
    setTimeout(() => {
      const clarificationMessage: Message = {
        id: `clarify-${currentQuestion.id}`,
        content: `Let me clarify that question: "${currentQuestion.prompt}" is asking about ${
          currentQuestion.type === 'email' ? 'your email address' : 
          currentQuestion.type === 'number' ? 'a numerical value' : 
          currentQuestion.type === 'multiline' ? 'a detailed response' : 
          'your thoughts or preferences'
        }. ${currentQuestion.helpText || 'Feel free to provide as much detail as you like.'}`,
        sender: 'ai',
      };
      
      setMessages(prev => [...prev, clarificationMessage]);
      setProcessing(false);
    }, 1000);
  };
  
  // Handle submitting a response
  const handleSubmitResponse = () => {
    if ((!currentInput.trim() && !mediaAttachment) || !currentQuestion) return;
    
    // Analyze sentiment
    const sentiment = analyzeSentiment(currentInput);
    
    // Update theme based on sentiment
    setTheme(sentiment);
    
    const userMessage: Message = {
      id: `r-${currentQuestion.id}`,
      content: currentInput,
      sender: 'user',
      questionId: currentQuestion.id,
      mediaUrl: mediaAttachment || undefined,
      sentiment,
    };
    
    // Add user's response to messages
    setMessages((prev) => [...prev, userMessage]);
    
    // Add to responses for form submission
    const newResponse: FormResponse = {
      questionId: currentQuestion.id,
      answer: currentInput,
    };
    
    setFormResponses(prev => [...prev, newResponse]);
    setResponses(prev => ({
      ...prev,
      [currentQuestion.id]: currentInput,
    }));
    
    // Clear input and set processing
    setCurrentInput('');
    setMediaAttachment(null);
    setProcessing(true);
    
    // Move to next question or complete form
    const nextIndex = currentQuestionIndex + 1;
    
    if (form && nextIndex < form.questions.length) {
      const nextQuestion = form.questions[nextIndex];
      setCurrentQuestionIndex(nextIndex);
      setCurrentQuestion(nextQuestion);
      
      // Add next question as a message
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: `q-${nextQuestion.id}`,
            content: nextQuestion.prompt,
            sender: 'ai',
            questionId: nextQuestion.id,
          },
        ]);
        setProcessing(false);
      }, 1000);
    } else {
      // Form is complete - Submit all responses
      if (form) {
        addSubmission({
          formId: form.id,
          responses: formResponses,
          submittedAt: new Date(),
        });
      }
      
      setFormComplete(true);
      setCurrentQuestion(null);
      
      // Add thank you message
      setTimeout(() => {
        const thankYouMessage = form?.thankyouMessage || 'Thank you for your responses!';
        setMessages((prev) => [
          ...prev,
          {
            id: 'thank-you',
            content: thankYouMessage,
            sender: 'ai',
          },
        ]);
        setProcessing(false);
      }, 1000);
    }
  };
  
  // Get theme class based on current theme
  const getThemeClass = useCallback(() => {
    switch (theme) {
      case 'positive':
        return 'bg-gradient-to-br from-green-50 to-blue-50 border-green-200';
      case 'negative':
        return 'bg-gradient-to-br from-red-50 to-orange-50 border-red-200';
      case 'neutral':
        return 'bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200';
      default:
        return 'bg-background/50 border-border';
    }
  }, [theme]);
  
  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    
    // Focus input when a new question is presented
    if (currentQuestion && inputRef.current && !processing) {
      inputRef.current.focus();
    }
  }, [messages, currentQuestion, processing]);
  
  // Get sentiment icon
  const getSentimentIcon = (sentiment?: 'positive' | 'neutral' | 'negative') => {
    switch (sentiment) {
      case 'positive':
        return <Smile className="h-4 w-4 text-green-500" />;
      case 'negative':
        return <Frown className="h-4 w-4 text-red-500" />;
      case 'neutral':
        return <Meh className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };
  
  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center">
        <Loader 
          type="converging-spinner"
          themeColor="primary" 
          size="large"
        />
        <p className="mt-4 text-muted-foreground">Loading form...</p>
      </div>
    );
  }
  
  if (!form) {
    return (
      <div className="h-96 flex flex-col items-center justify-center">
        <p className="text-xl text-muted-foreground">This form doesn't exist or has been deleted.</p>
      </div>
    );
  }
  
  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card className={`overflow-hidden border shadow-md ${getThemeClass()}`}>
        <CardHeader className="bg-background/50 backdrop-blur-sm border-b">
          <CardTitle>{form.title}</CardTitle>
          {form.description && <CardDescription>{form.description}</CardDescription>}
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="h-[400px] overflow-y-auto p-4 space-y-4">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.sender === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <div className="flex items-center space-x-1">
                      {message.sender === 'user' && message.sentiment && (
                        <div className="ml-auto">{getSentimentIcon(message.sentiment)}</div>
                      )}
                    </div>
                    <p className="text-sm">{message.content}</p>
                    {message.mediaUrl && (
                      <div className="mt-2">
                        <img
                          src={message.mediaUrl}
                          alt="Attached media"
                          className="max-w-full h-auto rounded-md"
                        />
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        </CardContent>
        
        <CardFooter className="border-t bg-background/50 backdrop-blur-sm p-4">
          {!formStarted ? (
            <Button 
              onClick={startForm} 
              className="w-full"
            >
              Start Form
            </Button>
          ) : formComplete ? (
            <div className="w-full flex items-center justify-center space-x-2">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
              >
                <ThumbsUp className="h-8 w-8 text-primary" />
              </motion.div>
              <p className="ml-2 text-muted-foreground">Form completed! Thank you for your responses.</p>
            </div>
          ) : (
            <div className="w-full space-y-3">
              {mediaAttachment && (
                <div className="relative w-full rounded-md overflow-hidden border border-border">
                  <img 
                    src={mediaAttachment} 
                    alt="Attached media" 
                    className="max-w-full h-auto max-h-32 mx-auto"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6 rounded-full"
                    onClick={() => setMediaAttachment(null)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
              
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmitResponse();
                }}
                className="flex flex-col space-y-2"
              >
                <div className="flex items-center space-x-2">
                  {currentQuestion?.type === 'multiline' ? (
                    <Textarea
                      value={currentInput}
                      onChange={(e) => setCurrentInput(e.target.value)}
                      placeholder="Type your response..."
                      className="flex-1 min-h-[80px]"
                      disabled={processing}
                    />
                  ) : (
                    <Input
                      ref={inputRef}
                      type={currentQuestion?.type === 'email' ? 'email' : currentQuestion?.type === 'number' ? 'number' : 'text'}
                      value={currentInput}
                      onChange={(e) => setCurrentInput(e.target.value)}
                      placeholder="Type your response..."
                      className="flex-1"
                      disabled={processing}
                    />
                  )}
                  <Button
                    type="submit"
                    disabled={(!currentInput.trim() && !mediaAttachment) || processing}
                    className="shrink-0"
                  >
                    {processing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <VoiceInput 
                      onSpeechResult={handleSpeechResult}
                      isListening={isListening}
                      setIsListening={setIsListening}
                      disabled={processing}
                    />
                    
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={processing}
                      className="h-8 w-8 rounded-full"
                    >
                      <Image className="h-4 w-4" />
                    </Button>
                    
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="image/*"
                      className="hidden"
                      aria-label="Upload image"
                    />
                  </div>
                  
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={askForClarification}
                    disabled={processing}
                    className="text-xs"
                  >
                    <HelpCircle className="h-3 w-3 mr-1" />
                    Need help?
                  </Button>
                </div>
              </form>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default ConversationalForm;
