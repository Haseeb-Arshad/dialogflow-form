import React, { useState, useEffect } from 'react';
import { Users, UserPlus, MessageSquare, X, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useFormStore } from '@/utils/formStore';
import { formatDistanceToNow } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

interface Participant {
  id: string;
  name: string;
  avatar?: string;
  isActive: boolean;
  lastActive: Date;
}

interface CollaborativeSessionProps {
  formId: string;
  currentUserId: string;
  currentUserName: string;
}

interface CollaborativeAction {
  id: string;
  type: 'join' | 'leave' | 'answer' | 'comment' | 'reaction';
  userId: string;
  userName: string;
  timestamp: Date;
  data: any;
}

const CollaborativeSession: React.FC<CollaborativeSessionProps> = ({
  formId,
  currentUserId,
  currentUserName,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([
    {
      id: currentUserId,
      name: currentUserName,
      isActive: true,
      lastActive: new Date(),
    },
  ]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{id: string, userId: string, userName: string, message: string, timestamp: Date}>>([]);
  const [chatInput, setChatInput] = useState('');
  const [actions, setActions] = useState<CollaborativeAction[]>([]);
  const [reactionEmojis, setReactionEmojis] = useState<Record<string, string[]>>({});
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(null);
  const { getForm } = useFormStore();
  
  // Get form data
  const form = getForm(formId);
  
  // Simulate other participants joining (in a real app, this would come from a WebSocket)
  useEffect(() => {
    const simulatedParticipants: Participant[] = [
      {
        id: 'user-2',
        name: 'Jane Smith',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane',
        isActive: true,
        lastActive: new Date(),
      },
      {
        id: 'user-3',
        name: 'Alex Johnson',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
        isActive: false,
        lastActive: new Date(Date.now() - 5 * 60000), // 5 minutes ago
      },
    ];
    
    const timer = setTimeout(() => {
      setParticipants(prev => [...prev, ...simulatedParticipants]);
      
      // Add a welcome message
      setChatMessages([
        {
          id: 'msg-1',
          userId: 'system',
          userName: 'System',
          message: 'Welcome to the collaborative session! You can discuss the form with other participants here.',
          timestamp: new Date(),
        },
        {
          id: 'msg-2',
          userId: 'user-2',
          userName: 'Jane Smith',
          message: 'Hi everyone! I just joined to help with this form.',
          timestamp: new Date(),
        },
      ]);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Simulate collaborative actions
  useEffect(() => {
    if (participants.length > 1) {
      const timer = setInterval(() => {
        // Randomly select a participant other than current user
        const otherParticipants = participants.filter(p => p.id !== currentUserId);
        if (otherParticipants.length === 0) return;
        
        const randomParticipant = otherParticipants[Math.floor(Math.random() * otherParticipants.length)];
        
        // Randomly select an action type
        const actionTypes = ['answer', 'comment', 'reaction'];
        const randomActionType = actionTypes[Math.floor(Math.random() * actionTypes.length)] as 'answer' | 'comment' | 'reaction';
        
        // Create a new action
        const newAction: CollaborativeAction = {
          id: uuidv4(),
          type: randomActionType,
          userId: randomParticipant.id,
          userName: randomParticipant.name,
          timestamp: new Date(),
          data: {}
        };
        
        // Set action-specific data
        if (randomActionType === 'answer' && form) {
          const randomQuestion = form.questions[Math.floor(Math.random() * form.questions.length)];
          newAction.data = {
            questionId: randomQuestion.id,
            questionText: randomQuestion.prompt.substring(0, 30) + '...',
            answer: 'Just answered this question'
          };
        } else if (randomActionType === 'comment') {
          const comments = [
            'I think this is an interesting question!',
            'Not sure how to answer this one...',
            'Does anyone have thoughts on this?',
            'I had a similar experience with this.'
          ];
          newAction.data = {
            text: comments[Math.floor(Math.random() * comments.length)]
          };
        } else if (randomActionType === 'reaction') {
          const emojis = ['👍', '❤️', '😊', '🤔', '👏', '🎉'];
          const targetMessageId = chatMessages.length > 0 
            ? chatMessages[Math.floor(Math.random() * chatMessages.length)].id
            : null;
            
          if (targetMessageId) {
            newAction.data = {
              targetId: targetMessageId,
              emoji: emojis[Math.floor(Math.random() * emojis.length)]
            };
            
            // Add reaction to message
            setReactionEmojis(prev => {
              const existing = prev[targetMessageId] || [];
              return {
                ...prev,
                [targetMessageId]: [...existing, newAction.data.emoji]
              };
            });
          }
        }
        
        // Add action to list
        setActions(prev => [...prev, newAction]);
        
        // If it's a comment, also add it to chat messages
        if (randomActionType === 'comment') {
          const newMessage = {
            id: newAction.id,
            userId: randomParticipant.id,
            userName: randomParticipant.name,
            message: newAction.data.text,
            timestamp: new Date(),
          };
          
          setChatMessages(prev => [...prev, newMessage]);
        }
      }, 15000); // Every 15 seconds
      
      return () => clearInterval(timer);
    }
  }, [participants, currentUserId, chatMessages, form]);
  
  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    
    // In a real app, this would send an invitation via API
    toast.success(`Invitation sent to ${inviteEmail}`);
    setInviteEmail('');
  };
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    
    const newMessage = {
      id: `msg-${Date.now()}`,
      userId: currentUserId,
      userName: currentUserName,
      message: chatInput,
      timestamp: new Date(),
    };
    
    setChatMessages(prev => [...prev, newMessage]);
    setChatInput('');
    
    // Add as an action
    const newAction: CollaborativeAction = {
      id: newMessage.id,
      type: 'comment',
      userId: currentUserId,
      userName: currentUserName,
      timestamp: new Date(),
      data: {
        text: chatInput
      }
    };
    
    setActions(prev => [...prev, newAction]);
  };
  
  const handleReaction = (messageId: string, emoji: string) => {
    // Add reaction to message
    setReactionEmojis(prev => {
      const existing = prev[messageId] || [];
      return {
        ...prev,
        [messageId]: [...existing, emoji]
      };
    });
    
    // Add as an action
    const newAction: CollaborativeAction = {
      id: uuidv4(),
      type: 'reaction',
      userId: currentUserId,
      userName: currentUserName,
      timestamp: new Date(),
      data: {
        targetId: messageId,
        emoji
      }
    };
    
    setActions(prev => [...prev, newAction]);
    setShowReactionPicker(null);
  };
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="mb-2"
          >
            <Card className="w-80 shadow-lg">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-sm font-medium">Collaborative Session</CardTitle>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6" 
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h3 className="text-xs font-medium mb-2">Participants ({participants.length})</h3>
                  <div className="flex -space-x-2 overflow-hidden">
                    {participants.map((participant) => (
                      <div key={participant.id} className="relative">
                        <Avatar className="border-2 border-background">
                          <AvatarImage src={participant.avatar} />
                          <AvatarFallback>{participant.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className={`absolute bottom-0 right-0 h-2 w-2 rounded-full ${participant.isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Activity Feed */}
                <div>
                  <h3 className="text-xs font-medium mb-2">Recent Activity</h3>
                  <div className="max-h-24 overflow-y-auto text-xs space-y-1.5">
                    {actions.slice(-5).reverse().map(action => (
                      <div key={action.id} className="text-muted-foreground">
                        <span className="font-medium text-foreground">{action.userName}</span>
                        {action.type === 'join' && ' joined the session'}
                        {action.type === 'leave' && ' left the session'}
                        {action.type === 'answer' && ` answered "${action.data.questionText}"`}
                        {action.type === 'comment' && ' added a comment'}
                        {action.type === 'reaction' && ` reacted with ${action.data.emoji}`}
                        <span className="ml-1 text-[10px]">
                          {formatDistanceToNow(action.timestamp, { addSuffix: true })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <form onSubmit={handleInvite} className="flex space-x-2">
                  <Input
                    type="email"
                    placeholder="Invite by email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="h-8 text-xs"
                  />
                  <Button type="submit" size="sm" className="h-8 px-2">
                    <UserPlus className="h-3 w-3 mr-1" />
                    <span className="text-xs">Invite</span>
                  </Button>
                </form>
                
                {/* Chat with reactions */}
                <div className="border rounded-md h-40 overflow-y-auto p-2 bg-muted/30">
                  <div className="space-y-2">
                    {chatMessages.map((msg) => (
                      <div 
                        key={msg.id} 
                        className={`group flex ${msg.userId === currentUserId ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className="relative">
                          <div 
                            className={`max-w-[80%] rounded-lg px-2 py-1 text-xs ${
                              msg.userId === 'system' 
                                ? 'bg-muted text-muted-foreground italic' 
                                : msg.userId === currentUserId 
                                  ? 'bg-primary text-primary-foreground' 
                                  : 'bg-secondary text-secondary-foreground'
                            }`}
                          >
                            {msg.userId !== 'system' && msg.userId !== currentUserId && (
                              <p className="text-[10px] font-medium">{msg.userName}</p>
                            )}
                            <p>{msg.message}</p>
                            
                            {/* Reactions */}
                            {reactionEmojis[msg.id] && reactionEmojis[msg.id].length > 0 && (
                              <div className="flex mt-1 gap-0.5">
                                {reactionEmojis[msg.id].map((emoji, i) => (
                                  <span key={i} className="text-[10px]">{emoji}</span>
                                ))}
                              </div>
                            )}
                          </div>
                          
                          {/* Reaction button */}
                          <button
                            onClick={() => setShowReactionPicker(prev => prev === msg.id ? null : msg.id)}
                            className="absolute -right-2 -bottom-2 bg-background rounded-full p-0.5 border border-border shadow-sm text-[8px] opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Smile className="h-3 w-3" />
                          </button>
                          
                          {/* Reaction picker */}
                          {showReactionPicker === msg.id && (
                            <div className="absolute bottom-6 right-0 bg-background rounded-full p-1 border border-border shadow-md flex gap-1">
                              {['👍', '❤️', '😊', '🤔', '👏', '🎉'].map(emoji => (
                                <button
                                  key={emoji}
                                  onClick={() => handleReaction(msg.id, emoji)}
                                  className="hover:bg-muted rounded-full p-0.5 text-xs"
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <form onSubmit={handleSendMessage} className="flex space-x-2">
                  <Input
                    placeholder="Type a message..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    className="h-8 text-xs"
                  />
                  <Button type="submit" size="sm" className="h-8 px-2">
                    <MessageSquare className="h-3 w-3" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
      
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          onClick={() => setIsOpen(!isOpen)}
          variant={isOpen ? "default" : "outline"}
          size="icon"
          className="rounded-full h-12 w-12 shadow-lg"
        >
          <Users className="h-5 w-5" />
        </Button>
      </motion.div>
    </div>
  );
};

export default CollaborativeSession; 