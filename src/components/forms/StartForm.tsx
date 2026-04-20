import { memo } from 'react';
import { useNodeConfig } from '../../hooks/useNodeConfig';
import type { StartNodeData } from '../../types/workflow.types';
import { Input } from '../ui/Input';
import { KeyValueEditor } from './KeyValueEditor';

interface StartFormProps {
  nodeId: string;
}

export const StartForm = memo<StartFormProps>(function StartForm({ nodeId }) {
  const { draft, updateDraftField, commitToStore, commitField } =
    useNodeConfig<StartNodeData>(nodeId);

  return (
    <div className="flex flex-col gap-4">
      <Input
        label="Title"
        value={draft.title}
        onChange={(e) => updateDraftField('title', e.currentTarget.value)}
        onBlur={commitToStore}
        required
      />
      <KeyValueEditor
        label="Metadata"
        value={draft.metadata}
        onChange={(v) => commitField('metadata', v)}
      />
    </div>
  );
});
