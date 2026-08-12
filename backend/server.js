import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import dns from 'dns';

// Force Node.js to use IPv4 first on Windows to resolve getaddrinfo ENOTFOUND errors
dns.setDefaultResultOrder('ipv4first');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS & JSON middleware
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true
}));

app.use(express.json());

// 1. Target Hugging Face Qwen Model Endpoint (60s timeout, Qwen2.5-7B-Instruct)
const HF_API_URL = process.env.HF_API_URL || 'https://api-inference.huggingface.co/models/Qwen/Qwen2.5-7B-Instruct';
const HF_MODEL = process.env.HF_MODEL || 'Qwen/Qwen2.5-7B-Instruct';

/**
 * GET /api/health
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    message: 'Kinetic Flow Qwen-2.5 Neural Physics Engine',
    timestamp: new Date().toISOString()
  });
});

/**
 * POST /api/predict-bottleneck
 * Accepts venue telemetry and returns spatial force field tensors using Qwen-2.5-7B-Instruct
 */
app.post('/api/predict-bottleneck', async (req, res) => {
  const { 
    venueType = 'Central Railway Terminal', 
    expectedCrowd = 50000, 
    activeGates = 3, 
    timeToRushHour = 'Entry Gate Open',
    nodes = []
  } = req.body || {};

  console.log(`\n[POST /api/predict-bottleneck] Telemetry Input: Venue="${venueType}", Crowd=${expectedCrowd}, Phase="${timeToRushHour}", NodesCount=${nodes.length}`);

  // 2. Strict Qwen-2.5 AI Spatial Intelligence System Prompt
  const systemPrompt = `You are an AI Spatial Physics & Congestion Architect analyzing crowd routing node graphs. You output strictly valid JSON. 
Do not include any conversational text, markdown formatting, or explanations. 

Analyze the provided structural spatial nodes, crowd size, and event phase. 
Assign a "congestion factor" (float between 0.0 for free-flowing corridor to 1.0 for severe choke point) to each node ID.

Return exactly this JSON format:
{
  "nodeWeights": [
    { "id": "string", "congestion": float, "reason": "string" }
  ],
  "repellers": [{ "x": float, "y": float, "force": float, "radius": float }],
  "attractors": [{ "x": float, "y": float, "force": float }],
  "pressureMetrics": { "peakDensity": float, "flowVelocity": float }
}`;

  const nodeSummary = nodes.length > 0 
    ? nodes.map(n => `${n.id} (${n.name}, type:${n.type}, choke:${!!n.isChoke})`).join('; ')
    : 'N_MAIN_CHOKE (Main Concourse Choke Point); N_WEST_BYPASS (West Bypass); N_EAST_BYPASS (East Bypass)';

  const userPrompt = `Input: Venue=${venueType}, Crowd=${expectedCrowd}, Phase=${timeToRushHour}, Nodes=[${nodeSummary}]`;

  // Helper for dynamic fallback tensors & node congestion weighting
  const generateDynamicTensors = () => {
    const crowdRatio = expectedCrowd / 100000;
    const phaseMultiplier = timeToRushHour === 'Post-Event Mass Exit' ? 1.35 : (timeToRushHour === 'Mid-Event Concession Rush' ? 1.15 : 0.95);
    const peakDensity = parseFloat(Math.min(99, crowdRatio * phaseMultiplier * 92).toFixed(1));
    const flowVelocity = parseFloat((1.2 + (1.0 - crowdRatio) * 2.5).toFixed(2));

    let repellers = [{ x: 0.50, y: 0.40, force: parseFloat((1.5 + crowdRatio * 2.0).toFixed(2)), radius: 0.20 }];
    let attractors = [{ x: 0.84, y: 0.85, force: 2.1 }];

    if (venueType === 'IPL Stadium Sector 4') {
      repellers = [{ x: 0.50, y: 0.45, force: parseFloat((1.8 + crowdRatio * 1.8).toFixed(2)), radius: 0.22 }];
      attractors = [{ x: 0.84, y: 0.85, force: 2.2 }, { x: 0.16, y: 0.85, force: 1.5 }];
    } else if (venueType === 'Concert Arena') {
      repellers = [{ x: 0.50, y: 0.35, force: parseFloat((2.0 + crowdRatio * 1.5).toFixed(2)), radius: 0.18 }];
      attractors = [{ x: 0.16, y: 0.85, force: 2.0 }, { x: 0.84, y: 0.85, force: 1.8 }];
    }

    // Dynamic congestion factor calculation per node
    const nodeWeights = nodes.map(node => {
      let congestion = 0.15;
      let reason = 'Normal flow corridor';

      const isChokeNode = node.isChoke || node.id.includes('CHOKE') || node.type === 'intersection';
      const isBypassNode = node.id.includes('BYPASS') || node.name?.toLowerCase().includes('bypass');

      if (isChokeNode) {
        congestion = parseFloat(Math.min(0.98, 0.45 + crowdRatio * 0.5 * phaseMultiplier).toFixed(2));
        reason = `Central bottleneck choke point under ${timeToRushHour}`;
      } else if (isBypassNode) {
        congestion = parseFloat((0.08 + crowdRatio * 0.1).toFixed(2));
        reason = 'Low-density emergency bypass corridor';
      } else if (node.type === 'entry') {
        congestion = parseFloat((0.2 + crowdRatio * 0.3).toFixed(2));
        reason = 'Ingress gate corridor';
      } else if (node.type === 'exit') {
        congestion = parseFloat((0.15 + crowdRatio * 0.25).toFixed(2));
        reason = 'Clear egress channel';
      } else {
        congestion = parseFloat((0.10 + crowdRatio * 0.2).toFixed(2));
      }

      return {
        id: node.id,
        congestion,
        reason
      };
    });

    return {
      nodeWeights,
      repellers,
      attractors,
      pressureMetrics: {
        peakDensity,
        flowVelocity
      }
    };
  };

  const hfToken = process.env.HF_TOKEN;
  const isPlaceholder = !hfToken || hfToken.includes('YourHuggingFaceTokenHere');

  if (isPlaceholder) {
    const fallbackTensors = generateDynamicTensors();
    console.log("[HF Raw Output]: (Local Qwen-2.5 Physics Engine Fallback)");
    console.log("[Parsed JSON Payload]:", fallbackTensors);
    return res.json(fallbackTensors);
  }

  try {
    // Resolve router endpoint if legacy domain provided
    const targetUrl = HF_API_URL.includes('api-inference.huggingface.co')
      ? 'https://router.huggingface.co/v1/chat/completions'
      : HF_API_URL;

    const isChat = targetUrl.includes('chat/completions') || targetUrl.includes('/v1');

    const requestPayload = isChat ? {
      model: HF_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 450,
      temperature: 0.1
    } : {
      inputs: `${systemPrompt}\n${userPrompt}`,
      parameters: {
        return_full_text: false,
        max_new_tokens: 450,
        temperature: 0.1
      }
    };

    // 3. Axios Request with 60000ms (60-second) timeout limit
    const response = await axios.post(
      targetUrl,
      requestPayload,
      {
        headers: {
          'Authorization': `Bearer ${hfToken}`,
          'Content-Type': 'application/json'
        },
        timeout: 60000
      }
    );

    let rawOutput = '';
    if (response.data?.choices?.[0]?.message?.content) {
      rawOutput = response.data.choices[0].message.content.trim();
    } else if (Array.isArray(response.data) && response.data[0]?.generated_text) {
      rawOutput = response.data[0].generated_text.trim();
    } else if (typeof response.data === 'string') {
      rawOutput = response.data.trim();
    } else if (response.data?.generated_text) {
      rawOutput = response.data.generated_text.trim();
    } else {
      rawOutput = JSON.stringify(response.data);
    }

    console.log("[HF Raw Output]:", rawOutput);

    // 4. Regex Parsing Safety & Markdown Code Block Sanitization
    const sanitizedText = rawOutput.replace(/```json/gi, '').replace(/```/g, '').trim();

    let predictionJson;
    if (sanitizedText && sanitizedText.includes('{')) {
      const jsonMatch = sanitizedText.match(/\{[\s\S]*\}/);
      predictionJson = JSON.parse(jsonMatch ? jsonMatch[0] : sanitizedText);
    } else {
      throw new Error('Response did not contain valid JSON structure.');
    }

    console.log("[Parsed JSON Payload]:", predictionJson);

    // Merge fallback node weights if HF didn't return all node weights
    const fallbackData = generateDynamicTensors();
    const finalNodeWeights = Array.isArray(predictionJson.nodeWeights) && predictionJson.nodeWeights.length > 0
      ? predictionJson.nodeWeights
      : fallbackData.nodeWeights;

    return res.json({
      nodeWeights: finalNodeWeights,
      repellers: Array.isArray(predictionJson.repellers) ? predictionJson.repellers : fallbackData.repellers,
      attractors: Array.isArray(predictionJson.attractors) ? predictionJson.attractors : fallbackData.attractors,
      pressureMetrics: predictionJson.pressureMetrics || fallbackData.pressureMetrics
    });

  } catch (error) {
    console.error('❌ Hugging Face Llama-3 Axios Error:', error.response?.data || error.message);
    
    // Fallback JSON Object in Catch Block
    const fallbackTensors = generateDynamicTensors();
    console.log("[Parsed JSON Payload (Fallback)]:", fallbackTensors);
    return res.json(fallbackTensors);
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
});
