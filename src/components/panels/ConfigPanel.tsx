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

  // Derive config and errors outside selectors to avoid unstable references
  const nodeConfig = selectedNodeId ? nodeConfigs[selectedNodeId] : undefined;
  const nodeErrors = useMemo(
    () => validationErrors.filter((e) => e.nodeId === selectedNodeId),
    [validationErrors, selectedNodeId]
  );

  if (!selectedNodeId || !nodeConfig) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6">
        <div className="w-16 h-16 rounded-2xl bg-slate-800/50 flex items-center justify-center mb-4">
          <span className="text-3xl opacity-40">🖱️</span>
        </div>
        <h3 className="text-sm font-medium text-slate-400 mb-1">No Node Selected</h3>
        <p className="text-xs text-slate-500">
          Click a node on the canvas to configure it
        </p>
      </div>
    );
  }

  // Get the form component from registry
  const entry = getRegistryEntryForType(nodeConfig.type);
  const FormComponent = entry?.formComponent;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50">
        <div className="flex items-center gap-2">
          <span className="text-lg">{entry?.icon ?? '📦'}</span>
          <div>
            <h3 className="text-sm font-semibold text-slate-200">
              {nodeConfig.data.title || 'Untitled'}
            </h3>
            <span
              className="text-[10px] font-semibold uppercase tracking-wider"
              style={{ color: entry?.color ?? '#94a3b8' }}
            >
              {nodeConfig.type} node
            </span>
          </div>
        </div>
        <button
          onClick={() => {
            removeNode(selectedNodeId);
            selectNode(null);
          }}
          className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
          title="Delete node"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {/* Validation errors */}
      {nodeErrors.length > 0 && (
        <div className="mx-4 mt-3 p-2.5 bg-red-500/10 border border-red-500/20 rounded-lg">
          {nodeErrors.map((err, i) => (
            <p key={i} className="text-xs text-red-400 flex items-start gap-1.5">
              <span className="shrink-0 mt-0.5">{err.severity === 'error' ? '🔴' : '🟡'}</span>
              {err.message}
            </p>
          ))}
        </div>
      )}

      {/* Form */}
      <div className="flex-1 overflow-y-auto p-4">
        {FormComponent ? (
          <FormComponent nodeId={selectedNodeId} />
        ) : (
          <p className="text-sm text-slate-500">No configuration available</p>
        )}
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
