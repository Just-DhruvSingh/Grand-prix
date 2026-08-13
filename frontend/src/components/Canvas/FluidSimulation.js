/**
 * FluidSimulation.js — Simplex Noise Fluid Physics Class
 * Provides JS-side fluid parameters and noise-based density field.
 * The actual rendering happens in the GPU (shaders.js).
 * This class manages the simulation state that drives shader uniforms.
 */
import { noise2D, fbm } from '../../lib/simplex';
import { clamp } from '../../lib/utils';

export class FluidSimulation {
  constructor(options = {}) {
    this.width = options.width || 1000;
    this.height = options.height || 600;
    this.time = 0;
    this.speed = options.speed || 1.0;
    this.density = options.density || 1.0;
    this.octaves = options.octaves || 3;
    this.repellers = [];
    this.attractors = [];
  }

  /**
   * Advance simulation time.
   * @param {number} dt - Delta time in seconds
   */
  update(dt) {
    this.time += dt * this.speed;
  }

  /**
   * Set simulation speed multiplier.
   * Driven by expectedCrowd / 10000.
   */
  setSpeed(crowdSize) {
    this.speed = clamp(0.5 + (crowdSize / 10000) * 0.3, 0.5, 5.0);
  }

  /**
   * Set density factor (0-1).
   */
  setDensity(factor) {
    this.density = clamp(factor, 0, 1);
  }

  /**
   * Update repeller positions from AI prediction.
   * @param {Array} repellers - [{ x, y, force, radius }]
   */
  setRepellers(repellers) {
    this.repellers = Array.isArray(repellers) ? repellers.slice(0, 8) : [];
  }

  /**
   * Update attractor positions from AI prediction.
   * @param {Array} attractors - [{ x, y, force }]
   */
  setAttractors(attractors) {
    this.attractors = Array.isArray(attractors) ? attractors.slice(0, 4) : [];
  }

  /**
   * Sample crowd density at a given normalized UV coordinate.
   * Useful for JS-side density queries (sensor overlay, heatmap).
   * @param {number} nx - Normalized X (0-1)
   * @param {number} ny - Normalized Y (0-1)
   * @returns {number} Density value (0-1)
   */
  sampleDensity(nx, ny) {
    const scale = 3.0 * (0.8 + this.density * 0.4);
    const value = fbm(
      nx * scale + this.time * 0.1 * this.speed,
      ny * scale + this.time * 0.05 * this.speed,
      this.octaves
    );

    // Apply repeller influence
    let repellerEffect = 0;
    for (const r of this.repellers) {
      const dx = nx - r.x;
      const dy = ny - r.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const radius = r.radius || 0.2;
      if (dist < radius) {
        repellerEffect += (1 - dist / radius) * (r.force || 1);
      }
    }

    return clamp((value + 1) / 2 + repellerEffect * 0.2, 0, 1);
  }

  /**
   * Get the current state as shader uniform values.
   */
  getUniforms() {
    return {
      time: this.time,
      density: this.density,
      repellers: this.repellers,
      attractors: this.attractors,
    };
  }
}

export default FluidSimulation;
