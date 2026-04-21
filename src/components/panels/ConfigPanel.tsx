import { memo, useMemo } from 'react';
import { useWorkflowStore } from '../../store/workflowStore';
import type { NodeType } from '../../types/workflow.types';
import { getNodeRegistryEntry } from '../../registry/nodeRegistry';

export const ConfigPanel = memo(function ConfigPanel() {
  const selectedNodeId = useWorkflowStore((s) => s.selectedNodeId);
  const nodeConfigs = useWorkflowStore((s) => s.nodeConfigs);
  const validationErrors = useWorkflowStore((s) => s.validationErrors);
  const removeNode = useWorkflowStore((s) => s.removeNode);
  const selectNode = useWorkflowStore((s) => s.selectNode);

  const nodeConfig = selectedNodeId ? nodeConfigs[selectedNodeId] : undefined;
  const nodeErrors = useMemo(
    () => validationErrors.filter((e) => e.nodeId === selectedNodeId),
    [validationErrors, selectedNodeId]
  );

  if (!selectedNodeId || !nodeConfig) {
    return (
      <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-black/5">
        <div className="flex h-[calc(100vh-230px)] min-h-[360px] flex-col items-center justify-center text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
            <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M15 15l-2 5L9 9l11 4-5 2zm0 0 5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656-2.12 2.122" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-950">No node selected</h3>
          <p className="mt-2 max-w-[220px] text-sm leading-6 text-gray-500">
            Select a workflow block to edit its settings and metadata.
          </p>
        </div>
      </div>
    );
  }

  const entry = getRegistryEntryForType(nodeConfig.type);
  const FormComponent = entry?.formComponent;

  return (
    <div className="flex h-full flex-col space-y-4">
      <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-black/5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-semibold"
              style={{ backgroundColor: `${entry?.color ?? '#9ca3af'}14`, color: entry?.color ?? '#9ca3af' }}
            >
              {entry?.icon ?? 'N'}
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-lg font-semibold tracking-tight text-gray-950">
                {nodeConfig.data.title || 'Untitled'}
              </h3>
              <p className="text-sm capitalize text-gray-500">{nodeConfig.type}</p>
            </div>
          </div>
          <button
            onClick={() => {
              removeNode(selectedNodeId);
              selectNode(null);
            }}
            className="rounded-lg p-2 text-gray-400 transition-colors duration-150 hover:bg-red-50 hover:text-red-600"
            title="Delete node"
            aria-label="Delete node"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="m19 7-.867 12.142A2 2 0 0 1 16.138 21H7.862a2 2 0 0 1-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto">
        {nodeErrors.length > 0 && (
          <section className="rounded-2xl bg-red-50 p-4 ring-1 ring-red-100">
            <h4 className="mb-3 text-sm font-semibold text-red-700">
              Validation
            </h4>
            <div className="space-y-2">
              {nodeErrors.map((err, i) => (
                <p key={i} className="flex items-start gap-2 text-sm leading-5 text-red-600">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                  {err.message}
                </p>
              ))}
            </div>
          </section>
        )}

        <section className="rounded-2xl bg-slate-50 p-4 ring-1 ring-black/5">
          <h4 className="mb-4 text-sm font-semibold text-gray-950">
            Node settings
          </h4>
          {FormComponent ? (
            <FormComponent nodeId={selectedNodeId} />
          ) : (
            <p className="text-sm text-gray-500">No configuration available.</p>
          )}
        </section>
      </div>
    </div>
  );
});

function getRegistryEntryForType(type: NodeType) {
  try {
    return getNodeRegistryEntry(type);
  } catch {
    return undefined;
  }
}
