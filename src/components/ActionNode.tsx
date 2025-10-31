import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

export default memo(({ data }) => {
import uiSchema from '@/lib/ui-schema.json';

// ... (keep the rest of the file the same until renderInputs)

  const renderInputs = () => {
    const currentPage = window.location.pathname;
    const pageSchema = uiSchema.pages[currentPage];

    switch (data.action) {
      case 'navigate':
        return <input type="text" placeholder="URL" defaultValue={data.target || ''} onChange={(e) => data.target = e.target.value} className="nodrag" />;
      case 'fill':
        return (
          <>
            <select onChange={(e) => data.field = e.target.value} defaultValue={data.field || ''} className="nodrag">
                <option value="">Select Field</option>
                {pageSchema && Object.keys(pageSchema.elements).map(field => (
                    <option key={field} value={field}>{field}</option>
                ))}
            </select>
            <input type="text" placeholder="Value" defaultValue={data.value || ''} onChange={(e) => data.value = e.target.value} className="nodrag" />
          </>
        );
      case 'click':
        return (
            <select onChange={(e) => data.target = e.target.value} defaultValue={data.target || ''} className="nodrag">
                <option value="">Select Target</option>
                {pageSchema && Object.keys(pageSchema.elements).map(element => (
                    <option key={element} value={element}>{element}</option>
                ))}
            </select>
        );
      case 'prompt-user':
        return <input type="text" placeholder="Message" defaultValue={data.message || ''} onChange={(e) => data.message = e.target.value} className="nodrag" />;
      case 'if':
        return <input type="text" placeholder="Condition" defaultValue={data.condition || ''} onChange={(e) => data.condition = e.target.value} className="nodrag" />;
      case 'loop':
        return <input type="number" placeholder="Count" defaultValue={data.count || 0} onChange={(e) => data.count = e.target.value} className="nodrag" />;
      default:
        return null;
    }
  };

  const [error, setError] = React.useState(null);

  const validate = () => {
    setError(null);
    if (data.action === 'fill' && !data.field) {
        setError('Please select a field');
    }
    if (data.action === 'click' && !data.target) {
        setError('Please select a target');
    }
  }

  React.useEffect(() => {
    validate();
  }, [data]);

  return (
    <>
      <Handle type="target" position={Position.Top} />
      <div className={`react-flow__node-default ${error ? 'border-red-500' : ''}`}>
        <div>{data.label}</div>
        {renderInputs()}
        {error && <div className="text-red-500 text-xs">{error}</div>}
      </div>
      <Handle type="source" position={Position.Bottom} />
    </>
  );
});
