
import React, { useState, useEffect } from 'react';
import { useFormStore } from '@/utils/formStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Edit,
  Trash2,
  ExternalLink,
  BarChart,
  Copy,
  Loader2,
  PlusCircle,
  AlertCircle,
  Check
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';

const FormList = () => {
  const { forms, deleteForm, publishForm, getFormSubmissions } = useFormStore();
  const navigate = useNavigate();
  const [sortedForms, setSortedForms] = useState([...forms]);
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [copyStates, setCopyStates] = useState<Record<string, boolean>>({});
  
  useEffect(() => {
    // Sort forms by updated date (newest first)
    const sorted = [...forms].sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
    setSortedForms(sorted);
  }, [forms]);
  
  const handleShare = async (formId: string) => {
    setLoadingStates(prev => ({ ...prev, [formId]: true }));
    
    try {
      const shareLink = publishForm(formId);
      await navigator.clipboard.writeText(shareLink);
      
      setCopyStates(prev => ({ ...prev, [formId]: true }));
      setTimeout(() => {
        setCopyStates(prev => ({ ...prev, [formId]: false }));
      }, 2000);
      
      toast.success('Link copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy link');
    } finally {
      setLoadingStates(prev => ({ ...prev, [formId]: false }));
    }
  };
  
  const handleDelete = (formId: string) => {
    if (window.confirm('Are you sure you want to delete this form? This action cannot be undone.')) {
      deleteForm(formId);
      toast.success('Form deleted successfully');
    }
  };
  
  if (forms.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center h-[50vh] text-center"
      >
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-xl font-medium mb-2">No forms yet</h3>
        <p className="text-muted-foreground max-w-md mb-6">
          You haven't created any forms yet. Get started by creating your first conversational form.
        </p>
        <Button onClick={() => navigate('/create')} className="bg-primary hover:bg-primary/90">
          <PlusCircle className="mr-2 h-4 w-4" />
          Create New Form
        </Button>
      </motion.div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {sortedForms.map((form, index) => {
        const responseCount = getFormSubmissions(form.id).length;
        return (
          <motion.div
            key={form.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              transition: { delay: index * 0.05 } 
            }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="h-full"
          >
            <Card className="h-full border border-border hover:shadow-md transition-all duration-300 flex flex-col">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl font-semibold truncate">{form.title}</CardTitle>
                  <span className={`text-xs px-2 py-1 rounded-full ${form.isPublished ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                    {form.isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Updated {formatDistanceToNow(new Date(form.updatedAt), { addSuffix: true })}
                </p>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm line-clamp-2 mb-3">
                  {form.description || 'No description provided.'}
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center">
                    <BarChart className="h-4 w-4 mr-1 text-muted-foreground" />
                    <span>{responseCount} {responseCount === 1 ? 'response' : 'responses'}</span>
                  </div>
                  <div className="flex items-center">
                    <div className="h-4 w-4 mr-1 flex items-center justify-center">
                      <span className="text-muted-foreground">Q</span>
                    </div>
                    <span>{form.questions.length} {form.questions.length === 1 ? 'question' : 'questions'}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-wrap gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/edit/${form.id}`)}
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/responses/${form.id}`)}
                  className="flex-1"
                >
                  <BarChart className="h-4 w-4 mr-1" />
                  Responses
                </Button>
                <Button
                  variant={copyStates[form.id] ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleShare(form.id)}
                  disabled={loadingStates[form.id]}
                  className="flex-1"
                >
                  {loadingStates[form.id] ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  ) : copyStates[form.id] ? (
                    <Check className="h-4 w-4 mr-1" />
                  ) : (
                    <Copy className="h-4 w-4 mr-1" />
                  )}
                  {copyStates[form.id] ? 'Copied' : 'Share'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/view/${form.id}`)}
                  className="flex-1"
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(form.id)}
                  className="flex-1 text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};

export default FormList;
