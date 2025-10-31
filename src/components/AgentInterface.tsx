import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Paperclip, Send, Bot, User, X, Mic, Volume2 } from 'lucide-react';
import { AIMessage } from '@/services/aiAssistantService';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Markdown } from './Markdown';

interface AgentInterfaceProps {
  conversation: AIMessage[];
  isSpeaking: boolean;
  isListening: boolean;
  listeningText: string;
  onClose: () => void;
  onSendMessage: (message: string, file?: File) => void;
  isVisible: boolean;
  isThinking: boolean;
  onVoiceToggle: () => void;
  onCancelSpeaking: () => void;
  status: 'idle' | 'listening' | 'thinking' | 'speaking' | 'error';
}

export const AgentInterface: React.FC<AgentInterfaceProps> = ({
  conversation,
  isSpeaking,
  isListening,
  listeningText,
  onClose,
  onSendMessage,
  isVisible,
  isThinking,
  onVoiceToggle,
  onCancelSpeaking,
  status,
}) => {
  // Only log in development mode and reduce frequency
  if (process.env.NODE_ENV === 'development') {
    // Use a ref to track previous values to avoid excessive logging
    const prevValues = React.useRef({ isVisible, status });
    if (prevValues.current.isVisible !== isVisible || prevValues.current.status !== status) {
      console.log('AgentInterface isVisible:', isVisible, 'status:', status);
      prevValues.current = { isVisible, status };
    }
  }
  const [newMessage, setNewMessage] = useState('');
  const [isUserTyping, setIsUserTyping] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [conversation, isThinking]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage('');
      setIsUserTyping(false);
    }
  };

  const handleNewMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    setIsUserTyping(e.target.value.length > 0);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onSendMessage(`file: ${file.name}`, file);
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="fixed bottom-24 right-6 z-40 w-96 h-[32rem] bg-card/80 backdrop-blur-lg rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-primary/10"
        >
          {/* Header */}
          <header className="bg-gradient-to-r from-primary/10 to-secondary/10 p-4 flex items-center justify-between border-b border-primary/20">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-full">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-primary">Bheema AI Assistant</h3>
                <p className="text-xs text-muted-foreground">Always here to help 🌾</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {status === 'listening' && (
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-2"></div>
              )}
              {status === 'thinking' && (
                <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse mr-2"></div>
              )}
              {status === 'speaking' && (
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse mr-2"></div>
              )}
              <Button variant="ghost" size="icon" onClick={onClose} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </Button>
            </div>
          </header>

          {/* Conversation Area */}
          <ScrollArea className="flex-1 p-6 bg-gradient-to-b from-background/50 to-background/80">
            <div className="space-y-6">
              {/* Status logging removed to reduce console noise */}
              {conversation.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex items-end gap-2 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.sender === 'bot' && (
                    <Avatar className="h-10 w-10 border-2 border-primary/30">
                      <AvatarFallback className="bg-primary/10 text-primary"><Bot size={24} /></AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`max-w-[70%] p-4 rounded-2xl ${
                      message.sender === 'user'
                        ? 'bg-gradient-to-r from-primary to-primary/90 text-primary-foreground rounded-br-md shadow-lg'
                        : 'bg-gradient-to-r from-secondary/30 to-muted text-foreground rounded-bl-md shadow-md'
                    }`}
                  >
                    <div className="text-sm leading-relaxed select-text"><Markdown content={message.content} /></div>
                    <div className="flex justify-end items-center mt-2">
                      <p className="text-xs opacity-80">
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  {message.sender === 'user' && (
                    <Avatar className="h-10 w-10 border-2 border-gray-300/50">
                      <AvatarFallback className="bg-gray-100 text-gray-600"><User size={24} /></AvatarFallback>
                    </Avatar>
                  )}
                </motion.div>
              ))}
              {status === 'listening' && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-center items-center gap-2 py-3 px-4 bg-blue-50/70 rounded-full mx-4 my-2 border border-blue-200"
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="w-3 h-3 bg-blue-500 rounded-full"
                  />
                  <span className="text-sm text-blue-700 font-medium">
                    {listeningText || 'Bheema is listening... 🎤'}
                  </span>
                </motion.div>
              )}
              {status === 'speaking' && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-center items-center gap-2 py-3 px-4 bg-green-50/70 rounded-full mx-4 my-2 border border-green-200"
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                    className="text-green-600"
                  >
                    💬
                  </motion.div>
                  <span className="text-sm text-green-700 font-medium">
                    Bheema is speaking... 
                  </span>
                </motion.div>
              )}
              {status === 'thinking' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex flex-col items-center justify-center py-6 px-6 bg-gradient-to-br from-indigo-50/70 to-purple-50/70 rounded-xl mx-4 my-4 border border-indigo-200/50"
                >
                  <div className="relative mb-4">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      className="w-14 h-14 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center"
                    >
                      <Bot className="h-7 w-7 text-white" />
                    </motion.div>
                    <motion.div
                      className="absolute inset-0 rounded-full border-4 border-white/50"
                      animate={{ scale: [1, 1.5], opacity: [1, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </div>
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="text-base font-semibold text-indigo-700 mb-3"
                  >
                    Bheema is thinking... 🤔
                  </motion.div>
                  <div className="flex space-x-2">
                    <motion.div
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 0.8, repeat: Infinity, delay: 0 }}
                      className="w-3 h-3 bg-indigo-500 rounded-full"
                    />
                    <motion.div
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }}
                      className="w-3 h-3 bg-indigo-500 rounded-full"
                    />
                    <motion.div
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 0.8, repeat: Infinity, delay: 0.4 }}
                      className="w-3 h-3 bg-indigo-500 rounded-full"
                    />
                  </div>
                </motion.div>
              )}
              {status === 'error' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-center items-center gap-2 py-3 px-4 bg-red-50/70 rounded-full mx-4 my-2 border border-red-200"
                >
                  <span className="text-sm text-red-700 font-medium flex items-center">
                    <span className="mr-2">⚠️</span> Something went wrong. Please try again!
                  </span>
                </motion.div>
              )}
              {isUserTyping && (
                <div className="flex justify-end">
                  <motion.div
                    className="text-sm text-muted-foreground"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    Typing...
                  </motion.div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input Area */}
          <footer className="bg-gradient-to-b from-card to-background p-4 border-t border-primary/20">
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => fileInputRef.current?.click()} 
                className="border-primary/30 hover:bg-primary/10 text-primary"
                title="Attach file"
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
              
              <div className="flex-1 relative">
                <Input
                  type="text"
                  placeholder="Message Bheema... 🌾"
                  value={newMessage}
                  onChange={handleNewMessageChange}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="w-full py-6 pl-4 pr-10 rounded-full border-primary/30 focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary bg-background"
                />
                {newMessage.trim() && (
                  <Button 
                    onClick={() => setNewMessage('')}
                    size="icon"
                    variant="ghost" 
                    className="absolute right-12 top-1/2 transform -translate-y-1/2 h-6 w-6 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              <Button 
                onClick={handleSendMessage} 
                disabled={!newMessage.trim()} 
                className="h-12 w-12 rounded-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground shadow-md"
                title="Send message"
              >
                <Send className="h-5 w-5" />
              </Button>
              
              <Button
                onClick={onVoiceToggle}
                className={`h-12 w-12 rounded-full relative flex items-center justify-center transition-colors ${
                  isListening 
                    ? 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700' 
                    : 'bg-gradient-to-r from-secondary to-secondary/90 text-foreground hover:from-secondary/90 hover:to-secondary'
                }`}
                disabled={isSpeaking}
                title={isListening ? "Stop listening" : "Voice message"}
              >
                {isListening && (
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-white"
                    animate={{ scale: [1, 1.5], opacity: [1, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}
                
                {isSpeaking ? (
                  <Volume2 className="h-5 w-5" />
                ) : (
                  <Mic className="h-5 w-5" />
                )}
              </Button>
              
              {isSpeaking && (
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={onCancelSpeaking} 
                  className="h-12 w-12 rounded-full border-destructive/50 text-destructive hover:bg-destructive/10"
                  title="Stop speaking"
                >
                  <X className="h-5 w-5" />
                </Button>
              )}
            </div>
            
            <div className="flex justify-center mt-2">
              <p className="text-xs text-muted-foreground">Bheema is {status === 'idle' ? 'ready' : status === 'listening' ? 'listening' : status === 'thinking' ? 'thinking' : status === 'speaking' ? 'speaking' : 'busy'} {status === 'listening' ? '... 🎤' : status === 'thinking' ? '... 🤔' : status === 'speaking' ? '... 💬' : '... ⏳'}</p>
            </div>
          </footer>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

