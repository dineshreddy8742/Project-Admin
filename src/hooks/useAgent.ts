
import { useState, useEffect, useCallback } from 'react';
import { AIMessage, aiAssistantService } from '@/services/aiAssistantService';
import { dynamicWorkflowEngine } from '@/services/dynamicWorkflowEngine';
import eventBus from '@/lib/eventBus';

export const useAgent = () => {
  const [conversation, setConversation] = useState<AIMessage[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [listeningText, setListeningText] = useState('');
  const [status, setStatus] = useState<'idle' | 'listening' | 'thinking' | 'speaking' | 'error'>('idle');

  const handleWorkflowMessage = useCallback((message: AIMessage) => {
    setConversation(prev => [...prev, message]);
    setStatus('idle');
  }, []);

  useEffect(() => {
    eventBus.on('workflow-message', handleWorkflowMessage);
    return () => {
      eventBus.remove('workflow-message', handleWorkflowMessage);
    };
  }, [handleWorkflowMessage]);

  const handleSendMessage = async (message: string, file?: File) => {
    const userMessage: AIMessage = {
      id: new Date().toISOString(),
      content: message,
      sender: 'user',
      timestamp: new Date(),
    };
    setConversation(prev => [...prev, userMessage]);
    setStatus('thinking');
    setIsThinking(true);

    const response = await aiAssistantService.generateAndExecuteWorkflow(message, 'en', file);

    setIsThinking(false);
    if (response) {
      setConversation(prev => [...prev, response]);
    }
    setStatus('idle');
  };

  const handleVoiceToggle = () => {
    // Voice functionality to be implemented
  };

  const handleCancelSpeaking = () => {
    // Voice functionality to be implemented
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleOpen = () => {
    setIsVisible(true);
  };

  return {
    conversation,
    isVisible,
    isListening,
    isSpeaking,
    isThinking,
    listeningText,
    status,
    handleSendMessage,
    handleVoiceToggle,
    handleCancelSpeaking,
    handleClose,
    handleOpen,
  };
};
