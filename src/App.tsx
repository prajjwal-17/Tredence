import { useState } from 'react';
import { ReactFlowProvider } from '@xyflow/react';

import { WorkflowCanvas } from './components/canvas/WorkflowCanvas';
import { CanvasToolbar } from './components/canvas/CanvasToolbar';
import { NodePalette } from './components/sidebar/NodePalette';
import { ConfigPanel } from './components/panels/ConfigPanel';
import { SimulationPanel } from './components/panels/SimulationPanel';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { initializeNodeRegistry } from './components/nodes';

initializeNodeRegistry();

type RightPanel = 'config' | 'simulation';

export default function App() {
  const [rightPanel, setRightPanel] = useState<RightPanel>('config');

  return (
    <ReactFlowProvider>
      <div className="h-screen flex flex-col overflow-hidden bg-slate-100 text-gray-900">
        <CanvasToolbar onRunSimulation={() => setRightPanel('simulation')} />

        <div className="flex flex-1 gap-3 overflow-hidden p-3">
          <aside className="w-[252px] shrink-0 overflow-y-auto rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
            <NodePalette />
          </aside>

          <main className="min-w-0 flex-1">
            <div className="h-full overflow-hidden rounded-[28px] bg-white shadow-sm ring-1 ring-black/5">
              <ErrorBoundary>
                <WorkflowCanvas />
              </ErrorBoundary>
            </div>
          </main>

          <aside className="flex w-[340px] shrink-0 flex-col overflow-hidden rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
            <div className="flex rounded-xl bg-slate-100 p-1">
              <button
                onClick={() => setRightPanel('config')}
                className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 active:scale-95 ${
                  rightPanel === 'config'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Configure
              </button>
              <button
                onClick={() => setRightPanel('simulation')}
                className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 active:scale-95 ${
                  rightPanel === 'simulation'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Simulate
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-hidden pt-4">
              {rightPanel === 'config' ? <ConfigPanel /> : <SimulationPanel />}
            </div>
          </aside>
        </div>
      </div>
    </ReactFlowProvider>
  );
}
