import { create } from 'zustand';
import {
  type Node,
  type Edge,
  type Connection,
  type NodeChange,
  type EdgeChange,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from '@xyflow/react';
import type { NodeConfig, ValidationError } from '../types/workflow.types';
import type { SimulationLog } from '../types/execution.types';
import { NodeType } from '../types/workflow.types';
import { createNodeId, getNodeRegistryEntry } from '../registry/nodeRegistry';
import { validateWorkflow, isValidConnection } from '../utils/validation';
import { serializeWorkflow, exportFullState, deserializeWorkflow } from '../utils/serializer';
import { simulateWorkflow } from '../services/api';

// ─── Undo/Redo history ─────────────────────────────────────────────────────

interface HistorySnapshot {
  nodes: Node[];
  edges: Edge[];
  nodeConfigs: Record<string, NodeConfig>;
}

const MAX_HISTORY = 50;
let pastStates: HistorySnapshot[] = [];
let futureStates: HistorySnapshot[] = [];

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj)) as T;
}

function pushHistory(state: HistorySnapshot) {
  pastStates = [...pastStates.slice(-(MAX_HISTORY - 1)), {
    nodes: deepClone(state.nodes),
    edges: deepClone(state.edges),
    nodeConfigs: deepClone(state.nodeConfigs),
  }];
  futureStates = [];
}

// ─── State shape ───────────────────────────────────────────────────────────

export interface WorkflowState {
  // Graph data
  nodes: Node[];
  edges: Edge[];
  nodeConfigs: Record<string, NodeConfig>;

  // UI state
  selectedNodeId: string | null;
  validationErrors: ValidationError[];
  simulationLogs: SimulationLog[];
  isSimulating: boolean;

  // ─── Node/Edge mutations ─────────────────────────────────────────────
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;

  addNode: (type: NodeType, position: { x: number; y: number }) => string | null;
  removeNode: (id: string) => void;
  updateNodeConfig: (id: string, data: Partial<NodeConfig['data']>) => void;

  // ─── Selection ───────────────────────────────────────────────────────
  selectNode: (id: string | null) => void;

  // ─── Validation ──────────────────────────────────────────────────────
  runValidation: () => ValidationError[];

  // ─── Simulation ──────────────────────────────────────────────────────
  runSimulation: () => Promise<void>;

  // ─── Export/Import ───────────────────────────────────────────────────
  exportWorkflow: () => string;
  importWorkflow: (json: string) => void;

  // ─── Connection validation ───────────────────────────────────────────
  isValidConnection: (connection: Edge | Connection) => boolean;

  // ─── Undo/Redo ───────────────────────────────────────────────────────
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
}

// ─── Store ─────────────────────────────────────────────────────────────────

export const useWorkflowStore = create<WorkflowState>()((set, get) => ({
  // Initial state
  nodes: [],
  edges: [],
  nodeConfigs: {},
  selectedNodeId: null,
  validationErrors: [],
  simulationLogs: [],
  isSimulating: false,

  // ─── React Flow change handlers ────────────────────────────────────

  onNodesChange: (changes) => {
    set((state) => ({
      nodes: applyNodeChanges(changes, state.nodes),
    }));
  },

  onEdgesChange: (changes) => {
    set((state) => ({
      edges: applyEdgeChanges(changes, state.edges),
    }));
  },

  onConnect: (connection) => {
    const state = get();
    const sourceNode = state.nodes.find((n) => n.id === connection.source);
    const targetNode = state.nodes.find((n) => n.id === connection.target);

    const result = isValidConnection(
      sourceNode?.type,
      targetNode?.type,
      connection.source ?? '',
      connection.target ?? '',
      state.edges
    );

    if (!result.valid) return;

    pushHistory({ nodes: state.nodes, edges: state.edges, nodeConfigs: state.nodeConfigs });

    set((state) => ({
      edges: addEdge(
        { ...connection, type: 'smoothstep', animated: true },
        state.edges
      ),
    }));
  },

  // ─── Node CRUD ──────────────────────────────────────────────────────

  addNode: (type, position) => {
    const state = get();

    // Prevent multiple Start nodes
    if (type === NodeType.START) {
      const existing = state.nodes.find((n) => n.type === NodeType.START);
      if (existing) return null;
    }

    pushHistory({ nodes: state.nodes, edges: state.edges, nodeConfigs: state.nodeConfigs });

    const id = createNodeId();
    const entry = getNodeRegistryEntry(type);
    const config: NodeConfig = {
      type,
      data: entry.defaultData(),
    } as NodeConfig;

    const newNode: Node = {
      id,
      type,
      position,
      data: { label: entry.label },
    };

    set((state) => ({
      nodes: [...state.nodes, newNode],
      nodeConfigs: { ...state.nodeConfigs, [id]: config },
    }));

    return id;
  },

  removeNode: (id) => {
    const state = get();
    pushHistory({ nodes: state.nodes, edges: state.edges, nodeConfigs: state.nodeConfigs });

    set((state) => {
      const { [id]: _removed, ...remainingConfigs } = state.nodeConfigs;
      return {
        nodes: state.nodes.filter((n) => n.id !== id),
        edges: state.edges.filter(
          (e) => e.source !== id && e.target !== id
        ),
        nodeConfigs: remainingConfigs,
        selectedNodeId:
          state.selectedNodeId === id ? null : state.selectedNodeId,
      };
    });
  },

  updateNodeConfig: (id, data) => {
    set((state) => {
      const existing = state.nodeConfigs[id];
      if (!existing) return state;

      const updatedConfig = {
        ...existing,
        data: { ...existing.data, ...data },
      } as NodeConfig;

      // Also update the node's label in React Flow
      const updatedNodes = state.nodes.map((n) =>
        n.id === id
          ? { ...n, data: { ...n.data, label: (data as Record<string, unknown>).title ?? n.data.label } }
          : n
      );

      return {
        nodeConfigs: { ...state.nodeConfigs, [id]: updatedConfig },
        nodes: updatedNodes,
      };
    });
  },

  // ─── Selection ──────────────────────────────────────────────────────

  selectNode: (id) => {
    set({ selectedNodeId: id });
  },

  // ─── Validation ─────────────────────────────────────────────────────

  runValidation: () => {
    const state = get();
    const errors = validateWorkflow(
      state.nodes,
      state.edges,
      state.nodeConfigs
    );
    set({ validationErrors: errors });
    return errors;
  },

  // ─── Simulation ─────────────────────────────────────────────────────

  runSimulation: async () => {
    const state = get();

    // Validate first
    const errors = validateWorkflow(
      state.nodes,
      state.edges,
      state.nodeConfigs
    );
    set({ validationErrors: errors });

    const criticalErrors = errors.filter((e) => e.severity === 'error');
    if (criticalErrors.length > 0) {
      set({ simulationLogs: [] });
      return;
    }

    set({ isSimulating: true, simulationLogs: [] });

    try {
      const definition = serializeWorkflow(
        state.nodes,
        state.edges,
        state.nodeConfigs
      );
      const result = await simulateWorkflow(definition);
      set({
        simulationLogs: result.logs,
        isSimulating: false,
      });
    } catch (error) {
      set({
        isSimulating: false,
        simulationLogs: [],
        validationErrors: [
          ...get().validationErrors,
          {
            message: `Simulation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            severity: 'error',
          },
        ],
      });
    }
  },

  // ─── Export/Import ──────────────────────────────────────────────────

  exportWorkflow: () => {
    const state = get();
    return exportFullState(state.nodes, state.edges, state.nodeConfigs);
  },

  importWorkflow: (json) => {
    const state = get();
    pushHistory({ nodes: state.nodes, edges: state.edges, nodeConfigs: state.nodeConfigs });

    try {
      const result = deserializeWorkflow(json);
      set({
        nodes: result.nodes as Node[],
        edges: result.edges,
        nodeConfigs: result.configs,
        selectedNodeId: null,
        validationErrors: [],
        simulationLogs: [],
      });
    } catch (error) {
      set((state) => ({
        validationErrors: [
          ...state.validationErrors,
          {
            message: `Import failed: ${error instanceof Error ? error.message : 'Invalid JSON'}`,
            severity: 'error',
          },
        ],
      }));
    }
  },

  // ─── Connection validation ──────────────────────────────────────────

  isValidConnection: (edgeOrConnection) => {
    const state = get();
    const source = edgeOrConnection.source;
    const target = edgeOrConnection.target;
    if (!source || !target) return false;

    const sourceNode = state.nodes.find(
      (n) => n.id === source
    );
    const targetNode = state.nodes.find(
      (n) => n.id === target
    );

    const result = isValidConnection(
      sourceNode?.type,
      targetNode?.type,
      source,
      target,
      state.edges
    );

    return result.valid;
  },

  // ─── Undo/Redo ──────────────────────────────────────────────────────

  undo: () => {
    if (pastStates.length === 0) return;
    const state = get();
    const previous = pastStates[pastStates.length - 1]!;
    
    futureStates = [...futureStates, {
      nodes: deepClone(state.nodes),
      edges: deepClone(state.edges),
      nodeConfigs: deepClone(state.nodeConfigs),
    }];
    pastStates = pastStates.slice(0, -1);

    set({
      nodes: previous.nodes,
      edges: previous.edges,
      nodeConfigs: previous.nodeConfigs,
    });
  },

  redo: () => {
    if (futureStates.length === 0) return;
    const state = get();
    const next = futureStates[futureStates.length - 1]!;

    pastStates = [...pastStates, {
      nodes: deepClone(state.nodes),
      edges: deepClone(state.edges),
      nodeConfigs: deepClone(state.nodeConfigs),
    }];
    futureStates = futureStates.slice(0, -1);

    set({
      nodes: next.nodes,
      edges: next.edges,
      nodeConfigs: next.nodeConfigs,
    });
  },

  canUndo: () => pastStates.length > 0,
  canRedo: () => futureStates.length > 0,
}));
