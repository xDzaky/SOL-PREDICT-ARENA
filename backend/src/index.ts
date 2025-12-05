import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  JoinMatchmakingPayload,
  MakePredictionPayload,
  LeaveGamePayload,
  Challenge,
  PlayerInQueue,
} from './types/events';
import { MatchmakingQueue } from './services/MatchmakingQueue';
import { PythPriceService } from './services/PythPriceService';
import { GameSessionManager } from './services/GameSessionManager';
import apiRoutes from './routes/index';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimiter';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api', apiLimiter, apiRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'SOL Predict Arena API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      player: '/api/player',
      leaderboard: '/api/leaderboard',
      season: '/api/season',
      challenge: '/api/challenge',
    },
  });
});

// Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

const server = http.createServer(app);
const io = new Server<ClientToServerEvents, ServerToClientEvents>(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// Initialize services
const matchmakingQueue = new MatchmakingQueue();
const pythService = new PythPriceService();
const gameManager = new GameSessionManager(io, pythService);

// Wallet address to socket mapping for quick lookups
const walletToSocket = new Map<string, string>();

// Periodic cleanup of stale games (every minute)
setInterval(() => {
  matchmakingQueue.cleanupStaleGames(300000); // 5 minutes
}, 60000);

io.on('connection', (socket) => {
  console.log('[Socket] Client connected:', socket.id);

  // Join matchmaking
  socket.on('join_matchmaking', async (payload: JoinMatchmakingPayload) => {
    try {
      const { walletAddress, username, signature } = payload;

      // TODO: Validate wallet signature (skip for now)
      if (!walletAddress || !username) {
        socket.emit('error', { message: 'Missing wallet address or username' });
        return;
      }

      const player: PlayerInQueue = {
        socketId: socket.id,
        walletAddress,
        username,
        joinedAt: Date.now(),
      };

      try {
        matchmakingQueue.addPlayer(player);
        walletToSocket.set(walletAddress, socket.id);

        console.log(`[Matchmaking] ${username} (${walletAddress}) joined queue`);

        // Try to find a match
        const match = matchmakingQueue.findMatch();
        if (match) {
          const [player1, player2] = match;

          // Fetch current price
          const currentPrice = await pythService.getLatestPrice();

          // Create challenge
          const challenge: Challenge = {
            type: 'price_movement',
            duration: 30, // 30 seconds
            startPrice: currentPrice.price,
          };

          // Create game session
          const game = matchmakingQueue.createGameSession(
            player1,
            player2,
            challenge,
            currentPrice.price
          );

          // Join both players to a room
          const player1Socket = io.sockets.sockets.get(player1.socketId);
          const player2Socket = io.sockets.sockets.get(player2.socketId);

          if (!player1Socket || !player2Socket) {
            socket.emit('error', { message: 'Failed to connect players' });
            return;
          }

          player1Socket.join(game.gameId);
          player2Socket.join(game.gameId);

          // Emit match_found to both players
          const timing = {
            startTime: game.startTime,
            duration: game.duration,
          };

          player1Socket.emit('match_found', {
            gameId: game.gameId,
            opponent: {
              username: player2.username,
              walletAddress: player2.walletAddress,
            },
            challenge,
            timing,
          });

          player2Socket.emit('match_found', {
            gameId: game.gameId,
            opponent: {
              username: player1.username,
              walletAddress: player1.walletAddress,
            },
            challenge,
            timing,
          });

          // Start game timer
          gameManager.startGameTimer(game, (result) => {
            // Broadcast results to both players
            // TODO: Fetch real stats from on-chain program
            const player1Stats = {
              xp: 120,
              totalWins: 42,
              totalGames: 68,
              winRate: 61.76,
              streak: 3,
            };

            const player2Stats = {
              xp: 95,
              totalWins: 31,
              totalGames: 54,
              winRate: 57.41,
              streak: 1,
            };

            io.to(game.gameId).emit('game_result', {
              winner: result.winner,
              startPrice: result.startPrice,
              endPrice: result.endPrice,
              player1Choice: result.player1Choice,
              player2Choice: result.player2Choice,
              player1Stats,
              player2Stats,
            });

            // Mark as resolved and cleanup
            matchmakingQueue.markResolved(game.gameId);
            setTimeout(() => {
              matchmakingQueue.removeGame(game.gameId);
            }, 5000); // Keep game for 5s for clients to process
          });

          console.log(`[Match] Game ${game.gameId} started: ${player1.username} vs ${player2.username}`);
        }
      } catch (error: any) {
        socket.emit('error', { message: error.message || 'Failed to join matchmaking' });
      }
    } catch (error) {
      console.error('[Matchmaking] Error:', error);
      socket.emit('error', { message: 'Internal server error' });
    }
  });

  // Make prediction
  socket.on('make_prediction', (payload: MakePredictionPayload) => {
    try {
      const { gameId, choice } = payload;
      const game = matchmakingQueue.getGame(gameId);

      if (!game) {
        socket.emit('error', { message: 'Game not found' });
        return;
      }

      // Find which player this socket belongs to
      const walletAddress =
        game.player1.socketId === socket.id
          ? game.player1.walletAddress
          : game.player2.socketId === socket.id
          ? game.player2.walletAddress
          : null;

      if (!walletAddress) {
        socket.emit('error', { message: 'Player not in this game' });
        return;
      }

      // Check if already predicted
      if (matchmakingQueue.hasPlayerMadePrediction(gameId, walletAddress)) {
        socket.emit('error', { message: 'Prediction already made' });
        return;
      }

      // Record prediction
      matchmakingQueue.setPlayerChoice(gameId, walletAddress, choice);

      // Notify opponent that this player predicted
      const opponentSocketId =
        socket.id === game.player1.socketId ? game.player2.socketId : game.player1.socketId;

      const opponentSocket = io.sockets.sockets.get(opponentSocketId);
      if (opponentSocket) {
        opponentSocket.emit('opponent_predicted', {});
      }

      console.log(`[Game] ${gameId}: ${walletAddress} predicted ${choice}`);
    } catch (error: any) {
      console.error('[Prediction] Error:', error);
      socket.emit('error', { message: error.message || 'Failed to make prediction' });
    }
  });

  // Leave game
  socket.on('leave_game', (payload: LeaveGamePayload) => {
    try {
      const { gameId } = payload;
      const game = matchmakingQueue.getGame(gameId);

      if (game && !game.resolved) {
        gameManager.cancelGameTimer(gameId);
        io.to(gameId).emit('error', { message: 'Opponent left the game' });
        matchmakingQueue.removeGame(gameId);
        console.log(`[Game] ${gameId}: Player left, game cancelled`);
      }
    } catch (error) {
      console.error('[LeaveGame] Error:', error);
    }
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log('[Socket] Client disconnected:', socket.id);

    // Find and remove from queue
    const entries = Array.from(walletToSocket.entries());
    const entry = entries.find(([_, sid]) => sid === socket.id);
    if (entry) {
      const [wallet] = entry;
      matchmakingQueue.removePlayer(wallet);
      walletToSocket.delete(wallet);

      // Check if player was in an active game
      const game = matchmakingQueue.getGameByPlayer(wallet);
      if (game && !game.resolved) {
        gameManager.cancelGameTimer(game.gameId);
        io.to(game.gameId).emit('error', { message: 'Opponent disconnected' });
        matchmakingQueue.removeGame(game.gameId);
        console.log(`[Game] ${game.gameId}: Player disconnected, game cancelled`);
      }
    }
  });
});

app.get('/health', (req, res) => {
  const stats = matchmakingQueue.getStats();
  res.json({
    status: 'ok',
    ...stats,
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});
