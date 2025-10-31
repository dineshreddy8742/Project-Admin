const WORKFLOWS_KEY = 'workflows';

class WorkflowStorageService {
  getWorkflows() {
    const workflows = localStorage.getItem(WORKFLOWS_KEY);
    return workflows ? JSON.parse(workflows) : [];
  }

  saveWorkflow(workflow) {
    const workflows = this.getWorkflows();
    const existingWorkflowIndex = workflows.findIndex(w => w.intent === workflow.intent);

    if (existingWorkflowIndex > -1) {
        workflows[existingWorkflowIndex] = workflow;
    } else {
        workflows.push(workflow);
    }

    localStorage.setItem(WORKFLOWS_KEY, JSON.stringify(workflows));
  }

  getWorkflow(intent) {
    const workflows = this.getWorkflows();
    return workflows.find(w => w.intent === intent);
  }
}

export const workflowStorageService = new WorkflowStorageService();
