/**
 * venues.js — GET /api/venues
 * Returns preset venue configurations.
 */
import { Router } from 'express';

const router = Router();

const VENUES = [
  { id: 'railway-terminal', name: 'Central Railway Terminal', description: 'Mumbai-scale terminus, 12 platforms', defaultCrowd: 45000, maxCrowd: 200000, nodeCount: 15 },
  { id: 'ipl-stadium', name: 'IPL Cricket Stadium', description: '80,000-seat cricket ground', defaultCrowd: 78000, maxCrowd: 100000, nodeCount: 15 },
  { id: 'kumbh-ghat', name: 'Kumbh Mela Ghat Sector', description: 'Riverbank pilgrimage sector', defaultCrowd: 500000, maxCrowd: 5000000, nodeCount: 12 },
  { id: 'music-festival', name: 'Open-Air Music Festival', description: 'Multi-stage outdoor festival', defaultCrowd: 25000, maxCrowd: 80000, nodeCount: 12 },
];

router.get('/', (req, res) => {
  res.json(VENUES);
});

export default router;
