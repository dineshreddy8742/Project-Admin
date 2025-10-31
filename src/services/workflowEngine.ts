import eventBus from '@/lib/eventBus';
import { AIMessage } from './aiAssistantService';

export interface WorkflowStep {
  id: string;
  message: string;
  type: 'text' | 'number' | 'choice' | 'confirm';
  targetField?: string;
  options?: string[];
  nextStep?: string | Record<string, string>;
  actions?: Array<{ type: 'dispatch'; event: string; payload?: Record<string, any> } | { type: 'navigate'; path: string }>;
  validation?: (value: string) => string | null; // Returns error message if invalid
}

export interface Workflow {
  name: string;
  intent: string;
  initialMessage: string;
  steps: WorkflowStep[];
}

class WorkflowEngine {
  private workflows: Record<string, any> = {};
  private activeWorkflow: any = null;
  private currentStep: WorkflowStep | null = null;
  private collectedData: Record<string, any> = {};
  private conversationHistory: AIMessage[] = [];

  loadWorkflows(workflows: any[]) {
    workflows.forEach((wf: any) => {
      if (wf.steps) {
        wf.steps = wf.steps.filter(this.validateWorkflowStep);
      }
      this.workflows[wf.intent] = wf;
    });
  }

  startWorkflow(intent: string, initialEntities: Record<string, any> = {}): AIMessage | null {
    const workflow = this.workflows[intent];
    if (!workflow) {
      console.warn(`No workflow found for intent: ${intent}`);
      return null;
    }

    this.activeWorkflow = workflow;
    this.collectedData = { ...initialEntities };
    this.conversationHistory = [];

    // Find the first step or a step based on initial entities
    this.currentStep = workflow.steps[0] as WorkflowStep;
    // TODO: Logic to jump to a step if initialEntities already provide some data

    if (this.currentStep) {
      return this.createBotMessage(this.currentStep.message);
    }
    return null;
  }

  async processMessage(userMessageContent: string): Promise<AIMessage | null> {
    if (!this.activeWorkflow || !this.currentStep) {
      return this.createBotMessage("I'm not currently in a specific workflow. How can I help?");
    }

    // Validate user input if validation function exists
    if (this.currentStep.validation) {
      const error = this.currentStep.validation(userMessageContent);
      if (error) {
        return this.createBotMessage(error + " Please try again.");
      }
    }

    // Store collected data
    if (this.currentStep.targetField) {
      this.collectedData[this.currentStep.targetField] = userMessageContent;
    }

    // Execute actions for the current step
    if (this.currentStep.actions) {
      this.currentStep.actions.forEach(action => {
        if (action.type === 'dispatch') {
          eventBus.dispatch(action.event, this.replacePlaceholders(action.payload || {}));
        } else if (action.type === 'navigate') {
          // This would typically be handled by the UI component listening to an event
          eventBus.dispatch('navigate', { path: this.replacePlaceholders(action.path) });
        }
      });
    }

    // Determine next step
    let nextStepId: string | null = null;
    if (typeof this.currentStep.nextStep === 'string') {
      nextStepId = this.currentStep.nextStep as string;
    } else if (this.currentStep.nextStep && typeof this.currentStep.nextStep === 'object') {
      // Handle conditional next steps
      const userInput = userMessageContent.toLowerCase();
      nextStepId = (this.currentStep.nextStep as Record<string, string>)[userInput] || null;
    }

    if (nextStepId) {
      this.currentStep = this.findStepById(nextStepId);
      if (this.currentStep) {
        return this.createBotMessage(this.replacePlaceholders(this.currentStep.message));
      } else {
        console.warn(`Next step ${nextStepId} not found in workflow ${this.activeWorkflow?.name}`);
        this.resetWorkflow();
        return this.createBotMessage("It seems like I've lost my way in this conversation. Let's start over.");
      }
    } else {
      // End of workflow
      const finalMessage = this.createBotMessage("I've completed the task. Is there anything else I can help you with?");
      this.resetWorkflow();
      return finalMessage;
    }
  }

  resetWorkflow() {
    this.activeWorkflow = null;
    this.currentStep = null;
    this.collectedData = {};
  }

  isActive(): boolean {
    return this.activeWorkflow !== null;
  }

  getCurrentBotMessage(): AIMessage | null {
    if (this.currentStep) {
      return this.createBotMessage(this.replacePlaceholders(this.currentStep.message));
    }
    return null;
  }

  private getWorkflows(): Workflow[] {
    return Object.values(this.workflows);
  }

  private createBotMessage(content: string | Record<string, any>): AIMessage {
    const messageContent = typeof content === 'string' ? content : JSON.stringify(content);
    return {
      id: new Date().toISOString(),
      content: messageContent,
      sender: 'bot',
      timestamp: new Date(),
    };
  }

  private replacePlaceholders(text: string | Record<string, any>): string | Record<string, any> {
    if (typeof text === 'string') {
      let result = text;
      for (const key in this.collectedData) {
        result = result.replace(new RegExp(`{${key}}`, 'g'), String(this.collectedData[key]));
      }
      return result;
    } else if (typeof text === 'object' && text !== null) {
      const newObject: Record<string, any> = {};
      for (const key in text) {
        newObject[key] = this.replacePlaceholders(text[key]);
      }
      return newObject;
    }
    return text;
  }

  private validateWorkflowStep(step: any): step is WorkflowStep {
    return step && typeof step.id === 'string' && typeof step.message === 'string' &&
           ['text', 'number', 'choice', 'confirm'].includes(step.type);
  }

  private findStepById(stepId: string): WorkflowStep | null {
    return this.activeWorkflow?.steps.find((step: any) => step.id === stepId) || null;
  }
}

export const workflowEngine = new WorkflowEngine();
