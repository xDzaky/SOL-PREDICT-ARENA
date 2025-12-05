import type { GameSession, Challenge, PredictionChoice } from "../types/events";
import { PythPriceService } from "./PythPriceService";
import type { Server } from "socket.io";

export interface GameResultData {
  winner: "player1" | "player2" | "draw";
  player1Choice: PredictionChoice;
  player2Choice: PredictionChoice;
  startPrice: number;
  endPrice: number;
  priceChange: number;
}

export class GameSessionManager {
  private pythService: PythPriceService;
  private io: Server;
  private gameTimers: Map<string, NodeJS.Timeout> = new Map();

  constructor(io: Server, pythService: PythPriceService) {
    this.io = io;
    this.pythService = pythService;
  }

  /**
   * Start the game timer and resolve the game when duration elapses
   */
  startGameTimer(game: GameSession, onResolve: (result: GameResultData) => void): void {
    const timer = setTimeout(async () => {
      try {
        const result = await this.resolveGame(game);
        onResolve(result);
      } catch (error) {
        console.error(`[GameManager] Error resolving game ${game.gameId}:`, error);
        this.io.to(game.gameId).emit("error", {
          message: "Failed to resolve game. Please try again.",
        });
      } finally {
        this.gameTimers.delete(game.gameId);
      }
    }, game.duration * 1000);

    this.gameTimers.set(game.gameId, timer);
    console.log(`[GameManager] Timer started for game ${game.gameId} (${game.duration}s)`);
  }

  /**
   * Resolve the game by fetching the end price and comparing predictions
   */
  private async resolveGame(game: GameSession): Promise<GameResultData> {
    console.log(`[GameManager] Resolving game ${game.gameId}...`);

    // Fetch end price from Pyth
    const endPriceData = await this.pythService.getLatestPrice();
    const endPrice = endPriceData.price;
    const startPrice = game.startPrice;
    const priceChange = ((endPrice - startPrice) / startPrice) * 100;

    const actualDirection: PredictionChoice = endPrice > startPrice ? "up" : "down";

    console.log(
      `[GameManager] Game ${game.gameId}: Start $${startPrice.toFixed(2)} → End $${endPrice.toFixed(2)} (${priceChange > 0 ? "+" : ""}${priceChange.toFixed(2)}%)`
    );

    const player1Choice = game.player1Choice!;
    const player2Choice = game.player2Choice!;

    let winner: "player1" | "player2" | "draw";

    if (player1Choice === player2Choice) {
      // Both predicted the same direction
      winner = "draw";
    } else if (player1Choice === actualDirection) {
      winner = "player1";
    } else if (player2Choice === actualDirection) {
      winner = "player2";
    } else {
      // Neither predicted correctly (should not happen if only two choices)
      winner = "draw";
    }

    console.log(
      `[GameManager] Game ${game.gameId}: Winner = ${winner} (actual: ${actualDirection}, p1: ${player1Choice}, p2: ${player2Choice})`
    );

    return {
      winner,
      player1Choice,
      player2Choice,
      startPrice,
      endPrice,
      priceChange,
    };
  }

  /**
   * Cancel a game timer (e.g., if a player disconnects)
   */
  cancelGameTimer(gameId: string): void {
    const timer = this.gameTimers.get(gameId);
    if (timer) {
      clearTimeout(timer);
      this.gameTimers.delete(gameId);
      console.log(`[GameManager] Timer cancelled for game ${gameId}`);
    }
  }

  /**
   * Cleanup all active timers
   */
  cleanup(): void {
    for (const timer of this.gameTimers.values()) {
      clearTimeout(timer);
    }
    this.gameTimers.clear();
    console.log(`[GameManager] All game timers cleared`);
  }
}
