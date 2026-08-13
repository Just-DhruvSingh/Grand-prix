/**
 * RoutePanel.jsx — Escape Routes List UI
 * Shows ranked A* routes with cost, distance, and risk level.
 */
import React from 'react';
import { CornerUpRight, ShieldCheck, AlertTriangle } from 'lucide-react';
import useKineticStore from '../../hooks/useKineticStore';
import { Badge } from '../UI/Badge';

const ROUTE_LABELS = ['PRIMARY', 'ALT-1', 'ALT-2'];
const ROUTE_COLORS = ['#00F5FF', '#39FF14', '#FFB800'];

export function RoutePanel({ className = '' }) {
  const escapePaths = useKineticStore((s) => s.escapePaths);
  const isReroutingActive = useKineticStore((s) => s.isReroutingActive);

  if (!isReroutingActive || escapePaths.length === 0) return null;

  const primary = escapePaths[0];

  return (
    <div className={`bg-[#161310]/95 backdrop-blur-md border border-[#00F5FF] p-3.5 rounded shadow-2xl ${className}`}
         style={{ boxShadow: '0 0 20px rgba(0,245,255,0.15)' }}>
      {/* Header */}
      <div className="flex items-center space-x-2 mb-2">
        <div className="w-8 h-8 rounded bg-[#00F5FF]/20 border border-[#00F5FF] flex items-center justify-center">
          <CornerUpRight className="w-4 h-4 text-[#00F5FF]" />
        </div>
        <div>
          <span className="text-xs font-heading font-bold text-[#00F5FF] uppercase tracking-wider">
            A* ESCAPE ROUTES
          </span>
          <Badge variant="success" dot className="ml-2">OPTIMAL</Badge>
        </div>
      </div>

      {/* Route list */}
      <div className="space-y-1.5">
        {escapePaths.map((route, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between px-2.5 py-1.5 rounded border transition-all"
            style={{
              borderColor: `${ROUTE_COLORS[idx]}40`,
              backgroundColor: idx === 0 ? `${ROUTE_COLORS[idx]}10` : 'transparent',
            }}
          >
            <div className="flex items-center space-x-2">
              <span
                className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded"
                style={{ color: ROUTE_COLORS[idx], backgroundColor: `${ROUTE_COLORS[idx]}20` }}
              >
                {ROUTE_LABELS[idx]}
              </span>
              <span className="text-xs font-mono text-[#F0EBE3]">
                {route.endNode?.name || 'Exit'}
              </span>
            </div>
            <div className="flex items-center space-x-3 text-[10px] font-mono text-[#8A7F72]">
              <span>{route.totalDistance}m</span>
              <span style={{ color: ROUTE_COLORS[idx] }}>{route.weightedCost}</span>
              {route.bypassedChokes?.length > 0 && (
                <ShieldCheck className="w-3 h-3 text-[#39FF14]" />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Primary route detail */}
      {primary && (
        <div className="mt-2 pt-2 border-t border-[#2E2820] text-[10px] font-mono text-[#8A7F72]">
          <span>{primary.startNode?.name || 'Entry'}</span>
          <span className="text-[#00F5FF] mx-1">➔</span>
          <span className="text-[#39FF14]">{primary.endNode?.name || 'Exit'}</span>
          {primary.bypassedChokes?.length > 0 && (
            <span className="ml-2 text-[#FFB800]">
              Bypassed: {primary.bypassedChokes.join(', ')}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default RoutePanel;
