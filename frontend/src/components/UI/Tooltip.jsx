/**
 * Tooltip.jsx — Hover tooltip with configurable position.
 */
import React, { useState } from 'react';

const POSITIONS = {
  top:    'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left:   'right-full top-1/2 -translate-y-1/2 mr-2',
  right:  'left-full top-1/2 -translate-y-1/2 ml-2',
};

export function Tooltip({
  children,
  content,
  position = 'top',
  className = '',
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div
      className={`relative inline-block ${className}`}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && content && (
        <div
          className={`
            absolute z-50 px-2.5 py-1.5 rounded
            bg-[#252018] border border-[#4A3F30]
            text-[10px] font-mono text-[#F0EBE3]
            whitespace-nowrap shadow-lg
            pointer-events-none
            animate-[fadeIn_0.15s_ease]
            ${POSITIONS[position] || POSITIONS.top}
          `}
        >
          {content}
        </div>
      )}
    </div>
  );
}

export default Tooltip;
