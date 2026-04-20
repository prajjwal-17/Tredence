import { memo } from 'react';
import { useNodeConfig } from '../../hooks/useNodeConfig';
import type { TaskNodeData } from '../../types/workflow.types';
import { Input } from '../ui/Input';
import { KeyValueEditor } from './KeyValueEditor';

interface TaskFormProps {
  nodeId: string;
}

export const TaskForm = memo<TaskFormProps>(function TaskForm({ nodeId }) {
  const { draft, updateDraftField, commitToStore, commitField } =
    useNodeConfig<TaskNodeData>(nodeId);

  return (
    <div className="flex flex-col gap-4">
      <Input
        label="Title"
        value={draft.title}
        onChange={(e) => updateDraftField('title', e.currentTarget.value)}
        onBlur={commitToStore}
        required
      />
      <Input
        label="Description"
        value={draft.description}
        onChange={(e) => updateDraftField('description', e.currentTarget.value)}
        onBlur={commitToStore}
      />
      <Input
        label="Assignee"
        value={draft.assignee}
        onChange={(e) => updateDraftField('assignee', e.currentTarget.value)}
        onBlur={commitToStore}
        placeholder="e.g., john.doe@company.com"
      />
      <Input
        label="Due Date"
        type="date"
        value={draft.dueDate}
        onChange={(e) => commitField('dueDate', e.currentTarget.value)}
      />
      <KeyValueEditor
        label="Custom Fields"
        value={draft.customFields}
        onChange={(v) => commitField('customFields', v)}
      />
    </div>
  );
});
