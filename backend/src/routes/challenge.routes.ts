/**
 * Challenge Routes
 */

import { Router } from 'express';
import {
  getDailyChallenge,
  submitChallengeAttempt,
} from '../controllers/challengeController';
import { validateBody, validateQuery } from '../middleware/validate';
import {
  GetDailyChallengeSchema,
  SubmitDailyChallengeSchema,
} from '../validators/schemas';
import { apiLimiter, strictLimiter } from '../middleware/rateLimiter';

const router = Router();

/**
 * GET /api/challenge/daily
 * Get today's daily challenge
 */
router.get(
  '/daily',
  apiLimiter,
  validateQuery(GetDailyChallengeSchema),
  getDailyChallenge
);

/**
 * POST /api/challenge/daily/attempt
 * Submit daily challenge attempt
 */
router.post(
  '/daily/attempt',
  strictLimiter,
  validateBody(SubmitDailyChallengeSchema),
  submitChallengeAttempt
);

export default router;
