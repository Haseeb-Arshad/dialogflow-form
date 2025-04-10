import React, { useState, useEffect } from 'react';
import { useFormStore } from '@/utils/formStore';
import { FormQuestion, FormStatus } from '@/utils/formTypes';
import { Button as KendoButton } from '@progress/kendo-react-buttons';
import { DropDownList } from '@progress/kendo-react-dropdowns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { PlusCircle, Trash2, ArrowDownUp, Pencil, MessageSquare, Settings, Save, Sparkles, PenLine, ChartBar, Vote } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { DatePicker } from "@progress/kendo-react-dateinputs";
// import { TimePicker } from "@progress/kendo-react-dateinputs";
import { Slider } from "@progress/kendo-react-inputs";
import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import AIFormGenerator from '@/components/AIFormGenerator';
import FormVisualization from '@/components/FormVisualization';
import FormPoll from '@/components/FormPoll';
import { ChartContainer, ResponsiveContainer } from '@/components/ui/chart';

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
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [hasExpiration, setHasExpiration] = useState(false);
  const [model, setModel] = useState("gpt-3.5-turbo");
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(150);
  const [creationMethod, setCreationMethod] = useState<'manual' | 'ai'>(editMode ? 'manual' : 'ai');
  const [visualizations, setVisualizations] = useState<Array<{
    id: string;
    type: 'bar' | 'pie' | 'line' | 'area' | 'scatter';
    title: string;
    data: Array<Record<string, any>>;
    config: Record<string, any>;
  }>>([]);
  const [polls, setPolls] = useState<Array<{
    id: string;
    question: string;
    options: string[];
    allowMultipleSelections: boolean;
    displayType: 'bar' | 'pie';
  }>>([]);

  useEffect(() => {
    if (editMode && formId) {
      const form = getForm(formId);
      if (form) {
        setTitle(form.title);
        setDescription(form.description || '');
        setQuestions(form.questions);
        setAiInstructions(form.aiInstructions || '');
        setWelcomeMessage(form.welcomeMessage || '');
        setThankyouMessage(form.thankyouMessage || '');
        
        // Load scheduling data
        setStartDate(new Date(form.schedule?.startDate || new Date()));
        setEndDate(form.schedule?.endDate ? new Date(form.schedule.endDate) : null);
        setHasExpiration(!!form.schedule?.endDate);
        
        // Load AI config
        setModel(form.aiConfig?.model || "gpt-3.5-turbo");
        setTemperature(form.aiConfig?.temperature || 0.7);
        setMaxTokens(form.aiConfig?.maxTokens || 150);
        
        // Load visualizations and polls if they exist
        if (form.visualizations) setVisualizations(form.visualizations);
        if (form.polls) setPolls(form.polls);
      } else {
        toast.error('Form not found');
        navigate('/forms');
      }
    } else {
      // Default values for new form
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

    const newQuestions = [...questions];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newQuestions[index], newQuestions[newIndex]] = [newQuestions[newIndex], newQuestions[index]];
    setQuestions(newQuestions);
  };

  const handleSave = () => {
    if (!title.trim()) {
      toast.error('Please enter a form title');
      return;
    }

    if (questions.length === 0) {
      toast.error('Please add at least one question');
      return;
    }

    if (questions.some(q => !q.prompt.trim())) {
      toast.error('All questions must have a prompt');
      return;
    }

    try {
      const formData = {
        id: editMode && formId ? formId : uuidv4(),
        title,
        description,
        questions,
        aiInstructions,
        welcomeMessage,
        thankyouMessage,
        createdAt: editMode && formId ? getForm(formId)?.createdAt || new Date() : new Date(),
        updatedAt: new Date(),
        schedule: {
          startDate: startDate,
          endDate: hasExpiration ? endDate : null,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        aiConfig: {
          model,
          temperature,
          maxTokens,
          responseInstructions: aiInstructions,
          behaviorGuidelines: "Be friendly and conversational. Ask follow-up questions when appropriate.",
        },
        status: 'active' as FormStatus,
        analytics: {
          totalViews: editMode && formId ? getForm(formId)?.analytics?.totalViews || 0 : 0,
          totalResponses: editMode && formId ? getForm(formId)?.analytics?.totalResponses || 0 : 0,
          averageCompletionTime: editMode && formId ? getForm(formId)?.analytics?.averageCompletionTime || 0 : 0,
          responseHistory: editMode && formId ? getForm(formId)?.analytics?.responseHistory || [] : [],
        },
        visualizations,
        polls,
      };

      if (editMode && formId) {
        updateForm(formId, formData);
        toast.success('Form updated successfully');
      } else {
        addForm(formData);
        toast.success('Form created successfully');
      }

      navigate('/forms');
    } catch (error) {
      console.error('Error saving form:', error);
      toast.error('An error occurred while saving the form');
    }
  };

  const handleAIFormGenerated = (formData: {
    title: string;
    description: string;
    questions: FormQuestion[];
    welcomeMessage: string;
    thankyouMessage: string;
  }) => {
    setTitle(formData.title);
    setDescription(formData.description);
    setQuestions(formData.questions);
    setWelcomeMessage(formData.welcomeMessage);
    setThankyouMessage(formData.thankyouMessage);
    setCreationMethod('manual'); // Switch to manual mode for further editing
    setActiveTab('questions');
  };

  const handleAddVisualization = (visualization: {
    id: string;
    type: 'bar' | 'pie' | 'line' | 'area' | 'scatter';
    title: string;
    data: Array<Record<string, any>>;
    config: Record<string, any>;
  }) => {
    setVisualizations(prev => [...prev, visualization]);
    toast.success('Visualization added to form');
  };

  const handleAddPoll = (poll: {
    id: string;
    question: string;
    options: string[];
    allowMultipleSelections: boolean;
    displayType: 'bar' | 'pie';
  }) => {
    setPolls(prev => [...prev, poll]);
    toast.success('Poll added to form');
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

      {!editMode && (
        <Tabs value={creationMethod} onValueChange={(value) => setCreationMethod(value as 'manual' | 'ai')} className="mb-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="ai" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              AI-Generated
            </TabsTrigger>
            <TabsTrigger value="manual" className="flex items-center gap-2">
              <PenLine className="h-4 w-4" />
              Manual Creation
            </TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      {creationMethod === 'ai' && !editMode ? (
        <AIFormGenerator onFormGenerated={handleAIFormGenerated} />
      ) : (
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
              <TabsList className="grid grid-cols-5 mb-4">
                <TabsTrigger value="questions" className="flex-1">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Questions
                </TabsTrigger>
                <TabsTrigger value="messages" className="flex-1">
                  <Pencil className="mr-2 h-4 w-4" />
                  Messages
                </TabsTrigger>
                <TabsTrigger value="schedule" className="flex-1">
                  <Settings className="mr-2 h-4 w-4" />
                  Schedule
                </TabsTrigger>
                <TabsTrigger value="visualizations" className="flex-1">
                  <ChartBar className="mr-2 h-4 w-4" />
                  Visualizations
                </TabsTrigger>
                <TabsTrigger value="polls" className="flex-1">
                  <Vote className="mr-2 h-4 w-4" />
                  Polls
                </TabsTrigger>
              </TabsList>

              <TabsContent value="questions" className="space-y-4">
                <AnimatedList>
                  {questions.map((question, index) => (
                    <QuestionCard
                      key={question.id}
                      question={question}
                      index={index}
                      updateQuestion={(updates) => updateQuestion(index, updates)}
                      removeQuestion={() => removeQuestion(index)}
                      moveUp={() => moveQuestion(index, 'up')}
                      moveDown={() => moveQuestion(index, 'down')}
                      isFirst={index === 0}
                      isLast={index === questions.length - 1}
                    />
                  ))}
                </AnimatedList>

                <Button
                  onClick={addQuestion}
                  variant="outline"
                  className="w-full mt-2"
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Question
                </Button>
              </TabsContent>

              <TabsContent value="messages" className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Welcome Message</label>
                    <Textarea
                      value={welcomeMessage}
                      onChange={(e) => setWelcomeMessage(e.target.value)}
                      placeholder="Enter a welcome message for your form"
                      className="resize-none"
                    />
                    <p className="text-xs text-muted-foreground">
                      This message will be shown to users when they first open your form.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Thank You Message</label>
                    <Textarea
                      value={thankyouMessage}
                      onChange={(e) => setThankyouMessage(e.target.value)}
                      placeholder="Enter a thank you message for your form"
                      className="resize-none"
                    />
                    <p className="text-xs text-muted-foreground">
                      This message will be shown to users after they complete your form.
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="schedule">
                <SchedulingSection />
              </TabsContent>

              <TabsContent value="visualizations" className="space-y-6">
                <FormVisualization onAddVisualization={handleAddVisualization} />
                
                {visualizations.length > 0 && (
                  <div className="mt-6 space-y-4">
                    <h3 className="text-lg font-medium">Added Visualizations</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {visualizations.map((viz) => (
                        <Card key={viz.id} className="overflow-hidden">
                          <CardHeader className="py-3">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-sm">{viz.title}</CardTitle>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setVisualizations(prev => prev.filter(v => v.id !== viz.id))}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="p-4">
                            <div className="h-40">
                              <ChartContainer
                                config={{
                                  name: { label: "Category" },
                                  value: { label: "Value" },
                                }}
                              >
                                <ResponsiveContainer width="100%" height="100%">
                                  <div className="flex items-center justify-center h-full bg-muted/30 rounded-md">
                                    <p className="text-sm text-muted-foreground">{viz.type.charAt(0).toUpperCase() + viz.type.slice(1)} Chart</p>
                                  </div>
                                </ResponsiveContainer>
                              </ChartContainer>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="polls" className="space-y-6">
                <FormPoll onAddPoll={handleAddPoll} />
                
                {polls.length > 0 && (
                  <div className="mt-6 space-y-4">
                    <h3 className="text-lg font-medium">Added Polls</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {polls.map((poll) => (
                        <Card key={poll.id}>
                          <CardHeader className="py-3">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-sm">{poll.question}</CardTitle>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setPolls(prev => prev.filter(p => p.id !== poll.id))}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="p-4">
                            <div className="space-y-2">
                              {poll.options.map((option, i) => (
                                <div key={i} className="flex items-center gap-2">
                                  <div className="h-3 w-3 rounded-full bg-primary/80"></div>
                                  <span className="text-sm">{option}</span>
                                </div>
                              ))}
                              <div className="text-xs text-muted-foreground mt-2">
                                {poll.allowMultipleSelections ? 'Multiple selections allowed' : 'Single selection only'} • 
                                {poll.displayType === 'bar' ? ' Bar chart' : ' Pie chart'} results
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

interface QuestionCardProps {
  question: FormQuestion;
  index: number;
  updateQuestion: (updates: Partial<FormQuestion>) => void;
  removeQuestion: () => void;
  moveUp: () => void;
  moveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  index,
  updateQuestion,
  removeQuestion,
  moveUp,
  moveDown,
  isFirst,
  isLast,
}) => {
  const responseTypes = [
    { label: 'Short Text', value: 'text' },
    { label: 'Paragraph', value: 'multiline' },
    { label: 'Yes/No', value: 'yes-no' },
    { label: 'Multiple Choice', value: 'options' },
    { label: 'Email', value: 'email' },
    { label: 'Number', value: 'number' },
    { label: 'Rating', value: 'rating' },
  ];

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
              <KendoButton
                look="outline"
                onClick={moveUp}
                disabled={isFirst}
                className="h-8 w-8"
              >
                <ArrowDownUp className="h-4 w-4 rotate-180" />
              </KendoButton>
              <KendoButton
                look="outline"
                onClick={moveDown}
                disabled={isLast}
                className="h-8 w-8"
              >
                <ArrowDownUp className="h-4 w-4" />
              </KendoButton>
              <KendoButton
                look="flat"
                onClick={removeQuestion}
                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </KendoButton>
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
                <DropDownList
                  id={`type-${question.id}`}
                  data={responseTypes}
                  textField="label"
                  dataItemKey="value"
                  value={responseTypes.find((rt) => rt.value === question.type)}
                  onChange={(e) => updateQuestion({ type: e.value.value })}
                  className="w-full h-8"
                />
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
                  <label htmlFor={`required-${question.id}`} className="ml-2 text-sm text-muted-foreground">
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
                      <KendoButton
                        look="flat"
                        onClick={() => {
                          const newOptions = [...(question.options || [])];
                          newOptions.splice(optIndex, 1);
                          updateQuestion({ options: newOptions });
                        }}
                        className="h-10 w-10 text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </KendoButton>
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
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0, transition: { delay: i * 0.05 } }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};

const SchedulingSection = () => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium">Start Date</label>
        <DatePicker
          value={startDate}
          onChange={(e) => setStartDate(e.value)}
          format="yyyy-MM-dd"
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="hasExpiration"
            checked={hasExpiration}
            onChange={(e) => setHasExpiration(e.target.checked)}
            className="rounded border-gray-300"
          />
          <label htmlFor="hasExpiration" className="text-sm font-medium">
            Set expiration date
          </label>
        </div>

        {hasExpiration && (
          <DatePicker
            value={endDate}
            onChange={(e) => setEndDate(e.value)}
            min={new Date(startDate.getTime() + 86400000)} // min date is start date + 1 day
            format="yyyy-MM-dd"
            className="w-full"
            disabled={!hasExpiration}
          />
        )}
      </div>

      <div className="p-3 bg-muted/50 rounded-md">
        <p className="text-xs text-muted-foreground">
          {hasExpiration
            ? `This form will be available from ${startDate.toLocaleDateString()} to ${
                endDate ? endDate.toLocaleDateString() : 'N/A'
              }`
            : `This form will be available starting from ${startDate.toLocaleDateString()} with no expiration date.`}
        </p>
      </div>
    </div>
  );
};

const AIConfigSection = () => {
  const models = [
    { text: "GPT-3.5 Turbo", value: "gpt-3.5-turbo" },
    { text: "GPT-4", value: "gpt-4o" },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium">AI Model</label>
        <DropDownList
          data={models}
          textField="text"
          dataItemKey="value"
          value={models.find(m => m.value === model)}
          onChange={(e) => setModel(e.value.value)}
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">
          Temperature (Creativity): {temperature}
        </label>
        <Slider
          value={temperature}
          onChange={(e) => setTemperature(e.value)}
          min={0}
          max={1}
          step={0.1}
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">
          Max Response Length: {maxTokens} tokens
        </label>
        <Slider
          value={maxTokens}
          onChange={(e) => setMaxTokens(e.value)}
          min={50}
          max={500}
          step={50}
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">
          AI Instructions (optional)
        </label>
        <Textarea
          value={aiInstructions}
          onChange={(e) => setAiInstructions(e.target.value)}
          placeholder="Provide specific instructions for how the AI should respond to users"
          className="resize-none min-h-[100px]"
        />
      </div>
    </div>
  );
};

export default FormCreator;