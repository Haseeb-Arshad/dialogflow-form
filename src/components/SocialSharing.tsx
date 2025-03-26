import React from 'react';
import { Share2, Twitter, Facebook, Linkedin, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface SocialSharingProps {
  title: string;
  url: string;
  summary?: string;
}

const SocialSharing: React.FC<SocialSharingProps> = ({ title, url, summary = '' }) => {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedSummary = encodeURIComponent(summary);
  
  const shareLinks = [
    {
      name: 'Twitter',
      icon: Twitter,
      url: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      color: 'bg-[#1DA1F2] hover:bg-[#1DA1F2]/90',
    },
    {
      name: 'Facebook',
      icon: Facebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      color: 'bg-[#1877F2] hover:bg-[#1877F2]/90',
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}&title=${encodedTitle}&summary=${encodedSummary}`,
      color: 'bg-[#0A66C2] hover:bg-[#0A66C2]/90',
    },
  ];
  
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard');
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };
  
  return (
    <div className="flex flex-col space-y-3">
      <div className="flex items-center justify-center space-x-2">
        <Share2 className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Share this form</span>
      </div>
      
      <div className="flex items-center justify-center space-x-2">
        {shareLinks.map((link) => (
          <motion.div
            key={link.name}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="outline"
              size="icon"
              className={`rounded-full ${link.color} text-white`}
              onClick={() => window.open(link.url, '_blank')}
            >
              <link.icon className="h-4 w-4" />
              <span className="sr-only">Share on {link.name}</span>
            </Button>
          </motion.div>
        ))}
        
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            variant="outline"
            size="icon"
            className="rounded-full"
            onClick={copyToClipboard}
          >
            <LinkIcon className="h-4 w-4" />
            <span className="sr-only">Copy link</span>
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default SocialSharing; 