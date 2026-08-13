/**
 * useKineticStore.js — Zustand Global State Store
 * Single source of truth for all application state.
 */
import { create } from 'zustand';
import { PRESET_VENUES, SCHEDULE_PHASES } from '../constants/venues';

const useKineticStore = create((set, get) => ({
  // ─── Venue Config ───
  venue: PRESET_VENUES[0],
  venueId: PRESET_VENUES[0].id,
  expectedCrowd: PRESET_VENUES[0].defaultCrowd,
  schedulePhase: SCHEDULE_PHASES[1], // 'Event In Progress'

  // ─── Graph State ───
  nodes: [],
  edges: [],
  nodeMap: new Map(),
  entryNodes: [],
  exitNodes: [],
  congestionWeights: {},
  viewBox: { width: 1000, height: 600 },

  // ─── AI Prediction State ───
  isLoading: false,
  lastPrediction: null,
  predictionError: null,

  // ─── Physics State ───
  repellers: [{ x: 0.50, y: 0.40, force: 2.5, radius: 0.20 }],
  attractors: [{ x: 0.84, y: 0.85, force: 2.1 }],
  pressureMetrics: { peakDensity: 0, flowVelocity: 0 },

  // ─── Routes State ───
  escapePaths: [],
  selectedPath: 0,
  isReroutingActive: true,

  // ─── Sensor State ───
  sensorMode: 'offline',
  nodeCounts: {},
  sensorPacketCount: 0,

  // ─── UI State ───
  showGraphOverlay: true,
  uploadedSvgContent: null,
  uploadedSvgName: null,
  mouseCoords: { x: 50, y: 50 },

  // ─── History (for sparkline) ───
  predictionHistory: [],

  // ─── Log Feed ───
  logFeed: [
    { id: 1, time: new Date().toLocaleTimeString('en-GB'), event: 'Spatial Intelligence Engine Initialized', type: 'info' },
    { id: 2, time: new Date().toLocaleTimeString('en-GB'), event: 'A* Pathfinding Mesh Active', type: 'success' },
  ],

  // ═══ ACTIONS ═══

  setVenue: (venue) => set({
    venue,
    venueId: venue.id,
    expectedCrowd: venue.defaultCrowd,
    uploadedSvgContent: null,
    uploadedSvgName: null,
  }),

  setCrowd: (expectedCrowd) => set({ expectedCrowd }),

  setPhase: (schedulePhase) => set({ schedulePhase }),

  // Graph actions
  setGraph: ({ nodes, edges, nodeMap, entryNodes, exitNodes, viewBox }) => set({
    nodes, edges, nodeMap, entryNodes, exitNodes,
    viewBox: viewBox || { width: 1000, height: 600 },
  }),

  updateCongestionWeights: (weights) => {
    const state = get();
    const weightMap = new Map();
    if (Array.isArray(weights)) {
      weights.forEach(w => weightMap.set(w.id, w.congestion));
    }

    const updatedNodes = state.nodes.map(n => ({
      ...n,
      congestion: weightMap.has(n.id) ? weightMap.get(n.id) : n.congestion,
    }));

    const updatedNodeMap = new Map();
    updatedNodes.forEach(n => updatedNodeMap.set(n.id, n));

    const congestionWeights = {};
    weightMap.forEach((v, k) => { congestionWeights[k] = v; });

    set({ nodes: updatedNodes, nodeMap: updatedNodeMap, congestionWeights });
  },

  // AI prediction actions
  setLoading: (isLoading) => set({ isLoading }),

  setError: (predictionError) => set({ predictionError }),

  updatePrediction: (prediction) => {
    const state = get();
    const history = [...state.predictionHistory, prediction.pressureMetrics?.peakDensity || 0].slice(-10);

    set({
      lastPrediction: prediction,
      predictionError: null,
      repellers: Array.isArray(prediction.repellers) ? prediction.repellers : state.repellers,
      attractors: Array.isArray(prediction.attractors) ? prediction.attractors : state.attractors,
      pressureMetrics: prediction.pressureMetrics || state.pressureMetrics,
      predictionHistory: history,
    });

    // Update node congestion weights
    if (Array.isArray(prediction.nodeWeights) && prediction.nodeWeights.length > 0) {
      get().updateCongestionWeights(prediction.nodeWeights);
    }
  },

  // Routes actions
  setEscapePaths: (escapePaths) => set({ escapePaths }),

  setSelectedPath: (selectedPath) => set({ selectedPath }),

  setReroutingActive: (isReroutingActive) => set({ isReroutingActive }),

  toggleRerouting: () => set((state) => ({ isReroutingActive: !state.isReroutingActive })),

  // Sensor actions
  setSensorMode: (sensorMode) => set({ sensorMode }),

  updateNodeCounts: (nodeCounts) => set((state) => ({
    nodeCounts,
    sensorPacketCount: state.sensorPacketCount + 1,
  })),

  // UI actions
  setShowGraphOverlay: (show) => set({ showGraphOverlay: show }),

  toggleGraphOverlay: () => set((state) => ({ showGraphOverlay: !state.showGraphOverlay })),

  setUploadedSvg: (content, name) => set({
    uploadedSvgContent: content,
    uploadedSvgName: name,
  }),

  clearUploadedSvg: () => set({
    uploadedSvgContent: null,
    uploadedSvgName: null,
  }),

  setMouseCoords: (coords) => set({ mouseCoords: coords }),

  // Log actions
  addLog: (event, type = 'info') => set((state) => ({
    logFeed: [
      { id: Date.now(), time: new Date().toLocaleTimeString('en-GB'), event, type },
      ...state.logFeed.slice(0, 8),
    ],
  })),
}));

export default useKineticStore;
