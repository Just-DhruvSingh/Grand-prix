/**
 * Toggle.jsx — On/Off toggle switch with LED indicator.
 */
import React from 'react';

export function Toggle({
  label,
  checked,
  onChange,
  colorOn = '#39FF14',
  colorOff = '#FFB800',
  className = '',
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`flex items-center space-x-2.5 text-xs font-mono group ${className}`}
    >
      <div
        className={`relative w-10 h-5 rounded-full transition-colors duration-300 border ${
          checked
            ? 'bg-[#39FF14]/20 border-[#39FF14]/50'
            : 'bg-[#2E2820] border-[#4A3F30]'
        }`}
      >
        <div
          className={`absolute top-0.5 w-4 h-4 rounded-full transition-all duration-300 shadow-lg ${
            checked
              ? 'left-5 shadow-[#39FF14]/50'
              : 'left-0.5 shadow-[#FFB800]/30'
          }`}
          style={{ backgroundColor: checked ? colorOn : colorOff }}
        />
      </div>
      <div className="flex items-center space-x-1.5">
        <span
          className="w-2 h-2 rounded-full"
          style={{
            backgroundColor: checked ? colorOn : colorOff,
            boxShadow: `0 0 8px ${checked ? colorOn : colorOff}60`,
          }}
        />
        <span className={`${checked ? 'text-[#F0EBE3]' : 'text-[#8A7F72]'} group-hover:text-[#F0EBE3] transition-colors`}>
          {label}
        </span>
      </div>
    </button>
  );
}

export default Toggle;
