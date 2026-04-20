import { memo, useMemo, type ReactNode } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { useWorkflowStore } from '../../store/workflowStore';
import { Badge } from '../ui/Badge';

interface BaseNodeProps extends NodeProps {
  icon: string;
  color: string;
  borderColor: string;
  bgColor: string;
  showSourceHandle?: boolean;
  showTargetHandle?: boolean;
  children?: ReactNode;
}

export const BaseNode = memo<BaseNodeProps>(function BaseNode({
  id,
  data,
  selected,
  icon,
  color,
  borderColor,
  bgColor,
  showSourceHandle = true,
  showTargetHandle = true,
}) {
  const validationErrors = useWorkflowStore((s) => s.validationErrors);

  const errors = useMemo(
    () => validationErrors.filter((e) => e.nodeId === id),
    [validationErrors, id]
  );

  const errorCount = errors.filter((e) => e.severity === 'error').length;
  const warningCount = errors.filter((e) => e.severity === 'warning').length;

  return (
    <div
      className={`
        relative min-w-[160px] rounded-xl shadow-2xl
        transition-all duration-200 ease-out
        ${selected ? 'ring-2 ring-offset-2 ring-offset-slate-950 scale-105' : 'hover:scale-[1.02]'}
      `}
      style={{
        borderColor: selected ? color : borderColor,
        borderWidth: '2px',
        borderStyle: 'solid',
        background: bgColor,
        boxShadow: selected
          ? `0 0 20px ${color}33, 0 8px 32px rgba(0,0,0,0.4)`
          : '0 8px 32px rgba(0,0,0,0.3)',
      }}
    >
      {/* Error badge */}
      {(errorCount > 0 || warningCount > 0) && (
        <div className="absolute -top-2 -right-2 flex gap-1">
          {errorCount > 0 && (
            <Badge variant="error">{errorCount}</Badge>
          )}
          {warningCount > 0 && (
            <Badge variant="warning">{warningCount}</Badge>
          )}
        </div>
      )}

      {/* Content */}
      <div className="flex items-center gap-3 px-4 py-3">
        <div
          className="flex items-center justify-center w-8 h-8 rounded-lg text-lg"
          style={{ backgroundColor: `${color}22` }}
        >
          {icon}
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color }}>
            {(data as Record<string, unknown>).nodeType as string ?? 'Node'}
          </span>
          <span className="text-sm font-medium text-slate-200 truncate max-w-[120px]">
            {(data as Record<string, unknown>).label as string ?? 'Untitled'}
          </span>
        </div>
      </div>

      {/* Handles */}
      {showTargetHandle && (
        <Handle
          type="target"
          position={Position.Top}
          className="!w-3 !h-3 !rounded-full !border-2 !-top-1.5"
          style={{
            backgroundColor: bgColor,
            borderColor: color,
          }}
        />
      )}
      {showSourceHandle && (
        <Handle
          type="source"
          position={Position.Bottom}
          className="!w-3 !h-3 !rounded-full !border-2 !-bottom-1.5"
          style={{
            backgroundColor: bgColor,
            borderColor: color,
          }}
        />
      )}
    </div>
  );
});
