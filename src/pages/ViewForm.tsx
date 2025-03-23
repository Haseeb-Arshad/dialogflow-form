
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFormStore } from '@/utils/formStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import Header from '@/components/Header';
import AnimatedTransition from '@/components/AnimatedTransition';
import { 
  ChevronLeft, 
  Copy, 
  Check, 
  Edit,
  Share2,
  Eye,
  BarChart
} from 'lucide-react';
import { motion } from 'framer-motion';
import ConversationalForm from '@/components/ConversationalForm';

const ViewForm = () => {
  const { formId } = useParams<{ formId: string }>();
  const navigate = useNavigate();
  const { getForm, publishForm, getFormSubmissions } = useFormStore();
  const [form, setForm] = useState(formId ? getForm(formId) : null);
  const [copied, setCopied] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  
  const submissions = formId ? getFormSubmissions(formId) : [];
  
  useEffect(() => {
    if (formId) {
      const formData = getForm(formId);
      setForm(formData);
      
      if (!formData) {
        toast.error('Form not found');
        navigate('/forms');
      }
    }
  }, [formId, getForm, navigate]);
  
  const handleShareLink = async () => {
    if (!form) return;
    
    try {
      let shareLink = form.shareLink;
      
      // Publish the form if it's not already published
      if (!form.isPublished) {
        shareLink = publishForm(form.id);
        setForm(getForm(form.id)); // Refresh form data
      }
      
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      toast.success('Link copied to clipboard');
      
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };
  
  if (!form) return null;
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <AnimatedTransition className="flex-1">
        <div className="container max-w-5xl mx-auto py-8 px-4">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/forms')}
              className="self-start"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Forms
            </Button>
            
            <div className="flex flex-wrap gap-2">
              <Button
                variant={previewMode ? "default" : "outline"}
                size="sm"
                onClick={() => setPreviewMode(!previewMode)}
              >
                <Eye className="h-4 w-4 mr-1" />
                {previewMode ? "Exit Preview" : "Preview Form"}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/edit/${form.id}`)}
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit Form
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/responses/${form.id}`)}
              >
                <BarChart className="h-4 w-4 mr-1" />
                View Responses {submissions.length > 0 && `(${submissions.length})`}
              </Button>
              
              <Button
                variant={copied ? "default" : "outline"}
                size="sm"
                onClick={handleShareLink}
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-1" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-1" />
                    Copy Link
                  </>
                )}
              </Button>
            </div>
          </div>
          
          {previewMode ? (
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Form Preview</h2>
              <ConversationalForm formId={form.id} />
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="overflow-hidden border border-border">
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div>
                      <h1 className="text-2xl font-bold mb-2">{form.title}</h1>
                      {form.description && (
                        <p className="text-muted-foreground">{form.description}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <h2 className="text-xl font-semibold flex items-center">
                        <Share2 className="h-5 w-5 mr-2 text-primary" />
                        Share Your Form
                      </h2>
                      <p className="text-muted-foreground mb-4">
                        {form.isPublished
                          ? "Your form is published and ready to share with respondents."
                          : "Publish your form to get a shareable link."}
                      </p>
                      
                      <div className="flex flex-col sm:flex-row gap-2">
                        <div className="flex-1 p-3 bg-muted rounded-md border border-border text-sm font-mono truncate">
                          {form.shareLink}
                        </div>
                        <Button onClick={handleShareLink} className="shrink-0">
                          {copied ? (
                            <>
                              <Check className="h-4 w-4 mr-1" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4 mr-1" />
                              Copy Link
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h2 className="text-xl font-semibold">Form Details</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-md bg-muted/50 border border-border">
                          <p className="text-sm font-medium mb-1">Questions</p>
                          <p className="text-2xl font-semibold">{form.questions.length}</p>
                        </div>
                        <div className="p-4 rounded-md bg-muted/50 border border-border">
                          <p className="text-sm font-medium mb-1">Responses</p>
                          <p className="text-2xl font-semibold">{submissions.length}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h2 className="text-xl font-semibold">Questions Overview</h2>
                      <div className="space-y-2">
                        {form.questions.map((question, index) => (
                          <div 
                            key={question.id} 
                            className="p-4 rounded-md border border-border hover:bg-muted/30 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Question {index + 1}</span>
                              <span className="text-xs px-2 py-0.5 rounded-full bg-muted">
                                {question.type}
                              </span>
                            </div>
                            <p className="mt-1 font-medium">{question.prompt}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </AnimatedTransition>
    </div>
  );
};

export default ViewForm;
