import { memo } from 'react';
import type { NodeProps } from '@xyflow/react';
import { BaseNode } from './BaseNode';

export const AutomatedNode = memo<NodeProps>(function AutomatedNode(props) {
  return (
    <BaseNode
      {...props}
      icon="⚡"
      color="#8b5cf6"
    />
  );
});
