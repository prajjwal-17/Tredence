import { memo } from 'react';
import type { NodeProps } from '@xyflow/react';
import { BaseNode } from './BaseNode';

export const AutomatedNode = memo<NodeProps>(function AutomatedNode(props) {
  return (
    <BaseNode
      {...props}
      icon="⚡"
      color="#8b5cf6"
      borderColor="#7c3aed22"
      bgColor="linear-gradient(135deg, #170f27 0%, #0d1b2a 100%)"
      data={{ ...props.data, nodeType: 'Automated' }}
    />
  );
});
