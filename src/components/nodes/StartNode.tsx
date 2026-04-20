import { memo } from 'react';
import type { NodeProps } from '@xyflow/react';
import { BaseNode } from './BaseNode';

export const StartNode = memo<NodeProps>(function StartNode(props) {
  return (
    <BaseNode
      {...props}
      icon="▶"
      color="#10b981"
      borderColor="#065f4622"
      bgColor="linear-gradient(135deg, #0f1a18 0%, #0d1b2a 100%)"
      showTargetHandle={false}
      showSourceHandle={true}
      data={{ ...props.data, nodeType: 'Start' }}
    />
  );
});
