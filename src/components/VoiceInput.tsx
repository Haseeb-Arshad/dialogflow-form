import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface VoiceInputProps {
  onSpeechResult: (text: string) => void;
  isListening: boolean;
  setIsListening: (isListening: boolean) => void;
  disabled?: boolean;
}

const VoiceInput: React.FC<VoiceInputProps> = ({
  onSpeechResult,
  isListening,
  setIsListening,
  disabled = false,
}) => {
  const [isSupported, setIsSupported] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef<any>(null);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    // Check if browser supports SpeechRecognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSupported(true);
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onSpeechResult(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
        toast.error('Speech recognition failed. Please try again.');
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    // Initialize speech synthesis
    speechSynthesisRef.current = new SpeechSynthesisUtterance();
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (speechSynthesis) {
        speechSynthesis.cancel();
      }
    };
  }, [onSpeechResult, setIsListening]);

  const toggleListening = () => {
    if (!isSupported) {
      toast.error('Speech recognition is not supported in your browser');
      return;
    }

    if (isListening) {
      recognitionRef.current.abort();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const speakText = (text: string) => {
    if (!speechSynthesisRef.current) return;
    
    if (isSpeaking) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    
    speechSynthesisRef.current.text = text;
    speechSynthesisRef.current.onend = () => setIsSpeaking(false);
    speechSynthesis.speak(speechSynthesisRef.current);
    setIsSpeaking(true);
  };

  return (
    <div className="flex items-center gap-2">
      <motion.div
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.1 }}
      >
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={toggleListening}
          disabled={disabled || !isSupported}
          className={`rounded-full ${isListening ? 'bg-red-100 text-red-600 border-red-300' : ''}`}
        >
          {isListening ? (
            <MicOff className="h-4 w-4" />
          ) : (
            <Mic className="h-4 w-4" />
          )}
          <span className="sr-only">
            {isListening ? 'Stop listening' : 'Start listening'}
          </span>
        </Button>
      </motion.div>
      
      {isListening && (
        <div className="flex items-center gap-1">
          <span className="animate-pulse text-xs text-primary">Listening...</span>
          <div className="flex gap-0.5">
            <motion.div
              animate={{
                height: [3, 12, 3],
                transition: { repeat: Infinity, duration: 1.2 }
              }}
              className="w-1 bg-primary rounded-full"
            />
            <motion.div
              animate={{
                height: [3, 16, 3],
                transition: { repeat: Infinity, duration: 0.9, delay: 0.2 }
              }}
              className="w-1 bg-primary rounded-full"
            />
            <motion.div
              animate={{
                height: [3, 8, 3],
                transition: { repeat: Infinity, duration: 0.7, delay: 0.1 }
              }}
              className="w-1 bg-primary rounded-full"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceInput; 