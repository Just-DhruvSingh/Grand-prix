/**
 * simplex.js — 2D Simplex Noise Implementation
 * Used for JS-side crowd density simulation, sensor data emulation,
 * and procedural venue generation. The GLSL shader has its own inline version.
 *
 * Based on Stefan Gustavson's simplex noise algorithm.
 */

const F2 = 0.5 * (Math.sqrt(3.0) - 1.0);
const G2 = (3.0 - Math.sqrt(3.0)) / 6.0;

// Permutation table (256 entries, doubled for overflow)
const perm = new Uint8Array(512);
const grad2 = [
  [1, 1], [-1, 1], [1, -1], [-1, -1],
  [1, 0], [-1, 0], [0, 1], [0, -1],
];

// Initialize permutation table with seed
function seedPermutation(seed = 0) {
  const p = new Uint8Array(256);
  for (let i = 0; i < 256; i++) p[i] = i;

  // Fisher-Yates shuffle with seed
  let s = seed;
  for (let i = 255; i > 0; i--) {
    s = (s * 16807 + 0) % 2147483647;
    const j = s % (i + 1);
    [p[i], p[j]] = [p[j], p[i]];
  }

  for (let i = 0; i < 512; i++) {
    perm[i] = p[i & 255];
  }
}

// Initialize with default seed
seedPermutation(42);

function dot2(gi, x, y) {
  const g = grad2[gi % 8];
  return g[0] * x + g[1] * y;
}

/**
 * 2D Simplex Noise
 * @param {number} xin - X coordinate
 * @param {number} yin - Y coordinate
 * @returns {number} Noise value in range [-1, 1]
 */
export function noise2D(xin, yin) {
  const s = (xin + yin) * F2;
  const i = Math.floor(xin + s);
  const j = Math.floor(yin + s);

  const t = (i + j) * G2;
  const X0 = i - t;
  const Y0 = j - t;
  const x0 = xin - X0;
  const y0 = yin - Y0;

  let i1, j1;
  if (x0 > y0) {
    i1 = 1; j1 = 0;
  } else {
    i1 = 0; j1 = 1;
  }

  const x1 = x0 - i1 + G2;
  const y1 = y0 - j1 + G2;
  const x2 = x0 - 1.0 + 2.0 * G2;
  const y2 = y0 - 1.0 + 2.0 * G2;

  const ii = i & 255;
  const jj = j & 255;

  let n0 = 0, n1 = 0, n2 = 0;

  let t0 = 0.5 - x0 * x0 - y0 * y0;
  if (t0 >= 0) {
    t0 *= t0;
    n0 = t0 * t0 * dot2(perm[ii + perm[jj]], x0, y0);
  }

  let t1 = 0.5 - x1 * x1 - y1 * y1;
  if (t1 >= 0) {
    t1 *= t1;
    n1 = t1 * t1 * dot2(perm[ii + i1 + perm[jj + j1]], x1, y1);
  }

  let t2 = 0.5 - x2 * x2 - y2 * y2;
  if (t2 >= 0) {
    t2 *= t2;
    n2 = t2 * t2 * dot2(perm[ii + 1 + perm[jj + 1]], x2, y2);
  }

  return 70.0 * (n0 + n1 + n2);
}

/**
 * Fractal Brownian Motion — layered noise with configurable octaves.
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {number} octaves - Number of noise layers (default 3)
 * @param {number} persistence - Amplitude falloff per octave (default 0.5)
 * @param {number} lacunarity - Frequency multiplier per octave (default 2.0)
 * @returns {number} Combined noise value
 */
export function fbm(x, y, octaves = 3, persistence = 0.5, lacunarity = 2.0) {
  let total = 0;
  let amplitude = 1.0;
  let frequency = 1.0;
  let maxValue = 0;

  for (let i = 0; i < octaves; i++) {
    total += noise2D(x * frequency, y * frequency) * amplitude;
    maxValue += amplitude;
    amplitude *= persistence;
    frequency *= lacunarity;
  }

  return total / maxValue;
}

/**
 * Re-seed the noise generator.
 * @param {number} seed - Integer seed value
 */
export function seed(s) {
  seedPermutation(s);
}

export default { noise2D, fbm, seed };
