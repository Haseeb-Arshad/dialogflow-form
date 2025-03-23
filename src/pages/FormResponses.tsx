
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFormStore } from '@/utils/formStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { ChevronLeft, Download, ClipboardList, AlertCircle } from 'lucide-react';
import Header from '@/components/Header';
import AnimatedTransition from '@/components/AnimatedTransition';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';

const FormResponses = () => {
  const { formId } = useParams<{ formId: string }>();
  const navigate = useNavigate();
  const { getForm, getFormSubmissions } = useFormStore();
  const [form, setForm] = useState(formId ? getForm(formId) : null);
  const [submissions, setSubmissions] = useState(formId ? getFormSubmissions(formId) : []);
  
  useEffect(() => {
    if (formId) {
      const formData = getForm(formId);
      setForm(formData);
      
      if (!formData) {
        toast.error('Form not found');
        navigate('/forms');
      } else {
        setSubmissions(getFormSubmissions(formId));
      }
    }
  }, [formId, getForm, getFormSubmissions, navigate]);
  
  const exportResponses = () => {
    if (!form || submissions.length === 0) return;
    
    try {
      // Create CSV structure
      const headers = ['Submission Date', ...form.questions.map(q => q.prompt)];
      
      const rows = submissions.map(sub => {
        const submissionDate = new Date(sub.submittedAt).toLocaleString();
        const answers = form.questions.map(question => {
          const response = sub.responses.find(r => r.questionId === question.id);
          return response ? response.answer : '';
        });
        
        return [submissionDate, ...answers];
      });
      
      // Convert to CSV string
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');
      
      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${form.title.replace(/\s+/g, '_')}_responses.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Responses exported successfully');
    } catch (error) {
      toast.error('Failed to export responses');
      console.error(error);
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
              onClick={() => navigate(`/view/${formId}`)}
              className="self-start"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Form
            </Button>
            
            {submissions.length > 0 && (
              <Button onClick={exportResponses} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" />
                Export to CSV
              </Button>
            )}
          </div>
          
          <div className="mb-8">
            <h1 className="text-3xl font-bold">{form.title}</h1>
            <p className="text-muted-foreground mt-1">Responses</p>
          </div>
          
          {submissions.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-16 text-center"
            >
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium mb-2">No responses yet</h3>
              <p className="text-muted-foreground max-w-md mb-6">
                Your form hasn't received any responses yet. Share your form to start collecting responses.
              </p>
              <Button onClick={() => navigate(`/view/${formId}`)}>
                Share Your Form
              </Button>
            </motion.div>
          ) : (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total Responses
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{submissions.length}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Questions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{form.questions.length}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Latest Response
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-md">
                      {formatDistanceToNow(
                        new Date(Math.max(...submissions.map(s => new Date(s.submittedAt).getTime()))),
                        { addSuffix: true }
                      )}
                    </p>
                  </CardContent>
                </Card>
              </div>
              
              <div className="space-y-4">
                <h2 className="text-xl font-semibold flex items-center">
                  <ClipboardList className="h-5 w-5 mr-2" />
                  Submission Details
                </h2>
                
                {submissions.map((submission, index) => (
                  <motion.div
                    key={submission.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ 
                      opacity: 1, 
                      y: 0,
                      transition: { delay: index * 0.05 }
                    }}
                  >
                    <Card className="overflow-hidden">
                      <CardHeader className="bg-muted/30 pb-2">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-lg">
                            Response #{index + 1}
                          </CardTitle>
                          <span className="text-sm text-muted-foreground">
                            {new Date(submission.submittedAt).toLocaleString()}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <div className="space-y-3">
                          {form.questions.map((question) => {
                            const response = submission.responses.find(
                              (r) => r.questionId === question.id
                            );
                            
                            return (
                              <div key={question.id} className="space-y-1">
                                <p className="text-sm font-medium">{question.prompt}</p>
                                <p className="p-2 rounded bg-muted/30 border border-border">
                                  {response ? response.answer : 'No answer provided'}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </AnimatedTransition>
    </div>
  );
};

export default FormResponses;
