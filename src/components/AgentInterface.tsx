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
  console.log('AgentInterface isVisible:', isVisible, '(Dev mode)');
  console.log('AgentInterface status:', status, '(Dev mode)');
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
          <header className="bg-card/90 p-4 flex items-center justify-between border-b border-primary/10">
            <div className="flex items-center gap-3">
              <Bot className="h-6 w-6 text-primary" />
              <h3 className="font-semibold text-lg text-primary">AI Assistant</h3>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </header>

          {/* Conversation Area */}
          <ScrollArea className="flex-1 p-6 bg-gradient-to-b from-background/50 to-background/80">
            <div className="space-y-6">
              {console.log('Status in AgentInterface:', status)}
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
                    className={`max-w-[70%] p-3 rounded-xl shadow-md ${
                      message.sender === 'user'
                        ? 'bg-primary text-primary-foreground rounded-br-none'
                        : 'bg-muted text-muted-foreground rounded-bl-none'
                    }`}
                  >
                    <div className="text-sm leading-snug select-text"><Markdown content={message.content} /></div>
                    <div className="flex justify-end items-center mt-1">
                      <p className="text-xs opacity-60">
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
                <div className="flex justify-center">
                  <motion.div
                    className="text-sm text-muted-foreground"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    {listeningText}
                  </motion.div>
                </div>
              )}
              {status === 'speaking' && (
                <div className="flex justify-center">
                  <motion.div
                    className="text-sm text-muted-foreground"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    Bheema is responding...
                  </motion.div>
                </div>
              )}
              {status === 'thinking' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex flex-col items-center justify-center py-6 px-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl mx-4 my-2 border border-primary/20"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-3"
                  >
                    <Bot className="h-6 w-6 text-primary" />
                  </motion.div>
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="text-sm font-medium text-primary mb-2"
                  >
                    Bheema is thinking...
                  </motion.div>
                  <div className="flex space-x-1">
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 0.8, repeat: Infinity, delay: 0 }}
                      className="w-2 h-2 bg-primary rounded-full"
                    />
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }}
                      className="w-2 h-2 bg-primary rounded-full"
                    />
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 0.8, repeat: Infinity, delay: 0.4 }}
                      className="w-2 h-2 bg-primary rounded-full"
                    />
                  </div>
                </motion.div>
              )}
              {status === 'error' && (
                <div className="flex justify-center">
                  <div
                    className="text-sm text-red-500"
                  >
                    An error occurred. Please try again.
                  </div>
                </div>
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
          <footer className="bg-card p-3 border-t border-primary/10 flex items-center gap-2">
            <Input
              type="text"
              placeholder="Type your message..."
              value={newMessage}
              onChange={handleNewMessageChange}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1 bg-background border-primary/20 focus-visible:ring-primary"
            />
            <Button variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()} className="text-primary hover:bg-primary/10">
              <Paperclip className="h-5 w-5" />
            </Button>
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
            <Button onClick={handleSendMessage} disabled={!newMessage.trim()} className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Send className="h-5 w-5" />
            </Button>
            <Button
              onClick={onVoiceToggle}
              className={`h-10 w-10 rounded-full relative overflow-hidden transition-colors ${
                isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-primary/90'
              }`}
              disabled={isSpeaking}
            >
              {isListening && (
                <motion.div
                  className="absolute inset-0 border-2 border-white rounded-full"
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
              <Button variant="ghost" size="icon" onClick={onCancelSpeaking} className="h-10 w-10 rounded-full bg-red-500 hover:bg-red-600">
                <X className="h-5 w-5" />
              </Button>
            )}
          </footer>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

