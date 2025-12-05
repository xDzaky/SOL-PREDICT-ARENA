/**
 * Leaderboard Controller
 */

import { Request, Response } from 'express';
import {
  getSeasonLeaderboard,
  getGlobalLeaderboard,
  getCurrentSeason,
} from '../lib/queries';
import { ApiError, asyncHandler } from '../middleware/errorHandler';

/**
 * GET /api/leaderboard/season/:seasonId
 * Get season leaderboard rankings
 */
export const getSeasonRankings = asyncHandler(
  async (req: Request, res: Response) => {
    const { seasonId } = req.params;
    const { limit = 100, offset = 0 } = req.query;

    const { entries, total } = await getSeasonLeaderboard(
      Number(seasonId),
      Number(limit),
      Number(offset)
    );

    res.json({
      success: true,
      data: {
        entries: entries.map((entry) => ({
          ...entry,
          score: entry.score.toString(),
          xp: entry.xp.toString(),
        })),
        total,
        limit: Number(limit),
        offset: Number(offset),
      },
    });
  }
);

/**
 * GET /api/leaderboard/global
 * Get all-time global leaderboard
 */
export const getGlobalRankings = asyncHandler(
  async (req: Request, res: Response) => {
    const { limit = 100, offset = 0 } = req.query;

    const { entries, total } = await getGlobalLeaderboard(
      Number(limit),
      Number(offset)
    );

    res.json({
      success: true,
      data: {
        entries: entries.map((entry) => ({
          ...entry,
          xp: entry.xp.toString(),
        })),
        total,
        limit: Number(limit),
        offset: Number(offset),
      },
    });
  }
);

/**
 * GET /api/leaderboard/top
 * Get top 100 players (current season)
 */
export const getTopPlayers = asyncHandler(
  async (req: Request, res: Response) => {
    const season = await getCurrentSeason();

    if (!season) {
      throw new ApiError(404, 'NO_ACTIVE_SEASON', 'No active season found');
    }

    const { entries, total } = await getSeasonLeaderboard(
      season.seasonId,
      100,
      0
    );

    res.json({
      success: true,
      data: {
        season: {
          id: season.seasonId,
          name: season.name,
          isActive: season.isActive,
        },
        entries: entries.map((entry) => ({
          ...entry,
          score: entry.score.toString(),
          xp: entry.xp.toString(),
        })),
        total,
      },
    });
  }
);
