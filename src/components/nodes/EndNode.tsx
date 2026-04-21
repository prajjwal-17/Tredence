import { memo } from 'react';
import type { NodeProps } from '@xyflow/react';
import { BaseNode } from './BaseNode';

export const EndNode = memo<NodeProps>(function EndNode(props) {
  return (
    <BaseNode
      {...props}
      icon="⏹"
      color="#ef4444"
      showSourceHandle={false}
    />
  );
});
