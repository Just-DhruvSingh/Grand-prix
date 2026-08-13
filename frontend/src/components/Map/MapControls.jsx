/**
 * MapControls.jsx — Zoom + Pan + Node Click Controls
 * Overlay controls for the map viewport.
 */
import React from 'react';
import { ZoomIn, ZoomOut, Maximize, Eye, EyeOff } from 'lucide-react';
import useKineticStore from '../../hooks/useKineticStore';

export function MapControls({ className = '' }) {
  const showGraphOverlay = useKineticStore((s) => s.showGraphOverlay);
  const toggleGraphOverlay = useKineticStore((s) => s.toggleGraphOverlay);

  return (
    <div className={`flex flex-col space-y-1 ${className}`}>
      <button
        onClick={toggleGraphOverlay}
        className={`p-2 rounded border transition-all ${
          showGraphOverlay
            ? 'bg-[#00F5FF]/15 border-[#00F5FF]/40 text-[#00F5FF]'
            : 'bg-[#1E1A17] border-[#2E2820] text-[#8A7F72]'
        } hover:border-[#4A3F30]`}
        title={showGraphOverlay ? 'Hide Graph Mesh' : 'Show Graph Mesh'}
      >
        {showGraphOverlay ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
      </button>
      <button
        className="p-2 rounded bg-[#1E1A17] border border-[#2E2820] text-[#8A7F72] hover:border-[#4A3F30] hover:text-[#F0EBE3] transition-all"
        title="Fit to View"
      >
        <Maximize className="w-4 h-4" />
      </button>
    </div>
  );
}

export default MapControls;
