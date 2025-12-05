/**
 * Test Database Queries
 * 
 * Run: npm run test:db
 */

import {
  getPlayerByWallet,
  getSeasonLeaderboard,
  getPlayerMatchHistory,
  getCurrentSeason,
  getTodaysChallenge,
  getGameStats,
} from '../lib/queries';

async function testQueries() {
  console.log('🧪 Testing Database Queries...\n');

  try {
    // Test 1: Get current season
    console.log('1️⃣ Testing getCurrentSeason()...');
    const season = await getCurrentSeason();
    if (season) {
      console.log(`   ✅ Found season: ${season.name}`);
      console.log(`   - Season ID: ${season.seasonId}`);
      console.log(`   - Active: ${season.isActive}`);
      console.log(`   - Matches: ${season._count.matches}`);
      console.log(`   - Leaderboard entries: ${season._count.leaderboardCache}\n`);
    } else {
      console.log('   ❌ No active season found\n');
    }

    // Test 2: Get leaderboard (top 5)
    console.log('2️⃣ Testing getSeasonLeaderboard()...');
    if (season) {
      const { entries, total } = await getSeasonLeaderboard(season.seasonId, 5, 0);
      console.log(`   ✅ Found ${total} total leaderboard entries`);
      console.log('   Top 5 players:');
      entries.forEach((entry, i) => {
        console.log(
          `   ${i + 1}. ${entry.username || entry.walletAddress.slice(0, 8)} - ` +
            `Score: ${entry.score}, W/L: ${entry.wins}/${entry.losses}, ` +
            `Win Rate: ${entry.winRate}%`
        );
      });
      console.log();
    }

    // Test 3: Get player by wallet
    console.log('3️⃣ Testing getPlayerByWallet()...');
    const player = await getPlayerByWallet('5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp');
    if (player) {
      console.log(`   ✅ Found player: ${player.username}`);
      console.log(`   - XP: ${player.xp}`);
      console.log(`   - Level: ${player.level}`);
      console.log(`   - Win/Loss: ${player.wins}/${player.losses}`);
      console.log(`   - Current Streak: ${player.currentStreak}`);
      console.log(`   - Badges: [${player.badges.join(', ')}]\n`);
    } else {
      console.log('   ❌ Player not found\n');
    }

    // Test 4: Get player match history
    if (player) {
      console.log('4️⃣ Testing getPlayerMatchHistory()...');
      const { matches, total } = await getPlayerMatchHistory(player.id, 3, 0);
      console.log(`   ✅ Found ${total} total matches for player`);
      console.log('   Recent matches:');
      matches.forEach((match, i) => {
        const isPlayer1 = match.player1Id === player.id;
        const opponent = isPlayer1 ? match.player2 : match.player1;
        const playerChoice = isPlayer1 ? match.player1Choice : match.player2Choice;
        const isWinner = match.winnerId === player.id;
        console.log(
          `   ${i + 1}. vs ${opponent.username || opponent.walletAddress.slice(0, 8)} - ` +
            `Choice: ${playerChoice}, ` +
            `Result: ${isWinner ? '✅ WIN' : match.result === 'DRAW' ? '🤝 DRAW' : '❌ LOSS'}, ` +
            `XP: +${match.xpAwarded}`
        );
      });
      console.log();
    }

    // Test 5: Get today's challenge
    console.log('5️⃣ Testing getTodaysChallenge()...');
    const challenge = await getTodaysChallenge();
    if (challenge) {
      console.log(`   ✅ Found challenge: ${challenge.challengeType}`);
      console.log(`   - Description: ${challenge.description}`);
      console.log(`   - Difficulty: ${challenge.difficulty}`);
      console.log(`   - XP Reward: ${challenge.xpReward}`);
      console.log(`   - Attempts: ${challenge._count.attempts}\n`);
    } else {
      console.log('   ❌ No active challenge today\n');
    }

    // Test 6: Get game stats
    console.log('6️⃣ Testing getGameStats()...');
    const stats = await getGameStats();
    console.log(`   ✅ Game Statistics:`);
    console.log(`   - Total Players: ${stats.totalPlayers}`);
    console.log(`   - Total Matches: ${stats.totalMatches}`);
    console.log(`   - Active Players (24h): ${stats.activePlayers24h}\n`);

    console.log('✅ All query tests completed!\n');
  } catch (error) {
    console.error('❌ Query test failed:', error);
    process.exit(1);
  }
}

testQueries()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
