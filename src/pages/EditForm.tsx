
import React from 'react';
import FormCreator from '@/components/FormCreator';
import Header from '@/components/Header';
import AnimatedTransition from '@/components/AnimatedTransition';

const EditForm = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <AnimatedTransition className="flex-1">
        <FormCreator editMode={true} />
      </AnimatedTransition>
    </div>
  );
};

export default EditForm;
