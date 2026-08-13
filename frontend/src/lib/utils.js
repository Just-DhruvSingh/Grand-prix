/**
 * utils.js — Math, Color, and Formatting Utilities
 */

/**
 * Linear interpolation between two values.
 */
export const lerp = (a, b, t) => a + (b - a) * t;

/**
 * Clamp a value between min and max.
 */
export const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

/**
 * Map a value from one range to another.
 */
export const mapRange = (value, inMin, inMax, outMin, outMax) => {
  return outMin + ((value - inMin) / (inMax - inMin)) * (outMax - outMin);
};

/**
 * Smooth step interpolation (Hermite).
 */
export const smoothstep = (edge0, edge1, x) => {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
};

/**
 * Convert HSL to RGB hex string.
 * @param {number} h - Hue (0-360)
 * @param {number} s - Saturation (0-100)
 * @param {number} l - Lightness (0-100)
 * @returns {string} Hex color string
 */
export const hslToHex = (h, s, l) => {
  s /= 100;
  l /= 100;
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const toHex = (v) => Math.round(v * 255).toString(16).padStart(2, '0');
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
};

/**
 * Map a congestion value (0-1) to a color using cyan → amber → crimson gradient.
 * @param {number} value - Congestion factor (0.0 to 1.0)
 * @returns {string} CSS color string
 */
export const congestionToColor = (value) => {
  const v = clamp(value, 0, 1);
  if (v < 0.5) {
    // Cyan → Amber
    const t = v / 0.5;
    const r = Math.round(lerp(0, 255, t));
    const g = Math.round(lerp(245, 184, t));
    const b = Math.round(lerp(255, 0, t));
    return `rgb(${r}, ${g}, ${b})`;
  } else {
    // Amber → Crimson
    const t = (v - 0.5) / 0.5;
    const r = Math.round(lerp(255, 255, t));
    const g = Math.round(lerp(184, 45, t));
    const b = Math.round(lerp(0, 85, t));
    return `rgb(${r}, ${g}, ${b})`;
  }
};

/**
 * Generate Gaussian-distributed random number.
 * @param {number} mean - Mean value
 * @param {number} stddev - Standard deviation
 * @returns {number}
 */
export const gaussianRandom = (mean = 0, stddev = 1) => {
  const u1 = 1 - Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return z * stddev + mean;
};

/**
 * Format large numbers with locale separators (e.g. 50000 → "50,000").
 */
export const formatNumber = (n) => {
  if (typeof n !== 'number') return '0';
  return n.toLocaleString();
};

/**
 * Debounce a function call.
 * @param {Function} fn - Function to debounce
 * @param {number} ms - Delay in milliseconds
 * @returns {Function}
 */
export const debounce = (fn, ms) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
};

/**
 * Generate a unique ID string.
 */
export const uid = () => `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

/**
 * Get current time as HH:MM:SS string.
 */
export const timestamp = () => new Date().toLocaleTimeString('en-GB');

export default {
  lerp, clamp, mapRange, smoothstep,
  hslToHex, congestionToColor, gaussianRandom,
  formatNumber, debounce, uid, timestamp,
};
