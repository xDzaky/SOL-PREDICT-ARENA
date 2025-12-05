/**
 * API Routes Index
 */

import { Router } from 'express';
import playerRoutes from './player.routes';
import leaderboardRoutes from './leaderboard.routes';
import seasonRoutes from './season.routes';
import challengeRoutes from './challenge.routes';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
  });
});

// API routes
router.use('/player', playerRoutes);
router.use('/leaderboard', leaderboardRoutes);
router.use('/season', seasonRoutes);
router.use('/challenge', challengeRoutes);

export default router;
