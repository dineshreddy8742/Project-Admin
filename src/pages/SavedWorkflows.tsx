import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { workflowStorageService } from '@/services/workflowStorageService';
import { aiAssistantService } from '@/services/aiAssistantService';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const SavedWorkflows = () => {
  const [workflows, setWorkflows] = useState([]);

  useEffect(() => {
    setWorkflows(workflowStorageService.getWorkflows());
  }, []);

  const onExecute = (intent) => {
    aiAssistantService.executeSavedWorkflow(intent);
  };

  const onEdit = (intent) => {
    // Navigate to the workflow builder with the workflow loaded
    window.location.href = `/workflow-builder?intent=${intent}`;
  };

  const onDelete = (intent) => {
    const updatedWorkflows = workflows.filter(w => w.intent !== intent);
    workflowStorageService.saveAllWorkflows(updatedWorkflows);
    setWorkflows(updatedWorkflows);
  };

  return (
    <Layout>
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Saved Workflows</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workflows.map(workflow => (
            <Card key={workflow.intent}>
                <CardHeader>
                    <CardTitle>{workflow.intent}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-500">{workflow.steps.length} steps</p>
                    <div className="mt-4 space-x-2">
                        <Button onClick={() => onExecute(workflow.intent)}>Execute</Button>
                        <Button variant="outline" onClick={() => onEdit(workflow.intent)}>Edit</Button>
                        <Button variant="destructive" onClick={() => onDelete(workflow.intent)}>Delete</Button>
                    </div>
                </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default SavedWorkflows;
