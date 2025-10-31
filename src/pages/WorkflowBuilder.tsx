import React, { useState, useCallback } from 'react';
import ReactFlow, { ReactFlowProvider, useNodesState, useEdgesState, addEdge, Controls, Background } from 'reactflow';
import 'reactflow/dist/style.css';

import { Layout } from '@/components/Layout';

import Palette from '@/components/Palette';

import ActionNode from '@/components/ActionNode';

const nodeTypes = {
    action: ActionNode,
};

const initialNodes = [
  { id: '1', type: 'input', data: { label: 'Start' }, position: { x: 250, y: 5 } },
];

let id = 2;
const getId = () => `${id++}`;

const WorkflowBuilder = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  const onAddNode = useCallback((type, label) => {
    const newNode = {
      id: getId(),
      type: 'action',
      data: { label: `${label} Node`, action: type },
      position: {
        x: Math.random() * 500,
        y: Math.random() * 500,
      },
    };
    setNodes((nds) => nds.concat(newNode));
  }, [setNodes]);

import { workflowStorageService } from '@/services/workflowStorageService';

// ... (keep the rest of the file the same until onSave)

  const [intent, setIntent] = React.useState('');

  const onSave = useCallback(() => {
    const startNode = nodes.find(node => node.type === 'input');
    if (!startNode) {
        console.error("No start node found");
        return;
    }

    const workflow = {
        intent: intent,
        language: "English",
        translated_input: intent,
        steps: buildSteps(startNode, nodes, edges),
    };

    workflowStorageService.saveWorkflow(workflow);
    alert('Workflow saved!');
  }, [nodes, edges, intent]);

// ... (keep the rest of the file the same until the return statement)

  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const intent = urlParams.get('intent');
    if (intent) {
        const workflow = workflowStorageService.getWorkflow(intent);
        if (workflow) {
            setIntent(intent);
            const newNodes = workflow.steps.map((step, index) => ({
                id: `${index + 2}`,
                type: 'action',
                data: { label: `${step.action} Node`, ...step },
                position: { x: 100 * index, y: 100 * index },
            }));
            const newEdges = workflow.steps.map((step, index) => ({
                id: `e${index + 1}-${index + 2}`,
                source: `${index + 1}`,
                target: `${index + 2}`,
            }));
            setNodes([initialNodes[0], ...newNodes]);
            setEdges(newEdges);
        }
    }
  }, []);

  return (
    <Layout>
      <div className="h-screen w-full" ref={reactFlowWrapper}>
        <ReactFlowProvider>
            <Palette />
            <div className="absolute top-4 right-4 z-10 space-x-2">
                <input type="text" placeholder="Workflow Name" value={intent} onChange={(e) => setIntent(e.target.value)} className="p-2 border rounded-md" />
                <button onClick={onSave} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Save Workflow
                </button>
            </div>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            fitView
          >
            <Controls />
            <Background />
          </ReactFlow>
        </ReactFlowProvider>
      </div>
    </Layout>
  );
};

export default WorkflowBuilder;
