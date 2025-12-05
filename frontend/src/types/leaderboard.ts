export interface LeaderboardEntry {
  rank: number;
  wallet: string;
  username: string;
  xp: number;
  wins: number;
  losses: number;
  winRate: number;
  streak?: number;
}

export interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  total: number;
  seasonId?: number;
  updatedAt: number;
}

export type LeaderboardScope = "global" | "season";

export interface LeaderboardQueryParams {
  scope: LeaderboardScope;
  seasonId?: number;
  page: number;
  pageSize: number;
  search?: string;
}
