/**
 * huggingface.js — Hugging Face Inference API Client
 * Axios-based with retry, typed errors, and router endpoint resolution.
 */
import axios from 'axios';

const HF_MODEL = process.env.HF_MODEL || 'Qwen/Qwen2.5-7B-Instruct';
const HF_BASE_URL = 'https://router.huggingface.co/v1/chat/completions';
const TIMEOUT = 60000;
const MAX_RETRIES = 2;
const RETRY_DELAY = 2000;

// Typed error classes
export class HFTimeoutError extends Error {
  constructor(msg) { super(msg); this.name = 'HFTimeoutError'; }
}
export class HFRateLimitError extends Error {
  constructor(msg) { super(msg); this.name = 'HFRateLimitError'; }
}
export class HFModelError extends Error {
  constructor(msg) { super(msg); this.name = 'HFModelError'; }
}

/**
 * Call Hugging Face inference API.
 * @param {string} systemPrompt
 * @param {string} userPrompt
 * @param {string} token - HF API token
 * @returns {Promise<string>} Raw text response from the model
 */
export async function callHuggingFace(systemPrompt, userPrompt, token) {
  if (!token) throw new HFModelError('No HF API token configured');

  const payload = {
    model: HF_MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    max_tokens: 800,
    temperature: 0.1,
  };

  let lastError;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await axios.post(HF_BASE_URL, payload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        timeout: TIMEOUT,
      });

      // Extract response text
      if (response.data?.choices?.[0]?.message?.content) {
        return response.data.choices[0].message.content.trim();
      }
      if (Array.isArray(response.data) && response.data[0]?.generated_text) {
        return response.data[0].generated_text.trim();
      }
      if (typeof response.data === 'string') {
        return response.data.trim();
      }

      return JSON.stringify(response.data);

    } catch (error) {
      lastError = error;

      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        throw new HFTimeoutError(`HF request timed out after ${TIMEOUT}ms`);
      }

      const status = error.response?.status;
      const errorData = error.response?.data;

      if (status === 429) {
        throw new HFRateLimitError('HF rate limit exceeded');
      }

      if (status === 503 && attempt < MAX_RETRIES) {
        console.warn(`[HF] Model loading (503), retrying in ${RETRY_DELAY}ms... (${attempt + 1}/${MAX_RETRIES})`);
        await new Promise(r => setTimeout(r, RETRY_DELAY));
        continue;
      }

      if (errorData?.error) {
        throw new HFModelError(errorData.error);
      }

      throw new HFModelError(error.message);
    }
  }

  throw lastError;
}

export default { callHuggingFace, HFTimeoutError, HFRateLimitError, HFModelError };
