import { describe, it, expect } from 'vitest';
import { validateWorkflow, isValidConnection, detectCycles } from '../validation';
import { NodeType } from '../../types/workflow.types';
import type { NodeConfig } from '../../types/workflow.types';
import type { Edge } from '@xyflow/react';

// ─── Helpers ───────────────────────────────────────────────────────────────

function makeNode(id: string, type: string) {
  return { id, type };
}

function makeEdge(source: string, target: string): Edge {
  return { id: `${source}-${target}`, source, target };
}

function makeConfigs(
  entries: Array<{ id: string; type: string; title?: string }>
): Record<string, NodeConfig> {
  const configs: Record<string, NodeConfig> = {};
  for (const entry of entries) {
    configs[entry.id] = createConfig(entry.type, entry.title ?? entry.type);
  }
  return configs;
}

function createConfig(type: string, title: string): NodeConfig {
  switch (type) {
    case NodeType.START:
      return { type: NodeType.START, data: { title, metadata: {} } };
    case NodeType.TASK:
      return {
        type: NodeType.TASK,
        data: { title, description: '', assignee: '', dueDate: '', customFields: {} },
      };
    case NodeType.APPROVAL:
      return {
        type: NodeType.APPROVAL,
        data: { title, approverRole: 'Manager', autoApproveThreshold: 0 },
      };
    case NodeType.AUTOMATED:
      return {
        type: NodeType.AUTOMATED,
        data: { title, actionId: 'send_email', params: {} },
      };
    case NodeType.END:
      return {
        type: NodeType.END,
        data: { title, message: '', summaryFlag: false },
      };
    default:
      throw new Error(`Unknown type: ${type}`);
  }
}

// ─── validateWorkflow tests ────────────────────────────────────────────────

describe('validateWorkflow', () => {
  it('should return errors for empty workflow', () => {
    const errors = validateWorkflow([], [], {});
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.message.includes('no nodes'))).toBe(true);
  });

  it('should require exactly one Start node', () => {
    const nodes = [
      makeNode('s1', NodeType.START),
      makeNode('s2', NodeType.START),
    ];
    const configs = makeConfigs([
      { id: 's1', type: NodeType.START },
      { id: 's2', type: NodeType.START },
    ]);
    const errors = validateWorkflow(nodes, [], configs);
    expect(errors.some((e) => e.message.includes('exactly one Start'))).toBe(true);
  });

  it('should detect missing Start node', () => {
    const nodes = [makeNode('t1', NodeType.TASK)];
    const configs = makeConfigs([{ id: 't1', type: NodeType.TASK }]);
    const errors = validateWorkflow(nodes, [], configs);
    expect(errors.some((e) => e.message.includes('must have a Start'))).toBe(true);
  });

  it('should require Start node to have outgoing edge', () => {
    const nodes = [
      makeNode('s1', NodeType.START),
      makeNode('e1', NodeType.END),
    ];
    const configs = makeConfigs([
      { id: 's1', type: NodeType.START },
      { id: 'e1', type: NodeType.END },
    ]);
    const errors = validateWorkflow(nodes, [], configs);
    expect(errors.some((e) => e.message.includes('outgoing connection'))).toBe(true);
  });

  it('should detect End node with outgoing edges', () => {
    const nodes = [
      makeNode('s1', NodeType.START),
      makeNode('t1', NodeType.TASK),
      makeNode('e1', NodeType.END),
    ];
    const edges: Edge[] = [
      makeEdge('s1', 't1'),
      makeEdge('t1', 'e1'),
      makeEdge('e1', 't1'), // invalid!
    ];
    const configs = makeConfigs([
      { id: 's1', type: NodeType.START },
      { id: 't1', type: NodeType.TASK },
      { id: 'e1', type: NodeType.END },
    ]);
    const errors = validateWorkflow(nodes, edges, configs);
    expect(errors.some((e) => e.message.includes('must not have outgoing'))).toBe(true);
  });

  it('should detect unreachable nodes', () => {
    const nodes = [
      makeNode('s1', NodeType.START),
      makeNode('t1', NodeType.TASK),
      makeNode('t2', NodeType.TASK), // not connected
      makeNode('e1', NodeType.END),
    ];
    const edges: Edge[] = [
      makeEdge('s1', 't1'),
      makeEdge('t1', 'e1'),
    ];
    const configs = makeConfigs([
      { id: 's1', type: NodeType.START },
      { id: 't1', type: NodeType.TASK },
      { id: 't2', type: NodeType.TASK },
      { id: 'e1', type: NodeType.END },
    ]);
    const errors = validateWorkflow(nodes, edges, configs);
    expect(errors.some((e) => e.message.includes('not reachable'))).toBe(true);
  });

  it('should detect missing required title', () => {
    const nodes = [
      makeNode('s1', NodeType.START),
      makeNode('t1', NodeType.TASK),
      makeNode('e1', NodeType.END),
    ];
    const edges: Edge[] = [
      makeEdge('s1', 't1'),
      makeEdge('t1', 'e1'),
    ];
    const configs: Record<string, NodeConfig> = {
      s1: { type: NodeType.START, data: { title: 'Start', metadata: {} } },
      t1: {
        type: NodeType.TASK,
        data: { title: '', description: '', assignee: '', dueDate: '', customFields: {} },
      },
      e1: { type: NodeType.END, data: { title: 'End', message: '', summaryFlag: false } },
    };
    const errors = validateWorkflow(nodes, edges, configs);
    expect(errors.some((e) => e.field === 'title' && e.nodeId === 't1')).toBe(true);
  });

  it('should pass valid workflow', () => {
    const nodes = [
      makeNode('s1', NodeType.START),
      makeNode('t1', NodeType.TASK),
      makeNode('e1', NodeType.END),
    ];
    const edges: Edge[] = [
      makeEdge('s1', 't1'),
      makeEdge('t1', 'e1'),
    ];
    const configs = makeConfigs([
      { id: 's1', type: NodeType.START, title: 'Start' },
      { id: 't1', type: NodeType.TASK, title: 'My Task' },
      { id: 'e1', type: NodeType.END, title: 'End' },
    ]);
    const errors = validateWorkflow(nodes, edges, configs);
    // Should only have warnings at most (like missing End node message)
    const criticalErrors = errors.filter((e) => e.severity === 'error');
    expect(criticalErrors.length).toBe(0);
  });
});

// ─── detectCycles tests ────────────────────────────────────────────────────

describe('detectCycles', () => {
  it('should detect a simple cycle', () => {
    const nodes = [makeNode('a', 'task'), makeNode('b', 'task')];
    const edges: Edge[] = [makeEdge('a', 'b'), makeEdge('b', 'a')];
    const cycleNodes = detectCycles(nodes, edges);
    expect(cycleNodes.length).toBeGreaterThan(0);
  });

  it('should return empty for DAG', () => {
    const nodes = [makeNode('a', 'start'), makeNode('b', 'task'), makeNode('c', 'end')];
    const edges: Edge[] = [makeEdge('a', 'b'), makeEdge('b', 'c')];
    const cycleNodes = detectCycles(nodes, edges);
    expect(cycleNodes.length).toBe(0);
  });

  it('should detect cycle in larger graph', () => {
    const nodes = [
      makeNode('a', 'start'),
      makeNode('b', 'task'),
      makeNode('c', 'task'),
      makeNode('d', 'end'),
    ];
    const edges: Edge[] = [
      makeEdge('a', 'b'),
      makeEdge('b', 'c'),
      makeEdge('c', 'b'), // cycle
      makeEdge('c', 'd'),
    ];
    const cycleNodes = detectCycles(nodes, edges);
    expect(cycleNodes.length).toBeGreaterThan(0);
  });
});

// ─── isValidConnection tests ───────────────────────────────────────────────

describe('isValidConnection', () => {
  it('should reject self-loops', () => {
    const result = isValidConnection('task', 'task', 'a', 'a', []);
    expect(result.valid).toBe(false);
  });

  it('should reject outgoing from End', () => {
    const result = isValidConnection(NodeType.END, 'task', 'e1', 't1', []);
    expect(result.valid).toBe(false);
  });

  it('should reject incoming to Start', () => {
    const result = isValidConnection('task', NodeType.START, 't1', 's1', []);
    expect(result.valid).toBe(false);
  });

  it('should reject duplicate edges', () => {
    const existing: Edge[] = [makeEdge('a', 'b')];
    const result = isValidConnection('task', 'task', 'a', 'b', existing);
    expect(result.valid).toBe(false);
  });

  it('should accept valid connection', () => {
    const result = isValidConnection('task', 'approval', 'a', 'b', []);
    expect(result.valid).toBe(true);
  });
});
