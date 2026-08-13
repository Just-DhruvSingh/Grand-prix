/**
 * health.js — GET /api/health
 */
import { Router } from 'express';

const router = Router();
const startTime = Date.now();

router.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'Kinetic Flow AI Crowd Safety Engine',
    version: '1.0.0',
    uptime: Math.floor((Date.now() - startTime) / 1000),
    timestamp: new Date().toISOString(),
  });
});

export default router;
