import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create current season
  console.log('Creating season...');
  const season = await prisma.season.create({
    data: {
      seasonId: 1,
      name: 'Season 1: Genesis',
      startTime: new Date('2024-01-01'),
      endTime: new Date('2024-03-31'),
      isActive: true,
      prizePool: '10000',
    },
  });

  // Create sample players
  console.log('Creating players...');
  const players = await Promise.all([
    prisma.player.create({
      data: {
        walletAddress: '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
        username: 'SolWhale',
        xp: BigInt(15000),
        level: 12,
        wins: 45,
        losses: 15,
        totalMatches: 60,
        currentStreak: 5,
        bestStreak: 8,
        seasonPoints: BigInt(4500),
        badges: [1, 2, 3],
      },
    }),
    prisma.player.create({
      data: {
        walletAddress: '7fUAJdStEuGbc3sM8XQzFBZ3Rk39N6xU',
        username: 'CryptoNinja',
        xp: BigInt(12000),
        level: 10,
        wins: 38,
        losses: 22,
        totalMatches: 60,
        currentStreak: 3,
        bestStreak: 6,
        seasonPoints: BigInt(3800),
        badges: [1, 2],
      },
    }),
    prisma.player.create({
      data: {
        walletAddress: '9wKgVH2Uij89KL3mN4xR5TbPs6eQ8FyC',
        username: 'DiamondHands',
        xp: BigInt(9500),
        level: 8,
        wins: 30,
        losses: 20,
        totalMatches: 50,
        currentStreak: 2,
        bestStreak: 5,
        seasonPoints: BigInt(3000),
        badges: [1],
      },
    }),
    prisma.player.create({
      data: {
        walletAddress: '2hRtPkL9MnVx4Wb6GqYz3EuAs8FcJiDp',
        username: 'MoonBoy',
        xp: BigInt(7200),
        level: 7,
        wins: 24,
        losses: 26,
        totalMatches: 50,
        currentStreak: 0,
        bestStreak: 4,
        seasonPoints: BigInt(2400),
        badges: [1],
      },
    }),
    prisma.player.create({
      data: {
        walletAddress: '4kTyLp8QzWxN9Vb3MsEr2JuHg6FcDiAn',
        username: 'BullRunner',
        xp: BigInt(5800),
        level: 6,
        wins: 20,
        losses: 20,
        totalMatches: 40,
        currentStreak: 1,
        bestStreak: 3,
        seasonPoints: BigInt(2000),
        badges: [],
      },
    }),
    prisma.player.create({
      data: {
        walletAddress: '8pLkM3NqTx2Wy4Vb9JsEr5GuHc1FiDpZ',
        username: 'PricePredictor',
        xp: BigInt(4500),
        level: 5,
        wins: 15,
        losses: 15,
        totalMatches: 30,
        currentStreak: 0,
        bestStreak: 3,
        seasonPoints: BigInt(1500),
        badges: [],
      },
    }),
    prisma.player.create({
      data: {
        walletAddress: '6nWxR9KpLy8Vz2Tb4MqEu7JsHg3FcDiB',
        username: 'SOLTrader',
        xp: BigInt(3200),
        level: 4,
        wins: 12,
        losses: 18,
        totalMatches: 30,
        currentStreak: 0,
        bestStreak: 2,
        seasonPoints: BigInt(1200),
        badges: [],
      },
    }),
    prisma.player.create({
      data: {
        walletAddress: '3mYzQ8NpKx7Wv5Ub2JqEs9TrHf4GcDiL',
        username: 'Rookie123',
        xp: BigInt(1800),
        level: 3,
        wins: 8,
        losses: 12,
        totalMatches: 20,
        currentStreak: 0,
        bestStreak: 2,
        seasonPoints: BigInt(800),
        badges: [],
      },
    }),
    prisma.player.create({
      data: {
        walletAddress: '9kLxP2MnTy6Wz8Vb4JsEr1QuHg5FcDiC',
        username: 'NewPlayer',
        xp: BigInt(800),
        level: 2,
        wins: 3,
        losses: 7,
        totalMatches: 10,
        currentStreak: 0,
        bestStreak: 1,
        seasonPoints: BigInt(300),
        badges: [],
      },
    }),
    prisma.player.create({
      data: {
        walletAddress: '5jKxQ7NpLy9Wz3Vb6MqEs2TrHg8FcDiA',
        username: 'FreshStart',
        xp: BigInt(200),
        level: 1,
        wins: 1,
        losses: 4,
        totalMatches: 5,
        currentStreak: 0,
        bestStreak: 1,
        seasonPoints: BigInt(100),
        badges: [],
      },
    }),
  ]);

  // Create sample matches
  console.log('Creating matches...');
  const matches = [];
  for (let i = 0; i < 50; i++) {
    const player1 = players[Math.floor(Math.random() * players.length)];
    let player2 = players[Math.floor(Math.random() * players.length)];
    while (player2.id === player1.id) {
      player2 = players[Math.floor(Math.random() * players.length)];
    }

    const choices = ['UP', 'DOWN'];
    const player1Choice = choices[Math.floor(Math.random() * choices.length)];
    const player2Choice = choices[Math.floor(Math.random() * choices.length)];

    const startPrice = 100 + Math.random() * 50; // $100-$150
    const priceChange = (Math.random() - 0.5) * 5; // -$2.50 to +$2.50
    const endPrice = startPrice + priceChange;

    const actualDirection = priceChange >= 0 ? 'UP' : 'DOWN';
    const player1Correct = player1Choice === actualDirection;
    const player2Correct = player2Choice === actualDirection;

    let winnerId: string | null = null;
    let result: string;
    if (player1Correct && !player2Correct) {
      winnerId = player1.id;
      result = 'PLAYER1_WIN';
    } else if (!player1Correct && player2Correct) {
      winnerId = player2.id;
      result = 'PLAYER2_WIN';
    } else {
      result = 'DRAW';
    }

    const match = await prisma.match.create({
      data: {
        gameId: `game_${Date.now()}_${i}`,
        player1Id: player1.id,
        player2Id: player2.id,
        player1Choice,
        player2Choice,
        challengeType: 'PRICE_PREDICTION',
        startPrice: startPrice.toFixed(8),
        endPrice: endPrice.toFixed(8),
        priceChange: priceChange.toFixed(8),
        winnerId,
        result,
        duration: 30,
        xpAwarded: winnerId ? 100 : 25,
        seasonId: season.seasonId,
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random within last week
      },
    });

    matches.push(match);
  }

  // Update leaderboard cache
  console.log('Building leaderboard cache...');
  const leaderboardEntries = players
    .map((player, index) => ({
      seasonId: season.seasonId,
      playerId: player.id,
      walletAddress: player.walletAddress,
      username: player.username,
      rank: index + 1,
      score: player.seasonPoints,
      wins: player.wins,
      losses: player.losses,
      winRate: player.totalMatches > 0 
        ? ((player.wins / player.totalMatches) * 100).toFixed(2)
        : '0.00',
      totalMatches: player.totalMatches,
      xp: player.xp,
      level: player.level,
    }))
    .sort((a, b) => Number(b.score - a.score))
    .map((entry, index) => ({ ...entry, rank: index + 1 }));

  await prisma.leaderboardCache.createMany({
    data: leaderboardEntries,
  });

  // Create today's daily challenge
  console.log('Creating daily challenge...');
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dailyChallenge = await prisma.dailyChallenge.create({
    data: {
      challengeDate: today,
      challengeType: 'STREAK_MASTER',
      description: 'Win 3 matches in a row',
      difficulty: 'MEDIUM',
      xpReward: 500,
      targetValue: '3',
      isActive: true,
    },
  });

  // Add some daily attempts
  console.log('Creating daily attempts...');
  await Promise.all([
    prisma.dailyAttempt.create({
      data: {
        challengeId: dailyChallenge.id,
        playerId: players[0].id,
        playerAddress: players[0].walletAddress,
        isSuccessful: true,
        attemptValue: '3',
        xpEarned: 500,
      },
    }),
    prisma.dailyAttempt.create({
      data: {
        challengeId: dailyChallenge.id,
        playerId: players[1].id,
        playerAddress: players[1].walletAddress,
        isSuccessful: false,
        attemptValue: '2',
        xpEarned: 0,
      },
    }),
  ]);

  // Create game analytics
  console.log('Creating analytics...');
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);

  await prisma.gameAnalytics.create({
    data: {
      date: yesterday,
      totalPlayers: players.length,
      activePlayersDaily: 8,
      newPlayers: 2,
      totalMatches: 50,
      averageMatchDuration: 30,
      totalXpAwarded: BigInt(5000),
    },
  });

  console.log('✅ Seeding completed!');
  console.log(`   - Created ${players.length} players`);
  console.log(`   - Created ${matches.length} matches`);
  console.log(`   - Created 1 active season`);
  console.log(`   - Created leaderboard cache with ${leaderboardEntries.length} entries`);
  console.log(`   - Created 1 daily challenge with 2 attempts`);
  console.log(`   - Created 1 analytics record`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
