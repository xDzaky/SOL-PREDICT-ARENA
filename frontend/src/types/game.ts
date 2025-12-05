export type PredictionDirection = "up" | "down";

export interface ArenaPlayer {
  address: string;
  username: string;
  level: number;
  winRate: number; // 0 - 100
  avatarUrl?: string;
  streak?: number;
  badges?: number;
}

export interface ArenaChallenge {
  id: string;
  prompt: string;
  duration: number; // seconds
  startPrice?: number;
}

export interface ArenaResult {
  outcome: "win" | "lose" | "draw";
  winningDirection: PredictionDirection;
  endPrice: number;
  delta: number;
}

export interface PriceFeedData {
  feedId: string;
  price: number;
  confidence: number;
  lastUpdated: number;
  changePct?: number | null;
}
