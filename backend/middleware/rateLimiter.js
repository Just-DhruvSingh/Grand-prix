/**
 * rateLimiter.js — Express Rate Limiting Middleware
 * 30 requests per minute per IP.
 */
import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      message: 'Too many requests, please try again later.',
      type: 'RateLimitError',
    },
  },
});

export default apiLimiter;
