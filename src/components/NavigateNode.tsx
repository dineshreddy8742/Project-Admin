import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

export default memo(({ data }) => {
  return (
    <>
      <Handle type="target" position={Position.Top} />
      <div className="react-flow__node-default"> 
        <div>Navigate Node</div>
        <input type="text" defaultValue={data.url || ''} onChange={(e) => data.url = e.target.value} className="nodrag" />
      </div>
      <Handle type="source" position={Position.Bottom} />
    </>
  );
});
