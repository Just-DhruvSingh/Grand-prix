/**
 * responseParser.js — JSON Extraction + Validation
 * Parses HF model output, validates schema, returns mock fallback on failure.
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

/**
 * Parse and validate HF model response.
 * @param {string} rawText - Raw text from the model
 * @returns {Object} Validated payload or MOCK_PAYLOAD
 */
export function parseHFResponse(rawText) {
  try {
    // Step 1: Strip markdown fences
    let cleaned = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();

    // Step 2: Extract first JSON object
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) {
      console.warn('[Parser] No JSON object found in response');
      return MOCK_PAYLOAD;
    }

    // Step 3: Parse
    const parsed = JSON.parse(match[0]);

    // Step 4: Validate schema
    const validated = {};

    // nodeWeights
    if (Array.isArray(parsed.nodeWeights)) {
      validated.nodeWeights = parsed.nodeWeights
        .filter(w => w && typeof w.id === 'string')
        .map(w => ({
          id: w.id,
          congestion: typeof w.congestion === 'number' ? Math.max(0, Math.min(1, w.congestion)) : 0.5,
          reason: typeof w.reason === 'string' ? w.reason.slice(0, 80) : 'Unknown',
        }));
    } else {
      validated.nodeWeights = MOCK_PAYLOAD.nodeWeights;
    }

    // repellers
    if (Array.isArray(parsed.repellers)) {
      validated.repellers = parsed.repellers
        .filter(r => r && typeof r.x === 'number' && typeof r.y === 'number')
        .map(r => ({
          x: r.x,
          y: r.y,
          force: typeof r.force === 'number' ? r.force : 1.0,
          radius: typeof r.radius === 'number' ? r.radius : 0.15,
        }));
    } else {
      validated.repellers = MOCK_PAYLOAD.repellers;
    }

    // attractors
    if (Array.isArray(parsed.attractors)) {
      validated.attractors = parsed.attractors
        .filter(a => a && typeof a.x === 'number' && typeof a.y === 'number')
        .map(a => ({
          x: a.x,
          y: a.y,
          force: typeof a.force === 'number' ? a.force : 1.0,
        }));
    } else {
      validated.attractors = MOCK_PAYLOAD.attractors;
    }

    // pressureMetrics
    if (parsed.pressureMetrics && typeof parsed.pressureMetrics === 'object') {
      validated.pressureMetrics = {
        peakDensity: typeof parsed.pressureMetrics.peakDensity === 'number' ? parsed.pressureMetrics.peakDensity : 0,
        flowVelocity: typeof parsed.pressureMetrics.flowVelocity === 'number' ? parsed.pressureMetrics.flowVelocity : 0,
      };
    } else {
      validated.pressureMetrics = MOCK_PAYLOAD.pressureMetrics;
    }

    return validated;

  } catch (error) {
    console.warn('[Parser] JSON parse failed:', error.message);
    return MOCK_PAYLOAD;
  }
}

export { MOCK_PAYLOAD };
export default { parseHFResponse, MOCK_PAYLOAD };
