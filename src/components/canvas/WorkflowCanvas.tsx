import { memo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useWorkflowStore } from '../../store/workflowStore';
import { useWorkflow } from '../../hooks/useWorkflow';
import { nodeTypes } from '../nodes';

export const WorkflowCanvas = memo(function WorkflowCanvas() {
  const nodes = useWorkflowStore((s) => s.nodes);
  const edges = useWorkflowStore((s) => s.edges);
  const onNodesChange = useWorkflowStore((s) => s.onNodesChange);
  const onEdgesChange = useWorkflowStore((s) => s.onEdgesChange);
  const onConnect = useWorkflowStore((s) => s.onConnect);
  const isValidConnectionFn = useWorkflowStore((s) => s.isValidConnection);

  const {
    reactFlowWrapper,
    onDragOver,
    onDrop,
    onNodeClick,
    onPaneClick,
    onNodesDelete,
  } = useWorkflow();

  return (
    <div ref={reactFlowWrapper} className="flex-1 h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onNodesDelete={onNodesDelete}
        onDragOver={onDragOver}
        onDrop={onDrop}
        isValidConnection={isValidConnectionFn}
        nodeTypes={nodeTypes}
        fitView
        snapToGrid
        snapGrid={[16, 16]}
        defaultEdgeOptions={{
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#475569', strokeWidth: 2 },
        }}
        proOptions={{ hideAttribution: true }}
        className="bg-slate-950"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="#1e293b"
        />
        <Controls
          className="!bg-slate-800/90 !border-slate-700 !rounded-xl !shadow-xl [&>button]:!bg-slate-700 [&>button]:!border-slate-600 [&>button]:!text-slate-300 [&>button:hover]:!bg-slate-600"
          position="bottom-left"
        />
        <MiniMap
          className="!bg-slate-900/90 !border-slate-700 !rounded-xl"
          nodeColor={(node) => {
            const colorMap: Record<string, string> = {
              start: '#10b981',
              task: '#6366f1',
              approval: '#f59e0b',
              automated: '#8b5cf6',
              end: '#ef4444',
            };
            return colorMap[node.type ?? ''] ?? '#64748b';
          }}
          maskColor="rgba(15, 23, 42, 0.7)"
        />
      </ReactFlow>
    </div>
  );
});
