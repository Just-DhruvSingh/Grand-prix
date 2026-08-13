/**
 * server.js — Kinetic Flow Backend Entry Point
 * Express 4.x with modular routes, middleware, and graceful shutdown.
 */
import express from 'express';
import dotenv from 'dotenv';
import dns from 'dns';
import helmet from 'helmet';
import morgan from 'morgan';

// Force Node.js to use IPv4 first on Windows
dns.setDefaultResultOrder('ipv4first');

dotenv.config();

import { corsMiddleware } from './middleware/cors.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';

import healthRouter from './routes/health.js';
import predictRouter from './routes/predict.js';
import venuesRouter from './routes/venues.js';

const app = express();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ─── Middleware ───
app.use(helmet({ contentSecurityPolicy: false }));
app.use(corsMiddleware);
app.use(express.json());
app.use(morgan(NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use('/api/', apiLimiter);

// ─── Routes ───
app.use('/api/health', healthRouter);
app.use('/api/predict-bottleneck', predictRouter);
app.use('/api/venues', venuesRouter);

// ─── Error Handler (must be last) ───
app.use(errorHandler);

// ─── Start Server ───
const server = app.listen(PORT, () => {
  console.log(`🚀 Kinetic Flow Backend running on http://localhost:${PORT}`);
  console.log(`📡 Health: http://localhost:${PORT}/api/health`);
  console.log(`🎯 Predict: POST http://localhost:${PORT}/api/predict-bottleneck`);
  console.log(`🏟  Venues: GET http://localhost:${PORT}/api/venues`);
  console.log(`⚙️  Environment: ${NODE_ENV}`);
});

// ─── Graceful Shutdown ───
function gracefulShutdown(signal) {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
  setTimeout(() => {
    console.warn('Forcing shutdown...');
    process.exit(1);
  }, 5000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
