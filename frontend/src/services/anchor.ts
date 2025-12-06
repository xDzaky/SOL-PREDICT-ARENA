/**
 * Anchor Program Service for SOL Predict Arena
 * Handles all interactions with the Solana smart contract
 */

import * as anchor from "@coral-xyz/anchor";
import { Program, AnchorProvider, BN } from "@coral-xyz/anchor";
import { Connection, PublicKey, SystemProgram } from "@solana/web3.js";
import { WalletContextState } from "@solana/wallet-adapter-react";
import idl from "../idl/sol_predict_arena.json";

// Type for the program
export type SolPredictArena = anchor.Program<anchor.Idl>;

// Type for player profile account
export interface PlayerProfileAccount {
  owner: PublicKey;
  username: string;
  totalMatches: number;
  wins: number;
  losses: number;
  xp: anchor.BN;
  level: number;
  currentStreak: number;
  bestStreak: number;
  badges: number[];
  createdAt: anchor.BN;
  lastActive: anchor.BN;
  seasonPoints: anchor.BN;
  bump: number;
}

// Program ID from environment
const PROGRAM_ID = new PublicKey(import.meta.env.VITE_PROGRAM_ID);

/**
 * Get the Anchor program instance
 */
export function getProgram(
  connection: Connection,
  wallet: WalletContextState
): Program {
  const provider = new AnchorProvider(
    connection,
    wallet as unknown as anchor.Wallet,
    AnchorProvider.defaultOptions()
  );
  
  return new Program(idl as anchor.Idl, PROGRAM_ID, provider);
}

/**
 * Derive Player Profile PDA
 */
export function derivePlayerPDA(owner: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("player"), owner.toBuffer()],
    PROGRAM_ID
  );
}

/**
 * Derive Season PDA
 */
export function deriveSeasonPDA(seasonId: number): [PublicKey, number] {
  const seasonIdBuffer = Buffer.alloc(2);
  seasonIdBuffer.writeUInt16LE(seasonId, 0);
  
  return PublicKey.findProgramAddressSync(
    [Buffer.from("season"), seasonIdBuffer],
    PROGRAM_ID
  );
}

/**
 * Derive Leaderboard Entry PDA
 */
export function deriveLeaderboardPDA(
  seasonId: number,
  player: PublicKey
): [PublicKey, number] {
  const seasonIdBuffer = Buffer.alloc(2);
  seasonIdBuffer.writeUInt16LE(seasonId, 0);
  
  return PublicKey.findProgramAddressSync(
    [Buffer.from("leaderboard"), seasonIdBuffer, player.toBuffer()],
    PROGRAM_ID
  );
}

/**
 * Initialize a new player profile
 */
export async function initializePlayer(
  program: Program,
  username: string
): Promise<string> {
  const owner = program.provider.publicKey;
  if (!owner) throw new Error("Wallet not connected");
  
  const [playerPDA] = derivePlayerPDA(owner);
  
  const methodBuilder = program.methods?.initializePlayer?.(username);
  if (!methodBuilder) {
    throw new Error("initializePlayer method not found in program");
  }
  
  const tx = await methodBuilder
    .accounts({
      playerProfile: playerPDA,
      owner: owner,
      systemProgram: SystemProgram.programId,
    })
    .rpc();
  
  return tx;
}

/**
 * Fetch player profile
 */
export async function fetchPlayerProfile(
  program: Program,
  owner: PublicKey
): Promise<PlayerProfileAccount | null> {
  const [playerPDA] = derivePlayerPDA(owner);
  
  try {
    const accountNamespace = program.account?.playerProfile;
    if (!accountNamespace) {
      throw new Error("PlayerProfile account not found in program");
    }
    const account = await accountNamespace.fetch(playerPDA);
    return account as unknown as PlayerProfileAccount;
  } catch {
    return null; // Player doesn't exist
  }
}

/**
 * Update player stats (after match)
 */
export async function updatePlayerStats(
  program: Program,
  wins: number,
  losses: number,
  xp: number
): Promise<string> {
  const owner = program.provider.publicKey;
  if (!owner) throw new Error("Wallet not connected");
  
  const [playerPDA] = derivePlayerPDA(owner);
  
  const methodBuilder = program.methods?.updateStats?.(wins, losses, new BN(xp));
  if (!methodBuilder) {
    throw new Error("updateStats method not found in program");
  }
  
  const tx = await methodBuilder
    .accounts({
      playerProfile: playerPDA,
      owner: owner,
    })
    .rpc();
  
  return tx;
}

/**
 * Award badge to player
 */
export async function awardBadge(
  program: Program,
  badgeId: number
): Promise<string> {
  const owner = program.provider.publicKey;
  if (!owner) throw new Error("Wallet not connected");
  
  const [playerPDA] = derivePlayerPDA(owner);
  
  const methodBuilder = program.methods?.awardBadge?.(badgeId);
  if (!methodBuilder) {
    throw new Error("awardBadge method not found in program");
  }
  
  const tx = await methodBuilder
    .accounts({
      playerProfile: playerPDA,
      owner: owner,
    })
    .rpc();
  
  return tx;
}

/**
 * Update season points
 */
export async function updateSeasonPoints(
  program: Program,
  pointsDelta: number
): Promise<string> {
  const owner = program.provider.publicKey;
  if (!owner) throw new Error("Wallet not connected");
  
  const [playerPDA] = derivePlayerPDA(owner);
  
  const methodBuilder = program.methods?.updateSeasonPoints?.(new BN(pointsDelta));
  if (!methodBuilder) {
    throw new Error("updateSeasonPoints method not found in program");
  }
  
  const tx = await methodBuilder
    .accounts({
      playerProfile: playerPDA,
      owner: owner,
    })
    .rpc();
  
  return tx;
}

/**
 * Initialize a new season (admin only)
 */
export async function initializeSeason(
  program: Program,
  seasonId: number,
  startTime: number,
  endTime: number
): Promise<string> {
  const admin = program.provider.publicKey;
  if (!admin) throw new Error("Wallet not connected");
  
  const [seasonPDA] = deriveSeasonPDA(seasonId);
  
  const methodBuilder = program.methods?.initializeSeason?.(seasonId, new BN(startTime), new BN(endTime));
  if (!methodBuilder) {
    throw new Error("initializeSeason method not found in program");
  }
  
  const tx = await methodBuilder
    .accounts({
      season: seasonPDA,
      admin: admin,
      systemProgram: SystemProgram.programId,
    })
    .rpc();
  
  return tx;
}

/**
 * Fetch season data
 */
export async function fetchSeason(
  program: Program,
  seasonId: number
): Promise<Record<string, unknown> | null> {
  const [seasonPDA] = deriveSeasonPDA(seasonId);
  
  try {
    const accountNamespace = program.account?.season;
    if (!accountNamespace) {
      throw new Error("Season account not found in program");
    }
    const account = await accountNamespace.fetch(seasonPDA);
    return account as Record<string, unknown>;
  } catch {
    return null;
  }
}

/**
 * End a season (admin only)
 */
export async function endSeason(
  program: Program,
  seasonId: number
): Promise<string> {
  const admin = program.provider.publicKey;
  if (!admin) throw new Error("Wallet not connected");
  
  const [seasonPDA] = deriveSeasonPDA(seasonId);
  
  const methodBuilder = program.methods?.endSeason?.(seasonId);
  if (!methodBuilder) {
    throw new Error("endSeason method not found in program");
  }
  
  const tx = await methodBuilder
    .accounts({
      season: seasonPDA,
      admin: admin,
    })
    .rpc();
  
  return tx;
}

/**
 * Update leaderboard entry
 */
export async function updateLeaderboard(
  program: Program,
  seasonId: number,
  scoreDelta: number
): Promise<string> {
  const player = program.provider.publicKey;
  if (!player) throw new Error("Wallet not connected");
  
  const [leaderboardPDA] = deriveLeaderboardPDA(seasonId, player);
  const [seasonPDA] = deriveSeasonPDA(seasonId);
  
  const methodBuilder = program.methods?.updateLeaderboard?.(seasonId, new BN(scoreDelta));
  if (!methodBuilder) {
    throw new Error("updateLeaderboard method not found in program");
  }
  
  const tx = await methodBuilder
    .accounts({
      leaderboardEntry: leaderboardPDA,
      season: seasonPDA,
      player: player,
      systemProgram: SystemProgram.programId,
    })
    .rpc();
  
  return tx;
}

/**
 * Fetch leaderboard entry
 */
export async function fetchLeaderboardEntry(
  program: Program,
  seasonId: number,
  player: PublicKey
): Promise<Record<string, unknown> | null> {
  const [leaderboardPDA] = deriveLeaderboardPDA(seasonId, player);
  
  try {
    const accountNamespace = program.account?.leaderboardEntry;
    if (!accountNamespace) {
      throw new Error("LeaderboardEntry account not found in program");
    }
    const account = await accountNamespace.fetch(leaderboardPDA);
    return account as Record<string, unknown>;
  } catch {
    return null;
  }
}

/**
 * Calculate level from XP (mirrors on-chain calculation)
 */
export function calculateLevel(xp: number): number {
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
 * Calculate XP needed for next level
 */
export function xpForNextLevel(currentLevel: number): number {
  return currentLevel * 200;
}

/**
 * Badge IDs (matching on-chain enum)
 */
export const BADGE_IDS = {
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
} as const;

/**
 * Badge names
 */
export const BADGE_NAMES: Record<number, string> = {
  1: "First Blood",
  2: "On Fire",
  3: "Dominating",
  4: "Unstoppable",
  5: "Apprentice",
  6: "Expert",
  7: "Master",
  8: "Perfect Prophet",
  9: "Champion",
  10: "Challenge Master",
};

/**
 * Badge descriptions
 */
export const BADGE_DESCRIPTIONS: Record<number, string> = {
  1: "Win your first match",
  2: "Win 3 matches in a row",
  3: "Win 5 matches in a row",
  4: "Win 10 matches in a row",
  5: "Win 10 total matches",
  6: "Win 50 total matches",
  7: "Win 100 total matches",
  8: "Make a perfect prediction",
  9: "Win a season",
  10: "Complete 30 daily challenges",
};
