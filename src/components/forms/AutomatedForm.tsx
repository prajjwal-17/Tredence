import { memo, useEffect, useState } from 'react';
import { useNodeConfig } from '../../hooks/useNodeConfig';
import type { AutomatedNodeData, AutomationAction } from '../../types/workflow.types';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { getAutomations } from '../../services/api';

interface AutomatedFormProps {
  nodeId: string;
}

export const AutomatedForm = memo<AutomatedFormProps>(function AutomatedForm({
  nodeId,
}) {
  const { draft, updateDraftField, commitToStore, commitField } =
    useNodeConfig<AutomatedNodeData>(nodeId);

  const [automations, setAutomations] = useState<AutomationAction[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch available automations from mock API
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getAutomations()
      .then((actions) => {
        if (!cancelled) {
          setAutomations(actions);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedAction = automations.find((a) => a.id === draft.actionId);

  return (
    <div className="flex flex-col gap-4">
      <Input
        label="Title"
        value={draft.title}
        onChange={(e) => updateDraftField('title', e.currentTarget.value)}
        onBlur={commitToStore}
        required
      />

      <Select
        label="Action"
        value={draft.actionId}
        onChange={(e) => {
          const actionId = e.currentTarget.value;
          // Reset params when action changes
          commitField('actionId', actionId);
          commitField('params', {});
        }}
        options={automations.map((a) => ({ value: a.id, label: a.label }))}
        placeholder={loading ? 'Loading actions...' : 'Select an action'}
        disabled={loading}
        required
      />

      {/* Dynamic params based on selected action */}
      {selectedAction && selectedAction.params.length > 0 && (
        <div className="flex flex-col gap-3 p-3 bg-slate-800/40 rounded-lg border border-slate-700/30">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
            Action Parameters
          </span>
          {selectedAction.params.map((param) => (
            <Input
              key={param}
              label={param}
              value={draft.params[param] ?? ''}
              onChange={(e) => {
                const newParams = { ...draft.params, [param]: e.currentTarget.value };
                updateDraftField('params', newParams as AutomatedNodeData['params']);
              }}
              onBlur={commitToStore}
              placeholder={`Enter ${param}...`}
            />
          ))}
        </div>
      )}
    </div>
  );
});
