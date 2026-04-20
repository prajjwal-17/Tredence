import type { Edge } from '@xyflow/react';
import type { NodeConfig, ValidationError } from '../types/workflow.types';
import { NodeType } from '../types/workflow.types';

interface NodeLike {
  id: string;
  type?: string;
}

// ─── Main validation ───────────────────────────────────────────────────────

export function validateWorkflow(
  nodes: NodeLike[],
  edges: Edge[],
  configs: Record<string, NodeConfig>
): ValidationError[] {
  const errors: ValidationError[] = [];

  // 1. Must have at least one node
  if (nodes.length === 0) {
    errors.push({ message: 'Workflow has no nodes', severity: 'error' });
    return errors;
  }

  // 2. Exactly one Start node
  const startNodes = nodes.filter((n) => n.type === NodeType.START);
  if (startNodes.length === 0) {
    errors.push({ message: 'Workflow must have a Start node', severity: 'error' });
  } else if (startNodes.length > 1) {
    errors.push({ message: 'Workflow must have exactly one Start node', severity: 'error' });
  }

  // 3. At least one End node
  const endNodes = nodes.filter((n) => n.type === NodeType.END);
  if (endNodes.length === 0) {
    errors.push({ message: 'Workflow must have at least one End node', severity: 'warning' });
  }

  // 4. Start must have outgoing edge
  for (const start of startNodes) {
    const hasOutgoing = edges.some((e) => e.source === start.id);
    if (!hasOutgoing) {
      errors.push({
        nodeId: start.id,
        message: 'Start node must have an outgoing connection',
        severity: 'error',
      });
    }
  }

  // 5. End must NOT have outgoing edges
  for (const end of endNodes) {
    const hasOutgoing = edges.some((e) => e.source === end.id);
    if (hasOutgoing) {
      errors.push({
        nodeId: end.id,
        message: 'End node must not have outgoing connections',
        severity: 'error',
      });
    }
  }

  // 6. All nodes reachable from Start
  if (startNodes.length === 1 && startNodes[0]) {
    const reachable = getReachableNodes(startNodes[0].id, nodes, edges);
    for (const node of nodes) {
      if (!reachable.has(node.id)) {
        errors.push({
          nodeId: node.id,
          message: `Node "${configs[node.id]?.data?.title ?? node.id}" is not reachable from Start`,
          severity: 'warning',
        });
      }
    }
  }

  // 7. Cycle detection
  const cycleNodes = detectCycles(nodes, edges);
  if (cycleNodes.length > 0) {
    errors.push({
      message: `Workflow contains a cycle involving ${cycleNodes.length} node(s)`,
      severity: 'error',
    });
    for (const nodeId of cycleNodes) {
      errors.push({
        nodeId,
        message: 'This node is part of a cycle',
        severity: 'error',
      });
    }
  }

  // 8. Required field validation per node type
  for (const node of nodes) {
    const config = configs[node.id];
    if (!config) {
      errors.push({
        nodeId: node.id,
        message: 'Node has no configuration',
        severity: 'error',
      });
      continue;
    }
    errors.push(...validateNodeConfig(node.id, config));
  }

  return errors;
}

// ─── Node-level config validation ──────────────────────────────────────────

export function validateNodeConfig(
  nodeId: string,
  config: NodeConfig
): ValidationError[] {
  const errors: ValidationError[] = [];

  switch (config.type) {
    case NodeType.START:
      if (!config.data.title.trim()) {
        errors.push({ nodeId, field: 'title', message: 'Start node requires a title', severity: 'error' });
      }
      break;
    case NodeType.TASK:
      if (!config.data.title.trim()) {
        errors.push({ nodeId, field: 'title', message: 'Task node requires a title', severity: 'error' });
      }
      break;
    case NodeType.APPROVAL:
      if (!config.data.title.trim()) {
        errors.push({ nodeId, field: 'title', message: 'Approval node requires a title', severity: 'error' });
      }
      if (!config.data.approverRole.trim()) {
        errors.push({ nodeId, field: 'approverRole', message: 'Approval node requires an approver role', severity: 'warning' });
      }
      break;
    case NodeType.AUTOMATED:
      if (!config.data.title.trim()) {
        errors.push({ nodeId, field: 'title', message: 'Automated node requires a title', severity: 'error' });
      }
      if (!config.data.actionId) {
        errors.push({ nodeId, field: 'actionId', message: 'Automated node requires an action', severity: 'error' });
      }
      break;
    case NodeType.END:
      // End node fields are all optional
      break;
  }

  return errors;
}

// ─── Graph algorithms ──────────────────────────────────────────────────────

function getReachableNodes(
  startId: string,
  nodes: NodeLike[],
  edges: Edge[]
): Set<string> {
  const adjacency = buildAdjacencyList(nodes, edges);
  const visited = new Set<string>();
  const queue = [startId];

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (visited.has(current)) continue;
    visited.add(current);

    const neighbors = adjacency.get(current);
    if (neighbors) {
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          queue.push(neighbor);
        }
      }
    }
  }

  return visited;
}

export function detectCycles(
  nodes: NodeLike[],
  edges: Edge[]
): string[] {
  const adjacency = buildAdjacencyList(nodes, edges);
  const WHITE = 0, GRAY = 1, BLACK = 2;
  const color = new Map<string, number>();
  const cycleMembers: string[] = [];

  for (const node of nodes) {
    color.set(node.id, WHITE);
  }

  function dfs(nodeId: string): boolean {
    color.set(nodeId, GRAY);
    const neighbors = adjacency.get(nodeId) ?? [];
    for (const neighbor of neighbors) {
      const c = color.get(neighbor);
      if (c === GRAY) {
        // Found cycle
        cycleMembers.push(neighbor);
        return true;
      }
      if (c === WHITE) {
        if (dfs(neighbor)) {
          cycleMembers.push(nodeId);
          return true;
        }
      }
    }
    color.set(nodeId, BLACK);
    return false;
  }

  for (const node of nodes) {
    if (color.get(node.id) === WHITE) {
      dfs(node.id);
    }
  }

  return [...new Set(cycleMembers)];
}

function buildAdjacencyList(
  nodes: NodeLike[],
  edges: Edge[]
): Map<string, string[]> {
  const adj = new Map<string, string[]>();
  for (const node of nodes) {
    adj.set(node.id, []);
  }
  for (const edge of edges) {
    const list = adj.get(edge.source);
    if (list) {
      list.push(edge.target);
    }
  }
  return adj;
}

// ─── Connection validation (lightweight, runs on edge connect) ─────────────

export function isValidConnection(
  sourceType: string | undefined,
  targetType: string | undefined,
  sourceId: string,
  targetId: string,
  existingEdges: Edge[]
): { valid: boolean; reason?: string } {
  // No self-loops
  if (sourceId === targetId) {
    return { valid: false, reason: 'Cannot connect a node to itself' };
  }

  // End nodes cannot have outgoing connections
  if (sourceType === NodeType.END) {
    return { valid: false, reason: 'End nodes cannot have outgoing connections' };
  }

  // Start nodes cannot have incoming connections
  if (targetType === NodeType.START) {
    return { valid: false, reason: 'Start nodes cannot have incoming connections' };
  }

  // No duplicate edges
  const duplicate = existingEdges.some(
    (e) => e.source === sourceId && e.target === targetId
  );
  if (duplicate) {
    return { valid: false, reason: 'Connection already exists' };
  }

  return { valid: true };
}
