// ─── Execution model (decoupled from React Flow) ──────────────────────────

import type { NodeType, NodeConfig } from './workflow.types';

export interface WorkflowStep {
  id: string;
  type: NodeType;
  config: NodeConfig['data'];
  order: number;
}

export interface WorkflowTransition {
  from: string;
  to: string;
}

export interface WorkflowDefinition {
  steps: WorkflowStep[];
  transitions: WorkflowTransition[];
}

// ─── Simulation ────────────────────────────────────────────────────────────

export type SimulationStepStatus = 'completed' | 'skipped' | 'failed' | 'pending';

export interface SimulationLog {
  stepId: string;
  stepType: NodeType;
  title: string;
  status: SimulationStepStatus;
  duration: number;
  message: string;
  timestamp: string;
}

export interface SimulationResult {
  success: boolean;
  logs: SimulationLog[];
  errors: string[];
}
