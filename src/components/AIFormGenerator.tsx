import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFormStore } from '@/utils/formStore';
import { FormQuestion } from '@/utils/formTypes';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';
import { Loader2, Sparkles, Upload, FileText, Image as ImageIcon, Send, Check, X } from 'lucide-react';

interface AIFormGeneratorProps {
  onFormGenerated: (formData: {
    title: string;
    description: string;
    questions: FormQuestion[];
    welcomeMessage: string;
    thankyouMessage: string;
  }) => void;
}

const AIFormGenerator: React.FC<AIFormGeneratorProps> = ({ onFormGenerated }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedForm, setGeneratedForm] = useState<{
    title: string;
    description: string;
    questions: FormQuestion[];
    welcomeMessage: string;
    thankyouMessage: string;
  } | null>(null);
  const [activeTab, setActiveTab] = useState('prompt');
  const [uploadedFiles, setUploadedFiles] = useState<Array<{
    id: string;
    name: string;
    type: string;
    content: string;
  }>>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Mock AI generation - in a real app, this would call an API
  const generateFormWithAI = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt describing the form you want to create');
      return;
    }
    
    setIsGenerating(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Example generated form - in a real app, this would come from the AI
      const mockGeneratedForm = {
        title: 'Customer Satisfaction Survey',
        description: 'Help us improve our services by providing your feedback',
        questions: [
          {
            id: uuidv4(),
            prompt: 'How would you rate your overall experience with our service?',
            type: 'rating',
            required: true,
          },
          {
            id: uuidv4(),
            prompt: 'What aspects of our service did you like the most?',
            type: 'multiline',
            required: false,
          },
          {
            id: uuidv4(),
            prompt: 'Would you recommend our service to others?',
            type: 'yes-no',
            required: true,
          },
          {
            id: uuidv4(),
            prompt: 'Which of the following features do you use regularly?',
            type: 'options',
            required: true,
            options: ['Online booking', 'Mobile app', 'Customer support', 'Payment options', 'Rewards program']
          },
          {
            id: uuidv4(),
            prompt: 'How can we improve our service?',
            type: 'multiline',
            required: false,
          }
        ],
        welcomeMessage: 'Thank you for taking the time to complete our survey. Your feedback is valuable to us!',
        thankyouMessage: 'Thank you for your feedback! We appreciate your input and will use it to improve our services.',
      };
      
      setGeneratedForm(mockGeneratedForm);
      setActiveTab('preview');
      toast.success('Form generated successfully!');
    } catch (error) {
      console.error('Error generating form:', error);
      toast.error('Failed to generate form. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const newFiles: Array<{
      id: string;
      name: string;
      type: string;
      content: string;
    }> = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`File ${file.name} is too large. Maximum size is 5MB.`);
        continue;
      }
      
      try {
        // Read file content
        const content = await readFileContent(file);
        
        newFiles.push({
          id: uuidv4(),
          name: file.name,
          type: file.type,
          content,
        });
      } catch (error) {
        console.error(`Error reading file ${file.name}:`, error);
        toast.error(`Failed to read file ${file.name}`);
      }
    }
    
    setUploadedFiles(prev => [...prev, ...newFiles]);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (event.target?.result) {
          resolve(event.target.result as string);
        } else {
          reject(new Error('Failed to read file'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Error reading file'));
      };
      
      if (file.type.startsWith('image/')) {
        reader.readAsDataURL(file);
      } else {
        reader.readAsText(file);
      }
    });
  };
  
  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== id));
  };
  
  const acceptGeneratedForm = () => {
    if (generatedForm) {
      onFormGenerated(generatedForm);
      toast.success('Form applied successfully!');
    }
  };
  
  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <ImageIcon className="h-4 w-4" />;
    } else if (fileType.includes('pdf')) {
      return <FileText className="h-4 w-4" />;
    } else {
      return <FileText className="h-4 w-4" />;
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Form Generator
        </CardTitle>
        <CardDescription>
          Describe the form you want to create, and our AI will generate it for you
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="prompt">Prompt & Files</TabsTrigger>
            <TabsTrigger value="preview" disabled={!generatedForm}>Preview</TabsTrigger>
          </TabsList>
          
          <TabsContent value="prompt" className="space-y-4 mt-4">
            <div className="space-y-2">
              <label htmlFor="prompt" className="text-sm font-medium">
                Describe your form
              </label>
              <Textarea
                id="prompt"
                placeholder="Describe the purpose of your form, what kind of questions you want to include, and any specific requirements..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-32 resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Be specific about the purpose, target audience, and types of questions you want to include.
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">
                  Upload supporting files (optional)
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs"
                >
                  <Upload className="h-3 w-3 mr-1" />
                  Upload
                </Button>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  multiple
                  className="hidden"
                  aria-label="Upload supporting files"
                  title="Upload supporting files"
                />
              </div>
              
              <div className="border rounded-md p-2 min-h-20">
                {uploadedFiles.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-16 text-muted-foreground text-sm">
                    <p>No files uploaded</p>
                    <p className="text-xs">Upload documents or images to help the AI understand your requirements</p>
                  </div>
                ) : (
                  <ul className="space-y-2">
                    <AnimatePresence>
                      {uploadedFiles.map(file => (
                        <motion.li
                          key={file.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          className="flex items-center justify-between bg-muted/50 rounded-md p-2 text-sm"
                        >
                          <div className="flex items-center gap-2">
                            {getFileIcon(file.type)}
                            <span className="truncate max-w-[200px]">{file.name}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-muted-foreground hover:text-destructive"
                            onClick={() => removeFile(file.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </motion.li>
                      ))}
                    </AnimatePresence>
                  </ul>
                )}
              </div>
            </div>
            
            <Button
              onClick={generateFormWithAI}
              disabled={isGenerating || !prompt.trim()}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Form
                </>
              )}
            </Button>
          </TabsContent>
          
          <TabsContent value="preview" className="space-y-4 mt-4">
            {generatedForm && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">{generatedForm.title}</h3>
                  <p className="text-sm text-muted-foreground">{generatedForm.description}</p>
                </div>
                
                <div className="space-y-4 border-y py-4">
                  <div className="bg-muted/50 p-3 rounded-md italic text-sm">
                    {generatedForm.welcomeMessage}
                  </div>
                  
                  {generatedForm.questions.map((question, index) => (
                    <div key={question.id} className="border rounded-md p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">Question {index + 1}</span>
                        <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
                          {question.type === 'text' ? 'Short Text' :
                           question.type === 'multiline' ? 'Paragraph' :
                           question.type === 'yes-no' ? 'Yes/No' :
                           question.type === 'options' ? 'Multiple Choice' :
                           question.type === 'rating' ? 'Rating' :
                           question.type}
                        </span>
                      </div>
                      <p className="text-sm font-medium">{question.prompt}</p>
                      
                      {question.type === 'options' && question.options && (
                        <div className="pl-4 space-y-1">
                          {question.options.map((option, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm">
                              <div className="h-3 w-3 rounded-full border border-primary"></div>
                              {option}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  
                  <div className="bg-muted/50 p-3 rounded-md italic text-sm">
                    {generatedForm.thankyouMessage}
                  </div>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab('prompt')}
                  >
                    Edit Prompt
                  </Button>
                  <Button
                    onClick={acceptGeneratedForm}
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Use This Form
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AIFormGenerator; 