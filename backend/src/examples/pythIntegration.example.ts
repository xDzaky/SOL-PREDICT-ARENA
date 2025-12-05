/**
 * Integration Example: Using EnhancedPythPriceService in WebSocket Server
 * 
 * This example shows how to integrate the enhanced Pyth price service
 * into the existing WebSocket game server for more robust price fetching.
 */

import { Server } from "socket.io";
import { PythPriceService } from "./services/EnhancedPythPriceService";
import { MatchmakingQueue } from "./services/MatchmakingQueue";

export class GameServerWithEnhancedPyth {
  private pythService: PythPriceService;
  private matchmakingQueue: MatchmakingQueue;
  private io: Server;

  constructor(io: Server) {
    this.io = io;
    this.matchmakingQueue = new MatchmakingQueue();

    // Initialize enhanced Pyth service
    this.pythService = new PythPriceService({
      solanaRpcUrl: process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com",
      network: "mainnet-beta",
      enableFallback: true,      // Enable Jupiter fallback
      cacheMs: 3000,             // 3s cache for games
      retryAttempts: 3,          // Retry 3 times
      retryDelayMs: 500,         // Start with 500ms delay
    });

    this.setupPriceBroadcast();
  }

  /**
   * Broadcast real-time SOL price to all connected clients
   */
  private setupPriceBroadcast(): void {
    this.pythService.subscribeToPriceUpdates((update) => {
      // Broadcast to all clients on the "arena" room
      this.io.to("arena").emit("price_update", {
        price: update.price,
        change: update.changePercent,
        timestamp: update.timestamp,
      });

      // Log significant price movements
      if (Math.abs(update.changePercent) >= 0.5) {
        const direction = update.changePercent >= 0 ? "↑" : "↓";
        console.log(
          `[Price Alert] ${direction} $${update.price.toFixed(2)} ` +
          `(${update.changePercent >= 0 ? "+" : ""}${update.changePercent.toFixed(2)}%)`
        );
      }
    }, 2000); // 2 second updates
  }

  /**
   * Start a game with enhanced price fetching
   */
  async startGame(player1SocketId: string, player2SocketId: string): Promise<void> {
    try {
      // Get start price with automatic retry and fallback
      const startPriceData = await this.pythService.getCurrentPrice();
      
      console.log(
        `[Game] Starting at $${startPriceData.price.toFixed(2)} ` +
        `(confidence: ±$${startPriceData.confidence.toFixed(4)})`
      );

      const gameId = `game_${Date.now()}`;
      
      // Emit game start to both players
      this.io.to(player1SocketId).emit("game_start", {
        gameId,
        startPrice: startPriceData.price,
        duration: 30,
      });

      this.io.to(player2SocketId).emit("game_start", {
        gameId,
        startPrice: startPriceData.price,
        duration: 30,
      });

      // Wait for game duration
      await new Promise((resolve) => setTimeout(resolve, 30000));

      // Clear cache to force fresh end price
      this.pythService.clearCache();
      
      // Get end price
      const endPriceData = await this.pythService.getCurrentPrice();
      
      const priceChange = ((endPriceData.price - startPriceData.price) / startPriceData.price) * 100;
      
      console.log(
        `[Game] Ended at $${endPriceData.price.toFixed(2)} ` +
        `(${priceChange >= 0 ? "+" : ""}${priceChange.toFixed(2)}%)`
      );

      // Determine winner based on price movement
      const actualDirection = endPriceData.price > startPriceData.price ? "up" : "down";
      
      // Emit results (simplified - you'd integrate with game session manager)
      this.io.to([player1SocketId, player2SocketId]).emit("game_result", {
        startPrice: startPriceData.price,
        endPrice: endPriceData.price,
        change: priceChange,
        direction: actualDirection,
      });
    } catch (error: any) {
      console.error("[Game] Failed to start/resolve game:", error.message);
      
      // Notify players of error
      this.io.to([player1SocketId, player2SocketId]).emit("error", {
        message: "Failed to fetch price data. Game cancelled.",
      });
    }
  }

  /**
   * Get current price stats for monitoring
   */
  getPriceStats() {
    return this.pythService.getStats();
  }

  /**
   * Cleanup on server shutdown
   */
  destroy(): void {
    this.pythService.destroy();
  }
}

/**
 * Example: Drop-in replacement for existing PythPriceService
 * 
 * You can replace the simple PythPriceService in index.ts with this enhanced version:
 */

/*
// OLD (in index.ts):
import { PythPriceService } from './services/PythPriceService';
const pythService = new PythPriceService();

// NEW (in index.ts):
import { PythPriceService } from './services/EnhancedPythPriceService';
const pythService = new PythPriceService({
  solanaRpcUrl: process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
  network: 'mainnet-beta',
  enableFallback: true,
  cacheMs: 5000,
});

// The API is mostly compatible, just use:
const price = await pythService.getCurrentPrice();
// Instead of:
// const price = await pythService.getLatestPrice();
*/

/**
 * Example: Monitoring endpoint for price service health
 */

export function setupPriceMonitoring(app: any, pythService: PythPriceService) {
  app.get("/api/price/current", async (req: any, res: any) => {
    try {
      const price = await pythService.getCurrentPrice();
      res.json({
        success: true,
        data: {
          price: price.price,
          confidence: price.confidence,
          timestamp: price.timestamp,
          formattedPrice: `$${price.price.toFixed(2)}`,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });

  app.get("/api/price/stats", (req: any, res: any) => {
    const stats = pythService.getStats();
    res.json({
      success: true,
      data: stats,
    });
  });
}
