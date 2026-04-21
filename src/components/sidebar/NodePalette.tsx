import { memo, type DragEvent, type ReactNode, useCallback } from 'react';
import { NodeType } from '../../types/workflow.types';
import { useWorkflowStore } from '../../store/workflowStore';

interface PaletteItem {
  type: NodeType;
  label: string;
  color: string;
  description: string;
  icon: ReactNode;
}

const PALETTE_ITEMS: PaletteItem[] = [
  {
    type: NodeType.START,
    label: 'Start',
    color: '#10b981',
    description: 'Entry point',
    icon: <path d="M8 5v14l11-7L8 5z" />,
  },
  {
    type: NodeType.TASK,
    label: 'Task',
    color: '#4f46e5',
    description: 'Assign work',
    icon: <path d="M9 6h11M9 12h11M9 18h7M4 6h.01M4 12h.01M4 18h.01" />,
  },
  {
    type: NodeType.APPROVAL,
    label: 'Approval',
    color: '#d97706',
    description: 'Decision gate',
    icon: <path d="m5 13 4 4L19 7" />,
  },
  {
    type: NodeType.AUTOMATED,
    label: 'Automated',
    color: '#7c3aed',
    description: 'System action',
    icon: <path d="M13 3 4 14h7l-1 7 9-11h-7l1-7z" />,
  },
  {
    type: NodeType.END,
    label: 'End',
    color: '#ef4444',
    description: 'Completion',
    icon: <path d="M7 7h10v10H7z" />,
  },
];

export const NodePalette = memo(function NodePalette() {
  const nodes = useWorkflowStore((s) => s.nodes);
  const hasStartNode = nodes.some((n) => n.type === NodeType.START);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-slate-900 px-4 py-4 text-white">
        <div className="mb-3 inline-flex rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-white/80">
          Tools
        </div>
        <h2 className="text-base font-semibold tracking-tight text-white">
          Workflow Blocks
        </h2>
        <p className="mt-1 text-sm leading-6 text-slate-300">
          Drag onto the canvas to build the flow.
        </p>
      </div>

      <div className="space-y-3">
        {PALETTE_ITEMS.map((item) => {
          const disabled = item.type === NodeType.START && hasStartNode;
          return (
            <PaletteNode key={item.type} item={item} disabled={disabled} />
          );
        })}
      </div>
    </div>
  );
});

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
      if (disabled) return;

      event.dataTransfer.setData('application/reactflow-type', item.type);
      event.dataTransfer.effectAllowed = 'move';
    },
    [disabled, item.type]
  );

  return (
    <div
      draggable={!disabled}
      onDragStart={onDragStart}
      aria-disabled={disabled}
      className={`flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-3 transition-all duration-150 ${
        disabled
          ? 'cursor-not-allowed opacity-45'
          : 'cursor-grab hover:border-gray-200 hover:shadow-md active:scale-[0.99] active:cursor-grabbing'
      }`}
      title={disabled ? 'Only one Start node is allowed' : `Drag to add ${item.label}`}
    >
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: `${item.color}12`, color: item.color }}
      >
        <svg className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} viewBox="0 0 24 24">
          {item.icon}
        </svg>
      </div>
      <div className="min-w-0">
        <div className="truncate text-[15px] font-semibold text-gray-900">{item.label}</div>
        <div className="truncate text-xs leading-5 text-gray-500">{item.description}</div>
      </div>
    </div>
  );
});
