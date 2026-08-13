/**
 * Slider.jsx — Animated range slider with label and live value display.
 */
import React from 'react';
import { formatNumber } from '../../lib/utils';

export function Slider({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  icon: Icon = null,
  formatValue = null,
  className = '',
}) {
  const displayValue = formatValue ? formatValue(value) : formatNumber(value);

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex justify-between items-center text-xs font-mono">
        <label className="text-[#8A7F72] flex items-center space-x-1.5">
          {Icon && <Icon className="w-3.5 h-3.5 text-[#FFB800]" />}
          <span>{label}</span>
        </label>
        <span className="font-bold text-[#FFB800] text-sm font-mono">{displayValue}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 bg-[#2E2820] rounded-lg appearance-none cursor-pointer accent-[#FFB800]"
      />
    </div>
  );
}

export default Slider;
