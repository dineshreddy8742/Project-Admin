import React from 'react';

const nodeTypes = [
  { type: 'navigate', label: 'Navigate' },
  { type: 'fill', label: 'Fill Field' },
  { type: 'click', label: 'Click Element' },
  { type: 'prompt-user', label: 'Prompt User' },
  { type: 'if', label: 'If Condition' },
  { type: 'loop', label: 'Loop' },
];

const Palette = () => {
  const onDragStart = (event, nodeType, label) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify({ type: nodeType, label }));
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="absolute top-4 left-4 z-10 bg-white p-4 shadow-lg rounded-lg">
      <h3 className="text-lg font-bold mb-4">Workflow Steps</h3>
      <div className="space-y-2">
        {nodeTypes.map((nodeType) => (
          <div
            key={nodeType.type}
            onDragStart={(event) => onDragStart(event, nodeType.type, nodeType.label)}
            draggable
            className="w-full p-2 text-left bg-gray-100 hover:bg-gray-200 rounded-md cursor-move"
          >
            {nodeType.label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Palette;
