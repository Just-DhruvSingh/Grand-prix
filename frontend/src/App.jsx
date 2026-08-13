/**
 * App.jsx — Main Application Shell
 * Composes Sidebar, WebGL Canvas, VenueMap overlay, TopBar, and RoutePanel.
 * Initializes Zustand hooks for data flow.
 */
import React, { useEffect } from 'react';
import { Sidebar } from './components/Layout/Sidebar';
import { TopBar } from './components/Layout/TopBar';
import { WebGLCanvas } from './components/Canvas/WebGLCanvas';
import { VenueMap } from './components/Map/VenueMap';
import { RoutePanel } from './components/Pathfinding/RoutePanel';
import { MapControls } from './components/Map/MapControls';

import useKineticStore from './hooks/useKineticStore';
import { useVenueGraph } from './hooks/useVenueGraph';
import { usePrediction } from './hooks/usePrediction';
import { useAStarRouting } from './hooks/useAStarRouting';
import { checkHealth } from './lib/api';

function App() {
  // Initialize hooks
  useVenueGraph();
  usePrediction();
  useAStarRouting();

  // State from Zustand
  const repellers = useKineticStore((s) => s.repellers);
  const attractors = useKineticStore((s) => s.attractors);
  const isReroutingActive = useKineticStore((s) => s.isReroutingActive);
  const expectedCrowd = useKineticStore((s) => s.expectedCrowd);
  const setMouseCoords = useKineticStore((s) => s.setMouseCoords);
  const addLog = useKineticStore((s) => s.addLog);

  // Derived physics values
  const crowdRatio = expectedCrowd / 100000;
  const simSpeed = isReroutingActive ? 1.8 : (0.8 + crowdRatio * 0.6);
  const densityFactor = crowdRatio * 1.85 / 10.0;

  // Backend health check on mount
  useEffect(() => {
    checkHealth()
      .then((data) => {
        addLog(`Backend online: ${data.message || 'Connected'}`, 'success');
      })
      .catch(() => {
        addLog('Backend offline — using local physics engine', 'warning');
      });
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#161310] text-[#F0EBE3] select-none flex">

      {/* Left Panel — Sidebar */}
      <Sidebar />

      {/* Right Panel — Canvas + Map + TopBar */}
      <main className="flex-1 h-full relative overflow-hidden bg-[#161310] flex flex-col justify-between">

        {/* WebGL Fluid Canvas */}
        <WebGLCanvas
          speedMultiplier={simSpeed}
          densityFactor={densityFactor}
          rerouteActive={isReroutingActive}
          repellers={repellers}
          attractors={attractors}
          onMouseMoveCoords={setMouseCoords}
        />

        {/* Venue Map SVG Overlay */}
        <div className="absolute inset-0 z-10">
          <VenueMap />
        </div>

        {/* Map Controls (top-left over canvas) */}
        <MapControls className="absolute top-16 left-3 z-20" />

        {/* Route Panel (top-right over canvas) */}
        <RoutePanel className="absolute top-16 right-4 z-20 pointer-events-auto max-w-[320px]" />

        {/* TopBar (renders header + footer) */}
        <TopBar />
      </main>
    </div>
  );
}

export default App;
