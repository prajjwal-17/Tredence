import { memo } from 'react';
import type { NodeProps } from '@xyflow/react';
import { BaseNode } from './BaseNode';

export const EndNode = memo<NodeProps>(function EndNode(props) {
  return (
    <BaseNode
      {...props}
      icon="⏹"
      color="#ef4444"
      borderColor="#dc262622"
      bgColor="linear-gradient(135deg, #1a0c0c 0%, #0d1b2a 100%)"
      showTargetHandle={true}
      showSourceHandle={false}
      data={{ ...props.data, nodeType: 'End' }}
    />
  );
});
