/**
 * StatusLED.jsx — Animated Status Indicator
 */
import React from 'react';

export function StatusLED({ active = true, color = '#39FF14', size = 'sm', className = '' }) {
  const sizes = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  return (
    <span className={`relative inline-flex ${className}`}>
      {active && (
        <span
          className={`absolute inline-flex ${sizes[size]} rounded-full opacity-75 animate-ping`}
          style={{ backgroundColor: color }}
        />
      )}
      <span
        className={`relative inline-flex ${sizes[size]} rounded-full`}
        style={{
          backgroundColor: color,
          boxShadow: `0 0 8px ${color}60`,
        }}
      />
    </span>
  );
}

export default StatusLED;
