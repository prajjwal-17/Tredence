import { memo } from 'react';
import type { NodeProps } from '@xyflow/react';
import { BaseNode } from './BaseNode';

export const TaskNode = memo<NodeProps>(function TaskNode(props) {
  return (
    <BaseNode
      {...props}
      icon="📋"
      color="#6366f1"
    />
  );
});
