import { apiService } from './apiService';

export interface AIMessage {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  isVoice?: boolean;
  confidence?: number;
  suggestions?: string[];
  detectedLanguage?: string;
}

export interface AIResponse {
  message: string;
  confidence: number;
  category: string;
  suggestions?: string[];
  actionItems?: string[];
  relatedTopics?: string[];
}

export interface FarmingContext {
  location?: string;
  cropType?: string;
  season?: string;
  farmSize?: string;
  soilType?: string;
}

export interface RecognizedIntent {
  intent: string;
  entities: Record<string, any>;
}

import { dynamicWorkflowEngine, DynamicWorkflow } from './dynamicWorkflowEngine';

import { translateText } from './translationService';

class AIAssistantService {
  private farmingContext: FarmingContext = {};

  setContext(context: FarmingContext) {
    this.farmingContext = { ...this.farmingContext, ...context };
  }

  private async getGeminiWorkflow(prompt: string, languageCode: string, file?: File): Promise<DynamicWorkflow | null> {
    // 1. Translate the user's prompt to English if it's not already in English.
    let translatedPrompt = prompt;
    if (languageCode !== 'en') {
      translatedPrompt = await translateText(prompt, 'en', languageCode);
    }

    // In a real implementation, we would not import the schema directly,
    // but rather have a more sophisticated way of providing the UI schema to the model.
    const uiSchema = await import('@/lib/ui-schema.json');

    const systemPrompt = `
      You are an expert at using a web application for both farming assistance and artisan marketplace. Your goal is to create a step-by-step workflow to accomplish a user's task.
      You will be given a user's prompt and a JSON schema of the application's UI.
      The schema describes the pages and the elements on them.
      You must return a JSON object representing the workflow.
      The workflow should be a series of steps, each with an action and a target.
      Possible actions are: 'navigate', 'click', 'fill-field', 'speak', 'ask_user', 'upload_file', 'take_photo', 'check_status'.

      IMPORTANT: All messages and responses in the workflow must be in the user's language: ${languageCode}.
      If the user is speaking in a non-English language, translate all speak actions and messages to that language.
      The application supports multiple languages: English (en), Hindi (hi), Telugu (te), Tamil (ta), Kannada (kn), Marathi (mr).

      The application has two main dashboard contexts:
      1. Farming Dashboard (Rural Smart Kisan): 
         - Features: Dashboard, Crop Monitor, Crop Recommendation, Disease Detector, Market Trends, Gov Schemes, Cold Storage, Grocery Market, Community
      2. Artisan Dashboard (Art O Mart):
         - Features: Dashboard, My Products, My Orders, Marketing Hub, Heritage Story, Regional Language, Craft Education, Market Trends, Search & Discover, Reviews & Feedback, Marketplace

      Determine the appropriate context from the user's query and suggest relevant navigation.

      Here is the UI schema:
      ${JSON.stringify(uiSchema.default, null, 2)}
    `;

    try {
      const workflow = await apiService.generateWorkflow(systemPrompt, translatedPrompt, uiSchema.default);
      const parsedResponse = workflow;
      const workflowResult: DynamicWorkflow = {
        intent: "dynamic_workflow",
        language: languageCode,
        translated_input: translatedPrompt,
        steps: parsedResponse.workflow || [],
      };

      return workflowResult;
    } catch (error: any) {
      console.error('Error calling backend for Gemini Workflow:', error);
      return null;
    }
  }

  async generateAndExecuteWorkflow(message: string, languageCode: string, file?: File): Promise<AIMessage | null> {
    const workflow = await this.getGeminiWorkflow(message, languageCode, file);

    if (workflow) {
        return dynamicWorkflowEngine.startWorkflow(workflow);
    }

    return null;
  }

  private toBase64 = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = error => reject(error);
  });


  async recognizeIntent(message: string): Promise<RecognizedIntent> {
    const lowerCaseMessage = message.toLowerCase().trim();

    // Simple greetings and conversational queries
    if ([/^hi$/, /^hello$/, /^hey$/].some(regex => regex.test(lowerCaseMessage))) {
      return { intent: 'general_query', entities: {} };
    }

    // Specific command to run a saved workflow
    if (lowerCaseMessage.startsWith('run workflow')) {
      return { intent: 'run_workflow', entities: { workflowName: lowerCaseMessage.replace(/^run workflow /, '') } };
    }

    // Check for farming-related keywords
    const farmingKeywords = ['crop', 'weather', 'soil', 'market', 'price', 'scheme', 'storage', 'cold', 'fertilizer', 'pesticide', 'harvest', 'irrigation', 'seeds', 'pests', 'disease', 'farming', 'farm', 'agriculture', 'rabi', 'kharif'];
    if (farmingKeywords.some(keyword => lowerCaseMessage.includes(keyword))) {
      return { intent: 'farming_query', entities: {} };
    }

    // Check for artisan/marketplace-related keywords
    const artisanKeywords = ['product', 'craft', 'order', 'marketplace', 'buy', 'sell', 'customer', 'price', 'art', 'artwork', 'artifacts', 'artisan', 'sell', 'listing', 'marketing', 'heritage', 'story', 'reviews', 'feedback', 'profile'];
    if (artisanKeywords.some(keyword => lowerCaseMessage.includes(keyword))) {
      return { intent: 'artisan_query', entities: {} };
    }

    // Check for navigation-related keywords
    const navigationKeywords = ['open', 'go to', 'navigate to', 'show me', 'take me to', 'dashboard', 'profile', 'settings', 'community', 'search'];
    if (navigationKeywords.some(keyword => lowerCaseMessage.includes(keyword))) {
      return { intent: 'navigation_request', entities: {} };
    }

    // For everything else, assume it's a task that requires a dynamic workflow
    return { intent: 'dynamic_workflow', entities: {} };
  }

  async startSession(userId: string, initialTask: string, language: string = 'en') {
    try {
      const response = await apiService.startSession(userId, language);
      return response;
    } catch (error: any) {
      console.error('Error starting session:', error);
      // Return a mock session response to keep the application functional
      return {
        session_id: 'mock-session-' + Date.now(),
        status: 'active',
        timestamp: new Date().toISOString(),
        message: 'Session started with mock data (backend unavailable)'
      };
    }
  }

  async executeTask(sessionId: string, taskType: string, userInput: string, language: string = 'en', file?: File) {
    try {
      const response = await apiService.executeTask(sessionId, taskType, userInput, file);
      return response;
    } catch (error: any) {
      console.error('Error executing task:', error);
      // Return a mock response to keep the application functional
      return {
        actions: [
          {
            action: 'speak_response',
            message: `I'm processing your request about "${userInput}". The backend service is currently unavailable. For "${userInput}", I recommend checking the appropriate section in the app.`
          }
        ]
      };
    }
  }

  async processVoiceInput(sessionId: string, audioBlob: Blob, language: string = 'en') {
    // In our current apiService, we don't have a specific method for voice processing
    // so we'll need to handle this differently or create a more specific implementation
    const formData = new FormData();
    formData.append('session_id', sessionId);
    formData.append('audio_file', audioBlob, 'voice.webm');
    formData.append('language', language);

    try {
      // Using the multipartRequest method directly from the apiService
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:7860/api'}/agent/voice-command`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Voice command request failed');
      }

      return await response.json();
    } catch (error: any) {
      console.error('Error processing voice input:', error);
      throw error;
    }
  }

  async getAIResponse(message: string, conversationHistory: AIMessage[] = []): Promise<AIResponse> {
    // This method needs to be adapted to the new backend.
    // For now, it will call the executeTask endpoint with a generic task type.
    // A session ID would be required here.
    console.warn("getAIResponse needs a session ID to work correctly.");
    return this.executeTask("default-session", "general_query", message).then(res => ({
        message: res.actions[0]?.message || "No response",
        confidence: 0.9,
        category: "general"
    }));
  }
}

export const aiAssistantService = new AIAssistantService();
