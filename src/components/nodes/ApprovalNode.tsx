import { memo } from 'react';
import type { NodeProps } from '@xyflow/react';
import { BaseNode } from './BaseNode';

export const ApprovalNode = memo<NodeProps>(function ApprovalNode(props) {
  return (
    <BaseNode
      {...props}
      icon="✅"
      color="#f59e0b"
    />
  );
});
