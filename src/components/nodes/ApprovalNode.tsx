import { memo } from 'react';
import type { NodeProps } from '@xyflow/react';
import { BaseNode } from './BaseNode';

export const ApprovalNode = memo<NodeProps>(function ApprovalNode(props) {
  return (
    <BaseNode
      {...props}
      icon="✅"
      color="#f59e0b"
      borderColor="#d9770622"
      bgColor="linear-gradient(135deg, #1a1608 0%, #0d1b2a 100%)"
      data={{ ...props.data, nodeType: 'Approval' }}
    />
  );
});
