/**
 * Badge.jsx — Colored status badge with optional pulse animation.
 */
import React from 'react';

const BADGE_STYLES = {
  success: 'bg-[#39FF14]/15 text-[#39FF14] border-[#39FF14]/40',
  warning: 'bg-[#FFB800]/15 text-[#FFB800] border-[#FFB800]/40',
  danger:  'bg-[#FF2D55]/15 text-[#FF2D55] border-[#FF2D55]/40',
  info:    'bg-[#00F5FF]/15 text-[#00F5FF] border-[#00F5FF]/40',
  neutral: 'bg-[#2E2820] text-[#8A7F72] border-[#4A3F30]',
};

export function Badge({
  children,
  variant = 'info',
  pulse = false,
  dot = false,
  className = '',
}) {
  return (
    <span
      className={`
        inline-flex items-center space-x-1 px-2 py-0.5 rounded
        text-[10px] font-mono font-bold uppercase tracking-wide border
        ${BADGE_STYLES[variant] || BADGE_STYLES.info}
        ${pulse ? 'animate-pulse' : ''}
        ${className}
      `}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${pulse ? 'animate-ping' : ''}`}
          style={{ backgroundColor: 'currentColor' }}
        />
      )}
      <span>{children}</span>
    </span>
  );
}

export default Badge;
