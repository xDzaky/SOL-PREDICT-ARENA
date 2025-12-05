import { PublicKey } from "@solana/web3.js";

export interface PlayerProfileAccount {
  address: PublicKey;
  owner: PublicKey;
  username: string;
  totalMatches: number;
  wins: number;
  losses: number;
  xp: number;
  level: number;
  currentStreak: number;
  bestStreak: number;
  badges: number[];
  createdAt: number;
  lastActive: number;
  seasonPoints: number;
  bump: number;
  winRate: number;
}

export interface InitializePlayerArgs {
  username: string;
}

export interface UpdateStatsArgs {
  wins: number;
  losses: number;
  xp: number;
}

export interface AwardBadgeArgs {
  badgeId: number;
}
