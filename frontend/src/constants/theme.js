/**
 * theme.js — Kinetic Flow Design System Tokens
 * Single source of truth for all visual design decisions.
 * Never hardcode colors or fonts — import from here.
 */

export const COLORS = {
  // Backgrounds
  bgPrimary:    '#161310',
  bgSurface:    '#1E1A17',
  bgElevated:   '#252018',

  // Borders
  borderDim:    '#2E2820',
  borderGlow:   '#4A3F30',

  // Neon accents
  neonCyan:     '#00F5FF',
  neonAmber:    '#FFB800',
  neonCrimson:  '#FF2D55',
  neonGreen:    '#39FF14',

  // Text
  textPrimary:  '#F0EBE3',
  textSecondary:'#8A7F72',
  textAccent:   '#00F5FF',

  // Semantic aliases
  safe:         '#39FF14',
  warning:      '#FFB800',
  danger:       '#FF2D55',
  info:         '#00F5FF',
};

export const FONTS = {
  heading: '"Space Grotesk", sans-serif',
  mono:    '"JetBrains Mono", monospace',
};

export const FONT_WEIGHTS = {
  normal:    400,
  medium:    500,
  bold:      700,
  extrabold: 800,
};

export const SPACING = {
  xs:  '0.25rem',
  sm:  '0.5rem',
  md:  '0.75rem',
  lg:  '1rem',
  xl:  '1.5rem',
  xxl: '2rem',
};

export const RADII = {
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  full: '9999px',
};

export const SHADOWS = {
  glow: (color) => `0 0 15px ${color}40, 0 0 30px ${color}20`,
  card: '0 4px 24px rgba(0,0,0,0.4)',
  elevated: '0 8px 32px rgba(0,0,0,0.6)',
};

export const BREAKPOINTS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
};

export default { COLORS, FONTS, FONT_WEIGHTS, SPACING, RADII, SHADOWS, BREAKPOINTS };
