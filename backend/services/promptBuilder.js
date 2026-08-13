/**
 * promptBuilder.js — Dynamic AI Prompt Construction
 * Builds tight, output-enforced system+user prompt for HF inference.
 */

/**
 * Build the system and user prompts for crowd analysis.
 * @param {string} venueType - e.g. "Central Railway Terminal"
 * @param {number} expectedCrowd - e.g. 50000
 * @param {string} schedulePhase - e.g. "Post-Event Mass Exit"
 * @param {string[]} nodes - Array of node description strings
 * @returns {{ system: string, user: string }}
 */
export function buildPrompt(venueType, expectedCrowd, schedulePhase, nodes) {
  const system = `You are a crowd safety AI for ${venueType}.
Analyze crowd dynamics and return ONLY a valid JSON object.
No markdown. No explanation. No backticks. Only the JSON.

RULES:
- congestion values: 0.0 (clear) to 1.0 (critical crush danger)
- repellers represent high-density danger zones (coordinates 0.0–1.0, normalized)
- attractors represent optimal exit/dispersal points
- peakDensity is people per square meter (0–10 scale, >4.5 is dangerous)
- flowVelocity is average crowd movement speed in m/s
- reason strings: max 8 words, factual, no fluff`;

  const nodeList = Array.isArray(nodes) && nodes.length > 0
    ? nodes.join(', ')
    : 'N_MAIN_CHOKE (Main Concourse), N_WEST_BYPASS (West Bypass), N_EAST_BYPASS (East Bypass)';

  const user = `Venue: ${venueType}
Expected crowd: ${expectedCrowd.toLocaleString()} people
Event phase: ${schedulePhase}
Venue nodes: ${nodeList}

Analyze each node for congestion risk given the crowd size and phase.
Consider: entry/exit bottlenecks, corridor capacity, simultaneous egress pressure.

Return this exact JSON structure:
{
  "nodeWeights": [
    { "id": "NODE_ID", "congestion": 0.0, "reason": "brief reason" }
  ],
  "repellers": [
    { "x": 0.0, "y": 0.0, "force": 1.0, "radius": 0.1 }
  ],
  "attractors": [
    { "x": 0.0, "y": 0.0, "force": 1.0 }
  ],
  "pressureMetrics": {
    "peakDensity": 0.0,
    "flowVelocity": 0.0
  }
}`;

  return { system, user };
}

export default { buildPrompt };
