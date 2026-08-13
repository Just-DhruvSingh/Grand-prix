/**
 * Sidebar.jsx — Control Panel Sidebar
 * Assembles all control components into the left panel.
 */
import React from 'react';
import { Activity, Zap, Sliders, Upload, RefreshCw, ShieldAlert, AlertTriangle, Layers } from 'lucide-react';
import useKineticStore from '../../hooks/useKineticStore';
import { Badge } from '../UI/Badge';
import { VenueSelector } from '../Controls/VenueSelector';
import { CrowdSlider } from '../Controls/CrowdSlider';
import { PhaseSelector } from '../Controls/PhaseSelector';
import { SVGUploader } from '../Controls/SVGUploader';
import { SensorToggle } from '../Controls/SensorToggle';
import { MetricsPanel } from '../Analytics/MetricsPanel';
import { AlertBanner } from '../Analytics/AlertBanner';

export function Sidebar() {
  const nodes = useKineticStore((s) => s.nodes);
  const escapePaths = useKineticStore((s) => s.escapePaths);
  const isReroutingActive = useKineticStore((s) => s.isReroutingActive);
  const toggleRerouting = useKineticStore((s) => s.toggleRerouting);
  const showGraphOverlay = useKineticStore((s) => s.showGraphOverlay);
  const toggleGraphOverlay = useKineticStore((s) => s.toggleGraphOverlay);
  const pressureMetrics = useKineticStore((s) => s.pressureMetrics);
  const logFeed = useKineticStore((s) => s.logFeed);
  const isLoading = useKineticStore((s) => s.isLoading);

  const primaryRoute = escapePaths[0];
  const chokeNodes = nodes.filter(n => n.isChoke || (n.congestion && n.congestion > 0.6));

  return (
    <aside className="w-full md:w-[380px] lg:w-[460px] h-full bg-[#161310]/90 backdrop-blur-xl border-r border-[#2E2820] z-20 flex flex-col p-4 space-y-3 overflow-y-auto shrink-0 shadow-2xl">

      {/* Header */}
      <div className="p-3.5 rounded bg-[#1E1A17]/80 border border-[#2E2820] space-y-2 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded bg-[#FFB800]/10 border border-[#FFB800]/40 flex items-center justify-center p-1">
              <Activity className="w-full h-full text-[#FFB800] animate-pulse" />
            </div>
            <h1 className="font-heading font-bold text-xl text-[#F0EBE3] tracking-wider">KINETIC FLOW</h1>
          </div>
          <Badge variant="success" dot pulse>SPATIAL AI</Badge>
        </div>
        <div className="pt-1.5 border-t border-[#2E2820] flex items-center justify-between text-xs text-[#8A7F72] font-mono">
          <span className="flex items-center space-x-1">
            <Zap className="w-3.5 h-3.5 text-[#FFB800]" />
            <span>A* Pathfinder: <strong className="text-[#00F5FF]">{escapePaths.length > 0 ? 'OPTIMAL' : 'STANDBY'}</strong></span>
          </span>
          <span className="text-[10px] text-[#00F5FF]">{nodes.length} Nodes</span>
        </div>
      </div>

      {/* Alert Banner */}
      <AlertBanner className="shrink-0" />

      {/* Controls */}
      <div className="p-3.5 rounded bg-[#1E1A17]/80 border border-[#2E2820] space-y-3 shrink-0">
        <div className="flex items-center space-x-2 border-b border-[#2E2820] pb-2">
          <Sliders className="w-4 h-4 text-[#FFB800]" />
          <h2 className="font-heading font-bold text-sm text-[#F0EBE3] uppercase tracking-wider">Input Controls</h2>
        </div>
        <VenueSelector />
        <CrowdSlider />
        <PhaseSelector />
      </div>

      {/* SVG Uploader */}
      <div className="p-3.5 rounded bg-[#1E1A17]/80 border border-[#2E2820] space-y-2.5 shrink-0">
        <div className="flex items-center justify-between border-b border-[#2E2820] pb-2">
          <div className="flex items-center space-x-2">
            <Upload className="w-4 h-4 text-[#00F5FF]" />
            <h2 className="font-heading font-bold text-sm text-[#F0EBE3] uppercase tracking-wider">SVG Map</h2>
          </div>
          <button
            onClick={toggleGraphOverlay}
            className={`text-[10px] px-2 py-0.5 rounded font-mono border transition-all ${
              showGraphOverlay ? 'bg-[#00F5FF]/20 text-[#00F5FF] border-[#00F5FF]/50' : 'bg-[#1E1A17] text-[#8A7F72] border-[#2E2820]'
            }`}
          >
            Mesh: {showGraphOverlay ? 'ON' : 'OFF'}
          </button>
        </div>
        <SVGUploader />
      </div>

      {/* Sensor Toggle */}
      <div className="p-3.5 rounded bg-[#1E1A17]/80 border border-[#2E2820] shrink-0">
        <SensorToggle />
      </div>

      {/* A* Action Button */}
      <div className="space-y-1.5 shrink-0">
        <button
          onClick={toggleRerouting}
          className={`w-full py-3.5 px-4 rounded font-heading font-extrabold text-sm tracking-wider uppercase transition-all duration-200 flex items-center justify-center space-x-2 border shadow-xl ${
            isReroutingActive
              ? 'bg-[#FF2D55] text-white border-[#FF2D55] hover:bg-[#e6264d] animate-pulse'
              : 'bg-[#FFB800] text-[#161310] border-[#FFB800] hover:bg-[#e6a600] hover:scale-[1.02]'
          }`}
        >
          {isReroutingActive ? (
            <><RefreshCw className="w-4 h-4 animate-spin" /><span>DISENGAGE A* PATHFINDER</span></>
          ) : (
            <><ShieldAlert className="w-4 h-4" /><span>ENGAGE A* BYPASS PATHFINDER</span></>
          )}
        </button>
        <p className="text-[10px] text-[#8A7F72] text-center font-mono">
          {isReroutingActive
            ? `⚡ Routing to ${primaryRoute?.endNode?.name || 'Exit'} via ${escapePaths.length} paths`
            : 'Click to engage A* pathfinder'}
        </p>
      </div>

      {/* Congestion Card */}
      <div className="p-3 rounded bg-[#1E1A17]/80 border border-[#2E2820] space-y-2 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-[#FF2D55]" />
            <h3 className="font-heading font-bold text-xs text-[#F0EBE3] uppercase tracking-wider">Congestion</h3>
          </div>
          <Badge variant="danger">{chokeNodes.length} High Risk</Badge>
        </div>
        {primaryRoute && (
          <div className="flex items-center justify-between text-[10px] font-mono text-[#8A7F72]">
            <span>A* Cost: <strong className="text-[#FFB800]">{primaryRoute.weightedCost}</strong></span>
            <span>Dist: <strong className="text-[#F0EBE3]">{primaryRoute.totalDistance}m</strong></span>
            <span className="text-[#39FF14]">{isReroutingActive ? 'BYPASS ACTIVE' : 'STANDBY'}</span>
          </div>
        )}
      </div>

      {/* Metrics Panel */}
      <MetricsPanel className="shrink-0" />

      {/* Log Feed */}
      <div className="p-3 rounded bg-[#1E1A17]/80 border border-[#2E2820] space-y-1.5 shrink-0">
        <div className="flex items-center justify-between text-xs border-b border-[#2E2820] pb-1">
          <span className="flex items-center space-x-1.5 font-bold text-[#F0EBE3]">
            <Layers className="w-3.5 h-3.5 text-[#FFB800]" />
            <span>Execution Stream</span>
          </span>
          <span className="text-[10px] text-[#8A7F72]">
            {isLoading ? 'PREDICTING...' : 'IDLE'}
          </span>
        </div>
        <div className="space-y-0.5 max-h-24 overflow-y-auto pr-1 text-[10px]">
          {logFeed.map((log) => (
            <div key={log.id} className="flex items-start space-x-2 text-[#8A7F72] font-mono">
              <span className="text-[#4A3F30] shrink-0">[{log.time}]</span>
              <span className={
                log.type === 'alert' ? 'text-[#FF2D55] font-semibold' :
                log.type === 'success' ? 'text-[#FFB800] font-semibold' :
                log.type === 'warning' ? 'text-[#FFB800]' :
                log.type === 'sensor' ? 'text-[#39FF14] font-semibold' : 'text-[#8A7F72]'
              }>
                {log.event}
              </span>
            </div>
          ))}
        </div>
      </div>

    </aside>
  );
}

export default Sidebar;
