import React, { useState, useRef } from 'react';
import { Camera, Video, X, Upload, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface MediaResponseProps {
  onMediaCaptured: (file: File, type: 'image' | 'video' | 'audio') => void;
  allowedTypes: Array<'image' | 'video' | 'audio'>;
}

const MediaResponse: React.FC<MediaResponseProps> = ({ 
  onMediaCaptured, 
  allowedTypes 
}) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureType, setCaptureType] = useState<'image' | 'video' | 'audio' | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const startCapture = async (type: 'image' | 'video' | 'audio') => {
    try {
      setCaptureType(type);
      setIsCapturing(true);
      
      if (type === 'image' || type === 'video') {
        const constraints = {
          video: true,
          audio: type === 'video',
        };
        
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = stream;
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } else if (type === 'audio') {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        // Setup audio recording here
      }
    } catch (error) {
      console.error('Error accessing media devices:', error);
      toast.error('Could not access camera or microphone');
      setIsCapturing(false);
    }
  };
  
  const captureImage = () => {
    if (!videoRef.current || !streamRef.current) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `image-${Date.now()}.png`, { type: 'image/png' });
          setCapturedFile(file);
          setPreviewUrl(URL.createObjectURL(blob));
        }
      }, 'image/png');
    }
    
    stopCapture();
  };
  
  const stopCapture = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsCapturing(false);
  };
  
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const fileType = file.type.startsWith('image/') 
      ? 'image' 
      : file.type.startsWith('video/') 
        ? 'video' 
        : file.type.startsWith('audio/') 
          ? 'audio' 
          : null;
          
    if (!fileType || !allowedTypes.includes(fileType as any)) {
      toast.error('File type not supported');
      return;
    }
    
    setCapturedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setCaptureType(fileType as any);
  };
  
  const confirmMedia = () => {
    if (capturedFile && captureType) {
      onMediaCaptured(capturedFile, captureType);
      resetState();
    }
  };
  
  const resetState = () => {
    setIsCapturing(false);
    setCaptureType(null);
    setPreviewUrl(null);
    setCapturedFile(null);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  return (
    <div className="w-full">
      {!isCapturing && !previewUrl ? (
        <div className="flex flex-wrap gap-2 justify-center">
          {allowedTypes.includes('image') && (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => startCapture('image')}
                className="flex items-center gap-1"
              >
                <Camera className="h-4 w-4" />
                Take Photo
              </Button>
            </motion.div>
          )}
          
          {allowedTypes.includes('video') && (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => startCapture('video')}
                className="flex items-center gap-1"
              >
                <Video className="h-4 w-4" />
                Record Video
              </Button>
            </motion.div>
          )}
          
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1"
            >
              <Upload className="h-4 w-4" />
              Upload File
            </Button>
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept={allowedTypes.map(type => 
                type === 'image' ? 'image/*' : 
                type === 'video' ? 'video/*' : 
                'audio/*'
              ).join(',')}
              className="hidden"
            />
          </motion.div>
        </div>
      ) : isCapturing ? (
        <div className="relative w-full aspect-video bg-black rounded-md overflow-hidden">
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted={captureType === 'image'}
            className="w-full h-full object-cover"
          />
          
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
            {captureType === 'image' && (
              <Button 
                type="button" 
                onClick={captureImage}
                className="bg-white text-black hover:bg-white/90"
              >
                Capture
              </Button>
            )}
            
            <Button 
              type="button" 
              variant="outline"
              onClick={stopCapture}
              className="bg-white/20 backdrop-blur-sm border-white/40 text-white hover:bg-white/30"
            >
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
          </div>
        </div>
      ) : previewUrl ? (
        <div className="relative w-full rounded-md overflow-hidden border border-border">
          {captureType === 'image' ? (
            <img 
              src={previewUrl} 
              alt="Captured" 
              className="w-full object-contain max-h-64"
            />
          ) : captureType === 'video' ? (
            <video 
              src={previewUrl} 
              controls 
              className="w-full max-h-64"
            />
          ) : (
            <audio 
              src={previewUrl} 
              controls 
              className="w-full mt-2"
            />
          )}
          
          <div className="absolute bottom-2 right-2 flex gap-2">
            <Button 
              type="button" 
              variant="destructive" 
              size="sm"
              onClick={resetState}
            >
              <X className="h-4 w-4" />
            </Button>
            
            <Button 
              type="button" 
              variant="default" 
              size="sm"
              onClick={confirmMedia}
            >
              <Check className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default MediaResponse; 