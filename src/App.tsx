import { useState } from 'react';
import { ReactFlowProvider } from '@xyflow/react';

import { WorkflowCanvas } from './components/canvas/WorkflowCanvas';
import { CanvasToolbar } from './components/canvas/CanvasToolbar';
import { NodePalette } from './components/sidebar/NodePalette';
import { ConfigPanel } from './components/panels/ConfigPanel';
import { SimulationPanel } from './components/panels/SimulationPanel';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { initializeNodeRegistry } from './components/nodes';

// Initialize the node registry once at app startup
initializeNodeRegistry();

type RightPanel = 'config' | 'simulation';

export default function App() {
  const [rightPanel, setRightPanel] = useState<RightPanel>('config');

  return (
    <ReactFlowProvider>
      <div className="flex flex-col h-screen bg-slate-950 text-slate-200">
        {/* Top toolbar */}
        <CanvasToolbar />

        {/* Main content area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left sidebar — Node Palette */}
          <aside className="w-[220px] shrink-0 bg-slate-900/60 border-r border-slate-700/50 p-3 overflow-y-auto backdrop-blur-sm">
            <NodePalette />
          </aside>

          {/* Center — Canvas */}
          <ErrorBoundary>
            <WorkflowCanvas />
          </ErrorBoundary>

          {/* Right panel — Config / Simulation */}
          <aside className="w-[320px] shrink-0 bg-slate-900/60 border-l border-slate-700/50 flex flex-col backdrop-blur-sm">
            {/* Panel tabs */}
            <div className="flex border-b border-slate-700/50">
              <button
                onClick={() => setRightPanel('config')}
                className={`flex-1 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                  rightPanel === 'config'
                    ? 'text-indigo-400 border-b-2 border-indigo-400 bg-indigo-500/5'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                Configure
              </button>
              <button
                onClick={() => setRightPanel('simulation')}
                className={`flex-1 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                  rightPanel === 'simulation'
                    ? 'text-indigo-400 border-b-2 border-indigo-400 bg-indigo-500/5'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                Simulate
              </button>
            </div>

            {/* Panel content */}
            <div className="flex-1 overflow-hidden">
              {rightPanel === 'config' ? <ConfigPanel /> : <SimulationPanel />}
            </div>
          </aside>
        </div>
      </div>
    </ReactFlowProvider>
  );
}
