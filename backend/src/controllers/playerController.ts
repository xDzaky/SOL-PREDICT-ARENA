/**
 * Player Controller
 */

import { Request, Response } from 'express';
import {
  getPlayerByWallet,
  createPlayer,
  getPlayerMatchHistory,
  updatePlayerStats,
} from '../lib/queries';
import { ApiError, asyncHandler } from '../middleware/errorHandler';
import { getCurrentSeason, getSeasonLeaderboard } from '../lib/queries';

/**
 * GET /api/player/:address
 * Get player profile by wallet address
 */
export const getPlayer = asyncHandler(async (req: Request, res: Response) => {
  const { address } = req.params;

  const player = await getPlayerByWallet(address);

  if (!player) {
    throw new ApiError(404, 'PLAYER_NOT_FOUND', 'Player profile not found');
  }

  // Get player's current season rank
  let rank = null;
  const season = await getCurrentSeason();
  if (season) {
    const { entries } = await getSeasonLeaderboard(season.seasonId, 1000, 0);
    const rankEntry = entries.find((e) => e.playerId === player.id);
    rank = rankEntry?.rank ?? null;
  }

  // Calculate win rate
  const winRate =
    player.totalMatches > 0
      ? Math.round((player.wins / player.totalMatches) * 100 * 100) / 100
      : 0;

  res.json({
    success: true,
    data: {
      ...player,
      xp: player.xp.toString(),
      seasonPoints: player.seasonPoints.toString(),
      rank,
      winRate,
    },
  });
});

/**
 * POST /api/player/initialize
 * Create new player profile
 */
export const initializePlayer = asyncHandler(
  async (req: Request, res: Response) => {
    const { walletAddress, username } = req.body;

    // Check if player already exists
    const existingPlayer = await getPlayerByWallet(walletAddress);
    if (existingPlayer) {
      throw new ApiError(409, 'PLAYER_EXISTS', 'Player already initialized');
    }

    // Create player
    const player = await createPlayer(walletAddress, username);

    res.status(201).json({
      success: true,
      data: {
        player: {
          ...player,
          xp: player.xp.toString(),
          seasonPoints: player.seasonPoints.toString(),
        },
        message: 'Player profile created successfully',
      },
    });
  }
);

/**
 * GET /api/player/:address/history
 * Get player match history with pagination
 */
export const getPlayerHistory = asyncHandler(
  async (req: Request, res: Response) => {
    const { address } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    // Verify player exists
    const player = await getPlayerByWallet(address);
    if (!player) {
      throw new ApiError(404, 'PLAYER_NOT_FOUND', 'Player profile not found');
    }

    const { matches, total } = await getPlayerMatchHistory(
      player.id,
      Number(limit),
      Number(offset)
    );

    res.json({
      success: true,
      data: {
        matches,
        total,
        limit: Number(limit),
        offset: Number(offset),
      },
    });
  }
);

/**
 * GET /api/player/:address/stats
 * Get detailed player statistics
 */
export const getPlayerStats = asyncHandler(
  async (req: Request, res: Response) => {
    const { address } = req.params;

    const player = await getPlayerByWallet(address);
    if (!player) {
      throw new ApiError(404, 'PLAYER_NOT_FOUND', 'Player profile not found');
    }

    // Get match history for stats calculation
    const { matches } = await getPlayerMatchHistory(player.id, 50, 0);

    // Calculate stats
    const winRate =
      player.totalMatches > 0
        ? Math.round((player.wins / player.totalMatches) * 100 * 100) / 100
        : 0;

    const averageXpPerMatch =
      player.totalMatches > 0
        ? Math.round(Number(player.xp) / player.totalMatches)
        : 0;

    // Recent form (last 10 matches)
    const recentMatches = matches.slice(0, 10);
    const recentForm = recentMatches
      .map((m) => {
        if (m.winnerId === player.id) return 'W';
        if (m.result === 'DRAW') return 'D';
        return 'L';
      })
      .join('');

    // Get rankings
    let globalRank = null;
    let seasonRank = null;

    const season = await getCurrentSeason();
    if (season) {
      const { entries, total } = await getSeasonLeaderboard(
        season.seasonId,
        1000,
        0
      );
      const rankEntry = entries.find((e) => e.playerId === player.id);
      if (rankEntry) {
        seasonRank = rankEntry.rank;
        const percentile =
          total > 0 ? Math.round((1 - rankEntry.rank / total) * 100) : null;

        res.json({
          success: true,
          data: {
            player: {
              ...player,
              xp: player.xp.toString(),
              seasonPoints: player.seasonPoints.toString(),
            },
            stats: {
              winRate,
              averageXpPerMatch,
              totalXpEarned: player.xp.toString(),
              matchesPerDay: 0, // TODO: Calculate from match history
              favoriteGameMode: 'PRICE_PREDICTION', // TODO: Calculate from matches
              bestWinStreak: player.bestStreak,
              recentForm,
            },
            rankings: {
              globalRank,
              seasonRank,
              percentile,
            },
          },
        });
        return;
      }
    }

    res.json({
      success: true,
      data: {
        player: {
          ...player,
          xp: player.xp.toString(),
          seasonPoints: player.seasonPoints.toString(),
        },
        stats: {
          winRate,
          averageXpPerMatch,
          totalXpEarned: player.xp.toString(),
          matchesPerDay: 0,
          favoriteGameMode: 'PRICE_PREDICTION',
          bestWinStreak: player.bestStreak,
          recentForm,
        },
        rankings: {
          globalRank,
          seasonRank,
          percentile: null,
        },
      },
    });
  }
);
