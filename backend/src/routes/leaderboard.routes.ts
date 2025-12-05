/**
 * Leaderboard Routes
 */

import { Router } from 'express';
import {
  getSeasonRankings,
  getGlobalRankings,
  getTopPlayers,
} from '../controllers/leaderboardController';
import { validateQuery } from '../middleware/validate';
import {
  GetLeaderboardSchema,
  GetSeasonLeaderboardSchema,
} from '../validators/schemas';
import { leaderboardLimiter } from '../middleware/rateLimiter';

const router = Router();

/**
 * GET /api/leaderboard/season/:seasonId
 * Get season leaderboard with pagination
 */
router.get(
  '/season/:seasonId',
  leaderboardLimiter,
  validateQuery(GetLeaderboardSchema),
  getSeasonRankings
);

/**
 * GET /api/leaderboard/global
 * Get global all-time leaderboard
 */
router.get(
  '/global',
  leaderboardLimiter,
  validateQuery(GetLeaderboardSchema),
  getGlobalRankings
);

/**
 * GET /api/leaderboard/top
 * Get top 100 players (current season)
 */
router.get('/top', leaderboardLimiter, getTopPlayers);

export default router;
