import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ConversationalForm, FormSubmission, FormSchedule, FormAIConfig } from './formTypes';
import { v4 as uuidv4 } from 'uuid';

interface FormState {
  forms: ConversationalForm[];
  submissions: FormSubmission[];
  currentFormId: string | null;
  addForm: (form: Omit<ConversationalForm, 'id' | 'createdAt' | 'updatedAt' | 'shareLink' | 'isPublished'>) => string;
  updateForm: (id: string, updates: Partial<ConversationalForm>) => void;
  deleteForm: (id: string) => void;
  publishForm: (id: string) => string;
  unpublishForm: (id: string) => void;
  getForm: (id: string) => ConversationalForm | undefined;
  addSubmission: (submission: Omit<FormSubmission, 'id' | 'submittedAt'>) => void;
  getFormSubmissions: (formId: string) => FormSubmission[];
  setCurrentFormId: (id: string | null) => void;
  toggleFormStatus: (id: string) => void;
  updateFormSchedule: (id: string, schedule: FormSchedule) => void;
  updateAIConfig: (id: string, aiConfig: FormAIConfig) => void;
}

export const useFormStore = create<FormState>()(
  persist(
    (set, get) => ({
      forms: [],
      submissions: [],
      currentFormId: null,
      
      addForm: (formData) => {
        const id = uuidv4();
        const newForm: ConversationalForm = {
          ...formData,
          id,
          createdAt: new Date(),
          updatedAt: new Date(),
          shareLink: `${window.location.origin}/fill/${id}`,
          isPublished: false,
        };
        
        set((state) => ({
          forms: [...state.forms, newForm],
          currentFormId: id,
        }));
        
        return id;
      },
      
      updateForm: (id, updates) => {
        set((state) => ({
          forms: state.forms.map((form) => 
            form.id === id 
              ? { ...form, ...updates, updatedAt: new Date() } 
              : form
          ),
        }));
      },
      
      deleteForm: (id) => {
        set((state) => ({
          forms: state.forms.filter((form) => form.id !== id),
          submissions: state.submissions.filter((sub) => sub.formId !== id),
        }));
      },
      
      publishForm: (id) => {
        const shareLink = `${window.location.origin}/fill/${id}`;
        set((state) => ({
          forms: state.forms.map((form) => 
            form.id === id 
              ? { ...form, isPublished: true, shareLink, updatedAt: new Date() } 
              : form
          ),
        }));
        return shareLink;
      },
      
      unpublishForm: (id) => {
        set((state) => ({
          forms: state.forms.map((form) => 
            form.id === id 
              ? { ...form, isPublished: false, updatedAt: new Date() } 
              : form
          ),
        }));
      },
      
      getForm: (id) => {
        return get().forms.find((form) => form.id === id);
      },
      
      addSubmission: (submissionData) => {
        const newSubmission: FormSubmission = {
          ...submissionData,
          id: uuidv4(),
          submittedAt: new Date(),
        };
        
        set((state) => ({
          submissions: [...state.submissions, newSubmission],
        }));
      },
      
      getFormSubmissions: (formId) => {
        return get().submissions.filter((sub) => sub.formId === formId);
      },
      
      setCurrentFormId: (id) => {
        set({ currentFormId: id });
      },
      
      toggleFormStatus: (id) => {
        set((state) => ({
          forms: state.forms.map((form) => {
            if (form.id === id) {
              const newStatus: FormStatus = form.status === 'active' ? 'paused' : 'active';
              return {
                ...form,
                status: newStatus,
                [newStatus === 'paused' ? 'lastPausedAt' : 'lastResumedAt']: new Date(),
                updatedAt: new Date(),
              };
            }
            return form;
          }),
        }));
      },
      
      updateFormSchedule: (id, schedule) => {
        set((state) => ({
          forms: state.forms.map((form) => 
            form.id === id 
              ? { ...form, schedule, updatedAt: new Date() } 
              : form
          ),
        }));
      },
      
      updateAIConfig: (id, aiConfig) => {
        set((state) => ({
          forms: state.forms.map((form) => 
            form.id === id 
              ? { ...form, aiConfig, updatedAt: new Date() } 
              : form
          ),
        }));
      },
    }),
    {
      name: 'dialogflow-forms-storage',
    }
  )
);
