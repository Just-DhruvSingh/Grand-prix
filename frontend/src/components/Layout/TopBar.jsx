/**
 * TopBar.jsx — Status Bar + Live Metrics Strip
 */
import React from 'react';
import { MapPin, Radio, Gauge, Layers, TrendingUp, GitBranch } from 'lucide-react';
import useKineticStore from '../../hooks/useKineticStore';
import { StatusLED } from './StatusLED';

export function TopBar() {
  const venue = useKineticStore((s) => s.venue);
  const uploadedSvgName = useKineticStore((s) => s.uploadedSvgName);
  const mouseCoords = useKineticStore((s) => s.mouseCoords);
  const isLoading = useKineticStore((s) => s.isLoading);
  const expectedCrowd = useKineticStore((s) => s.expectedCrowd);
  const pressureMetrics = useKineticStore((s) => s.pressureMetrics);
  const escapePaths = useKineticStore((s) => s.escapePaths);
  const isReroutingActive = useKineticStore((s) => s.isReroutingActive);

  const fluidDensity = ((expectedCrowd / 10000) * 1.85).toFixed(2);
  const particleCount = Math.floor(expectedCrowd * 2.85);

  return (
    <>
      {/* Top Bar */}
      <header className="relative z-20 h-12 bg-[#161310]/80 backdrop-blur-md border-b border-[#2E2820] px-4 flex items-center justify-between">
        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-2 bg-[#1E1A17] px-3 py-1.5 rounded border border-[#2E2820]">
            <MapPin className="w-3.5 h-3.5 text-[#FFB800]" />
            <span className="text-[#8A7F72]">Venue:</span>
            <span className="text-[#F0EBE3] font-bold font-mono">{uploadedSvgName || venue?.name}</span>
          </div>
          <div className="flex items-center space-x-2 bg-[#1E1A17] px-3 py-1.5 rounded border border-[#2E2820]">
            <Radio className="w-3.5 h-3.5 text-[#FFB800]" />
            <span className="text-[#8A7F72]">Vector:</span>
            <span className="text-[#FFB800] font-bold font-mono">X:{mouseCoords.x}% Y:{mouseCoords.y}%</span>
          </div>
        </div>
        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-2 bg-[#1E1A17] px-3 py-1.5 rounded border border-[#2E2820]">
            <StatusLED active={!isLoading} color={isLoading ? '#FFB800' : '#39FF14'} />
            <span className="text-[#F0EBE3] font-bold font-mono">{isLoading ? 'PREDICTING...' : 'AI READY'}</span>
          </div>
        </div>
      </header>

      {/* Bottom Bar */}
      <footer className="relative z-20 h-12 bg-[#161310]/95 backdrop-blur-md border-t border-[#2E2820] px-4 flex items-center justify-between text-xs font-mono overflow-x-auto">
        <div className="flex items-center space-x-6 shrink-0">
          <div className="flex items-center space-x-2">
            <Gauge className="w-4 h-4 text-[#FFB800]" />
            <span className="text-[#8A7F72]">Density:</span>
            <span className="font-bold text-[#F0EBE3]">{fluidDensity} kg/m³</span>
          </div>
          <span className="text-[#2E2820]">|</span>
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-[#FFB800]" />
            <span className="text-[#8A7F72]">Particles:</span>
            <span className="font-bold text-[#F0EBE3]">{particleCount.toLocaleString()}</span>
          </div>
          <span className="text-[#2E2820]">|</span>
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-[#39FF14]" />
            <span className="text-[#8A7F72]">Velocity:</span>
            <span className="font-bold text-[#F0EBE3]">{pressureMetrics.flowVelocity || '0.0'} m/s</span>
          </div>
          <span className="text-[#2E2820]">|</span>
          <div className="flex items-center space-x-2">
            <GitBranch className="w-4 h-4 text-[#00F5FF]" />
            <span className="text-[#8A7F72]">A* Routes:</span>
            <span className="font-bold text-[#00F5FF]">
              {isReroutingActive ? `${escapePaths.length} OPTIMAL` : 'STANDBY'}
            </span>
          </div>
        </div>
      </footer>
    </>
  );
}

export default TopBar;
