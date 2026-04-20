import { describe, it, expect } from 'vitest';
import { serializeWorkflow, exportFullState, deserializeWorkflow } from '../serializer';
import { NodeType } from '../../types/workflow.types';
import type { NodeConfig } from '../../types/workflow.types';
import type { Edge } from '@xyflow/react';

// ─── Helpers ───────────────────────────────────────────────────────────────

function makeNodes() {
  return [
    { id: 's1', type: NodeType.START, position: { x: 0, y: 0 } },
    { id: 't1', type: NodeType.TASK, position: { x: 200, y: 100 } },
    { id: 'e1', type: NodeType.END, position: { x: 400, y: 200 } },
  ];
}

function makeEdges(): Edge[] {
  return [
    { id: 'edge-1', source: 's1', target: 't1' },
    { id: 'edge-2', source: 't1', target: 'e1' },
  ];
}

function makeConfigs(): Record<string, NodeConfig> {
  return {
    s1: { type: NodeType.START, data: { title: 'Start', metadata: { env: 'prod' } } },
    t1: {
      type: NodeType.TASK,
      data: {
        title: 'Review',
        description: 'Review docs',
        assignee: 'alice',
        dueDate: '2025-12-01',
        customFields: { priority: 'high' },
      },
    },
    e1: { type: NodeType.END, data: { title: 'Done', message: 'All complete', summaryFlag: true } },
  };
}

// ─── serializeWorkflow tests ───────────────────────────────────────────────

describe('serializeWorkflow', () => {
  it('should serialize a simple workflow into steps and transitions', () => {
    const def = serializeWorkflow(makeNodes(), makeEdges(), makeConfigs());
    expect(def.steps.length).toBe(3);
    expect(def.transitions.length).toBe(2);
  });

  it('should order steps topologically (start first, end last)', () => {
    const def = serializeWorkflow(makeNodes(), makeEdges(), makeConfigs());
    const firstStep = def.steps[0];
    const lastStep = def.steps[def.steps.length - 1];
    expect(firstStep?.type).toBe(NodeType.START);
    expect(lastStep?.type).toBe(NodeType.END);
  });

  it('should preserve config data in steps', () => {
    const def = serializeWorkflow(makeNodes(), makeEdges(), makeConfigs());
    const taskStep = def.steps.find((s) => s.type === NodeType.TASK);
    expect(taskStep).toBeDefined();
    expect((taskStep?.config as unknown as Record<string, unknown>).assignee).toBe('alice');
  });
});

// ─── exportFullState / deserializeWorkflow round-trip ──────────────────────

describe('serialization round-trip', () => {
  it('should export and re-import full state consistently', () => {
    const nodes = makeNodes();
    const edges = makeEdges();
    const configs = makeConfigs();

    const json = exportFullState(nodes, edges, configs);
    const result = deserializeWorkflow(json);

    expect(result.nodes.length).toBe(nodes.length);
    expect(result.edges.length).toBe(edges.length);
    expect(Object.keys(result.configs).length).toBe(Object.keys(configs).length);
  });

  it('should preserve node positions in round-trip', () => {
    const nodes = makeNodes();
    const json = exportFullState(nodes, makeEdges(), makeConfigs());
    const result = deserializeWorkflow(json);

    const s1 = result.nodes.find((n) => n.id === 's1');
    expect(s1?.position).toEqual({ x: 0, y: 0 });
  });

  it('should reject malformed JSON', () => {
    expect(() => deserializeWorkflow('not valid json')).toThrow();
  });

  it('should reject JSON with unrecognized format', () => {
    expect(() => deserializeWorkflow('{"foo": "bar"}')).toThrow('Unrecognized');
  });

  it('should handle empty workflow', () => {
    const json = exportFullState([], [], {});
    const result = deserializeWorkflow(json);
    expect(result.nodes.length).toBe(0);
    expect(result.edges.length).toBe(0);
  });
});
