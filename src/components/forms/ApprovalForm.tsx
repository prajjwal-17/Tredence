import { memo } from 'react';
import { useNodeConfig } from '../../hooks/useNodeConfig';
import type { ApprovalNodeData } from '../../types/workflow.types';
import { Input } from '../ui/Input';

interface ApprovalFormProps {
  nodeId: string;
}

export const ApprovalForm = memo<ApprovalFormProps>(function ApprovalForm({
  nodeId,
}) {
  const { draft, updateDraftField, commitToStore, commitField } =
    useNodeConfig<ApprovalNodeData>(nodeId);

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
        label="Approver Role"
        value={draft.approverRole}
        onChange={(e) => updateDraftField('approverRole', e.currentTarget.value)}
        onBlur={commitToStore}
        placeholder="e.g., Manager, HR Director"
      />
      <div className="flex flex-col gap-1.5">
        <Input
          label="Auto-Approve Threshold (%)"
          type="number"
          min={0}
          max={100}
          value={draft.autoApproveThreshold}
          onChange={(e) =>
            commitField(
              'autoApproveThreshold',
              Math.min(100, Math.max(0, parseInt(e.currentTarget.value) || 0))
            )
          }
        />
        <p className="text-[11px] text-slate-500">
          If set above 0, approvals may be auto-approved based on this threshold.
          Set to 0 to always require manual approval.
        </p>
      </div>
    </div>
  );
});
