
import React, { useState, useEffect } from 'react';
import { useFormStore } from '@/utils/formStore';
import { FormQuestion } from '@/utils/formTypes';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { PlusCircle, Trash2, ArrowDownUp, Pencil, MessageSquare, Settings, Save } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate, useParams } from 'react-router-dom';

interface FormCreatorProps {
  editMode?: boolean;
}

const FormCreator: React.FC<FormCreatorProps> = ({ editMode = false }) => {
  const navigate = useNavigate();
  const { formId } = useParams<{ formId?: string }>();
  
  const { addForm, updateForm, getForm } = useFormStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState<FormQuestion[]>([]);
  const [aiInstructions, setAiInstructions] = useState('');
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [thankyouMessage, setThankyouMessage] = useState('');
  const [activeTab, setActiveTab] = useState('questions');
  
  useEffect(() => {
    if (editMode && formId) {
      const form = getForm(formId);
      if (form) {
        setTitle(form.title);
        setDescription(form.description);
        setQuestions(form.questions);
        setAiInstructions(form.aiInstructions || '');
        setWelcomeMessage(form.welcomeMessage || '');
        setThankyouMessage(form.thankyouMessage || '');
      } else {
        toast.error('Form not found');
        navigate('/forms');
      }
    } else {
      // Initialize with example question for new forms
      setQuestions([
        {
          id: uuidv4(),
          prompt: 'What is your name?',
          type: 'text',
          required: true,
        },
      ]);
      setWelcomeMessage('Hi there! I have a few questions for you.');
      setThankyouMessage('Thank you for your responses!');
    }
  }, [editMode, formId, getForm, navigate]);
  
  const addQuestion = () => {
    const newQuestion: FormQuestion = {
      id: uuidv4(),
      prompt: '',
      type: 'text',
      required: true,
    };
    setQuestions([...questions, newQuestion]);
  };
  
  const updateQuestion = (index: number, updates: Partial<FormQuestion>) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = { ...updatedQuestions[index], ...updates };
    setQuestions(updatedQuestions);
  };
  
  const removeQuestion = (index: number) => {
    const updatedQuestions = [...questions];
    updatedQuestions.splice(index, 1);
    setQuestions(updatedQuestions);
  };
  
  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === questions.length - 1)
    ) {
      return;
    }
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const updatedQuestions = [...questions];
    [updatedQuestions[index], updatedQuestions[newIndex]] = [
      updatedQuestions[newIndex],
      updatedQuestions[index],
    ];
    
    setQuestions(updatedQuestions);
  };
  
  const handleSave = () => {
    // Validate form data
    if (!title.trim()) {
      toast.error('Please enter a form title');
      return;
    }
    
    if (questions.length === 0) {
      toast.error('Please add at least one question');
      return;
    }
    
    // Check if any questions are empty
    const hasEmptyPrompt = questions.some(q => !q.prompt.trim());
    if (hasEmptyPrompt) {
      toast.error('All questions must have a prompt');
      return;
    }
    
    try {
      if (editMode && formId) {
        updateForm(formId, {
          title,
          description,
          questions,
          aiInstructions,
          welcomeMessage,
          thankyouMessage,
        });
        toast.success('Form updated successfully');
        navigate(`/view/${formId}`);
      } else {
        const newFormId = addForm({
          title,
          description,
          questions,
          aiInstructions,
          welcomeMessage,
          thankyouMessage,
        });
        toast.success('Form created successfully');
        navigate(`/view/${newFormId}`);
      }
    } catch (error) {
      toast.error('Failed to save form');
      console.error(error);
    }
  };
  
  return (
    <div className="w-full max-w-5xl mx-auto my-8 px-4">
      <div className="mb-8 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">{editMode ? 'Edit Form' : 'Create New Form'}</h1>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">
              <Save className="mr-2 h-4 w-4" />
              Save Form
            </Button>
          </motion.div>
        </div>
        <p className="text-muted-foreground">
          {editMode
            ? 'Update your conversational form below.'
            : 'Create a new conversational form by adding questions below.'}
        </p>
      </div>
      
      <Card className="glass">
        <CardContent className="pt-6">
          <div className="space-y-4 mb-6">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Form Title
              </label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter form title"
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description (optional)
              </label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter form description"
                className="resize-none"
              />
            </div>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full mb-6">
              <TabsTrigger value="questions" className="flex-1">
                <MessageSquare className="mr-2 h-4 w-4" />
                Questions
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex-1">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="questions" className="space-y-6">
              <AnimatedList>
                {questions.map((question, index) => (
                  <QuestionCard
                    key={question.id}
                    question={question}
                    index={index}
                    updateQuestion={(updates) => updateQuestion(index, updates)}
                    removeQuestion={() => removeQuestion(index)}
                    moveQuestion={(direction) => moveQuestion(index, direction)}
                    isFirst={index === 0}
                    isLast={index === questions.length - 1}
                  />
                ))}
              </AnimatedList>
              
              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="w-full"
              >
                <Button
                  onClick={addQuestion}
                  variant="outline"
                  className="w-full mt-4 border-dashed"
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Question
                </Button>
              </motion.div>
            </TabsContent>
            
            <TabsContent value="settings" className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="welcome" className="text-sm font-medium">
                  Welcome Message
                </label>
                <Textarea
                  id="welcome"
                  value={welcomeMessage}
                  onChange={(e) => setWelcomeMessage(e.target.value)}
                  placeholder="Enter a welcome message for respondents"
                  className="resize-none"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="thankyou" className="text-sm font-medium">
                  Thank You Message
                </label>
                <Textarea
                  id="thankyou"
                  value={thankyouMessage}
                  onChange={(e) => setThankyouMessage(e.target.value)}
                  placeholder="Enter a thank you message for when respondents complete the form"
                  className="resize-none"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="aiInstructions" className="text-sm font-medium">
                  AI Instructions (Optional)
                </label>
                <Textarea
                  id="aiInstructions"
                  value={aiInstructions}
                  onChange={(e) => setAiInstructions(e.target.value)}
                  placeholder="Enter any special instructions for how the AI should interact with respondents"
                  className="resize-none min-h-24"
                />
                <p className="text-xs text-muted-foreground">
                  These instructions help guide how the AI should interact with respondents.
                  For example: "Be friendly and conversational. Ask follow-up questions for vague answers."
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

interface QuestionCardProps {
  question: FormQuestion;
  index: number;
  updateQuestion: (updates: Partial<FormQuestion>) => void;
  removeQuestion: () => void;
  moveQuestion: (direction: 'up' | 'down') => void;
  isFirst: boolean;
  isLast: boolean;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  index,
  updateQuestion,
  removeQuestion,
  moveQuestion,
  isFirst,
  isLast,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      className="w-full"
    >
      <Card className="border border-border">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Pencil className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-sm font-medium">Question {index + 1}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => moveQuestion('up')}
                disabled={isFirst}
                className="h-8 w-8"
              >
                <ArrowDownUp className="h-4 w-4 rotate-180" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => moveQuestion('down')}
                disabled={isLast}
                className="h-8 w-8"
              >
                <ArrowDownUp className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={removeQuestion}
                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor={`prompt-${question.id}`} className="text-sm font-medium">
                Question Prompt
              </label>
              <Textarea
                id={`prompt-${question.id}`}
                value={question.prompt}
                onChange={(e) => updateQuestion({ prompt: e.target.value })}
                placeholder="Enter your question"
                className="resize-none"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor={`type-${question.id}`} className="text-sm font-medium">
                  Response Type
                </label>
                <select
                  id={`type-${question.id}`}
                  value={question.type}
                  onChange={(e) => updateQuestion({ type: e.target.value as any })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="text">Short Text</option>
                  <option value="multiline">Paragraph</option>
                  <option value="yes-no">Yes/No</option>
                  <option value="options">Multiple Choice</option>
                  <option value="email">Email</option>
                  <option value="number">Number</option>
                  <option value="rating">Rating</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Required</label>
                <div className="flex items-center h-10">
                  <input
                    type="checkbox"
                    id={`required-${question.id}`}
                    checked={question.required}
                    onChange={(e) => updateQuestion({ required: e.target.checked })}
                    className="rounded border-gray-300 text-primary focus:ring-primary/80"
                  />
                  <label
                    htmlFor={`required-${question.id}`}
                    className="ml-2 text-sm text-muted-foreground"
                  >
                    Make this question required
                  </label>
                </div>
              </div>
            </div>
            
            {question.type === 'options' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Options</label>
                <div className="space-y-2">
                  {(question.options || []).map((option, optIndex) => (
                    <div key={optIndex} className="flex gap-2">
                      <Input
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...(question.options || [])];
                          newOptions[optIndex] = e.target.value;
                          updateQuestion({ options: newOptions });
                        }}
                        placeholder={`Option ${optIndex + 1}`}
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          const newOptions = [...(question.options || [])];
                          newOptions.splice(optIndex, 1);
                          updateQuestion({ options: newOptions });
                        }}
                        className="h-10 w-10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    onClick={() => {
                      const newOptions = [...(question.options || []), ''];
                      updateQuestion({ options: newOptions });
                    }}
                    className="w-full mt-2"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Option
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const AnimatedList: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <motion.div className="space-y-4">
      {React.Children.map(children, (child, i) => (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: 1, 
            y: 0, 
            transition: { delay: i * 0.05 } 
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};

export default FormCreator;
