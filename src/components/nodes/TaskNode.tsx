import { memo } from 'react';
import type { NodeProps } from '@xyflow/react';
import { BaseNode } from './BaseNode';

export const TaskNode = memo<NodeProps>(function TaskNode(props) {
  return (
    <BaseNode
      {...props}
      icon="📋"
      color="#6366f1"
      borderColor="#4f46e522"
      bgColor="linear-gradient(135deg, #131327 0%, #0d1b2a 100%)"
      data={{ ...props.data, nodeType: 'Task' }}
    />
  );
});
