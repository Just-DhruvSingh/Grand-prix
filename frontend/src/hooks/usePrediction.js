/**
 * usePrediction.js — Debounced AI Prediction Hook
 * Fires a prediction request 800ms after the user stops adjusting controls.
 * Dispatches results to Zustand store on success, uses mock fallback on error.
 */
import { useEffect, useRef, useCallback } from 'react';
import { predictBottleneck } from '../lib/api';
import useKineticStore from './useKineticStore';

const DEBOUNCE_MS = 800;

/**
 * Mock fallback payload — used when the API is unreachable or returns invalid data.
 */
const MOCK_PAYLOAD = {
  nodeWeights: [
    { id: 'N_MAIN_CONCOURSE', congestion: 0.87, reason: 'Post-event mass convergence' },
    { id: 'N_GATE1', congestion: 0.72, reason: 'Entry funnel bottleneck' },
    { id: 'N_EXIT_NORTH', congestion: 0.18, reason: 'Underutilized clear exit' },
    { id: 'N_PLATFORM_A', congestion: 0.95, reason: 'Platform crowd surge critical' },
  ],
  repellers: [
    { x: 0.50, y: 0.40, force: 2.8, radius: 0.18 },
    { x: 0.30, y: 0.60, force: 1.9, radius: 0.12 },
  ],
  attractors: [
    { x: 0.12, y: 0.85, force: 2.1 },
    { x: 0.88, y: 0.20, force: 1.7 },
  ],
  pressureMetrics: { peakDensity: 5.8, flowVelocity: 0.42 },
};

export function usePrediction() {
  const debounceRef = useRef(null);

  const venue = useKineticStore((s) => s.venue);
  const expectedCrowd = useKineticStore((s) => s.expectedCrowd);
  const schedulePhase = useKineticStore((s) => s.schedulePhase);
  const nodes = useKineticStore((s) => s.nodes);
  const isLoading = useKineticStore((s) => s.isLoading);
  const lastPrediction = useKineticStore((s) => s.lastPrediction);
  const predictionError = useKineticStore((s) => s.predictionError);

  const setLoading = useKineticStore((s) => s.setLoading);
  const setError = useKineticStore((s) => s.setError);
  const updatePrediction = useKineticStore((s) => s.updatePrediction);
  const addLog = useKineticStore((s) => s.addLog);

  const predict = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const payloadNodes = nodes.map((n) => ({
        id: n.id,
        name: n.name,
        type: n.type,
        isChoke: !!n.isChoke,
      }));

      const data = await predictBottleneck({
        venueType: venue?.name || 'Central Railway Terminal',
        expectedCrowd,
        schedulePhase,
        nodes: payloadNodes,
      });

      updatePrediction(data);
      addLog(
        `AI Prediction: ${data.nodeWeights?.length || 0} nodes scored | ${data.repellers?.length || 1} repellers`,
        'info'
      );
    } catch (err) {
      console.warn('⚠️ Prediction API error, using fallback:', err.message);
      setError(err.message);

      // Generate context-aware fallback weights for actual nodes
      const fallbackWeights = nodes.map((n) => {
        const crowdRatio = expectedCrowd / 100000;
        let congestion = 0.15;
        if (n.isChoke) congestion = Math.min(0.98, 0.45 + crowdRatio * 0.5);
        else if (n.type === 'entry') congestion = 0.2 + crowdRatio * 0.3;
        else if (n.type === 'exit') congestion = 0.15 + crowdRatio * 0.25;
        else congestion = 0.10 + crowdRatio * 0.2;
        return { id: n.id, congestion: parseFloat(congestion.toFixed(2)), reason: 'Local physics engine' };
      });

      const fallback = {
        ...MOCK_PAYLOAD,
        nodeWeights: fallbackWeights.length > 0 ? fallbackWeights : MOCK_PAYLOAD.nodeWeights,
      };

      updatePrediction(fallback);
      addLog('Fallback: Local physics engine activated', 'warning');
    } finally {
      setLoading(false);
    }
  }, [venue, expectedCrowd, schedulePhase, nodes, setLoading, setError, updatePrediction, addLog]);

  // Auto-trigger debounced prediction when inputs change
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    setLoading(true);
    debounceRef.current = setTimeout(() => {
      predict();
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [venue?.id, expectedCrowd, schedulePhase, nodes.length]);

  return { isLoading, lastPrediction, predictionError, predict };
}

export default usePrediction;
