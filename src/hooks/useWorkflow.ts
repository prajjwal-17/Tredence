import { useCallback, useRef, type DragEvent } from 'react';
import { useReactFlow, type Node } from '@xyflow/react';
import { useWorkflowStore } from '../store/workflowStore';
import { NodeType } from '../types/workflow.types';

/**
 * Canvas-level workflow operations: drag-and-drop, selection, deletion.
 */
export function useWorkflow() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();

  const addNode = useWorkflowStore((s) => s.addNode);
  const removeNode = useWorkflowStore((s) => s.removeNode);
  const selectNode = useWorkflowStore((s) => s.selectNode);
  const isValidConnectionFn = useWorkflowStore((s) => s.isValidConnection);

  // ─── Drag & Drop ───────────────────────────────────────────────────────

  const onDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData(
        'application/reactflow-type'
      ) as NodeType;

      if (!type || !Object.values(NodeType).includes(type)) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      addNode(type, position);
    },
    [screenToFlowPosition, addNode]
  );

  // ─── Selection ─────────────────────────────────────────────────────────

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      selectNode(node.id);
    },
    [selectNode]
  );

  const onPaneClick = useCallback(() => {
    selectNode(null);
  }, [selectNode]);

  // ─── Deletion ──────────────────────────────────────────────────────────

  const onNodesDelete = useCallback(
    (deleted: Node[]) => {
      for (const node of deleted) {
        removeNode(node.id);
      }
    },
    [removeNode]
  );

  return {
    reactFlowWrapper,
    onDragOver,
    onDrop,
    onNodeClick,
    onPaneClick,
    onNodesDelete,
    isValidConnection: isValidConnectionFn,
  };
}
