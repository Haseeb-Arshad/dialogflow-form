
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, ArrowRight, PlusCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import AnimatedTransition from '@/components/AnimatedTransition';

const Index = () => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <AnimatedTransition className="flex-1">
        <section className="py-20 px-4 md:px-6 max-w-7xl mx-auto">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-center max-w-3xl mx-auto"
          >
            <motion.div variants={itemVariants} className="mb-3">
              <span className="inline-block bg-primary/10 text-primary rounded-full px-4 py-2 text-sm font-medium">
                Introducing Dialogflow
              </span>
            </motion.div>
            
            <motion.h1 
              variants={itemVariants} 
              className="text-4xl md:text-6xl font-bold tracking-tight mb-6"
            >
              Create conversational forms that feel{" "}
              <span className="text-primary">human</span>
            </motion.h1>
            
            <motion.p 
              variants={itemVariants} 
              className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto"
            >
              Build AI-native forms and surveys that feel like natural conversations, 
              not rigid checkboxes and radio buttons.
            </motion.p>
            
            <motion.div variants={itemVariants} className="flex flex-wrap gap-4 justify-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Button 
                  onClick={() => navigate('/create')} 
                  size="lg" 
                  className="rounded-full bg-primary hover:bg-primary/90 px-8"
                >
                  <PlusCircle className="mr-2 h-5 w-5" />
                  Create a Form
                </Button>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Button 
                  onClick={() => navigate('/forms')} 
                  variant="outline" 
                  size="lg" 
                  className="rounded-full"
                >
                  View My Forms
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7 }}
            className="mt-20 md:mt-32 relative"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent h-1/3 bottom-0 z-10"></div>
            <div className="glass rounded-xl border border-border p-6 md:p-10 max-w-4xl mx-auto shadow-2xl">
              <div className="flex flex-col space-y-4 max-w-md">
                <div className="chat-bubble chat-bubble-ai">
                  <p>Hi there! I'd like to ask you a few questions about your experience with our product.</p>
                </div>
                
                <div className="chat-bubble chat-bubble-ai">
                  <p>First, how long have you been using our service?</p>
                </div>
                
                <div className="chat-bubble chat-bubble-user">
                  <p>I've been using it for about 3 months now.</p>
                </div>
                
                <div className="chat-bubble chat-bubble-ai">
                  <p>That's great! What features do you find most useful?</p>
                </div>
                
                <div className="chat-bubble chat-bubble-user">
                  <p>I really love the dashboard analytics and the mobile app integration.</p>
                </div>
                
                <div className="chat-bubble chat-bubble-ai">
                  <p>Would you recommend our product to a colleague or friend?</p>
                </div>
                
                <div className="relative">
                  <div className="bg-primary/10 h-10 rounded-full flex items-center px-4 border border-primary/20">
                    <input type="text" className="bg-transparent border-none outline-none flex-1" placeholder="Type your response..." />
                    <MessageSquare className="h-5 w-5 text-primary/70" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.7 }}
            className="mt-24 text-center"
          >
            <h2 className="text-3xl font-bold mb-4">Why use Dialogflow?</h2>
            <p className="text-muted-foreground mb-12 max-w-2xl mx-auto">
              Traditional forms are rigid and impersonal. Dialogflow creates a natural conversation flow that increases engagement and completion rates.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: "Natural Conversations",
                  description: "Questions flow like a real conversation, not a clinical questionnaire."
                },
                {
                  title: "Higher Completion Rates",
                  description: "Users are more engaged and likely to complete conversational forms."
                },
                {
                  title: "Better Data Quality",
                  description: "Natural conversations lead to more thoughtful, detailed responses."
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 + (index * 0.1), duration: 0.5 }}
                  className="p-6 rounded-lg glass border border-border"
                >
                  <h3 className="text-xl font-medium mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>
      </AnimatedTransition>
      
      <footer className="border-t border-border py-6 px-4 md:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <MessageSquare className="h-5 w-5 text-primary mr-2" />
            <span className="font-semibold">Dialogflow</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Dialogflow. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
