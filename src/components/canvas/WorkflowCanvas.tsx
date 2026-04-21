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
    <div
      ref={reactFlowWrapper}
      className="relative h-full overflow-hidden bg-[radial-gradient(circle_at_top,_#ffffff,_#f8fafc_65%)]"
    >
      {nodes.length === 0 && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center p-6">
          <div className="max-w-md text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-gray-400 shadow-sm ring-1 ring-black/5">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 5v14m-7-7h14" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold tracking-tight text-gray-950">
              Drag components to start building your workflow
            </h2>
            <p className="mt-3 text-base leading-7 text-gray-500">
              Begin with a Start block, then connect tasks, approvals, and automated steps.
            </p>
          </div>
        </div>
      )}

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
          animated: false,
          style: { stroke: '#cbd5e1', strokeWidth: 1.5 },
        }}
        connectionLineStyle={{ stroke: '#2563eb', strokeWidth: 1.8 }}
        proOptions={{ hideAttribution: true }}
        className="bg-transparent"
      >
        <Background
          variant={BackgroundVariant.Lines}
          gap={32}
          size={1}
          color="#f3f6fb"
        />
        <Controls
          className="!bottom-5 !left-5 !rounded-2xl !border !border-black/5 !bg-white !shadow-sm [&>button]:!border-gray-200 [&>button]:!bg-white [&>button]:!text-gray-500 [&>button:hover]:!bg-gray-50 [&>button:hover]:!text-gray-800"
          position="bottom-left"
        />
        {nodes.length > 0 && (
          <MiniMap
            className="!rounded-2xl !border !border-black/5 !bg-white !shadow-sm"
            nodeColor={(node) => {
              const colorMap: Record<string, string> = {
                start: '#10b981',
                task: '#4f46e5',
                approval: '#d97706',
                automated: '#7c3aed',
                end: '#ef4444',
              };
              return colorMap[node.type ?? ''] ?? '#d1d5db';
            }}
            maskColor="rgba(255, 255, 255, 0.72)"
          />
        )}
      </ReactFlow>
    </div>
  );
});
