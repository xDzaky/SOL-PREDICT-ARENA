/**
 * Test Helper Utilities for SOL Predict Arena
 * 
 * This file contains reusable helper functions for testing
 */

import * as anchor from "@coral-xyz/anchor";
import { PublicKey, Keypair } from "@solana/web3.js";
import { Program } from "@coral-xyz/anchor";
import { SolPredictArena } from "../../target/types/sol_predict_arena";

/**
 * Airdrop SOL to a public key
 * @param connection - Solana connection
 * @param publicKey - Public key to airdrop to
 * @param amount - Amount in SOL (default: 2)
 */
export async function airdropSOL(
  connection: anchor.web3.Connection,
  publicKey: PublicKey,
  amount: number = 2
): Promise<void> {
  const airdropSignature = await connection.requestAirdrop(
    publicKey,
    amount * anchor.web3.LAMPORTS_PER_SOL
  );
  
  await connection.confirmTransaction(airdropSignature);
}

/**
 * Derive Player Profile PDA
 * @param owner - Owner public key
 * @param programId - Program ID
 * @returns [PDA, bump]
 */
export function derivePlayerPDA(
  owner: PublicKey,
  programId: PublicKey
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("player"), owner.toBuffer()],
    programId
  );
}

/**
 * Derive Season PDA
 * @param seasonId - Season ID (u16)
 * @param programId - Program ID
 * @returns [PDA, bump]
 */
export function deriveSeasonPDA(
  seasonId: number,
  programId: PublicKey
): [PublicKey, number] {
  const seasonIdBuffer = Buffer.alloc(2);
  seasonIdBuffer.writeUInt16LE(seasonId, 0);
  
  return PublicKey.findProgramAddressSync(
    [Buffer.from("season"), seasonIdBuffer],
    programId
  );
}

/**
 * Derive Leaderboard Entry PDA
 * @param seasonId - Season ID (u16)
 * @param player - Player public key
 * @param programId - Program ID
 * @returns [PDA, bump]
 */
export function deriveLeaderboardPDA(
  seasonId: number,
  player: PublicKey,
  programId: PublicKey
): [PublicKey, number] {
  const seasonIdBuffer = Buffer.alloc(2);
  seasonIdBuffer.writeUInt16LE(seasonId, 0);
  
  return PublicKey.findProgramAddressSync(
    [Buffer.from("leaderboard"), seasonIdBuffer, player.toBuffer()],
    programId
  );
}

/**
 * Get current Unix timestamp in seconds
 */
export function getCurrentTimestamp(): number {
  return Math.floor(Date.now() / 1000);
}

/**
 * Generate a random username
 * @param length - Length of username (max 28)
 */
export function generateRandomUsername(length: number = 12): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let username = "";
  for (let i = 0; i < Math.min(length, 28); i++) {
    username += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return username;
}

/**
 * Calculate expected level from XP
 * Mirrors the on-chain calculation
 */
export function calculateExpectedLevel(xp: number): number {
  if (xp < 100) return 1;
  
  let level = 1;
  let requiredXp = 0;
  
  while (requiredXp <= xp) {
    level += 1;
    requiredXp += (level - 1) * 200;
  }
  
  return level - 1;
}

/**
 * Calculate win rate percentage
 */
export function calculateWinRate(wins: number, totalMatches: number): number {
  if (totalMatches === 0) return 0;
  return Math.floor((wins * 100) / totalMatches);
}

/**
 * Initialize a test player profile
 * @param program - Anchor program
 * @param player - Player keypair
 * @param username - Username
 */
export async function initializeTestPlayer(
  program: Program<SolPredictArena>,
  player: Keypair,
  username: string
): Promise<PublicKey> {
  const [playerPDA] = derivePlayerPDA(player.publicKey, program.programId);
  
  await program.methods
    .initializePlayer(username)
    .accounts({
      playerProfile: playerPDA,
      owner: player.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .signers([player])
    .rpc();
  
  return playerPDA;
}

/**
 * Initialize a test season
 * @param program - Anchor program
 * @param seasonId - Season ID
 * @param durationDays - Duration in days
 */
export async function initializeTestSeason(
  program: Program<SolPredictArena>,
  seasonId: number,
  durationDays: number = 30
): Promise<PublicKey> {
  const [seasonPDA] = deriveSeasonPDA(seasonId, program.programId);
  const now = getCurrentTimestamp();
  const startTime = now;
  const endTime = now + (86400 * durationDays);
  
  await program.methods
    .initializeSeason(
      seasonId,
      new anchor.BN(startTime),
      new anchor.BN(endTime)
    )
    .accounts({
      season: seasonPDA,
      admin: program.provider.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .rpc();
  
  return seasonPDA;
}

/**
 * Sleep for a specified duration
 * @param ms - Milliseconds to sleep
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Format timestamp to readable date
 */
export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp * 1000).toISOString();
}

/**
 * Assert error message contains expected text
 */
export function assertError(error: any, expectedMessage: string): boolean {
  const errorString = error.toString();
  return errorString.includes(expectedMessage);
}

/**
 * Test data generators
 */
export const TestData = {
  usernames: [
    "SolWarrior",
    "CryptoNinja",
    "DiamondHands",
    "MoonBoy",
    "BullRunner",
    "BearSlayer",
    "DeFiMaster",
    "NFTCollector",
  ],
  
  badgeIds: {
    FIRST_WIN: 1,
    WIN_STREAK_3: 2,
    WIN_STREAK_5: 3,
    WIN_STREAK_10: 4,
    TOTAL_WINS_10: 5,
    TOTAL_WINS_50: 6,
    TOTAL_WINS_100: 7,
    PERFECT_PREDICTION: 8,
    SEASON_WINNER: 9,
    DAILY_CHALLENGE_MASTER: 10,
  },
  
  xpValues: {
    LEVEL_1: 0,
    LEVEL_2: 100,
    LEVEL_3: 250,
    LEVEL_4: 500,
    LEVEL_5: 1000,
    LEVEL_10: 5000,
  },
};

/**
 * Benchmark helper - measure execution time
 */
export async function benchmark<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = Date.now();
  const result = await fn();
  const duration = Date.now() - start;
  console.log(`  ⏱️  ${name}: ${duration}ms`);
  return result;
}

/**
 * Retry helper - retry a function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < maxAttempts) {
        await sleep(delayMs * attempt); // Exponential backoff
      }
    }
  }
  
  throw lastError;
}
