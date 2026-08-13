/**
 * NodeWeightBadge.jsx — Per-Node Congestion Label
 */
import React from 'react';
import { congestionToColor } from '../../lib/utils';

export function NodeWeightBadge({ nodeId, congestion, reason, className = '' }) {
  const color = congestionToColor(congestion);
  const percentage = Math.round(congestion * 100);

  return (
    <div
      className={`inline-flex items-center space-x-1.5 px-2 py-1 rounded border text-[10px] font-mono ${className}`}
      style={{ borderColor: `${color}50`, backgroundColor: `${color}10` }}
    >
      <span
        className="w-2 h-2 rounded-full shrink-0"
        style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}60` }}
      />
      <span className="font-bold" style={{ color }}>{percentage}%</span>
      <span className="text-[#8A7F72] truncate max-w-[120px]">{nodeId}</span>
    </div>
  );
}

export default NodeWeightBadge;
