
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MessageSquare, Send, Volume2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { AgentInterface } from './AgentInterface';
import { useLanguage } from '@/contexts/language-utils';
import { useAuth } from '@/contexts/ArtomartAuthContext';
import { aiAssistantService, AIMessage } from '@/services/aiAssistantService';
import { translateText, detectLanguage } from '@/services/translationService';
import { devLog, ThrottledLogger } from '@/utils/devMode';

import eventBus from '@/lib/eventBus';
import { workflowEngine } from '@/services/workflowEngine';
import { dynamicWorkflowEngine } from '@/services/dynamicWorkflowEngine';

import coldStorageWorkflow from '@/workflows/coldStorage.workflow.json';
import diseaseDetectorWorkflow from '@/workflows/diseaseDetector.workflow.json';
import cropRecommendationWorkflow from '@/workflows/cropRecommendation.workflow.json';
import marketTrendsWorkflow from '@/workflows/marketTrends.workflow.json';
import governmentSchemesWorkflow from '@/workflows/governmentSchemes.workflow.json';
import groceryMarketplaceWorkflow from '@/workflows/groceryMarketplace.workflow.json';
import communityWorkflow from '@/workflows/community.workflow.json';
import profileWorkflow from '@/workflows/profile.workflow.json';
import settingsWorkflow from '@/workflows/settings.workflow.json';

export const VoiceAssistant: React.FC = () => {
  const navigate = useNavigate();
  const { currentLanguage } = useLanguage();
  const { user } = useAuth();
  const [isWorkflowActive, setIsWorkflowActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isAgentVisible, setIsAgentVisible] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [conversation, setConversation] = useState<AIMessage[]>([]);
  const recognitionRef = useRef<any | null>(null);

  const [isThinking, setIsThinking] = useState(false);
  const [listeningText, setListeningText] = useState("");
  const [status, setStatus] = useState<'idle' | 'listening' | 'thinking' | 'speaking' | 'error'>('idle');
  const [secureContextError, setSecureContextError] = useState<string | null>(null);


  const [isVoiceInteraction, setIsVoiceInteraction] = useState(false);
  const [lastDetectedLanguage, setLastDetectedLanguage] = useState(currentLanguage.code);

  useEffect(() => {
    if (!window.isSecureContext) {
      setSecureContextError("Voice features are disabled on insecure connections. Please use HTTPS.");
    }
  }, []);

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error('Speech recognition not supported in this browser.');
      return;
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    
    const langMap: { [key: string]: string } = {
      en: 'en-US',
      hi: 'hi-IN',
      te: 'te-IN',
      ta: 'ta-IN',
      kn: 'kn-IN',
      mr: 'mr-IN',
    };
    
    recognition.lang = langMap[currentLanguage.code] || 'en-US';
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onstart = () => {
      setIsListening(true);
      setIsVoiceInteraction(true);
      setListeningText("Bheema is listening...");
      setStatus('listening');
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';
      for (let i = 0; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      setListeningText(interimTranscript + finalTranscript);

      if (finalTranscript) {
        const userMessage: AIMessage = {
          id: new Date().toISOString(),
          content: finalTranscript,
          sender: 'user',
          timestamp: new Date(),
          isVoice: true,
        };
        setConversation(prev => [...prev, userMessage]);
        setIsThinking(true);
        setStatus('thinking');
        // Process the message immediately without artificial delay
        processUserMessage(finalTranscript, undefined, true);
        recognition.stop();
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      setListeningText("");
      setStatus('idle');
      // Reset voice interaction flag when speech recognition ends completely
      setIsVoiceInteraction(false);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      setListeningText("");
      setStatus('error');
      setTimeout(() => {
        setStatus('idle');
      }, 2000);
    };

    recognition.start();
  };

  const speakText = useCallback(async (text: string, detectedLang?: string) => {
    setIsSpeaking(true);
    setStatus('speaking');
    setIsThinking(false); // Reset thinking status when we start speaking

    // Detect the language of the text being spoken if not provided
    let textLanguage = detectedLang || lastDetectedLanguage || currentLanguage.code;
    if (!detectedLang) {
      try {
        textLanguage = await detectLanguage(text);
      } catch (error) {
        textLanguage = lastDetectedLanguage || currentLanguage.code;
        console.warn('Language detection for speech text failed, using current language:', error);
      }
    }

    // Use the voice service to handle speaking
    import('@/services/voiceService').then(({ voiceService }) => {
      voiceService.setLanguage(textLanguage);
      voiceService.speak(text);
    });

    // Set up a listener for when speech ends
    const handleSpeechEnd = () => {
      setIsSpeaking(false);
      setStatus('idle');
      // Don't reset isVoiceInteraction here - keep it true for workflow interactions
      // Only reset when the entire voice session ends
      if (dynamicWorkflowEngine.isPaused()) {
        startListening();
      }
      eventBus.remove('speech-ended', handleSpeechEnd);
    };

    eventBus.on('speech-ended', handleSpeechEnd);
  }, [currentLanguage.code, lastDetectedLanguage]);

  useEffect(() => {
    const handleWorkflowMessage = (event: CustomEvent<AIMessage>) => {
        console.log("Received workflow message:", event.detail);
        // Check if message already exists to avoid duplicates
        setConversation(prev => {
            const exists = prev.some(msg => msg.id === event.detail.id);
            if (!exists) {
                return [...prev, event.detail];
            }
            return prev;
        });
    };

    eventBus.on("workflow-message", handleWorkflowMessage);

    return () => {
        eventBus.remove("workflow-message", handleWorkflowMessage);
    };
  }, []);

  useEffect(() => {
    const startSession = async () => {
      try {
        // Use the actual user from auth context instead of hardcoded 'user123'
        const userId = user?.id || 'anonymous'; // Use actual user ID or 'anonymous'
        
        const sessionData = await aiAssistantService.startSession(userId, 'initial', currentLanguage.code);
        console.log('Session started successfully:', sessionData);
        setSessionId(sessionData.session_id);
        // Generic AI assistant greeting that works for both dashboards
        const greeting = "Hey there! I'm Bheema, your AI assistant. I can help with farming advice, market prices, cold storage, artisan business support, and much more! How can I assist you today?";
        setConversation([{
          id: 'greeting',
          content: greeting,
          sender: 'bot',
          timestamp: new Date()
        }]);
        setStatus('idle'); // Set status to idle after successful session start
        console.log('Agent is now ready and idle');
        // Don't auto-show agent - user must click the button to open it
        // setIsAgentVisible(true);
      } catch (error) {
        console.error('Error starting session:', error);
        setStatus('error'); // Set status to error if session fails
      }
    };
    startSession();

    const handleSpeak = async (event: CustomEvent<string>) => {
      console.log("Received speak event with text:", event.detail);
      // Reset thinking status when we start speaking, but only for voice interactions
      if (isVoiceInteraction) {
          setIsThinking(false);
          setStatus('speaking');
      } else {
          // For non-voice interactions, just set status to idle
          setStatus('idle');
      }
      // The text should already be in the correct language from the workflow
      // Just speak it directly
      speakText(event.detail, currentLanguage.code);
    };

    eventBus.on("speak", handleSpeak);

    return () => {
      eventBus.remove("speak", handleSpeak);
    };
  }, [currentLanguage.code, speakText, user]);

  useEffect(() => {
    const handleNavigate = (event: CustomEvent<{ path: string }>) => {
      navigate(event.detail.path);
    };

    eventBus.on('navigate', handleNavigate);

    return () => {
      eventBus.remove('navigate', handleNavigate);
    };
  }, [navigate]);

  useEffect(() => {
    const handleWorkflowCompleted = () => {
      console.log("Workflow completed, setting isWorkflowActive to false.");
      setIsWorkflowActive(false);
    };

    const handleUploadFile = (event: CustomEvent<{ filePath: string }>) => {
      console.log("Handling file upload:", event.detail.filePath);
      // Implement file upload logic here
    };

    const handleTakePhoto = (event: CustomEvent<{ selector: string }>) => {
      console.log("Handling take photo:", event.detail.selector);
      // Navigate to disease detector page and trigger camera
      navigate('/disease-detector');
      setTimeout(() => {
        eventBus.dispatch('trigger-camera', {});
      }, 1000);
    };

    const handleCheckStatus = (event: CustomEvent<{ target: string }>) => {
      console.log("Handling check status:", event.detail.target);
      // Implement status checking logic here
    };

    eventBus.on('workflow-completed', handleWorkflowCompleted);
    eventBus.on('upload-file', handleUploadFile);
    eventBus.on('take-photo', handleTakePhoto);
    eventBus.on('check-status', handleCheckStatus);

    return () => {
      eventBus.remove('workflow-completed', handleWorkflowCompleted);
      eventBus.remove('upload-file', handleUploadFile);
      eventBus.remove('take-photo', handleTakePhoto);
      eventBus.remove('check-status', handleCheckStatus);
    };
  }, []);

  useEffect(() => {
    // This is now for loading saved workflows, not the static JSON ones.
    // The logic for this will need to be implemented.
    // workflowEngine.loadWorkflows([]);
  }, []);

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
    setListeningText("");
    setStatus('idle');
  };

  const handleCancelSpeaking = () => {
    speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  // Create throttled logger instance
  const throttledLogger = useRef(new ThrottledLogger(2000));

  const processUserMessage = async (message: string, file?: File, isVoiceInput: boolean = false) => {
    devLog.log('processUserMessage called with isVoiceInput:', isVoiceInput);

    // Detect the language of the user's message
    let detectedLanguage = currentLanguage.code;
    try {
      detectedLanguage = await detectLanguage(message);
      setLastDetectedLanguage(detectedLanguage);
    } catch (error) {
      setLastDetectedLanguage(currentLanguage.code);
      console.warn('Language detection failed, using current language:', error);
    }

    // Handle simple greetings and basic queries without requiring a session
    const lowerMessage = message.toLowerCase().trim();
    const isGreeting = ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening', 'how are you', 'hey hi how are you', 'tell me a joke'].includes(lowerMessage) ||
                      lowerMessage.startsWith('hi ') ||
                      lowerMessage.startsWith('hello ') ||
                      lowerMessage.startsWith('good morning') ||
                      lowerMessage.startsWith('good afternoon') ||
                      lowerMessage.startsWith('good evening');

    // Check for joke request in any language
    const isJokeRequest = lowerMessage.includes('joke') || lowerMessage.includes('joke cheppa') || lowerMessage.includes('joke cheppu') || lowerMessage.includes('oka joke cheppa') || lowerMessage.includes('oka joke cheppu') || lowerMessage.includes('joke bol') || lowerMessage.includes('joke sunao') || lowerMessage.includes('joke sollunga') || lowerMessage.includes('joke heli') || lowerMessage.includes('joke parayuka') || lowerMessage.includes('joke boliye');

    // Check for basic farming-related queries that can be handled without session
    const isBasicQuery = lowerMessage.includes('weather') || lowerMessage.includes('market') || lowerMessage.includes('price') || lowerMessage.includes('crop') || lowerMessage.includes('disease') || lowerMessage.includes('pesticide') || lowerMessage.includes('fertilizer') || lowerMessage.includes('scheme') || lowerMessage.includes('government') || lowerMessage.includes('loan') || lowerMessage.includes('subsidy');

    // Handle specific market price queries
    if (lowerMessage.includes('market price') || lowerMessage.includes('price of') || (lowerMessage.includes('tomato') && lowerMessage.includes('price'))) {
      const crops = ['tomato', 'potato', 'onion', 'wheat', 'rice', 'beans', 'cabbage'];
      const crop = crops.find(c => lowerMessage.includes(c));
      if (crop) {
        // Navigate to market trends page and set the crop
        navigate('/market-trends');
        setTimeout(() => {
          eventBus.dispatch('fill-market-trends-field', { field: 'commodity', value: crop });
        }, 1000);

        // Use pre-translated responses for each crop
        const cropResponses = {
          tomato: "I've opened the market trends page for tomato. Please select your location to see current prices.",
          potato: "I've opened the market trends page for potato. Please select your location to see current prices.",
          onion: "I've opened the market trends page for onion. Please select your location to see current prices.",
          wheat: "I've opened the market trends page for wheat. Please select your location to see current prices.",
          rice: "I've opened the market trends page for rice. Please select your location to see current prices.",
          beans: "I've opened the market trends page for beans. Please select your location to see current prices.",
          cabbage: "I've opened the market trends page for cabbage. Please select your location to see current prices."
        };

        let responseText = cropResponses[crop as keyof typeof cropResponses];
        // Translate response to detected language if not English
        if (detectedLanguage !== 'en') {
          try {
            responseText = await translateText(responseText, detectedLanguage, 'en');
          } catch (error) {
            console.warn('Translation failed for market price response:', error);
          }
        }
        const botMessage: AIMessage = {
          id: `${new Date().toISOString()}-bot`,
          content: responseText,
          sender: 'bot',
          timestamp: new Date(),
        };
        setConversation(prev => [...prev, botMessage]);
        speakText(responseText, detectedLanguage);
        setIsThinking(false);
        setStatus('idle');
        return;
      } else {
        // Handle general price queries that don't match specific crops
        let generalResponse = "For current tomato prices in Tamil Nadu, I recommend checking local vendors through apps like Dunzo or BigBasket. Art-O-Mart specializes in connecting you with artisans and their crafts.";
        // Translate response to detected language if not English
        if (detectedLanguage !== 'en') {
          try {
            generalResponse = await translateText(generalResponse, detectedLanguage, 'en');
          } catch (error) {
            console.warn('Translation failed for general price response:', error);
          }
        }
        const botMessage: AIMessage = {
          id: `${new Date().toISOString()}-bot`,
          content: generalResponse,
          sender: 'bot',
          timestamp: new Date(),
        };
        setConversation(prev => [...prev, botMessage]);
        speakText(generalResponse, detectedLanguage);
        setIsThinking(false);
        setStatus('idle');
        return;
      }
    }

    if (isGreeting || isJokeRequest || isBasicQuery) {
      const responses = {
        en: {
          greeting: "Good morning! I'm Bheema, your AI farming assistant. How can I help you with your farming needs today?",
          joke: "Why did the scarecrow win an award? Because he was outstanding in his field! 🌾",
          weather: "I can help you check the current weather conditions for your location. Would you like me to get the weather information?",
          market: "I can provide you with current market prices for various crops and commodities. What would you like to know about market trends?",
          crop: "I can help you with crop recommendations, disease detection, and farming advice. What specific crop are you working with?",
          disease: "I can help identify crop diseases from photos and provide treatment recommendations. Would you like to upload an image of your crop?",
          scheme: "I can provide information about various government schemes and subsidies available for farmers. Which scheme are you interested in?"
        },
        hi: {
          greeting: "सुप्रभात! मैं भीमा हूं, आपका AI कृषि सहायक। आज मैं आपकी कृषि संबंधी जरूरतों में कैसे मदद कर सकता हूं?",
          joke: "स्केयरक्रो को पुरस्कार क्यों मिला? क्योंकि वह अपने क्षेत्र में उत्कृष्ट था! 🌾",
          weather: "मैं आपके स्थान के मौजूदा मौसम की स्थिति की जांच करने में आपकी मदद कर सकता हूं। क्या आप चाहते हैं कि मैं मौसम की जानकारी प्राप्त करूं?",
          market: "मैं आपको विभिन्न फसलों और वस्तुओं के वर्तमान बाजार मूल्य प्रदान कर सकता हूं। बाजार के रुझानों के बारे में आप क्या जानना चाहते हैं?",
          crop: "मैं फसल की सिफारिश, बीमारी का पता लगाने और कृषि सलाह में आपकी मदद कर सकता हूं। आप किस विशिष्ट फसल के साथ काम कर रहे हैं?",
          disease: "मैं फोटो से फसल की बीमारियों की पहचान कर सकता हूं और उपचार की सिफारिश दे सकता हूं। क्या आप अपनी फसल की एक छवि अपलोड करना चाहते हैं?",
          scheme: "मैं किसानों के लिए उपलब्ध विभिन्न सरकारी योजनाओं और सब्सिडी के बारे में जानकारी प्रदान कर सकता हूं। आप किस योजना में रुचि रखते हैं?"
        },
        te: {
          greeting: "శుభోదయం! నేను బీమా, మీ AI వ్యవసాయ సహాయకుడు. నేటి మీ వ్యవసాయ అవసరాలలో నేను ఎలా సహాయం చేయగలను?",
          joke: "స్కేర్క్రోగె అవార్డ్ ఎందుకు వచ్చింది? ఎందుకంటే అతను తన ఫీల్డ్‌లో అత్యుత్తమంగా ఉన్నాడు! 🌾",
          weather: "మీ స్థానం వాతావరణ పరిస్థితులను తనిఖీ చేయడంలో నేను మీకు సహాయం చేయగలను. వాతావరణ సమాచారాన్ని పొందాలని మీరు కోరుకుంటున్నారా?",
          market: "వివిధ పంటలు మరియు వస్తువులకు ప్రస్తుత మార్కెట్ ధరలను నేను మీకు అందించగలను. మార్కెట్ ట్రెండ్‌ల గురించి మీరు ఏమి తెలుసుకోవాలనుకుంటున్నారు?",
          crop: "పంట సిఫార్సులు, వ్యాధి గుర్తింపు మరియు వ్యవసాయ సలహెయలో నేను మీకు సహాయం చేయగలను. మీరు ఏ ప్రత్యేక పంటతో పని చేస్తున్నారు?",
          disease: "ఫోటోల నుండి పంట వ్యాధులను గుర్తించి చికిత్స సిఫార్సులను అందించగలను. మీ పంట చిత్రాన్ని అప్‌లోడ్ చేయాలని మీరు కోరుకుంటున్నారా?",
          scheme: "రైతులకు అందుబాటులో ఉన్న వివిధ ప్రభుత్వ పథకాలు మరియు సబ్సిడీల గురించి సమాచారాన్ని అందించగలను. యావ పథకంలో మీకు ఆసక్తి ఉంది?"
        },
        ta: {
          greeting: "காலை வணக்கம்! நான் பீமா, உங்கள் AI விவசாய உதவியாளர். இன்று உங்கள் விவசாயத் தேவைகளில் நான் எவ்வாறு உதவ முடியும்?",
          joke: "ஸ்கேர்க்ரோவுக்கு விருது ஏன் கிடைத்தது? ஏனென்றால் அவர் தனது வயலில் மிகவும் சிறப்பாக இருந்தார்! 🌾",
          weather: "உங்கள் இடத்தின் தற்போதைய வானிலை நிலைமைகளை சரிபார்க்க உதவ முடியும். வானிலை தகவலைப் பெற வேண்டுமா?",
          market: "பல்வேறு பயிர்கள் மற்றும் பொருட்களின் தற்போதைய சந்தை விலைகளை வழங்க முடியும். சந்தை போக்குகளைப் பற்றி என்ன தெரிந்து கொள்ள விரும்புகிறீர்கள்?",
          crop: "பயிர் பரிந்துரைகள், நோய் கண்டறிதல் மற்றும் விவசாய ஆலோசனையில் உதவ முடியும். எந்த குறிப்பிட்ட பயிருடன் வேலை செய்கிறீர்கள்?",
          disease: "புகைப்படங்களிலிருந்து பயிர் நோய்களை அடையாளம் கண்டு சிகிச்சை பரிந்துரைகளை வழங்க முடியும். உங்கள் பயிரின் படத்தை பதிவேற்ற விரும்புகிறீர்களா?",
          scheme: "விவசாயிகளுக்கு கிடைக்கும் பல்வேறு அரசு திட்டங்கள் மற்றும் மானியங்களைப் பற்றிய தகவலை வழங்க முடியும். எந்த திட்டத்தில் ஆர்வம் உள்ளது?"
        },
        kn: {
          greeting: "ಶುಭೋದಯ! ನಾನು ಬೀಮಾ, ನಿಮ್ಮ AI ಕೃಷಿ ಸಹಾಯಕ. ಇಂದು ನಿಮ್ಮ ಕೃಷಿ ಅಗತ್ಯಗಳಲ್ಲಿ ನಾನು ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?",
          joke: "ಸ್ಕೇರ್ಕ್ರೋಗೆ ಪ್ರಶಸ್ತಿ ಏಕೆ ಸಿಕ್ಕಿತು? ಏಕೆಂದರೆ ಅವನು ತನ್ನ ಕ್ಷೇತ್ರದಲ್ಲಿ ಅತ್ಯುತ್ತಮನಾಗಿದ್ದನು! 🌾",
          weather: "ನಿಮ್ಮ ಸ್ಥಳದ ಪ್ರಸ್ತುತ ಹವಾಮಾನ ಸ್ಥಿತಿಗಳನ್ನು ಪರಿಶೀಲಿಸಲು ನಾನು ನಿಮಗೆ ಸಹಾಯ ಮಾಡಬಹುದು. ಹವಾಮಾನ ಮಾಹಿತಿಯನ್ನು ಪಡೆಯಲು ನೀವು ಬಯಸುತ್ತೀರಾ?",
          market: "ವಿವಿಧ ಬೆಳೆಗಳು ಮತ್ತು ಸರಕುಗಳ ಪ್ರಸ್ತುತ ಮಾರುಕಟ್ಟೆ ಬೆಲೆಗಳನ್ನು ನಾನು ನಿಮಗೆ ಒದಗಿಸಬಹುದು. ಮಾರುಕಟ್ಟೆ ಪ್ರವೃತ್ತಿಗಳ ಬಗ್ಗೆ ನೀವು ಏನು ತಿಳಿದುಕೊಳ್ಳಲು ಬಯಸುತ್ತೀರಿ?",
          crop: "ಬೆಳೆ ಶಿಫಾರಸುಗಳು, ರೋಗ ಪತ್ತೆ ಮತ್ತು ಕೃಷಿ ಸಲಹೆಯಲ್ಲಿ ನಾನು ನಿಮಗೆ ಸಹಾಯ ಮಾಡಬಹುದು. ನೀವು ಯಾವ ನಿರ್ದಿಷ್ಟ ಬೆಳೆಯೊಂದಿಗೆ ಕೆಲಸ ಮಾಡುತ್ತಿದ್ದೀರಿ?",
          disease: "ಫೋಟೋಗಳಿಂದ ಬೆಳೆ ರೋಗಗಳನ್ನು ಗುರುತಿಸಿ ಮತ್ತು ಚಿಕಿತ್ಸಾ ಶಿಫಾರಸುಗಳನ್ನು ಒದಗಿಸಬಹುದು. ನಿಮ್ಮ ಬೆಳೆಯ ಚಿತ್ರವನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಲು ನೀವು ಬಯಸುತ್ತೀರಾ?",
          scheme: "ರೈತರಿಗೆ ಲಭ್ಯವಿರುವ ವಿವಿಧ ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು ಮತ್ತು ಸಬ್ಸಿಡಿಗಳ ಬಗ್ಗೆ ಮಾಹಿತಿಯನ್ನು ಒದಗಿಸಬಹುದು. ಯಾವ ಯೋಜನೆಯಲ್ಲಿ ನೀವು ಆಸಕ್ತಿ ಹೊಂದಿದ್ದೀರಿ?"
        },
        mr: {
          greeting: "शुभोदय! मी भीमा आहे, तुमचा AI शेती सहायक. आज मी तुमच्या शेतीच्या गरजांमध्ये कशी मदत करू शकतो?",
          joke: "स्केयरक्रोला पुरस्कार का मिळाला? कारण तो त्याच्या क्षेत्रात उत्कृष्ट होता! 🌾",
          weather: "तुमच्या स्थानाच्या सध्याच्या हवामान परिस्थिती तपासण्यात मी तुम्हाला मदत करू शकतो. तुम्हाला हवामान माहिती मिळवायची आहे का?",
          market: "विविध पिके आणि वस्तूंच्या सध्याच्या बाजारभावांची माहिती मी तुम्हाला देऊ शकतो. बाजार ट्रेंड्सबद्दल तुम्हाला काय माहिती हवी आहे?",
          crop: "पिक शिफारसी, रोग शोध आणि शेती सल्ल्यात मी तुम्हाला मदत करू शकतो. तुम्ही कोणत्या विशिष्ट पिकाबरोबर काम करत आहात?",
          disease: "फोटोंमधून पिक रोग ओळखून उपचार शिफारसी देऊ शकतो. तुमच्या पिकाचे प्रतिमा अपलोड करायचे आहे का?",
          scheme: "शेतकऱ्यांसाठी उपलब्ध असलेल्या विविध सरकारी योजना आणि सबसिडीबद्दल माहिती देऊ शकतो. तुम्हाला कोणत्या योजनेबद्दल माहिती हवी आहे?"
        }
      };

      const langResponses = responses[detectedLanguage as keyof typeof responses] || responses.en;
      let greetingResponse = langResponses.greeting;

      if (lowerMessage === 'tell me a joke' || isJokeRequest) {
        greetingResponse = langResponses.joke;
      } else if (isBasicQuery) {
        // Determine which type of query it is and respond accordingly
        if (lowerMessage.includes('weather')) {
          greetingResponse = langResponses.weather;
        } else if (lowerMessage.includes('market') || lowerMessage.includes('price')) {
          greetingResponse = langResponses.market;
        } else if (lowerMessage.includes('crop')) {
          greetingResponse = langResponses.crop;
        } else if (lowerMessage.includes('disease')) {
          greetingResponse = langResponses.disease;
        } else if (lowerMessage.includes('scheme') || lowerMessage.includes('government') || lowerMessage.includes('loan') || lowerMessage.includes('subsidy')) {
          greetingResponse = langResponses.scheme;
        } else {
          greetingResponse = langResponses.greeting;
        }
      }

      const botMessage: AIMessage = {
        id: `${new Date().toISOString()}-bot`,
        content: greetingResponse,
        sender: 'bot',
        timestamp: new Date(),
      };
      setConversation(prev => [...prev, botMessage]);
      // Always speak the response for voice assistant interactions
      speakText(greetingResponse, detectedLanguage);
      setIsThinking(false);
      setStatus('idle');
      return;
    }

    // Skip session check if workflow is active or paused - workflows handle their own logic
    if (!sessionId && !dynamicWorkflowEngine.isActive() && !dynamicWorkflowEngine.isPaused()) {
      // Wait for session to be initialized
      let attempts = 0;
      const maxAttempts = 10;
      const checkSession = () => {
        if (sessionId) {
          // Session is now available, proceed with processing
          processUserMessage(message, file, isVoiceInput);
        } else if (attempts < maxAttempts) {
          attempts++;
          setTimeout(checkSession, 500); // Check again in 500ms
        } else {
          // Give up after max attempts
          let errorMessage = "I'm still initializing. Please try again in a moment.";
          const botMessage: AIMessage = {
            id: `${new Date().toISOString()}-bot`,
            content: errorMessage,
            sender: 'bot',
            timestamp: new Date(),
          };
          setConversation(prev => [...prev, botMessage]);
          if (isVoiceInput) {
            speakText(errorMessage, detectedLanguage);
          }
          setIsThinking(false);
          setStatus('idle');
        }
      };
      checkSession();
      return;
    }

    setIsThinking(true);
    setStatus('thinking');

    try {
      if (dynamicWorkflowEngine.isPaused()) {
        const workflowResponse = dynamicWorkflowEngine.resumeWorkflow(message);
        if (workflowResponse) {
            setConversation(prev => [...prev, workflowResponse]);
            // Don't speak here - the workflow engine handles speaking for paused workflows
        }
      } else {
        const { intent, entities } = await aiAssistantService.recognizeIntent(message);

        switch (intent) {
            case 'run_workflow':
                const workflowName = entities.workflowName;
                if (workflowName) {
                    // aiAssistantService.executeSavedWorkflow(workflowName); // Not implemented
                    console.log(`Placeholder for running saved workflow: ${workflowName}`);
                }
                break;
            case 'dynamic_workflow':
                setIsWorkflowActive(true);
                await aiAssistantService.generateAndExecuteWorkflow(message, detectedLanguage, file);
                // The workflow engine handles adding messages to conversation via eventBus
                break;
            case 'general_query': {
                const response = await aiAssistantService.executeTask(sessionId!, 'general_query', message, detectedLanguage, file);
                let responseMessage = response.actions[0]?.message || "Sorry, I didn't understand.";
                // Always translate response to detected language for multilingual support
                if (detectedLanguage !== 'en') {
                    try {
                        responseMessage = await translateText(responseMessage, detectedLanguage, 'en');
                    } catch (error) {
                        console.warn('Translation failed, using original response:', error);
                    }
                }
                const botMessage: AIMessage = {
                    id: `${new Date().toISOString()}-bot`,
                    content: responseMessage,
                    sender: 'bot',
                    timestamp: new Date(),
                };
                setConversation(prev => [...prev, botMessage]);
                // Always speak the response for voice assistant interactions
                speakText(responseMessage, detectedLanguage);
                break;
            }
            case 'artisan_query': {
                // Handle artisan-related queries
                const response = await aiAssistantService.executeTask(sessionId!, 'artisan_query', message, detectedLanguage, file);
                let responseMessage = response.actions[0]?.message || "I can help you with artisan marketplace queries. What would you like to know about products, orders, or your artisan business?";

                // Always translate response to detected language for multilingual support
                if (detectedLanguage !== 'en') {
                    try {
                        responseMessage = await translateText(responseMessage, detectedLanguage, 'en');
                    } catch (error) {
                        console.warn('Translation failed, using original response:', error);
                    }
                }

                const botMessage: AIMessage = {
                    id: `${new Date().toISOString()}-bot`,
                    content: responseMessage,
                    sender: 'bot',
                    timestamp: new Date(),
                };
                setConversation(prev => [...prev, botMessage]);
                // Always speak the response for voice assistant interactions
                speakText(responseMessage, detectedLanguage);
                break;
            }
            default:
                console.error(`Unknown intent: ${intent}`);
                let errorMessageText = "Sorry, I'm not sure how to handle that request.";
                // Always translate error message to detected language for multilingual support
                if (detectedLanguage !== 'en') {
                    try {
                        errorMessageText = await translateText(errorMessageText, detectedLanguage, 'en');
                    } catch (error) {
                        console.warn('Translation failed, using original error message:', error);
                    }
                }
                const errorMessage: AIMessage = {
                    id: `${new Date().toISOString()}-bot`,
                    content: errorMessageText,
                    sender: 'bot',
                    timestamp: new Date(),
                };
                setConversation(prev => [...prev, errorMessage]);
                // Always speak the response for voice assistant interactions
                speakText(errorMessageText, detectedLanguage);
                break;
        }
      }
    } catch (error: any) {
        console.error('Error processing message:', error);
        setStatus('error');
        
        // Check if this is a specific API error
        let errorMessageText = "Sorry, I encountered an error. ";
        if (error?.response?.status === 500) {
            errorMessageText += "The AI service is currently unavailable. Please try again later.";
        } else if (error?.request) {
            errorMessageText += "Check your internet connection and try again.";
        } else {
            errorMessageText += "Please try again.";
        }
        
        // Always translate error message to detected language for multilingual support
        if (detectedLanguage !== 'en') {
            try {
                errorMessageText = await translateText(errorMessageText, detectedLanguage, 'en');
            } catch (error) {
                console.warn('Translation failed, using original error message:', error);
            }
        }
        const botMessage: AIMessage = {
            id: `${new Date().toISOString()}-bot`,
            content: errorMessageText,
            sender: 'bot',
            timestamp: new Date(),
        };
        setConversation(prev => [...prev, botMessage]);
        // Always speak the response for voice assistant interactions
        const textToSpeak = errorMessageText
            .replace(/\*\*(.*?)\*\*/g, '$1')
            .replace(/### (.*)/g, '$1')
            .replace(/#### (.*)/g, '$1')
            .replace(/\* (.*)/g, '$1')
            .replace(/---/g, '')
            .replace(/#(\w+)/g, '$1');
        speakText(textToSpeak, detectedLanguage);
    } finally {
        setIsThinking(false);
        setStatus('idle');
    }
  };

  const handleSendMessage = async (message: string, file?: File) => {
    if (!sessionId) return;

    const userMessage: AIMessage = {
      id: new Date().toISOString(),
      content: message,
      sender: 'user',
      timestamp: new Date(),
    };
    setConversation(prev => [...prev, userMessage]);
    // Always show thinking status for voice assistant interactions
    setIsThinking(true);
    setStatus('thinking');
    processUserMessage(message, file, true); // Always treat as voice input for speaking
  };

  return (
    <>
      <AgentInterface
        conversation={conversation}
        isSpeaking={isSpeaking}
        isListening={isListening}
        listeningText={listeningText}
        onClose={() => {
          console.log('Closing agent, setting isAgentVisible to false');
          setIsAgentVisible(false);
          setIsWorkflowActive(false);
          dynamicWorkflowEngine.resetWorkflow();
        }}
        onSendMessage={handleSendMessage}
        isVisible={isAgentVisible || isWorkflowActive || dynamicWorkflowEngine.isActive()}
        isThinking={isThinking}
        onVoiceToggle={handleVoiceToggle}
        onCancelSpeaking={handleCancelSpeaking}
        status={status}
      />

      {/* Floating toggle button to show/hide the agent */}
      {!isAgentVisible && (
        <motion.button
          onClick={() => setIsAgentVisible(true)}
          className="fixed bottom-6 right-6 z-50 p-5 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground rounded-full shadow-2xl hover:shadow-3xl focus:outline-none focus:ring-4 focus:ring-primary/30 transition-all duration-300 border-2 border-white"
          whileHover={{ scale: 1.15, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
          animate={{ 
            y: [0, -5, 0],
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <div className="relative">
            <MessageSquare className="h-6 w-6" />
            <motion.div
              className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-white"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
        </motion.button>
      )}

      {secureContextError && (
        <div className="fixed bottom-24 right-6 z-50 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700">
          <p className="font-bold">Warning</p>
          <p>{secureContextError}</p>
        </div>
      )}
    </>
  );
};