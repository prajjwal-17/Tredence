import { memo } from 'react';
import type { NodeProps } from '@xyflow/react';
import { BaseNode } from './BaseNode';

export const StartNode = memo<NodeProps>(function StartNode(props) {
  return (
    <BaseNode
      {...props}
      icon="▶"
      color="#10b981"
      showTargetHandle={false}
    />
  );
});
