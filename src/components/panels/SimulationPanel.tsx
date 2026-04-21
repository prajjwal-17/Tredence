import { memo, useMemo } from 'react';
import { useWorkflowStore } from '../../store/workflowStore';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export const SimulationPanel = memo(function SimulationPanel() {
  const runSimulation = useWorkflowStore((s) => s.runSimulation);
  const runValidation = useWorkflowStore((s) => s.runValidation);
  const isSimulating = useWorkflowStore((s) => s.isSimulating);
  const simulationLogs = useWorkflowStore((s) => s.simulationLogs);
  const validationErrors = useWorkflowStore((s) => s.validationErrors);

  const criticalErrors = useMemo(
    () => validationErrors.filter((e) => e.severity === 'error'),
    [validationErrors]
  );

  return (
    <div className="flex h-full flex-col space-y-4">
      <section className="space-y-4 rounded-2xl bg-slate-50 p-4 ring-1 ring-black/5">
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-gray-950">Simulation</h3>
            {criticalErrors.length > 0 && (
              <Badge variant="error">{criticalErrors.length}</Badge>
            )}
          </div>
          <p className="text-sm leading-5 text-gray-500">
            Validate the graph and preview the workflow path.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={runSimulation}
          disabled={isSimulating}
          className="h-11 w-full justify-center"
        >
          {isSimulating ? (
            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 5v14l11-7L8 5z" />
            </svg>
          )}
          {isSimulating ? 'Running simulation' : 'Run Simulation'}
        </Button>

        <Button
          variant="secondary"
          size="sm"
          onClick={runValidation}
          className="w-full justify-center"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m6-2v5c0 5-3.5 8-9 9-5.5-1-9-4-9-9V7l9-4 9 4z" />
          </svg>
          Validate Only
        </Button>
      </section>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto">
        {criticalErrors.length > 0 && (
          <section className="rounded-2xl bg-red-50 p-4 ring-1 ring-red-100">
            <h4 className="mb-3 text-sm font-semibold text-red-700">
              {criticalErrors.length} error{criticalErrors.length > 1 ? 's' : ''} found
            </h4>
            <div className="space-y-2">
              {criticalErrors.map((err, i) => (
                <p key={i} className="flex items-start gap-2 text-sm leading-5 text-red-600">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                  {err.message}
                </p>
              ))}
            </div>
          </section>
        )}

        <section className="min-h-[320px] rounded-2xl bg-slate-50 p-4 ring-1 ring-black/5">
          {simulationLogs.length > 0 ? (
            <div>
              <h4 className="mb-4 text-sm font-semibold text-gray-950">
                Execution log
              </h4>
              <div className="space-y-1">
                {simulationLogs.map((log, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 rounded-xl bg-white p-3 transition-colors duration-150 hover:bg-gray-50"
                  >
                    <div className="flex flex-col items-center pt-1">
                      <div
                        className={`h-2.5 w-2.5 rounded-full ${
                          log.status === 'completed'
                            ? 'bg-emerald-500'
                            : log.status === 'skipped'
                              ? 'bg-gray-300'
                              : log.status === 'pending'
                                ? 'bg-amber-500'
                                : 'bg-red-500'
                        }`}
                      />
                      {i < simulationLogs.length - 1 && (
                        <div className="mt-1 h-8 w-px bg-gray-200" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="truncate text-sm font-medium text-gray-900">
                              {log.title}
                            </span>
                            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs capitalize text-gray-500">
                              {log.stepType}
                            </span>
                          </div>
                          {log.message && (
                            <p className="mt-1 text-sm leading-5 text-gray-500">{log.message}</p>
                          )}
                        </div>
                        <span className="shrink-0 text-xs text-gray-500">
                          {log.duration}ms
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex h-full min-h-[320px] flex-col items-center justify-center text-center">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
                <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h4 className="text-sm font-semibold text-gray-950">
                No simulation yet
              </h4>
              <p className="mt-2 max-w-[220px] text-sm leading-6 text-gray-500">
                Run a simulation to inspect each executed workflow step.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
});
