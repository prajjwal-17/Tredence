import type { NodeProps } from '@xyflow/react';
import { NodeType } from '../../types/workflow.types';
import { registerNodeType } from '../../registry/nodeRegistry';
import {
  DEFAULT_START_DATA,
  DEFAULT_TASK_DATA,
  DEFAULT_APPROVAL_DATA,
  DEFAULT_AUTOMATED_DATA,
  DEFAULT_END_DATA,
} from '../../registry/nodeRegistry';

import { StartNode } from './StartNode';
import { TaskNode } from './TaskNode';
import { ApprovalNode } from './ApprovalNode';
import { AutomatedNode } from './AutomatedNode';
import { EndNode } from './EndNode';

// Lazy import forms to avoid circular deps
import { StartForm } from '../forms/StartForm';
import { TaskForm } from '../forms/TaskForm';
import { ApprovalForm } from '../forms/ApprovalForm';
import { AutomatedForm } from '../forms/AutomatedForm';
import { EndForm } from '../forms/EndForm';

// ─── Register all node types ───────────────────────────────────────────────

export function initializeNodeRegistry() {
  registerNodeType({
    type: NodeType.START,
    label: 'Start',
    icon: '▶',
    color: '#10b981',
    bgColor: '#0f1a18',
    borderColor: '#065f4622',
    component: StartNode,
    formComponent: StartForm,
    defaultData: DEFAULT_START_DATA,
    handles: { maxSources: 1, maxTargets: 0 },
  });

  registerNodeType({
    type: NodeType.TASK,
    label: 'Task',
    icon: '📋',
    color: '#6366f1',
    bgColor: '#131327',
    borderColor: '#4f46e522',
    component: TaskNode,
    formComponent: TaskForm,
    defaultData: DEFAULT_TASK_DATA,
    handles: { maxSources: 0, maxTargets: 0 },
  });

  registerNodeType({
    type: NodeType.APPROVAL,
    label: 'Approval',
    icon: '✅',
    color: '#f59e0b',
    bgColor: '#1a1608',
    borderColor: '#d9770622',
    component: ApprovalNode,
    formComponent: ApprovalForm,
    defaultData: DEFAULT_APPROVAL_DATA,
    handles: { maxSources: 0, maxTargets: 0 },
  });

  registerNodeType({
    type: NodeType.AUTOMATED,
    label: 'Automated',
    icon: '⚡',
    color: '#8b5cf6',
    bgColor: '#170f27',
    borderColor: '#7c3aed22',
    component: AutomatedNode,
    formComponent: AutomatedForm,
    defaultData: DEFAULT_AUTOMATED_DATA,
    handles: { maxSources: 0, maxTargets: 0 },
  });

  registerNodeType({
    type: NodeType.END,
    label: 'End',
    icon: '⏹',
    color: '#ef4444',
    bgColor: '#1a0c0c',
    borderColor: '#dc262622',
    component: EndNode,
    formComponent: EndForm,
    defaultData: DEFAULT_END_DATA,
    handles: { maxSources: 0, maxTargets: 1 },
  });
}

// ─── Node type map for React Flow ──────────────────────────────────────────
// IMPORTANT: This is a STATIC object, defined outside any component to avoid
// re-renders. React Flow requires this.

export const nodeTypes: Record<string, React.ComponentType<NodeProps>> = {
  [NodeType.START]: StartNode,
  [NodeType.TASK]: TaskNode,
  [NodeType.APPROVAL]: ApprovalNode,
  [NodeType.AUTOMATED]: AutomatedNode,
  [NodeType.END]: EndNode,
};
