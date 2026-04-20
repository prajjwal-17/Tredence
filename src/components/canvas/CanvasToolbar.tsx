import { memo, useCallback, useRef } from 'react';
import { useWorkflowStore } from '../../store/workflowStore';
import { Button } from '../ui/Button';

export const CanvasToolbar = memo(function CanvasToolbar() {
  const exportWorkflow = useWorkflowStore((s) => s.exportWorkflow);
  const importWorkflow = useWorkflowStore((s) => s.importWorkflow);
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

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const json = event.target?.result;
        if (typeof json === 'string') {
          importWorkflow(json);
        }
      };
      reader.readAsText(file);
      e.target.value = '';
    },
    [importWorkflow]
  );

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-slate-900/80 border-b border-slate-700/50 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <h1 className="text-sm font-bold text-slate-200 tracking-tight">
          <span className="text-indigo-400">HR</span> Workflow Designer
        </h1>
        <div className="h-4 w-px bg-slate-700" />
        <span className="text-[11px] text-slate-500">
          {nodeCount} nodes · {edgeCount} edges
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        <Button
          size="sm"
          variant="ghost"
          onClick={undo}
          disabled={!canUndo()}
          title="Undo"
        >
          ↩
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={redo}
          disabled={!canRedo()}
          title="Redo"
        >
          ↪
        </Button>

        <div className="h-4 w-px bg-slate-700 mx-1" />

        <Button size="sm" variant="ghost" onClick={handleImport}>
          📥 Import
        </Button>
        <Button size="sm" variant="ghost" onClick={handleExport}>
          📤 Export
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </div>
  );
});
