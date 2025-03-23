
import React from 'react';
import FormList from '@/components/FormList';
import Header from '@/components/Header';
import AnimatedTransition from '@/components/AnimatedTransition';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const MyForms = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <AnimatedTransition className="flex-1">
        <div className="container max-w-6xl mx-auto py-8 px-4">
          <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">My Forms</h1>
              <p className="text-muted-foreground">
                Create, manage, and share your conversational forms.
              </p>
            </div>
            
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <Button onClick={() => navigate('/create')} className="bg-primary hover:bg-primary/90">
                <PlusCircle className="mr-2 h-4 w-4" />
                Create New Form
              </Button>
            </motion.div>
          </div>
          
          <FormList />
        </div>
      </AnimatedTransition>
    </div>
  );
};

export default MyForms;
