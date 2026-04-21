import { memo } from 'react';
import { useNodeConfig } from '../../hooks/useNodeConfig';
import type { EndNodeData } from '../../types/workflow.types';
import { Input } from '../ui/Input';
import { Toggle } from '../ui/Toggle';

interface EndFormProps {
  nodeId: string;
}

export const EndForm = memo<EndFormProps>(function EndForm({ nodeId }) {
  const { draft, updateDraftField, commitToStore, commitField } =
    useNodeConfig<EndNodeData>(nodeId);

  return (
    <div className="space-y-6">
      <Input
        label="Title"
        value={draft.title}
        onChange={(e) => updateDraftField('title', e.currentTarget.value)}
        onBlur={commitToStore}
      />
      <Input
        label="Completion Message"
        value={draft.message}
        onChange={(e) => updateDraftField('message', e.currentTarget.value)}
        onBlur={commitToStore}
        placeholder="Workflow completed successfully"
      />
      <Toggle
        label="Include Summary"
        checked={draft.summaryFlag}
        onChange={(e) => commitField('summaryFlag', e.currentTarget.checked)}
      />
    </div>
  );
});
