// ─── Discriminated Union Type System ───────────────────────────────────────

export const NodeType = {
  START: 'start',
  TASK: 'task',
  APPROVAL: 'approval',
  AUTOMATED: 'automated',
  END: 'end',
} as const;

export type NodeType = (typeof NodeType)[keyof typeof NodeType];

// ─── Per-type data interfaces ──────────────────────────────────────────────

export interface StartNodeData {
  title: string;
  metadata: Record<string, string>;
}

export interface TaskNodeData {
  title: string;
  description: string;
  assignee: string;
  dueDate: string;
  customFields: Record<string, string>;
}

export interface ApprovalNodeData {
  title: string;
  approverRole: string;
  autoApproveThreshold: number;
}

export interface AutomatedNodeData {
  title: string;
  actionId: string;
  params: Record<string, string>;
}

export interface EndNodeData {
  title: string;
  message: string;
  summaryFlag: boolean;
}

// ─── Discriminated union ───────────────────────────────────────────────────

export type NodeConfig =
  | { type: typeof NodeType.START; data: StartNodeData }
  | { type: typeof NodeType.TASK; data: TaskNodeData }
  | { type: typeof NodeType.APPROVAL; data: ApprovalNodeData }
  | { type: typeof NodeType.AUTOMATED; data: AutomatedNodeData }
  | { type: typeof NodeType.END; data: EndNodeData };

// Helper to extract data type from a given NodeType
export type NodeDataForType<T extends NodeType> = Extract<
  NodeConfig,
  { type: T }
>['data'];

// ─── Validation ────────────────────────────────────────────────────────────

export type ValidationSeverity = 'error' | 'warning';

export interface ValidationError {
  nodeId?: string;
  field?: string;
  message: string;
  severity: ValidationSeverity;
}

// ─── API types ─────────────────────────────────────────────────────────────

export interface AutomationAction {
  id: string;
  label: string;
  params: string[];
}
