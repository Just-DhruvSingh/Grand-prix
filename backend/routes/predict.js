/**
 * predict.js — POST /api/predict-bottleneck
 * Core prediction route using HF inference + local fallback.
 */
import { Router } from 'express';
import { buildPrompt } from '../services/promptBuilder.js';
import { callHuggingFace } from '../services/huggingface.js';
import { parseHFResponse } from '../services/responseParser.js';

const router = Router();

/**
 * Generate dynamic fallback tensors when HF API is unavailable.
 */
function generateFallback(venueType, expectedCrowd, schedulePhase, nodes) {
  const crowdRatio = expectedCrowd / 100000;
  const phaseMultiplier =
    schedulePhase === 'Post-Event Mass Exit' ? 1.35 :
    schedulePhase === 'Emergency Evacuation' ? 1.5 :
    schedulePhase === 'Halftime / Intermission' ? 1.15 :
    0.95;

  const peakDensity = parseFloat(Math.min(9.9, crowdRatio * phaseMultiplier * 9.2).toFixed(1));
  const flowVelocity = parseFloat((1.2 + (1.0 - crowdRatio) * 2.5).toFixed(2));

  const nodeWeights = Array.isArray(nodes) ? nodes.map(node => {
    let congestion = 0.15;
    let reason = 'Normal flow corridor';

    const isChoke = node.isChoke || (node.id && node.id.includes('CHOKE'));
    const isBypass = node.id && (node.id.includes('BYPASS') || (node.name && node.name.toLowerCase().includes('bypass')));

    if (isChoke) {
      congestion = parseFloat(Math.min(0.98, 0.45 + crowdRatio * 0.5 * phaseMultiplier).toFixed(2));
      reason = `Bottleneck under ${schedulePhase}`;
    } else if (isBypass) {
      congestion = parseFloat((0.08 + crowdRatio * 0.1).toFixed(2));
      reason = 'Low-density bypass corridor';
    } else if (node.type === 'entry') {
      congestion = parseFloat((0.2 + crowdRatio * 0.3).toFixed(2));
      reason = 'Ingress gate corridor';
    } else if (node.type === 'exit') {
      congestion = parseFloat((0.15 + crowdRatio * 0.25).toFixed(2));
      reason = 'Egress channel';
    } else {
      congestion = parseFloat((0.10 + crowdRatio * 0.2).toFixed(2));
    }

    return { id: node.id, congestion, reason };
  }) : [];

  return {
    nodeWeights,
    repellers: [{ x: 0.50, y: 0.40, force: parseFloat((1.5 + crowdRatio * 2.0).toFixed(2)), radius: 0.20 }],
    attractors: [{ x: 0.16, y: 0.85, force: 2.0 }, { x: 0.84, y: 0.85, force: 1.8 }],
    pressureMetrics: { peakDensity, flowVelocity },
  };
}

router.post('/', async (req, res) => {
  const {
    venueType = 'Central Railway Terminal',
    expectedCrowd = 50000,
    schedulePhase = 'Event In Progress',
    nodes = [],
  } = req.body || {};

  console.log(`\n[POST /api/predict-bottleneck] Venue="${venueType}", Crowd=${expectedCrowd}, Phase="${schedulePhase}", Nodes=${nodes.length}`);

  const hfToken = process.env.HF_TOKEN || process.env.HF_API_TOKEN;
  const isPlaceholder = !hfToken || hfToken.includes('XXXX') || hfToken.includes('YourHuggingFace');

  // If no valid token, use local fallback immediately
  if (isPlaceholder) {
    const fallback = generateFallback(venueType, expectedCrowd, schedulePhase, nodes);
    console.log('[Local Physics Engine Fallback]');
    return res.json(fallback);
  }

  try {
    // Build prompt
    const nodeSummary = nodes.map(n => `${n.id} (${n.name || ''}, type:${n.type || 'corridor'}, choke:${!!n.isChoke})`);
    const { system, user } = buildPrompt(venueType, expectedCrowd, schedulePhase, nodeSummary);

    // Call HF
    const rawOutput = await callHuggingFace(system, user, hfToken);
    console.log('[HF Raw Output]:', rawOutput.substring(0, 200) + '...');

    // Parse and validate
    const prediction = parseHFResponse(rawOutput);
    console.log('[Parsed JSON Payload]:', JSON.stringify(prediction).substring(0, 200) + '...');

    // Merge fallback weights for missing nodes
    const fallback = generateFallback(venueType, expectedCrowd, schedulePhase, nodes);
    const finalWeights = prediction.nodeWeights.length > 0 ? prediction.nodeWeights : fallback.nodeWeights;

    return res.json({
      nodeWeights: finalWeights,
      repellers: prediction.repellers.length > 0 ? prediction.repellers : fallback.repellers,
      attractors: prediction.attractors.length > 0 ? prediction.attractors : fallback.attractors,
      pressureMetrics: prediction.pressureMetrics || fallback.pressureMetrics,
    });

  } catch (error) {
    console.warn('❌ HF Error:', error.name, error.message);
    const fallback = generateFallback(venueType, expectedCrowd, schedulePhase, nodes);
    return res.json(fallback);
  }
});

export default router;
