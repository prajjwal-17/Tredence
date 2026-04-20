import { memo } from 'react';
import { useWorkflowStore } from '../../store/workflowStore';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import type { SimulationLog } from '../../types/execution.types';

export const SimulationPanel = memo(function SimulationPanel() {
  const simulationLogs = useWorkflowStore((s) => s.simulationLogs);
  const validationErrors = useWorkflowStore((s) => s.validationErrors);
  const isSimulating = useWorkflowStore((s) => s.isSimulating);
  const runSimulation = useWorkflowStore((s) => s.runSimulation);
  const runValidation = useWorkflowStore((s) => s.runValidation);

  const criticalErrors = validationErrors.filter((e) => e.severity === 'error');

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50">
        <h3 className="text-sm font-semibold text-slate-200">Simulation</h3>
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={runValidation}>
            Validate
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={runSimulation}
            disabled={isSimulating}
          >
            {isSimulating ? (
              <>
                <span className="animate-spin inline-block w-3 h-3 border-2 border-white/30 border-t-white rounded-full" />
                Running...
              </>
            ) : (
              '▶ Simulate'
            )}
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {/* Validation errors */}
        {validationErrors.length > 0 && (
          <div className="flex flex-col gap-2 p-3 bg-slate-800/40 rounded-lg border border-slate-700/30">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Validation
              </span>
              {criticalErrors.length > 0 && (
                <Badge variant="error">{criticalErrors.length} errors</Badge>
              )}
            </div>
            {validationErrors.map((err, i) => (
              <div
                key={i}
                className={`flex items-start gap-2 text-xs p-2 rounded ${
                  err.severity === 'error'
                    ? 'bg-red-500/10 text-red-300'
                    : 'bg-amber-500/10 text-amber-300'
                }`}
              >
                <span className="shrink-0 mt-0.5">
                  {err.severity === 'error' ? '🔴' : '🟡'}
                </span>
                <span>{err.message}</span>
              </div>
            ))}
          </div>
        )}

        {/* Simulation logs */}
        {simulationLogs.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Execution Log
            </span>
            {simulationLogs.map((log, i) => (
              <LogEntry key={i} log={log} index={i} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {simulationLogs.length === 0 && validationErrors.length === 0 && (
          <div className="flex flex-col items-center justify-center flex-1 text-center">
            <div className="w-12 h-12 rounded-xl bg-slate-800/50 flex items-center justify-center mb-3">
              <span className="text-2xl opacity-40">🧪</span>
            </div>
            <p className="text-xs text-slate-500">
              Click "Simulate" to test your workflow
            </p>
          </div>
        )}
      </div>
    </div>
  );
});

// ─── Log entry component ───────────────────────────────────────────────────

const LogEntry = memo<{ log: SimulationLog; index: number }>(
  function LogEntry({ log, index }) {
    const statusConfig = {
      completed: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: '✓' },
      pending: { color: 'text-amber-400', bg: 'bg-amber-500/10', icon: '⏳' },
      failed: { color: 'text-red-400', bg: 'bg-red-500/10', icon: '✗' },
      skipped: { color: 'text-slate-400', bg: 'bg-slate-500/10', icon: '⊘' },
    };

    const cfg = statusConfig[log.status];

    return (
      <div
        className={`flex gap-3 p-3 rounded-lg border border-slate-700/30 ${cfg.bg} transition-all duration-300`}
        style={{ animationDelay: `${index * 100}ms` }}
      >
        {/* Step number */}
        <div className="flex flex-col items-center shrink-0">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${cfg.color} border border-current/20`}
          >
            {cfg.icon}
          </div>
          {/* Connector line */}
          <div className="w-px flex-1 bg-slate-700/50 mt-1" />
        </div>

        {/* Details */}
        <div className="flex flex-col gap-1 min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-200 truncate">
              {log.title}
            </span>
            <span className="text-[10px] text-slate-500 shrink-0 ml-2">
              {log.duration}ms
            </span>
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            {log.stepType}
          </span>
          <p className="text-xs text-slate-400 break-words">{log.message}</p>
        </div>
      </div>
    );
  }
);
