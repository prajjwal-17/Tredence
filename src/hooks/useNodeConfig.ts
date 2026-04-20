import { useState, useEffect, useCallback, useRef } from 'react';
import { useWorkflowStore } from '../store/workflowStore';
import type { NodeConfig } from '../types/workflow.types';

/**
 * Hook for managing node configuration with local draft state.
 * 
 * Pattern: local state for immediate UX → sync to store on blur/commit.
 * This prevents excessive re-renders from store updates during typing.
 */
export function useNodeConfig<T extends NodeConfig['data']>(nodeId: string) {
  const storeConfig = useWorkflowStore(
    useCallback((s) => s.nodeConfigs[nodeId], [nodeId])
  );

  const updateNodeConfig = useWorkflowStore((s) => s.updateNodeConfig);

  // Local draft state
  const [draft, setDraft] = useState<T>((storeConfig?.data as T) ?? ({} as T));

  // Track if we need to sync from store (e.g., on undo/redo)
  const lastStoreDataRef = useRef(storeConfig?.data);

  // Sync draft from store when node changes or undo/redo happens
  useEffect(() => {
    if (storeConfig?.data && storeConfig.data !== lastStoreDataRef.current) {
      setDraft(storeConfig.data as T);
      lastStoreDataRef.current = storeConfig.data;
    }
  }, [storeConfig?.data]);

  // Reset draft when switching to a different node
  useEffect(() => {
    if (storeConfig?.data) {
      setDraft(storeConfig.data as T);
      lastStoreDataRef.current = storeConfig.data;
    }
  }, [nodeId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Update a single field in the local draft
  const updateDraftField = useCallback(
    <K extends keyof T>(field: K, value: T[K]) => {
      setDraft((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  // Commit current draft to store (call on blur or explicit save)
  const commitToStore = useCallback(() => {
    updateNodeConfig(nodeId, draft as Partial<NodeConfig['data']>);
  }, [nodeId, draft, updateNodeConfig]);

  // Commit a single field immediately (for toggles, selects, etc.)
  const commitField = useCallback(
    <K extends keyof T>(field: K, value: T[K]) => {
      const updated = { ...draft, [field]: value };
      setDraft(updated);
      updateNodeConfig(nodeId, updated as Partial<NodeConfig['data']>);
    },
    [draft, nodeId, updateNodeConfig]
  );

  return {
    config: storeConfig,
    draft,
    setDraft,
    updateDraftField,
    commitToStore,
    commitField,
  };
}
