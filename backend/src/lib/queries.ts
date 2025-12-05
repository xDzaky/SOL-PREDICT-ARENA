/**
 * Example Prisma Queries for SOL Predict Arena
 * 
 * This file contains common database operations optimized for read-heavy workloads.
 */

import { prisma } from '../lib/prisma';

// ============================================
// PLAYER QUERIES
// ============================================

/**
 * Find player by wallet address
 */
export async function getPlayerByWallet(walletAddress: string) {
  return await prisma.player.findUnique({
    where: { walletAddress },
    include: {
      leaderboardEntries: {
        where: {
          season: {
            isActive: true,
          },
        },
        take: 1,
      },
    },
  });
}

/**
 * Create new player
 */
export async function createPlayer(walletAddress: string, username?: string) {
  return await prisma.player.create({
    data: {
      walletAddress,
      username,
    },
  });
}

/**
 * Update player stats after match
 */
export async function updatePlayerStats(
  playerId: string,
  stats: {
    wins?: number;
    losses?: number;
    xp?: bigint;
    currentStreak?: number;
    bestStreak?: number;
    seasonPoints?: bigint;
  }
) {
  return await prisma.player.update({
    where: { id: playerId },
    data: {
      ...stats,
      totalMatches: {
        increment: 1,
      },
      lastSeen: new Date(),
    },
  });
}

/**
 * Get player match history with pagination
 */
export async function getPlayerMatchHistory(
  playerId: string,
  limit: number = 20,
  offset: number = 0
) {
  const [matches, total] = await Promise.all([
    prisma.match.findMany({
      where: {
        OR: [{ player1Id: playerId }, { player2Id: playerId }],
      },
      include: {
        player1: {
          select: {
            walletAddress: true,
            username: true,
            level: true,
          },
        },
        player2: {
          select: {
            walletAddress: true,
            username: true,
            level: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.match.count({
      where: {
        OR: [{ player1Id: playerId }, { player2Id: playerId }],
      },
    }),
  ]);

  return { matches, total };
}

// ============================================
// MATCH QUERIES
// ============================================

/**
 * Create new match
 */
export async function createMatch(data: {
  gameId: string;
  player1Id: string;
  player2Id: string;
  player1Choice: string;
  player2Choice: string;
  challengeType: string;
  startPrice?: number;
  endPrice?: number;
  priceChange?: number;
  winnerId?: string;
  result: string;
  duration: number;
  xpAwarded: number;
  seasonId?: number;
}) {
  return await prisma.match.create({
    data: {
      ...data,
      startPrice: data.startPrice ? String(data.startPrice) : undefined,
      endPrice: data.endPrice ? String(data.endPrice) : undefined,
      priceChange: data.priceChange ? String(data.priceChange) : undefined,
    },
  });
}

/**
 * Get recent matches
 */
export async function getRecentMatches(limit: number = 50) {
  return await prisma.match.findMany({
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      player1: {
        select: {
          walletAddress: true,
          username: true,
          level: true,
        },
      },
      player2: {
        select: {
          walletAddress: true,
          username: true,
          level: true,
        },
      },
    },
  });
}

// ============================================
// LEADERBOARD QUERIES (OPTIMIZED)
// ============================================

/**
 * Get season leaderboard (read-optimized with cache)
 */
export async function getSeasonLeaderboard(
  seasonId: number,
  limit: number = 100,
  offset: number = 0
) {
  const [entries, total] = await Promise.all([
    prisma.leaderboardCache.findMany({
      where: { seasonId },
      orderBy: { rank: 'asc' },
      take: limit,
      skip: offset,
    }),
    prisma.leaderboardCache.count({
      where: { seasonId },
    }),
  ]);

  return { entries, total };
}

/**
 * Get global leaderboard (all-time)
 */
export async function getGlobalLeaderboard(limit: number = 100, offset: number = 0) {
  const [players, total] = await Promise.all([
    prisma.player.findMany({
      orderBy: [{ xp: 'desc' }, { wins: 'desc' }],
      take: limit,
      skip: offset,
      select: {
        id: true,
        walletAddress: true,
        username: true,
        xp: true,
        level: true,
        wins: true,
        losses: true,
        totalMatches: true,
        currentStreak: true,
        bestStreak: true,
      },
    }),
    prisma.player.count(),
  ]);

  // Add rank and win rate
  const entries = players.map((player, index) => ({
    ...player,
    rank: offset + index + 1,
    winRate: player.totalMatches > 0 ? (player.wins / player.totalMatches) * 100 : 0,
  }));

  return { entries, total };
}

/**
 * Update leaderboard cache (run periodically)
 */
export async function updateLeaderboardCache(seasonId: number) {
  // Get all players for this season
  const players = await prisma.player.findMany({
    include: {
      matchesAsPlayer1: {
        where: { seasonId },
      },
      matchesAsPlayer2: {
        where: { seasonId },
      },
    },
  });

  // Calculate rankings
  const rankings = players
    .map((player) => {
      const seasonMatches = [
        ...player.matchesAsPlayer1,
        ...player.matchesAsPlayer2,
      ];
      const seasonWins = seasonMatches.filter(
        (m) => m.winnerId === player.id
      ).length;
      const seasonLosses = seasonMatches.length - seasonWins;
      const winRate =
        seasonMatches.length > 0 ? (seasonWins / seasonMatches.length) * 100 : 0;

      return {
        playerId: player.id,
        walletAddress: player.walletAddress,
        username: player.username,
        score: player.seasonPoints,
        wins: seasonWins,
        losses: seasonLosses,
        winRate,
        totalMatches: seasonMatches.length,
        xp: player.xp,
        level: player.level,
      };
    })
    .sort((a, b) => Number(b.score - a.score))
    .map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));

  // Batch upsert to cache
  await prisma.$transaction(
    rankings.map((entry) =>
      prisma.leaderboardCache.upsert({
        where: {
          seasonId_playerId: {
            seasonId,
            playerId: entry.playerId,
          },
        },
        create: {
          seasonId,
          playerId: entry.playerId,
          walletAddress: entry.walletAddress,
          username: entry.username,
          rank: entry.rank,
          score: entry.score,
          wins: entry.wins,
          losses: entry.losses,
          winRate: String(entry.winRate),
          totalMatches: entry.totalMatches,
          xp: entry.xp,
          level: entry.level,
        },
        update: {
          rank: entry.rank,
          score: entry.score,
          wins: entry.wins,
          losses: entry.losses,
          winRate: String(entry.winRate),
          totalMatches: entry.totalMatches,
          xp: entry.xp,
          level: entry.level,
        },
      })
    )
  );

  return rankings.length;
}

// ============================================
// SEASON QUERIES
// ============================================

/**
 * Get current active season
 */
export async function getCurrentSeason() {
  return await prisma.season.findFirst({
    where: { isActive: true },
    include: {
      _count: {
        select: {
          matches: true,
          leaderboardCache: true,
        },
      },
    },
  });
}

/**
 * Create new season
 */
export async function createSeason(data: {
  seasonId: number;
  name: string;
  startTime: Date;
  endTime: Date;
  prizePool?: string;
}) {
  // Deactivate previous seasons
  await prisma.season.updateMany({
    where: { isActive: true },
    data: { isActive: false },
  });

  // Create new season
  return await prisma.season.create({
    data: {
      ...data,
      isActive: true,
    },
  });
}

// ============================================
// DAILY CHALLENGE QUERIES
// ============================================

/**
 * Get today's daily challenge
 */
export async function getTodaysChallenge() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return await prisma.dailyChallenge.findFirst({
    where: {
      challengeDate: today,
      isActive: true,
    },
    include: {
      _count: {
        select: {
          attempts: true,
        },
      },
    },
  });
}

/**
 * Create daily challenge
 */
export async function createDailyChallenge(data: {
  challengeDate: Date;
  challengeType: string;
  description: string;
  difficulty: string;
  xpReward: number;
  targetValue?: number;
  badgeReward?: number;
}) {
  return await prisma.dailyChallenge.create({
    data: {
      ...data,
      targetValue: data.targetValue ? String(data.targetValue) : undefined,
    },
  });
}

/**
 * Submit daily challenge attempt
 */
export async function submitDailyAttempt(data: {
  challengeId: string;
  playerId: string;
  playerAddress: string;
  isSuccessful: boolean;
  attemptValue?: number;
  xpEarned: number;
  badgeEarned?: number;
}) {
  return await prisma.dailyAttempt.create({
    data: {
      ...data,
      attemptValue: data.attemptValue ? String(data.attemptValue) : undefined,
    },
  });
}

/**
 * Check if player already attempted today's challenge
 */
export async function hasPlayerAttemptedToday(
  challengeId: string,
  playerId: string
): Promise<boolean> {
  const attempt = await prisma.dailyAttempt.findUnique({
    where: {
      challengeId_playerId: {
        challengeId,
        playerId,
      },
    },
  });

  return !!attempt;
}

// ============================================
// ANALYTICS QUERIES
// ============================================

/**
 * Get game statistics
 */
export async function getGameStats() {
  const [totalPlayers, totalMatches, recentPlayers] = await Promise.all([
    prisma.player.count(),
    prisma.match.count(),
    prisma.player.count({
      where: {
        lastSeen: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
    }),
  ]);

  return {
    totalPlayers,
    totalMatches,
    activePlayers24h: recentPlayers,
  };
}

/**
 * Record daily analytics
 */
export async function recordDailyAnalytics(date: Date) {
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  const [totalPlayers, newPlayers, dailyMatches, activePlayers] = await Promise.all([
    prisma.player.count(),
    prisma.player.count({
      where: {
        createdAt: {
          gte: dayStart,
          lte: dayEnd,
        },
      },
    }),
    prisma.match.findMany({
      where: {
        createdAt: {
          gte: dayStart,
          lte: dayEnd,
        },
      },
      select: {
        duration: true,
        xpAwarded: true,
      },
    }),
    prisma.player.count({
      where: {
        lastSeen: {
          gte: dayStart,
          lte: dayEnd,
        },
      },
    }),
  ]);

  const averageDuration =
    dailyMatches.length > 0
      ? Math.round(
          dailyMatches.reduce((sum, m) => sum + m.duration, 0) / dailyMatches.length
        )
      : 0;

  const totalXp = dailyMatches.reduce((sum, m) => sum + m.xpAwarded, 0);

  return await prisma.gameAnalytics.upsert({
    where: { date: dayStart },
    create: {
      date: dayStart,
      totalPlayers,
      activePlayersDaily: activePlayers,
      newPlayers,
      totalMatches: dailyMatches.length,
      averageMatchDuration: averageDuration,
      totalXpAwarded: BigInt(totalXp),
    },
    update: {
      totalPlayers,
      activePlayersDaily: activePlayers,
      newPlayers,
      totalMatches: dailyMatches.length,
      averageMatchDuration: averageDuration,
      totalXpAwarded: BigInt(totalXp),
    },
  });
}
