/**
 * Season Controller
 */

import { Request, Response } from 'express';
import { getCurrentSeason, createSeason } from '../lib/queries';
import { ApiError, asyncHandler } from '../middleware/errorHandler';
import { prisma } from '../lib/prisma';

/**
 * GET /api/season/current
 * Get current active season
 */
export const getCurrentSeasonInfo = asyncHandler(
  async (req: Request, res: Response) => {
    const season = await getCurrentSeason();

    if (!season) {
      throw new ApiError(404, 'NO_ACTIVE_SEASON', 'No active season found');
    }

    // Calculate days remaining
    const now = new Date();
    const endTime = new Date(season.endTime);
    const daysRemaining = Math.max(
      0,
      Math.ceil((endTime.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    );

    res.json({
      success: true,
      data: {
        ...season,
        prizePool: season.prizePool?.toString() ?? null,
        daysRemaining,
      },
    });
  }
);

/**
 * GET /api/season/all
 * Get all seasons
 */
export const getAllSeasons = asyncHandler(
  async (req: Request, res: Response) => {
    const seasons = await prisma.season.findMany({
      orderBy: { seasonId: 'desc' },
      include: {
        _count: {
          select: {
            matches: true,
            leaderboardCache: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: {
        seasons: seasons.map((s) => ({
          id: s.id,
          seasonId: s.seasonId,
          name: s.name,
          startTime: s.startTime,
          endTime: s.endTime,
          isActive: s.isActive,
          totalPlayers: s.totalPlayers,
          totalMatches: s.totalMatches,
          prizePool: s.prizePool?.toString() ?? null,
          createdAt: s.createdAt,
          updatedAt: s.updatedAt,
          matchCount: s._count.matches,
          playerCount: s._count.leaderboardCache,
        })),
      },
    });
  }
);

/**
 * POST /api/season/create
 * Create new season (admin only)
 */
export const createNewSeason = asyncHandler(
  async (req: Request, res: Response) => {
    const { seasonId, name, startTime, endTime, prizePool } = req.body;

    // TODO: Add admin authentication middleware

    // Check if season ID already exists
    const existingSeason = await prisma.season.findUnique({
      where: { seasonId },
    });

    if (existingSeason) {
      throw new ApiError(
        409,
        'SEASON_EXISTS',
        'Season with this ID already exists'
      );
    }

    const season = await createSeason({
      seasonId,
      name,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      prizePool,
    });

    res.status(201).json({
      success: true,
      data: {
        season: {
          ...season,
          prizePool: season.prizePool?.toString() ?? null,
        },
        message: 'Season created successfully',
      },
    });
  }
);
