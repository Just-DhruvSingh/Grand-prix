/**
 * api.js — Axios HTTP Client for Kinetic Flow
 * Centralized API layer with interceptors and error normalization.
 */
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach timestamps for latency tracking
api.interceptors.request.use(
  (config) => {
    config.metadata = { startTime: performance.now() };
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — log latency, normalize errors
api.interceptors.response.use(
  (response) => {
    const latency = Math.round(performance.now() - response.config.metadata.startTime);
    response.latency = latency;
    return response;
  },
  (error) => {
    if (error.response) {
      console.warn(`[API] ${error.response.status} — ${error.response.config?.url}`, error.response.data);
    } else if (error.request) {
      console.warn('[API] Network error — no response received');
    } else {
      console.warn('[API] Request setup error:', error.message);
    }
    return Promise.reject(error);
  }
);

/**
 * POST /api/predict-bottleneck
 * @param {Object} payload - { venueType, expectedCrowd, schedulePhase, nodes[] }
 * @returns {Promise<Object>} - { nodeWeights, repellers, attractors, pressureMetrics }
 */
export const predictBottleneck = async (payload) => {
  const response = await api.post('/api/predict-bottleneck', payload);
  return response.data;
};

/**
 * GET /api/health
 * @returns {Promise<Object>} - { status, message, timestamp }
 */
export const checkHealth = async () => {
  const response = await api.get('/api/health');
  return response.data;
};

/**
 * GET /api/venues
 * @returns {Promise<Object[]>} - Array of venue configs
 */
export const fetchVenues = async () => {
  const response = await api.get('/api/venues');
  return response.data;
};

export default api;
