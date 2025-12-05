# SOL Predict Arena - Backend WebSocket Server

Real-time PvP matchmaking and game server for SOL Predict Arena.

## Features

- ✅ Real-time player matchmaking (FIFO queue)
- ✅ Live price feeds from Pyth Network
- ✅ Game session management with automatic resolution
- ✅ WebSocket-based communication with typed events
- ✅ Automatic cleanup of stale games and disconnected players

## Architecture

### Services

- **MatchmakingQueue**: FIFO queue for player matching, creates 1v1 games when 2 players available
- **PythPriceService**: Fetches real-time SOL/USD prices from Pyth Hermes API with caching
- **GameSessionManager**: Manages game lifecycle, timers, and automatic result resolution

### WebSocket Events

#### Client → Server

- `join_matchmaking`: Join the matchmaking queue
  ```typescript
  {
    walletAddress: string;
    username: string;
    signature?: string;
  }
  ```

- `make_prediction`: Submit UP/DOWN prediction
  ```typescript
  {
    gameId: string;
    choice: "up" | "down";
  }
  ```

- `leave_game`: Leave an active game
  ```typescript
  {
    gameId: string;
  }
  ```

#### Server → Client

- `match_found`: Match created, game starting
  ```typescript
  {
    gameId: string;
    opponent: { username: string; walletAddress: string };
    challenge: { type: "price_movement"; duration: number; startPrice: number };
    timing: { startTime: number; duration: number };
  }
  ```

- `opponent_predicted`: Opponent made their prediction
  ```typescript
  {} // Empty payload
  ```

- `game_result`: Game resolved with results
  ```typescript
  {
    winner: "player1" | "player2" | "draw";
    startPrice: number;
    endPrice: number;
    player1Choice: "up" | "down";
    player2Choice: "up" | "down";
    player1Stats: { xp: number; totalWins: number; totalGames: number; winRate: number; streak: number };
    player2Stats: { ... };
  }
  ```

- `error`: Error occurred
  ```typescript
  {
    message: string;
    code?: string;
  }
  ```

## Setup

### Install Dependencies

```bash
pnpm install
```

### Environment Variables

Create `.env` file:

```env
PORT=3000
FRONTEND_URL=http://localhost:5173
```

### Development

```bash
pnpm run dev
```

Server starts on `http://localhost:3000` with hot-reloading.

### Production Build

```bash
pnpm run build
pnpm start
```

## API Endpoints

### Health Check

```bash
GET /health
```

Response:
```json
{
  "status": "ok",
  "queueSize": 0,
  "activeGames": 0
}
```

## Game Flow

1. **Matchmaking**: Two players join queue → Instant match when paired
2. **Game Start**: Server fetches current SOL price from Pyth, creates 30s challenge
3. **Predictions**: Both players submit UP/DOWN predictions (can be made anytime during 30s)
4. **Resolution**: After 30s, server fetches end price, determines winner based on actual price movement
5. **Results**: Both players receive outcome, stats update (TODO: on-chain update)

## Technical Details

- **Price Oracle**: Pyth Network Hermes API (5s cache TTL)
- **Game Duration**: 30 seconds per round
- **Matchmaking**: FIFO queue, instant matching
- **Cleanup**: Stale games removed after 5 minutes (runs every 60s)
- **Disconnection Handling**: Game cancelled if player disconnects before resolution

## TODO

- [ ] Implement wallet signature verification (join_matchmaking)
- [ ] Integrate Anchor program for on-chain stats updates
- [ ] Add Redis for distributed matchmaking queue
- [ ] Implement ELO-based matchmaking
- [ ] Add game replay/history storage
- [ ] Rate limiting on socket events
- [ ] Monitoring and observability (Prometheus metrics)
