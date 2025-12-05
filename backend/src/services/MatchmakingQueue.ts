import type { PlayerInQueue, GameSession, Challenge, PredictionChoice } from "../types/events";

export class MatchmakingQueue {
  private queue: Map<string, PlayerInQueue> = new Map();
  private games: Map<string, GameSession> = new Map();
  private playerToGame: Map<string, string> = new Map();

  addPlayer(player: PlayerInQueue): void {
    if (this.queue.has(player.walletAddress)) {
      throw new Error("Player already in queue");
    }

    if (this.playerToGame.has(player.walletAddress)) {
      throw new Error("Player already in game");
    }

    this.queue.set(player.walletAddress, player);
    console.log(`[Queue] Player ${player.username} joined. Queue size: ${this.queue.size}`);
  }

  removePlayer(walletAddress: string): void {
    const removed = this.queue.delete(walletAddress);
    if (removed) {
      console.log(`[Queue] Player ${walletAddress} removed. Queue size: ${this.queue.size}`);
    }
  }

  findMatch(): [PlayerInQueue, PlayerInQueue] | null {
    if (this.queue.size < 2) {
      return null;
    }

    const players = Array.from(this.queue.values()).sort((a, b) => a.joinedAt - b.joinedAt);
    const player1 = players[0];
    const player2 = players[1];

    if (player1 && player2) {
      this.queue.delete(player1.walletAddress);
      this.queue.delete(player2.walletAddress);
      console.log(`[Queue] Match found: ${player1.username} vs ${player2.username}`);
      return [player1, player2];
    }

    return null;
  }

  createGameSession(player1: PlayerInQueue, player2: PlayerInQueue, challenge: Challenge, startPrice: number): GameSession {
    const gameId = `game_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const session: GameSession = {
      gameId,
      player1,
      player2,
      challenge,
      startTime: Date.now(),
      duration: challenge.duration,
      player1Choice: null,
      player2Choice: null,
      resolved: false,
      startPrice,
    };

    this.games.set(gameId, session);
    this.playerToGame.set(player1.walletAddress, gameId);
    this.playerToGame.set(player2.walletAddress, gameId);

    console.log(`[Game] Session created: ${gameId}`);
    return session;
  }

  getGame(gameId: string): GameSession | undefined {
    return this.games.get(gameId);
  }

  getGameByPlayer(walletAddress: string): GameSession | undefined {
    const gameId = this.playerToGame.get(walletAddress);
    if (!gameId) return undefined;
    return this.games.get(gameId);
  }

  setPlayerChoice(gameId: string, walletAddress: string, choice: PredictionChoice): void {
    const game = this.games.get(gameId);
    if (!game) {
      throw new Error("Game not found");
    }

    if (game.player1.walletAddress === walletAddress) {
      game.player1Choice = choice;
    } else if (game.player2.walletAddress === walletAddress) {
      game.player2Choice = choice;
    } else {
      throw new Error("Player not in this game");
    }

    console.log(`[Game] ${gameId}: ${walletAddress} chose ${choice}`);
  }

  hasPlayerMadePrediction(gameId: string, walletAddress: string): boolean {
    const game = this.games.get(gameId);
    if (!game) return false;

    if (game.player1.walletAddress === walletAddress) {
      return game.player1Choice !== null;
    }
    if (game.player2.walletAddress === walletAddress) {
      return game.player2Choice !== null;
    }
    return false;
  }

  areBothPlayersPredicted(gameId: string): boolean {
    const game = this.games.get(gameId);
    if (!game) return false;
    return game.player1Choice !== null && game.player2Choice !== null;
  }

  markResolved(gameId: string): void {
    const game = this.games.get(gameId);
    if (game) {
      game.resolved = true;
    }
  }

  removeGame(gameId: string): void {
    const game = this.games.get(gameId);
    if (game) {
      this.playerToGame.delete(game.player1.walletAddress);
      this.playerToGame.delete(game.player2.walletAddress);
      this.games.delete(gameId);
      console.log(`[Game] Session removed: ${gameId}`);
    }
  }

  cleanupStaleGames(maxAgeMs: number = 300000): number {
    const now = Date.now();
    let removed = 0;

    for (const [gameId, game] of this.games.entries()) {
      if (now - game.startTime > maxAgeMs) {
        this.removeGame(gameId);
        removed++;
      }
    }

    if (removed > 0) {
      console.log(`[Cleanup] Removed ${removed} stale games`);
    }

    return removed;
  }

  getStats() {
    return {
      queueSize: this.queue.size,
      activeGames: this.games.size,
    };
  }
}
