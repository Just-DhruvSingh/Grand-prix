/**
 * HistoryChart.jsx — Sparkline of Past 10 Predictions
 * Pure SVG, no external charting library.
 */
import React from 'react';

export function HistoryChart({ data = [], height = 32, className = '' }) {
  if (data.length < 2) return null;

  const width = 200;
  const padding = 4;
  const maxVal = Math.max(...data, 1);
  const minVal = Math.min(...data, 0);
  const range = maxVal - minVal || 1;

  const points = data.map((val, idx) => {
    const x = padding + (idx / (data.length - 1)) * (width - padding * 2);
    const y = padding + (1 - (val - minVal) / range) * (height - padding * 2);
    return `${x},${y}`;
  });

  const polyline = points.join(' ');

  // Determine color based on latest value
  const latest = data[data.length - 1];
  let color = '#39FF14';
  if (latest > 4.5) color = '#FF2D55';
  else if (latest > 3.0) color = '#FFB800';

  // Area fill
  const areaPath = `M ${padding},${height - padding} ${points.map(p => `L ${p}`).join(' ')} L ${width - padding},${height - padding} Z`;

  return (
    <div className={`${className}`}>
      <div className="flex items-center justify-between text-[9px] font-mono text-[#8A7F72] mb-1">
        <span>Density History</span>
        <span style={{ color }}>{latest?.toFixed(1)} ppl/m²</span>
      </div>
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        {/* Area fill */}
        <path d={areaPath} fill={`${color}15`} />
        {/* Line */}
        <polyline
          points={polyline}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ filter: `drop-shadow(0 0 3px ${color}60)` }}
        />
        {/* Latest point */}
        <circle
          cx={points[points.length - 1]?.split(',')[0]}
          cy={points[points.length - 1]?.split(',')[1]}
          r="3"
          fill={color}
          style={{ filter: `drop-shadow(0 0 4px ${color})` }}
        />
      </svg>
    </div>
  );
}

export default HistoryChart;
