/**
 * API Request and Response Types
 */

// Player Types
export interface PlayerResponse {
  id: string;
  walletAddress: string;
  username: string | null;
  totalMatches: number;
  wins: number;
  losses: number;
  xp: string; // BigInt as string
  level: number;
  currentStreak: number;
  bestStreak: number;
  badges: number[];
  seasonPoints: string; // BigInt as string
  createdAt: Date;
  updatedAt: Date;
  lastSeen: Date;
  rank?: number;
  winRate?: number;
}

export interface InitializePlayerRequest {
  walletAddress: string;
  username?: string;
}

export interface InitializePlayerResponse {
  player: PlayerResponse;
  message: string;
}

// Match Types
export interface MatchResponse {
  id: string;
  gameId: string;
  player1: {
    id: string;
    walletAddress: string;
    username: string | null;
    level: number;
  };
  player2: {
    id: string;
    walletAddress: string;
    username: string | null;
    level: number;
  };
  player1Choice: string;
  player2Choice: string;
  challengeType: string;
  startPrice: string | null;
  endPrice: string | null;
  priceChange: string | null;
  winnerId: string | null;
  result: string;
  duration: number;
  xpAwarded: number;
  createdAt: Date;
}

export interface MatchHistoryResponse {
  matches: MatchResponse[];
  total: number;
  limit: number;
  offset: number;
}

// Leaderboard Types
export interface LeaderboardEntry {
  rank: number;
  walletAddress: string;
  username: string | null;
  score: string; // BigInt as string
  wins: number;
  losses: number;
  winRate: string;
  totalMatches: number;
  xp: string;
  level: number;
  updatedAt: Date;
}

export interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  total: number;
  limit: number;
  offset: number;
}

// Season Types
export interface SeasonResponse {
  id: number;
  seasonId: number;
  name: string;
  startTime: Date;
  endTime: Date;
  isActive: boolean;
  totalPlayers: number;
  totalMatches: number;
  prizePool: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSeasonRequest {
  seasonId: number;
  name: string;
  startTime: Date;
  endTime: Date;
  prizePool?: string;
}

// Challenge Types
export interface DailyChallengeResponse {
  id: string;
  challengeDate: Date;
  challengeType: string;
  description: string;
  targetValue: string | null;
  difficulty: string;
  xpReward: number;
  badgeReward: number | null;
  isActive: boolean;
  totalAttempts: number;
  successfulAttempts: number;
  hasAttempted: boolean;
  userAttempt?: {
    isSuccessful: boolean;
    attemptValue: string | null;
    xpEarned: number;
    attemptedAt: Date;
  };
}

export interface SubmitDailyChallengeRequest {
  challengeId: string;
  walletAddress: string;
  attemptValue?: string;
}

export interface SubmitDailyChallengeResponse {
  isSuccessful: boolean;
  xpEarned: number;
  badgeEarned: number | null;
  newXp: string;
  newLevel: number;
  message: string;
}

// Stats Types
export interface PlayerStatsResponse {
  player: PlayerResponse;
  stats: {
    winRate: number;
    averageXpPerMatch: number;
    totalXpEarned: string;
    matchesPerDay: number;
    favoriteGameMode: string;
    bestWinStreak: number;
    recentForm: string; // e.g., "WWLWD"
  };
  rankings: {
    globalRank: number | null;
    seasonRank: number | null;
    percentile: number | null;
  };
}

// Error Response
export interface ErrorResponse {
  error: string;
  code: string;
  details?: any;
}

// Pagination
export interface PaginationParams {
  limit?: number;
  offset?: number;
}

// Common Response
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ErrorResponse;
}
