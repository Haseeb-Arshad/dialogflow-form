import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFormStore } from '@/utils/formStore';
import { MessageSquare, AlertCircle } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { Button as KendoButton } from '@progress/kendo-react-buttons';
import ConversationalForm from '@/components/ConversationalForm';
import { motion } from 'framer-motion';

const FillForm = () => {
  const { formId } = useParams<{ formId: string }>();
  const navigate = useNavigate();
  const { getForm } = useFormStore();
  const [form, setForm] = useState(formId ? getForm(formId) : null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (formId) {
      setTimeout(() => {
        const formData = getForm(formId);
        setForm(formData);
        setLoading(false);
      }, 800); // Brief loading state for UX
    }
  }, [formId, getForm]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 text-primary mx-auto animate-spin mb-4" />
          <p className="text-lg">Loading form...</p>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center"
        >
          <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Form Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The form you're looking for doesn't exist or has been deleted.
          </p>
          <KendoButton onClick={() => navigate('/')} className="mx-auto">
            Go Home
          </KendoButton>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto pt-6 pb-12">
        <div className="flex items-center mb-8">
          <MessageSquare className="h-6 w-6 text-primary mr-2" />
          <span className="text-xl font-semibold">Dialogflow</span>
        </div>

        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">{form.title}</h1>
          {form.description && (
            <p className="text-muted-foreground">{form.description}</p>
          )}
        </div>

        <ConversationalForm formId={form.id} />
      </div>
    </div>
  );
};

export default FillForm;