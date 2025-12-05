/**
 * Season Routes
 */

import { Router } from 'express';
import {
  getCurrentSeasonInfo,
  getAllSeasons,
  createNewSeason,
} from '../controllers/seasonController';
import { validateBody } from '../middleware/validate';
import { CreateSeasonSchema } from '../validators/schemas';
import { apiLimiter, strictLimiter } from '../middleware/rateLimiter';

const router = Router();

/**
 * GET /api/season/current
 * Get current active season
 */
router.get('/current', apiLimiter, getCurrentSeasonInfo);

/**
 * GET /api/season/all
 * Get all seasons
 */
router.get('/all', apiLimiter, getAllSeasons);

/**
 * POST /api/season/create
 * Create new season (admin only)
 * TODO: Add admin authentication middleware
 */
router.post(
  '/create',
  strictLimiter,
  validateBody(CreateSeasonSchema),
  createNewSeason
);

export default router;
