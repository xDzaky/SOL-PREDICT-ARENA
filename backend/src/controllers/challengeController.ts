/**
 * Challenge Controller
 */

import { Request, Response } from 'express';
import {
  getTodaysChallenge,
  createDailyChallenge,
  submitDailyAttempt,
  hasPlayerAttemptedToday,
  getPlayerByWallet,
  updatePlayerStats,
} from '../lib/queries';
import { ApiError, asyncHandler } from '../middleware/errorHandler';
import { prisma } from '../lib/prisma';

/**
 * GET /api/challenge/daily
 * Get today's daily challenge
 */
export const getDailyChallenge = asyncHandler(
  async (req: Request, res: Response) => {
    const { walletAddress } = req.query;

    const challenge = await getTodaysChallenge();

    if (!challenge) {
      throw new ApiError(
        404,
        'NO_DAILY_CHALLENGE',
        'No active daily challenge found'
      );
    }

    // Check if player has attempted
    let hasAttempted = false;
    let userAttempt = null;

    if (walletAddress) {
      const player = await getPlayerByWallet(walletAddress as string);
      if (player) {
        hasAttempted = await hasPlayerAttemptedToday(challenge.id, player.id);

        if (hasAttempted) {
          userAttempt = await prisma.dailyAttempt.findUnique({
            where: {
              challengeId_playerId: {
                challengeId: challenge.id,
                playerId: player.id,
              },
            },
          });
        }
      }
    }

    res.json({
      success: true,
      data: {
        id: challenge.id,
        challengeDate: challenge.challengeDate,
        challengeType: challenge.challengeType,
        description: challenge.description,
        targetValue: challenge.targetValue?.toString() ?? null,
        difficulty: challenge.difficulty,
        xpReward: challenge.xpReward,
        badgeReward: challenge.badgeReward,
        isActive: challenge.isActive,
        totalAttempts: challenge._count.attempts,
        hasAttempted,
        userAttempt: userAttempt
          ? {
              isSuccessful: userAttempt.isSuccessful,
              attemptValue: userAttempt.attemptValue?.toString() ?? null,
              xpEarned: userAttempt.xpEarned,
              attemptedAt: userAttempt.attemptedAt,
            }
          : null,
      },
    });
  }
);

/**
 * POST /api/challenge/daily/attempt
 * Submit daily challenge attempt
 */
export const submitChallengeAttempt = asyncHandler(
  async (req: Request, res: Response) => {
    const { challengeId, walletAddress, attemptValue } = req.body;

    // Get challenge
    const challenge = await prisma.dailyChallenge.findUnique({
      where: { id: challengeId },
    });

    if (!challenge) {
      throw new ApiError(404, 'CHALLENGE_NOT_FOUND', 'Challenge not found');
    }

    if (!challenge.isActive) {
      throw new ApiError(400, 'CHALLENGE_INACTIVE', 'Challenge is not active');
    }

    // Get player
    const player = await getPlayerByWallet(walletAddress);
    if (!player) {
      throw new ApiError(404, 'PLAYER_NOT_FOUND', 'Player profile not found');
    }

    // Check if already attempted
    const alreadyAttempted = await hasPlayerAttemptedToday(
      challengeId,
      player.id
    );
    if (alreadyAttempted) {
      throw new ApiError(
        409,
        'ALREADY_ATTEMPTED',
        'You have already attempted this challenge today'
      );
    }

    // Validate attempt based on challenge type
    let isSuccessful = false;

    switch (challenge.challengeType) {
      case 'STREAK_MASTER':
        // Check if player has required streak
        isSuccessful = player.currentStreak >= Number(challenge.targetValue);
        break;

      case 'WIN_COUNT':
        // Check total wins
        isSuccessful = player.wins >= Number(challenge.targetValue);
        break;

      case 'MATCH_COUNT':
        // Check total matches
        isSuccessful = player.totalMatches >= Number(challenge.targetValue);
        break;

      default:
        // For other types, use attemptValue
        if (attemptValue && challenge.targetValue) {
          isSuccessful = Number(attemptValue) >= Number(challenge.targetValue);
        }
    }

    // Calculate XP earned
    const xpEarned = isSuccessful ? challenge.xpReward : 0;
    const badgeEarned = isSuccessful ? challenge.badgeReward : null;

    // Submit attempt
    const attempt = await submitDailyAttempt({
      challengeId,
      playerId: player.id,
      playerAddress: walletAddress,
      isSuccessful,
      attemptValue,
      xpEarned,
      badgeEarned: badgeEarned ?? undefined,
    });

    // Update player stats if successful
    if (isSuccessful && xpEarned > 0) {
      const newXp = player.xp + BigInt(xpEarned);
      const newLevel = calculateLevel(newXp);

      await updatePlayerStats(player.id, {
        xp: newXp,
      });

      // Update total attempts count on challenge
      await prisma.dailyChallenge.update({
        where: { id: challengeId },
        data: {
          totalAttempts: { increment: 1 },
          successfulAttempts: { increment: isSuccessful ? 1 : 0 },
        },
      });

      res.json({
        success: true,
        data: {
          isSuccessful,
          xpEarned,
          badgeEarned,
          newXp: newXp.toString(),
          newLevel,
          message: isSuccessful
            ? 'Challenge completed successfully!'
            : 'Challenge attempt recorded',
        },
      });
    } else {
      // Update total attempts count
      await prisma.dailyChallenge.update({
        where: { id: challengeId },
        data: {
          totalAttempts: { increment: 1 },
        },
      });

      res.json({
        success: true,
        data: {
          isSuccessful: false,
          xpEarned: 0,
          badgeEarned: null,
          newXp: player.xp.toString(),
          newLevel: player.level,
          message: 'Challenge not completed. Try again tomorrow!',
        },
      });
    }
  }
);

/**
 * Calculate level from XP
 */
function calculateLevel(xp: bigint): number {
  const xpNum = Number(xp);
  let level = 1;
  let requiredXp = 100;

  while (xpNum >= requiredXp) {
    level++;
    requiredXp += level * 200;
  }

  return level;
}
