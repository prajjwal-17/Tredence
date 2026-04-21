import { memo, useCallback, useRef, type ChangeEvent } from 'react';
import { useWorkflowStore } from '../../store/workflowStore';
import { Button } from '../ui/Button';

interface CanvasToolbarProps {
  onRunSimulation?: () => void;
}

export const CanvasToolbar = memo<CanvasToolbarProps>(function CanvasToolbar({
  onRunSimulation,
}) {
  const exportWorkflow = useWorkflowStore((s) => s.exportWorkflow);
  const importWorkflow = useWorkflowStore((s) => s.importWorkflow);
  const runSimulation = useWorkflowStore((s) => s.runSimulation);
  const isSimulating = useWorkflowStore((s) => s.isSimulating);
  const nodeCount = useWorkflowStore((s) => s.nodes.length);
  const edgeCount = useWorkflowStore((s) => s.edges.length);
  const undo = useWorkflowStore((s) => s.undo);
  const redo = useWorkflowStore((s) => s.redo);
  const canUndo = useWorkflowStore((s) => s.canUndo);
  const canRedo = useWorkflowStore((s) => s.canRedo);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = useCallback(() => {
    const json = exportWorkflow();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workflow-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [exportWorkflow]);

  const handleImport = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleRunSimulation = useCallback(() => {
    onRunSimulation?.();
    void runSimulation();
  }, [onRunSimulation, runSimulation]);

  const handleFileChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        const json = loadEvent.target?.result;
        if (typeof json === 'string') {
          importWorkflow(json);
        }
      };
      reader.readAsText(file);
      event.target.value = '';
    },
    [importWorkflow]
  );

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-black/5 bg-white px-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-sm font-semibold text-white shadow-sm shadow-blue-600/20">
          HR
        </div>
        <div className="flex flex-col">
          <h1 className="text-base font-semibold tracking-tight text-gray-950">
            HR Workflow Designer
          </h1>
          <p className="text-xs text-gray-500">Build and validate process flows</p>
        </div>
      </div>

      <div className="absolute left-1/2 hidden -translate-x-1/2 lg:block">
        <div className="inline-flex h-10 items-center gap-2 rounded-full border border-black/5 bg-slate-50 px-4 text-sm text-gray-500 shadow-sm">
          <span className="font-medium tabular-nums text-gray-900">{nodeCount}</span>
          <span>nodes</span>
          <span className="h-1 w-1 rounded-full bg-gray-300" />
          <span className="font-medium tabular-nums text-gray-900">{edgeCount}</span>
          <span>edges</span>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <div className="flex items-center gap-1 rounded-xl bg-slate-50 p-1 ring-1 ring-black/5">
        <Button
          size="sm"
          variant="ghost"
          onClick={undo}
          disabled={!canUndo()}
          title="Undo"
          aria-label="Undo"
          className="w-9 px-0"
        >
          <svg className="h-[17px] w-[17px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
          </svg>
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={redo}
          disabled={!canRedo()}
          title="Redo"
          aria-label="Redo"
          className="w-9 px-0"
        >
          <svg className="h-[17px] w-[17px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="m15 15 6-6m0 0-6-6m6 6H9a6 6 0 0 0 0 12h3" />
          </svg>
        </Button>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-white">
        <Button size="sm" variant="secondary" onClick={handleImport}>
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 16v1a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-1M8 8l4-4m0 0 4 4m-4-4v12" />
          </svg>
          Import
        </Button>
        <Button size="sm" variant="secondary" onClick={handleExport}>
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 16v1a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-1m-4-4-4 4m0 0-4-4m4 4V4" />
          </svg>
          Export
        </Button>
        </div>
        <Button
          size="sm"
          variant="primary"
          onClick={handleRunSimulation}
          disabled={isSimulating}
          className="min-w-[168px] px-5"
        >
          {isSimulating ? (
            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 5v14l11-7L8 5z" />
            </svg>
          )}
          {isSimulating ? 'Running' : 'Run Simulation'}
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </header>
  );
});
