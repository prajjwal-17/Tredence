import { memo, type DragEvent, useCallback } from 'react';
import { NodeType } from '../../types/workflow.types';
import { useWorkflowStore } from '../../store/workflowStore';

interface PaletteItem {
  type: NodeType;
  label: string;
  icon: string;
  color: string;
  description: string;
}

const PALETTE_ITEMS: PaletteItem[] = [
  {
    type: NodeType.START,
    label: 'Start',
    icon: '▶',
    color: '#10b981',
    description: 'Entry point of the workflow',
  },
  {
    type: NodeType.TASK,
    label: 'Task',
    icon: '📋',
    color: '#6366f1',
    description: 'Assign a task to someone',
  },
  {
    type: NodeType.APPROVAL,
    label: 'Approval',
    icon: '✅',
    color: '#f59e0b',
    description: 'Require approval to proceed',
  },
  {
    type: NodeType.AUTOMATED,
    label: 'Automated',
    icon: '⚡',
    color: '#8b5cf6',
    description: 'Run an automated action',
  },
  {
    type: NodeType.END,
    label: 'End',
    icon: '⏹',
    color: '#ef4444',
    description: 'Workflow completion point',
  },
];

export const NodePalette = memo(function NodePalette() {
  const nodes = useWorkflowStore((s) => s.nodes);
  const hasStartNode = nodes.some((n) => n.type === NodeType.START);

  return (
    <div className="flex flex-col gap-1.5">
      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1 mb-1">
        Node Types
      </h3>
      {PALETTE_ITEMS.map((item) => {
        const disabled = item.type === NodeType.START && hasStartNode;
        return (
          <PaletteNode key={item.type} item={item} disabled={disabled} />
        );
      })}
    </div>
  );
});

// ─── Individual draggable palette node ─────────────────────────────────────

interface PaletteNodeProps {
  item: PaletteItem;
  disabled: boolean;
}

const PaletteNode = memo<PaletteNodeProps>(function PaletteNode({
  item,
  disabled,
}) {
  const onDragStart = useCallback(
    (event: DragEvent) => {
      event.dataTransfer.setData('application/reactflow-type', item.type);
      event.dataTransfer.effectAllowed = 'move';
    },
    [item.type]
  );

  return (
    <div
      draggable={!disabled}
      onDragStart={onDragStart}
      className={`
        flex items-center gap-3 px-3 py-2.5 rounded-lg
        border border-slate-700/50 transition-all duration-200
        ${
          disabled
            ? 'opacity-40 cursor-not-allowed bg-slate-800/30'
            : 'cursor-grab active:cursor-grabbing hover:bg-slate-800/60 hover:border-slate-600/50 hover:shadow-lg'
        }
      `}
      title={disabled ? 'Only one Start node allowed' : `Drag to add ${item.label}`}
    >
      <div
        className="flex items-center justify-center w-8 h-8 rounded-lg text-base shrink-0"
        style={{ backgroundColor: `${item.color}18` }}
      >
        {item.icon}
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-sm font-medium text-slate-200">{item.label}</span>
        <span className="text-[11px] text-slate-500 truncate">
          {item.description}
        </span>
      </div>
    </div>
  );
});
