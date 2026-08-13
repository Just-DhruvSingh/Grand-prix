/**
 * MetricsPanel.jsx — Peak Density + Flow Velocity Gauges
 * SVG arc gauges with animated stroke-dashoffset.
 */
import React from 'react';
import { Gauge, TrendingUp } from 'lucide-react';
import useKineticStore from '../../hooks/useKineticStore';
import HistoryChart from './HistoryChart';

function ArcGauge({ value, max, label, unit, thresholds, size = 80 }) {
  const radius = (size - 12) / 2;
  const circumference = Math.PI * radius;
  const normalized = Math.min(value / max, 1);
  const dashOffset = circumference * (1 - normalized);

  let color = '#39FF14';
  if (thresholds) {
    for (const t of thresholds) {
      if (value >= t.min) color = t.color;
    }
  }

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size / 2 + 8} viewBox={`0 0 ${size} ${size / 2 + 8}`}>
        {/* Background arc */}
        <path
          d={`M ${6} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - 6} ${size / 2}`}
          fill="none"
          stroke="#2E2820"
          strokeWidth="6"
          strokeLinecap="round"
        />
        {/* Value arc */}
        <path
          d={`M ${6} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - 6} ${size / 2}`}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{ transition: 'stroke-dashoffset 0.6s ease, stroke 0.3s ease', filter: `drop-shadow(0 0 6px ${color}60)` }}
        />
      </svg>
      <div className="text-center -mt-1">
        <span className="text-lg font-mono font-extrabold" style={{ color }}>
          {typeof value === 'number' ? value.toFixed(1) : value}
        </span>
        <span className="text-[10px] font-mono text-[#8A7F72] ml-0.5">{unit}</span>
      </div>
      <span className="text-[9px] font-mono text-[#8A7F72] uppercase">{label}</span>
    </div>
  );
}

export function MetricsPanel({ className = '' }) {
  const pressureMetrics = useKineticStore((s) => s.pressureMetrics);
  const predictionHistory = useKineticStore((s) => s.predictionHistory);

  const peakDensity = pressureMetrics.peakDensity || 0;
  const flowVelocity = pressureMetrics.flowVelocity || 0;

  return (
    <div className={`p-3 rounded bg-[#161310]/90 border border-[#2E2820] space-y-3 ${className}`}>
      <div className="flex items-center space-x-2 border-b border-[#2E2820] pb-2">
        <Gauge className="w-4 h-4 text-[#FFB800]" />
        <h3 className="font-heading font-bold text-xs text-[#F0EBE3] uppercase tracking-wider">
          Pressure Metrics
        </h3>
      </div>

      <div className="flex items-center justify-around">
        <ArcGauge
          value={peakDensity}
          max={10}
          label="Peak Density"
          unit="ppl/m²"
          thresholds={[
            { min: 0,   color: '#39FF14' },
            { min: 3.0, color: '#FFB800' },
            { min: 4.5, color: '#FF2D55' },
          ]}
        />
        <ArcGauge
          value={flowVelocity}
          max={3}
          label="Flow Velocity"
          unit="m/s"
          thresholds={[
            { min: 0,   color: '#FFB800' },
            { min: 0.5, color: '#39FF14' },
            { min: 1.5, color: '#00F5FF' },
          ]}
        />
      </div>

      {/* Sparkline */}
      {predictionHistory.length > 1 && (
        <HistoryChart data={predictionHistory} height={32} />
      )}
    </div>
  );
}

export default MetricsPanel;
