import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from './AppIcon';
import SmartProductImage from './SmartProductImage';
import { speechUtils } from '../lib/multimodalRag';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { agentInfo } from '../lib/aiAgents';
import { useAuth } from '@/contexts/ArtomartAuthContext';

const AIChatAssistant = ({ 
  className = "",
  userContext = {},
  onProductClick = () => {}
}) => {
  const { userProfile } = useAuth();
  const { t } = useLanguage(); // Add language context
  const [currentAgent, setCurrentAgent] = useState('farming'); // Default to farming
  // Determine agent based on user role
  useEffect(() => {
    if (userProfile?.role === 'artifact_seller' || userProfile?.role === 'artisan') {
      setCurrentAgent('artisan');
    } else {
      setCurrentAgent('farming');
    }
  }, [userProfile]);

  const [messages, setMessages] = useState([]); // Initialize with empty array
  useEffect(() => {
    // Set initial message based on currentAgent
    setMessages([
      {
        id: 1,
        type: 'ai',
        content: agentInfo[currentAgent].initialMessage,
        timestamp: new Date(),
      }
    ]);
    
    // Initialize voice service when component mounts
    import('../services/voiceService').then(({ voiceService }) => {
      voiceService.init();
      voiceService.setLanguage(userContext.language || 'en');
    });
  }, [currentAgent]); // Re-run when currentAgent changes
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  
  // Define suggestions based on agent type
  const suggestions = currentAgent === 'artisan' ? [
    { title: t('navbar.products'), reason: t('aiAssistant.suggestionManageProducts') },
    { title: t('navbar.orders'), reason: t('aiAssistant.suggestionTrackOrders') },
    { title: t('navbar.marketing'), reason: t('aiAssistant.suggestionPromote') }
  ] : [
    { title: t('dashboard.cropRecommendation'), reason: t('aiAssistant.suggestionCropSelection') },
    { title: t('dashboard.diseaseDetector'), reason: t('aiAssistant.suggestionDiseaseIdentify') },
    { title: t('dashboard.coldStorage'), reason: t('aiAssistant.suggestionStorage') }
  ];

  useEffect(() => {
    const startSession = async () => {
      try {
        const formData = new FormData();
        formData.append('user_id', userContext.userId || 'anonymous'); // Use real user ID when available
        const response = await axios.post('/api/agent/start-session', formData);
        if (response.data.session_id) {
          setSessionId(response.data.session_id);
        }
      } catch (error) {
        console.error("Error starting session:", error);
      }
    };
    startSession();
  }, [userContext.userId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (message = inputMessage) => {
    if (!message.trim() || isLoading || !sessionId) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: message.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('session_id', sessionId);
      formData.append('message', message.trim());
      formData.append('language', userContext.language || 'en');

      const response = await axios.post('/api/agent/chat', formData);
      const result = response.data;

      if (result.actions) {
        result.actions.forEach(action => {
          if (action.action === 'speak_response') {
            const aiMessage = {
              id: Date.now() + 1,
              type: 'ai',
              content: action.message,
              timestamp: new Date(),
            };
            setMessages(prev => [...prev, aiMessage]);
          } else if (action.action === 'navigate') {
            // Handle navigation based on the target page
            if (action.page.startsWith('/')) {
              navigate(action.page);
            } else {
              // Map common navigation requests to appropriate routes
              const navigationMap = {
                'dashboard': '/dashboard',
                'crop monitor': '/dashboard/crop-monitor',
                'crop recommendation': '/dashboard/crop-recommendation',
                'disease detector': '/dashboard/disease-detector',
                'market trends': '/dashboard/market-trends',
                'gov schemes': '/dashboard/gov-schemes',
                'cold storage': '/dashboard/cold-storage',
                'grocery market': '/dashboard/grocery-market',
                'community': '/dashboard/community',
                'profile': '/dashboard/profile',
                'my products': '/dashboard/products',
                'my orders': '/dashboard/orders',
                'marketing hub': '/dashboard/marketing',
                'heritage story': '/dashboard/heritage-story',
                'regional language': '/dashboard/regional-language',
                'craft education': '/dashboard/craft-education',
                'search': '/dashboard/search',
                'reviews': '/dashboard/reviews',
                'marketplace': '/dashboard/marketplace',
                'settings': '/dashboard/settings',
                'help': '/dashboard/help'
              };
              const route = navigationMap[action.page.toLowerCase()] || `/${action.page.toLowerCase().replace(/\s+/g, '-')}`;
              navigate(route);
            }
          } else if (action.action === 'perform_task') {
            // Handle specific tasks like form filling, data retrieval, etc.
            console.log('Performing task:', action.task, action.params);
            // Add logic for specific tasks here if needed
          }
        });
      }

    } catch (error) {
      console.error('Error processing message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: "I apologize, but I'm having trouble processing your request right now. Please try again.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const startVoiceInput = () => {
    setIsListening(true);
    const recognition = speechUtils.speechToText((transcript) => {
      setInputMessage(transcript);
      setIsListening(false);
    }, speechUtils.languageCodes[userContext.language] || 'en-US');

    if (!recognition) {
      setIsListening(false);
      alert('Speech recognition not supported in your browser');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    const suggestionText = suggestion.title || suggestion;
    // Check if the suggestion starts with "Open" to trigger navigation
    if (suggestionText.toLowerCase().startsWith('open')) {
      handleSendMessage(suggestionText);
    } else {
      handleSendMessage(`Tell me more about ${suggestionText}`);
    }
  };

  const playMessageAudio = (message) => {
    const language = speechUtils.languageCodes[userContext.language] || 'en-US';
    // Use the voice service for consistent audio handling
    import('../services/voiceService').then(({ voiceService }) => {
      voiceService.setLanguage(language);
      voiceService.speak(message.content);
    });
  };

  return (
    <div className={`ai-chat-assistant flex flex-col h-full bg-white rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <Icon name={agentInfo[currentAgent].icon} size={20} />
          </div>
          <div>
            <h3 className="font-semibold">{t('aiAssistant.title')}</h3>
            <p className="text-sm text-blue-100">{t('aiAssistant.title')}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          <span className="text-sm">Online</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-96">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.type === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}>
                {message.type === 'ai' && (
                  <div className="flex items-center space-x-2 mb-1">
                    <Icon 
                      name={agentInfo[message.agent]?.icon || 'MessageCircle'} 
                      size={12} 
                      className={`text-${agentInfo[message.agent]?.color || 'blue'}-600`}
                    />
                    <span className="text-xs text-gray-500">
                      {agentInfo[message.agent]?.name || 'AI Assistant'}
                    </span>
                  </div>
                )}
                
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                
                {/* Special data displays */}
                {message.data && message.agent === 'trust' && (
                  <div className="mt-2 p-2 bg-purple-50 rounded text-xs">
                    <div className="font-medium">Trust Score: {message.data.trustScore}/100</div>
                    <div className="text-purple-700">Badge: {message.data.badge}</div>
                  </div>
                )}
                
                {message.data && message.agent === 'recommendation' && (
                  <div className="mt-2 space-y-1">
                    {message.data.slice(0, 2).map((rec, idx) => (
                      <div key={idx} className="p-2 bg-green-50 rounded text-xs cursor-pointer hover:bg-green-100"
                           onClick={() => onProductClick(rec)}>
                        <div className="font-medium">{rec.title}</div>
                        <div className="text-green-700">{rec.reason}</div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs opacity-70">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                  {message.type === 'ai' && (
                    <button
                      onClick={() => playMessageAudio(message)}
                      className="text-xs opacity-70 hover:opacity-100"
                      title="Play audio"
                    >
                      <Icon name="Volume2" size={12} />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg px-4 py-2">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                <span className="text-sm text-gray-600 ml-2">AI thinking...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="px-4 py-2 border-t border-gray-200">
          <div className="flex space-x-2 overflow-x-auto">
            {suggestions.slice(0, 3).map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="flex-shrink-0 px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
              >
                {suggestion.title || suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-end space-x-2">
          <div className="flex-1 relative">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={t('aiAssistant.placeholder')}
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={1}
              style={{ minHeight: '44px', maxHeight: '120px' }}
            />
          </div>
          
          <button
            onClick={startVoiceInput}
            disabled={isListening}
            className={`p-3 rounded-lg transition-colors ${
              isListening 
                ? 'bg-red-500 text-white animate-pulse' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title={isListening ? "Listening..." : "Voice input"}
          >
            <Icon name={isListening ? "Square" : "Mic"} size={16} />
          </button>
          
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputMessage.trim() || isLoading}
            className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Send message"
          >
            <Icon name="Send" size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChatAssistant;
