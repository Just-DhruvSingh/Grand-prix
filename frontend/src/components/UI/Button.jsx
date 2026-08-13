/**
 * Button.jsx — Styled button primitive with variants.
 */
import React from 'react';

const VARIANTS = {
  primary: 'bg-[#FFB800] text-[#161310] border-[#FFB800] hover:bg-[#e6a600] hover:scale-[1.02]',
  danger: 'bg-[#FF2D55] text-white border-[#FF2D55] hover:bg-[#e6264d] animate-pulse',
  ghost: 'bg-transparent text-[#F0EBE3] border-[#2E2820] hover:bg-[#1E1A17] hover:border-[#4A3F30]',
  cyan: 'bg-[#00F5FF]/15 text-[#00F5FF] border-[#00F5FF]/50 hover:bg-[#00F5FF]/25',
};

const SIZES = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3.5 text-sm',
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  icon: Icon = null,
  disabled = false,
  ...props
}) {
  return (
    <button
      disabled={disabled}
      className={`
        inline-flex items-center justify-center space-x-2
        font-heading font-bold uppercase tracking-wider
        rounded border transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${VARIANTS[variant] || VARIANTS.primary}
        ${SIZES[size] || SIZES.md}
        ${className}
      `}
      {...props}
    >
      {Icon && <Icon className="w-4 h-4" />}
      <span>{children}</span>
    </button>
  );
}

export default Button;
