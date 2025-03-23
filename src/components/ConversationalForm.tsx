
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useFormStore } from '@/utils/formStore';
import { ConversationalForm as FormType, FormResponse, FormQuestion } from '@/utils/formTypes';
import { toast } from 'sonner';
import { Send, Loader2, ThumbsUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConversationalFormProps {
  formId: string;
}

interface Message {
  id: string;
  content: string;
  sender: 'ai' | 'user';
  questionId?: string;
}

const ConversationalForm: React.FC<ConversationalFormProps> = ({ formId }) => {
  const { getForm, addSubmission } = useFormStore();
  const [form, setForm] = useState<FormType | null>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1);
  const [currentQuestion, setCurrentQuestion] = useState<FormQuestion | null>(null);
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [formComplete, setFormComplete] = useState(false);
  const [formStarted, setFormStarted] = useState(false);
  const [processing, setProcessing] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
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
  
  // Handle submitting a response
  const handleSubmitResponse = () => {
    if (!currentInput.trim() || !currentQuestion) return;
    
    const userMessage: Message = {
      id: `r-${currentQuestion.id}`,
      content: currentInput,
      sender: 'user',
      questionId: currentQuestion.id,
    };
    
    // Add user's response to messages
    setMessages((prev) => [...prev, userMessage]);
    
    // Add to responses for form submission
    setResponses((prev) => [
      ...prev,
      {
        questionId: currentQuestion.id,
        answer: currentInput,
      },
    ]);
    
    // Clear input
    setCurrentInput('');
    setProcessing(true);
    
    // Simulate AI thinking (for UX purposes)
    setTimeout(() => {
      // Move to next question
      const nextIndex = currentQuestionIndex + 1;
      
      if (nextIndex < (form?.questions.length || 0)) {
        const nextQuestion = form!.questions[nextIndex];
        setCurrentQuestionIndex(nextIndex);
        setCurrentQuestion(nextQuestion);
        
        // Add next question as a message
        setMessages((prev) => [
          ...prev,
          {
            id: `q-${nextQuestion.id}`,
            content: nextQuestion.prompt,
            sender: 'ai',
            questionId: nextQuestion.id,
          },
        ]);
      } else {
        // Form is complete
        setFormComplete(true);
        setCurrentQuestion(null);
        
        // Add thank you message
        const thankYouMessage = form?.thankyouMessage || 'Thank you for your responses!';
        setMessages((prev) => [
          ...prev,
          {
            id: 'thank-you',
            content: thankYouMessage,
            sender: 'ai',
          },
        ]);
        
        // Submit the form responses
        addSubmission({
          formId: form!.id,
          responses,
        });
      }
      
      setProcessing(false);
    }, 1000);
  };
  
  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    
    // Focus input when a new question is presented
    if (currentQuestion && inputRef.current && !processing) {
      inputRef.current.focus();
    }
  }, [messages, currentQuestion, processing]);
  
  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
      <div className="flex flex-col h-[70vh] md:h-[600px] rounded-lg border border-border overflow-hidden glass">
        {/* Header */}
        <div className="p-4 border-b border-border bg-primary/5">
          <h2 className="text-lg font-medium">{form.title}</h2>
          {form.description && <p className="text-sm text-muted-foreground mt-1">{form.description}</p>}
        </div>
        
        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className={`chat-bubble ${
                  message.sender === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'
                }`}
              >
                {message.content}
              </motion.div>
            ))}
          </AnimatePresence>
          
          {processing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="chat-bubble chat-bubble-ai w-16"
            >
              <div className="loading-dots">
                <div></div>
                <div></div>
                <div></div>
              </div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        {/* Input area */}
        <div className="p-4 border-t border-border bg-background/50">
          {!formStarted ? (
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button onClick={startForm} className="w-full">
                Start Form
              </Button>
            </motion.div>
          ) : formComplete ? (
            <div className="flex items-center justify-center py-2">
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
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmitResponse();
              }}
              className="flex items-center space-x-2"
            >
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
                disabled={!currentInput.trim() || processing}
                className="shrink-0"
              >
                {processing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConversationalForm;
