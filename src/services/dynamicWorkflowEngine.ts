import eventBus from '@/lib/eventBus';
import { AIMessage } from './aiAssistantService';
import uiSchema from '@/lib/ui-schema.json';

export interface DynamicWorkflowStep {
  action: 'navigate' | 'fill' | 'click' | 'prompt-user' | 'if' | 'loop' | 'speak' | 'ask_user' | 'upload_file' | 'take_photo' | 'check_status' | 'dispatch';
  target?: string; // URL for navigate, CSS selector for click
  field?: string; // form field name for fill
  value?: any;
  message?: string; // Message to be spoken or displayed
  speak?: string; // Message to be spoken for navigate action
  condition?: string; // Condition for if action
  steps?: DynamicWorkflowStep[]; // Steps for if and loop actions
  count?: number; // Number of iterations for loop action
  prompt?: string; // Prompt for ask_user action
  response_key?: string; // Key to store user response for ask_user action
  expected_response?: Record<string, string>; // Expected response for ask_user action
  file_path?: string; // File path for upload_file action
  camera_selector?: string; // Camera element selector for take_photo action
  event?: string; // Event name for dispatch action
}

export interface DynamicWorkflow {
  intent: string;
  language: string;
  translated_input: string;
  steps: DynamicWorkflowStep[];
}

class DynamicWorkflowEngine {
  private activeWorkflow: DynamicWorkflow | null = null;
  private currentStepIndex: number = -1;
  private conversationHistory: AIMessage[] = [];
  private paused: boolean = false;
  private collectedData: Record<string, any> = {};
  private uiSchema: any = uiSchema;
  private messageCounter: number = 0;

  startWorkflow(workflow: DynamicWorkflow): AIMessage | null {
    this.activeWorkflow = workflow;
    this.currentStepIndex = 0;
    this.conversationHistory = [];
    this.paused = false;
    this.collectedData = {};
    console.log("Starting workflow with steps:", workflow.steps);
    return this.executeNextStep();
  }

  resumeWorkflow(userInput: string): AIMessage | null {
    if (!this.paused || !this.activeWorkflow) {
        return null;
    }

    const previousStep = this.activeWorkflow.steps[this.currentStepIndex - 1];
    if (previousStep && previousStep.response_key) {
        this.collectedData[previousStep.response_key] = userInput;
        // Dispatch an event to update the UI in real-time
        eventBus.dispatch('autofill-field', { field: previousStep.response_key, value: userInput });
    }

    this.paused = false;
    return this.executeNextStep();
  }

  private executeNextStep(): AIMessage | null {
    if (!this.activeWorkflow || this.currentStepIndex >= this.activeWorkflow.steps.length) {
      eventBus.dispatch('workflow-completed');
      this.resetWorkflow();
      return this.createBotMessage("I have completed the task.", this.activeWorkflow?.language);
    }

    const step = this.activeWorkflow.steps[this.currentStepIndex];
    console.log("Executing step:", step);
    this.currentStepIndex++;

    const message = this.executeStep(step);

    if (this.paused) {
        console.log("Workflow paused at step:", this.currentStepIndex - 1);
        return null;
    }

    if (message) {
        console.log("Returning message from step:", message);
        return message;
    }

    // Continue to the next step immediately without delay for better UX
    return this.executeNextStep();
  }

  private getSelector(page: string, elementName: string): string | undefined {
    return this.uiSchema.pages[page]?.elements[elementName];
  }

  private executeStep(step: DynamicWorkflowStep): AIMessage | null {
    try {
        console.log("Processing step:", step);
        // Replace placeholders in the step
        const processedStep = this.replacePlaceholders(step);
        console.log("Processed step:", processedStep);

        // Get the current page from the browser's location
        const currentPage = window.location.pathname;

        switch (processedStep.action) {
            case 'navigate':
                if (processedStep.target) {
                    eventBus.dispatch('navigate', { path: processedStep.target });
                    // If there's a speak message for navigate, dispatch it
                    if (processedStep.speak) {
                        console.log("Dispatching speak event for navigate:", processedStep.speak);
                        eventBus.dispatch('speak', processedStep.speak);
                        const message: AIMessage = {
                            id: new Date().toISOString(),
                            content: processedStep.speak,
                            sender: 'bot',
                            timestamp: new Date(),
                            detectedLanguage: this.activeWorkflow?.language || 'en',
                        };
                        eventBus.dispatch('workflow-message', message);
                    }
                }
                // Continue to next step immediately after navigation
                return null;
            case 'fill':
                if (processedStep.field && processedStep.value !== undefined) {
                    eventBus.dispatch('autofill-field', { field: processedStep.field, value: processedStep.value });
                }
                break;
            case 'click':
                if (processedStep.target) {
                    eventBus.dispatch('click-element', { target: processedStep.target });
                }
                break;
            case 'prompt-user':
            case 'ask_user':
                this.paused = true;
                if (processedStep.message) {
                    console.log("Pausing workflow for user input, message:", processedStep.message);
                    eventBus.dispatch('speak', processedStep.message);
                    // Also dispatch a workflow message for the chat interface
                    const message: AIMessage = {
                        id: new Date().toISOString(),
                        content: processedStep.message,
                        sender: 'bot',
                        timestamp: new Date(),
                        detectedLanguage: this.activeWorkflow?.language || 'en',
                    };
                    eventBus.dispatch('workflow-message', message);
                    // Return null to prevent duplicate messages - we already dispatched the message
                    return null;
                }
                break;
            case 'if':
                if (processedStep.condition && this.evaluateCondition(processedStep.condition)) {
                    this.executeSteps(processedStep.steps || []);
                }
                break;
            case 'loop':
                if (processedStep.count && processedStep.steps) {
                    for (let i = 0; i < processedStep.count; i++) {
                        this.executeSteps(processedStep.steps);
                    }
                }
                break;
            case 'speak':
                if (processedStep.message) {
                    console.log("Dispatching speak event with message:", processedStep.message);
                    eventBus.dispatch('speak', processedStep.message);
                    // Also dispatch a workflow message for the chat interface
                    const message: AIMessage = {
                        id: new Date().toISOString(),
                        content: processedStep.message,
                        sender: 'bot',
                        timestamp: new Date(),
                        detectedLanguage: this.activeWorkflow?.language || 'en',
                    };
                    eventBus.dispatch('workflow-message', message);
                } else if (processedStep.target) {
                    // Handle case where target is used instead of message
                    console.log("Dispatching speak event with target:", processedStep.target);
                    eventBus.dispatch('speak', processedStep.target);
                    const message: AIMessage = {
                        id: new Date().toISOString(),
                        content: processedStep.target,
                        sender: 'bot',
                        timestamp: new Date(),
                        detectedLanguage: this.activeWorkflow?.language || 'en',
                    };
                    eventBus.dispatch('workflow-message', message);
                }
                // Continue to next step immediately after speaking
                return null;
            case 'dispatch':
                if (processedStep.event) {
                    eventBus.dispatch(processedStep.event, processedStep);
                }
                break;
            case 'upload_file':
                if (processedStep.file_path) {
                    eventBus.dispatch('upload-file', { filePath: processedStep.file_path });
                }
                break;
            case 'take_photo':
                if (processedStep.camera_selector) {
                    eventBus.dispatch('take-photo', { selector: processedStep.camera_selector });
                }
                break;
            case 'check_status':
                eventBus.dispatch('check-status', { target: processedStep.target });
                break;
        }

        if (processedStep.message && processedStep.action !== 'speak' && processedStep.action !== 'prompt-user' && processedStep.action !== 'ask_user') {
            console.log("Creating bot message for step:", processedStep.message);
            return this.createBotMessage(processedStep.message, this.activeWorkflow?.language);
        }

        return null;
    } catch (error) {
        console.error("Error executing step:", error);
        this.paused = true; // Pause the workflow on error
    
        let errorMessage = "I encountered an unknown error.";
        if (error instanceof Error) {
            errorMessage = `I encountered an error: ${error.message}.`;
            if (error.message.includes('Could not find element')) {
                errorMessage += " Please check the selector in the UI schema and make sure the element is visible on the page.";
            } else if (error.message.includes('No selector found')) {
                errorMessage += " Please make sure the UI schema is up to date and that you are on the correct page.";
            }
        }
    
        // Dispatch error message to UI
        const errorMsg: AIMessage = {
            id: new Date().toISOString(),
            content: errorMessage,
            sender: 'bot',
            timestamp: new Date(),
            detectedLanguage: this.activeWorkflow?.language || 'en',
        };
        eventBus.dispatch('workflow-message', errorMsg);
        eventBus.dispatch('speak', errorMessage);
    
        return null; // Don't return error message here since we already dispatched it
    }
  }

  private executeSteps(steps: DynamicWorkflowStep[]) {
    for (const step of steps) {
        this.executeStep(step);
    }
  }

  private evaluateCondition(condition: string): boolean {
    // This is a more advanced condition evaluator.
    // It supports ==, !=, >, <, >=, <=, &&, ||, and parentheses.
    // In a real application, you would want to use a more robust library like `jexl`.

    try {
        const func = new Function('data', `return ${condition}`);
        return func(this.collectedData);
    } catch (error) {
        console.error("Error evaluating condition:", error);
        return false;
    }
  }

  resetWorkflow() {
    this.activeWorkflow = null;
    this.currentStepIndex = -1;
    this.paused = false;
    this.collectedData = {};
    this.messageCounter = 0;
  }

  isActive(): boolean {
    return this.activeWorkflow !== null;
  }

  isPaused(): boolean {
    return this.paused;
  }

  private createBotMessage(content: string, detectedLanguage?: string): AIMessage {
    const message: AIMessage = {
      id: new Date().toISOString(),
      content: content,
      sender: 'bot',
      timestamp: new Date(),
      detectedLanguage: detectedLanguage,
    };
    this.conversationHistory.push(message);
    return message;
  }

  private replacePlaceholders(step: DynamicWorkflowStep): DynamicWorkflowStep {
    const newStep = { ...step };
    if (newStep.value && typeof newStep.value === 'string') {
        for (const key in this.collectedData) {
            newStep.value = newStep.value.replace(new RegExp(`{${key}}`, 'g'), this.collectedData[key]);
        }
    }
    if (newStep.message && typeof newStep.message === 'string') {
        for (const key in this.collectedData) {
            newStep.message = newStep.message.replace(new RegExp(`{${key}}`, 'g'), this.collectedData[key]);
        }
    }
    return newStep;
  }
}

export const dynamicWorkflowEngine = new DynamicWorkflowEngine();
