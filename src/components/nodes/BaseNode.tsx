import { memo, useMemo, type ReactNode } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { useWorkflowStore } from '../../store/workflowStore';
import { Badge } from '../ui/Badge';

interface BaseNodeProps extends NodeProps {
  icon: string;
  color: string;
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
        relative min-w-[172px] rounded-xl bg-white
        border transition-all duration-150 ease-out
        ${selected
          ? 'border-blue-500 shadow-lg ring-2 ring-blue-500/20'
          : 'border-gray-200 shadow-sm hover:border-gray-300 hover:shadow-md'
        }
      `}
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
      <div className="flex items-center gap-3 px-3.5 py-3">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-semibold"
          style={{ backgroundColor: `${color}14`, color }}
        >
          {icon}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-xs font-semibold uppercase" style={{ color }}>
            {(data as Record<string, unknown>).nodeType as string ?? 'Node'}
          </span>
          <span className="max-w-[132px] truncate text-sm font-medium text-gray-900">
            {(data as Record<string, unknown>).label as string ?? 'Untitled'}
          </span>
        </div>
      </div>

      {/* Handles */}
      {showTargetHandle && (
        <Handle
          type="target"
          position={Position.Top}
          className="!h-3 !w-3 !rounded-full !border-2 !bg-white !transition-all !duration-150 !-top-1.5"
          style={{ borderColor: color }}
        />
      )}
      {showSourceHandle && (
        <Handle
          type="source"
          position={Position.Bottom}
          className="!h-3 !w-3 !rounded-full !border-2 !bg-white !transition-all !duration-150 !-bottom-1.5"
          style={{ borderColor: color }}
        />
      )}
    </div>
  );
});
