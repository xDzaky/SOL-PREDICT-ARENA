/**
 * Player Routes
 */

import { Router } from 'express';
import {
  getPlayer,
  initializePlayer,
  getPlayerHistory,
  getPlayerStats,
} from '../controllers/playerController';
import { validateBody, validateQuery } from '../middleware/validate';
import {
  InitializePlayerSchema,
  GetPlayerHistorySchema,
  PaginationSchema,
} from '../validators/schemas';
import { profileLimiter, strictLimiter } from '../middleware/rateLimiter';

const router = Router();

/**
 * GET /api/player/:address
 * Get player profile
 */
router.get('/:address', profileLimiter, getPlayer);

/**
 * POST /api/player/initialize
 * Create new player profile
 */
router.post(
  '/initialize',
  strictLimiter,
  validateBody(InitializePlayerSchema),
  initializePlayer
);

/**
 * GET /api/player/:address/history
 * Get match history with pagination
 */
router.get(
  '/:address/history',
  profileLimiter,
  validateQuery(PaginationSchema),
  getPlayerHistory
);

/**
 * GET /api/player/:address/stats
 * Get detailed player statistics
 */
router.get('/:address/stats', profileLimiter, getPlayerStats);

export default router;
