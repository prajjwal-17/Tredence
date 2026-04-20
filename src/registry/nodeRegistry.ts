import type { ComponentType } from 'react';
import type { NodeProps } from '@xyflow/react';
import {
  NodeType,
  type NodeConfig,
  type StartNodeData,
  type TaskNodeData,
  type ApprovalNodeData,
  type AutomatedNodeData,
  type EndNodeData,
} from '../types/workflow.types';

// ─── Registry entry shape ──────────────────────────────────────────────────

export interface NodeRegistryEntry {
  type: NodeType;
  label: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  component: ComponentType<NodeProps>;
  formComponent: ComponentType<{ nodeId: string }>;
  defaultData: () => NodeConfig['data'];
  handles: {
    maxSources: number; // 0 = unlimited
    maxTargets: number; // 0 = unlimited
  };
}

// ─── Default data factories ────────────────────────────────────────────────

export const DEFAULT_START_DATA: () => StartNodeData = () => ({
  title: 'Start',
  metadata: {},
});

export const DEFAULT_TASK_DATA: () => TaskNodeData = () => ({
  title: 'New Task',
  description: '',
  assignee: '',
  dueDate: '',
  customFields: {},
});

export const DEFAULT_APPROVAL_DATA: () => ApprovalNodeData = () => ({
  title: 'Approval',
  approverRole: '',
  autoApproveThreshold: 0,
});

export const DEFAULT_AUTOMATED_DATA: () => AutomatedNodeData = () => ({
  title: 'Automated Step',
  actionId: '',
  params: {},
});

export const DEFAULT_END_DATA: () => EndNodeData = () => ({
  title: 'End',
  message: '',
  summaryFlag: false,
});

// ─── Lazy registry (populated at app init to avoid circular imports) ──────

// We use a mutable registry that gets populated from the components side
const _registry = new Map<NodeType, NodeRegistryEntry>();

export function registerNodeType(entry: NodeRegistryEntry): void {
  _registry.set(entry.type, entry);
}

export function getNodeRegistryEntry(type: NodeType): NodeRegistryEntry {
  const entry = _registry.get(type);
  if (!entry) {
    throw new Error(`No registry entry for node type: ${type}`);
  }
  return entry;
}

export function getAllRegistryEntries(): NodeRegistryEntry[] {
  return Array.from(_registry.values());
}

export function getDefaultConfig(type: NodeType): NodeConfig {
  const entry = getNodeRegistryEntry(type);
  return { type, data: entry.defaultData() } as NodeConfig;
}

// ─── Node factory ──────────────────────────────────────────────────────────

let _idCounter = 0;

export function createNodeId(): string {
  _idCounter++;
  return `node_${Date.now()}_${_idCounter}_${Math.random().toString(36).slice(2, 7)}`;
}

export function createWorkflowNode(
  type: NodeType,
  _position: { x: number; y: number }
): { nodeId: string; config: NodeConfig } {
  const id = createNodeId();
  const entry = getNodeRegistryEntry(type);
  return {
    nodeId: id,
    config: { type, data: entry.defaultData() } as NodeConfig,
  };
  // The React Flow Node object is created in the store's addNode action
  // so we only return the id + config here
}
