import { Socket } from "socket.io";

export type PredictionChoice = "up" | "down";

export interface JoinMatchmakingPayload {
  walletAddress: string;
  username: string;
  signature?: string;
}

export interface MakePredictionPayload {
  gameId: string;
  choice: PredictionChoice;
}

export interface LeaveGamePayload {
  gameId: string;
}

export interface MatchFoundPayload {
  gameId: string;
  opponent: {
    walletAddress: string;
    username: string;
  };
  challenge: Challenge;
  timing: {
    startTime: number;
    duration: number;
  };
}

export interface OpponentPredictedPayload {
  // Empty payload - just signals that opponent made a prediction
}

export interface GameResultPayload {
  winner: "player1" | "player2" | "draw";
  startPrice: number;
  endPrice: number;
  player1Choice: PredictionChoice;
  player2Choice: PredictionChoice;
  player1Stats: {
    xp: number;
    totalWins: number;
    totalGames: number;
    winRate: number;
    streak: number;
  };
  player2Stats: {
    xp: number;
    totalWins: number;
    totalGames: number;
    winRate: number;
    streak: number;
  };
}

export interface ErrorPayload {
  message: string;
  code?: string;
}

export interface Challenge {
  type: "price_movement";
  duration: number;
  startPrice: number;
}

export interface PlayerInQueue {
  socketId: string;
  walletAddress: string;
  username: string;
  joinedAt: number;
}

export interface GameSession {
  gameId: string;
  player1: PlayerInQueue;
  player2: PlayerInQueue;
  challenge: Challenge;
  startTime: number;
  duration: number;
  player1Choice: PredictionChoice | null;
  player2Choice: PredictionChoice | null;
  resolved: boolean;
  startPrice: number;
}

export interface ClientToServerEvents {
  join_matchmaking: (payload: JoinMatchmakingPayload) => void;
  make_prediction: (payload: MakePredictionPayload) => void;
  leave_game: (payload: LeaveGamePayload) => void;
}

export interface ServerToClientEvents {
  match_found: (payload: MatchFoundPayload) => void;
  opponent_predicted: (payload: OpponentPredictedPayload) => void;
  game_result: (payload: GameResultPayload) => void;
  error: (payload: ErrorPayload) => void;
}
