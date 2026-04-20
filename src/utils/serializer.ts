import type { Edge } from '@xyflow/react';
import type { NodeConfig } from '../types/workflow.types';
import type { WorkflowDefinition, WorkflowStep, WorkflowTransition } from '../types/execution.types';

interface SerializableNode {
  id: string;
  type?: string;
  position: { x: number; y: number };
}

// ─── Serialize: React Flow state → WorkflowDefinition ──────────────────────

export function serializeWorkflow(
  nodes: SerializableNode[],
  edges: Edge[],
  configs: Record<string, NodeConfig>
): WorkflowDefinition {
  const steps: WorkflowStep[] = [];
  const transitions: WorkflowTransition[] = [];

  // Compute topological order
  const order = computeTopologicalOrder(nodes, edges);

  for (const node of nodes) {
    const config = configs[node.id];
    if (!config) continue;

    steps.push({
      id: node.id,
      type: config.type,
      config: config.data,
      order: order.get(node.id) ?? -1,
    });
  }

  for (const edge of edges) {
    transitions.push({
      from: edge.source,
      to: edge.target,
    });
  }

  // Sort steps by order
  steps.sort((a, b) => a.order - b.order);

  return { steps, transitions };
}

// ─── Deserialize: JSON → React Flow state ──────────────────────────────────

export interface DeserializedWorkflow {
  nodes: SerializableNode[];
  edges: Edge[];
  configs: Record<string, NodeConfig>;
}

export function deserializeWorkflow(json: string): DeserializedWorkflow {
  const parsed = JSON.parse(json) as {
    steps?: unknown[];
    transitions?: unknown[];
    nodes?: unknown[];
    edges?: unknown[];
    configs?: Record<string, unknown>;
  };

  // Support both formats: full RF state or WorkflowDefinition
  if (parsed.nodes && parsed.edges && parsed.configs) {
    // Full state format
    return {
      nodes: parsed.nodes as SerializableNode[],
      edges: parsed.edges as Edge[],
      configs: parsed.configs as Record<string, NodeConfig>,
    };
  }

  if (parsed.steps && parsed.transitions) {
    // WorkflowDefinition format
    return fromWorkflowDefinition(parsed as WorkflowDefinition);
  }

  throw new Error('Unrecognized workflow JSON format');
}

function fromWorkflowDefinition(def: WorkflowDefinition): DeserializedWorkflow {
  const nodes: SerializableNode[] = [];
  const configs: Record<string, NodeConfig> = {};

  // Auto-layout: simple vertical stack
  for (let i = 0; i < def.steps.length; i++) {
    const step = def.steps[i]!;
    nodes.push({
      id: step.id,
      type: step.type,
      position: { x: 300, y: i * 150 },
    });
    configs[step.id] = {
      type: step.type,
      data: step.config,
    } as NodeConfig;
  }

  const edges: Edge[] = def.transitions.map((t, i) => ({
    id: `edge_${i}`,
    source: t.from,
    target: t.to,
  }));

  return { nodes, edges, configs };
}

// ─── Export full state (for save/load) ─────────────────────────────────────

export function exportFullState(
  nodes: SerializableNode[],
  edges: Edge[],
  configs: Record<string, NodeConfig>
): string {
  return JSON.stringify({ nodes, edges, configs }, null, 2);
}

// ─── Topological sort ──────────────────────────────────────────────────────

function computeTopologicalOrder(
  nodes: SerializableNode[],
  edges: Edge[]
): Map<string, number> {
  const inDegree = new Map<string, number>();
  const adj = new Map<string, string[]>();

  for (const node of nodes) {
    inDegree.set(node.id, 0);
    adj.set(node.id, []);
  }

  for (const edge of edges) {
    const list = adj.get(edge.source);
    if (list) list.push(edge.target);
    const deg = inDegree.get(edge.target);
    if (deg !== undefined) inDegree.set(edge.target, deg + 1);
  }

  const queue: string[] = [];
  for (const [id, deg] of inDegree) {
    if (deg === 0) queue.push(id);
  }

  const order = new Map<string, number>();
  let idx = 0;

  while (queue.length > 0) {
    const current = queue.shift()!;
    order.set(current, idx++);

    const neighbors = adj.get(current) ?? [];
    for (const neighbor of neighbors) {
      const deg = inDegree.get(neighbor);
      if (deg !== undefined) {
        const newDeg = deg - 1;
        inDegree.set(neighbor, newDeg);
        if (newDeg === 0) queue.push(neighbor);
      }
    }
  }

  return order;
}
