
import React from 'react';
import FormCreator from '@/components/FormCreator';
import Header from '@/components/Header';
import AnimatedTransition from '@/components/AnimatedTransition';

const CreateForm = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <AnimatedTransition className="flex-1">
        {/* <FormCreator /> */}
      </AnimatedTransition>
    </div>
  );
};

export default CreateForm;
