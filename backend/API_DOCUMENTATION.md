# SOL Predict Arena - REST API Documentation

## Base URL
```
Development: http://localhost:3001
Production: https://api.solpredictarena.com
```

## Authentication
Currently, API endpoints do not require authentication. Wallet address validation is used for player-specific operations.

## Rate Limiting
- General API: 60 requests/minute
- Leaderboard: 30 requests/minute
- Profile queries: 30 requests/minute
- Write operations: 10 requests/minute

## Response Format

### Success Response
```json
{
  "success": true,
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {} // Optional additional details
  }
}
```

---

## Endpoints

### Health Check

#### GET /api/health
Check API health status.

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "2024-01-05T10:30:00.000Z",
    "uptime": 12345.67
  }
}
```

---

## Player Endpoints

### GET /api/player/:address
Get player profile by wallet address.

**Parameters:**
- `address` (path) - Solana wallet address

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "walletAddress": "5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp",
    "username": "SolWhale",
    "totalMatches": 60,
    "wins": 45,
    "losses": 15,
    "xp": "15000",
    "level": 12,
    "currentStreak": 5,
    "bestStreak": 8,
    "badges": [1, 2, 3],
    "seasonPoints": "4500",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-05T10:00:00.000Z",
    "lastSeen": "2024-01-05T10:00:00.000Z",
    "rank": 1,
    "winRate": 75
  }
}
```

**Errors:**
- `404` - Player not found

---

### POST /api/player/initialize
Create a new player profile.

**Body:**
```json
{
  "walletAddress": "5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp",
  "username": "SolWhale" // Optional, 3-28 characters
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "player": {
      // Player object
    },
    "message": "Player profile created successfully"
  }
}
```

**Errors:**
- `400` - Invalid wallet address or username
- `409` - Player already exists

---

### GET /api/player/:address/history
Get player match history with pagination.

**Parameters:**
- `address` (path) - Solana wallet address
- `limit` (query) - Number of matches (1-100, default: 20)
- `offset` (query) - Offset for pagination (default: 0)

**Response:**
```json
{
  "success": true,
  "data": {
    "matches": [
      {
        "id": "uuid",
        "gameId": "game_demo_1",
        "player1": {
          "id": "uuid",
          "walletAddress": "...",
          "username": "Player1",
          "level": 10
        },
        "player2": {
          "id": "uuid",
          "walletAddress": "...",
          "username": "Player2",
          "level": 12
        },
        "player1Choice": "UP",
        "player2Choice": "DOWN",
        "challengeType": "PRICE_PREDICTION",
        "startPrice": "125.50000000",
        "endPrice": "127.25000000",
        "priceChange": "1.7500",
        "winnerId": "player1-uuid",
        "result": "PLAYER1_WIN",
        "duration": 30,
        "xpAwarded": 100,
        "createdAt": "2024-01-05T10:00:00.000Z"
      }
    ],
    "total": 100,
    "limit": 20,
    "offset": 0
  }
}
```

---

### GET /api/player/:address/stats
Get detailed player statistics and analytics.

**Parameters:**
- `address` (path) - Solana wallet address

**Response:**
```json
{
  "success": true,
  "data": {
    "player": {
      // Full player object
    },
    "stats": {
      "winRate": 75.5,
      "averageXpPerMatch": 250,
      "totalXpEarned": "15000",
      "matchesPerDay": 5.2,
      "favoriteGameMode": "PRICE_PREDICTION",
      "bestWinStreak": 8,
      "recentForm": "WWLWW" // Last 5 matches
    },
    "rankings": {
      "globalRank": 5,
      "seasonRank": 1,
      "percentile": 95
    }
  }
}
```

---

## Leaderboard Endpoints

### GET /api/leaderboard/season/:seasonId
Get season leaderboard rankings.

**Parameters:**
- `seasonId` (path) - Season ID
- `limit` (query) - Number of entries (1-100, default: 100)
- `offset` (query) - Offset for pagination (default: 0)

**Response:**
```json
{
  "success": true,
  "data": {
    "entries": [
      {
        "rank": 1,
        "walletAddress": "5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp",
        "username": "SolWhale",
        "score": "4500",
        "wins": 45,
        "losses": 15,
        "winRate": "75.00",
        "totalMatches": 60,
        "xp": "15000",
        "level": 12,
        "updatedAt": "2024-01-05T10:00:00.000Z"
      }
    ],
    "total": 1000,
    "limit": 100,
    "offset": 0
  }
}
```

---

### GET /api/leaderboard/global
Get all-time global leaderboard.

**Parameters:**
- `limit` (query) - Number of entries (1-100, default: 100)
- `offset` (query) - Offset for pagination (default: 0)

**Response:**
```json
{
  "success": true,
  "data": {
    "entries": [
      {
        "rank": 1,
        "id": "uuid",
        "walletAddress": "...",
        "username": "...",
        "xp": "50000",
        "level": 25,
        "wins": 200,
        "losses": 50,
        "totalMatches": 250,
        "winRate": 80
      }
    ],
    "total": 5000,
    "limit": 100,
    "offset": 0
  }
}
```

---

### GET /api/leaderboard/top
Get top 100 players for current season.

**Response:**
```json
{
  "success": true,
  "data": {
    "season": {
      "id": 1,
      "name": "Season 1: Genesis",
      "isActive": true
    },
    "entries": [
      // Top 100 leaderboard entries
    ],
    "total": 1000
  }
}
```

**Errors:**
- `404` - No active season found

---

## Season Endpoints

### GET /api/season/current
Get current active season information.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "seasonId": 1,
    "name": "Season 1: Genesis",
    "startTime": "2024-01-01T00:00:00.000Z",
    "endTime": "2024-03-31T23:59:59.000Z",
    "isActive": true,
    "totalPlayers": 1000,
    "totalMatches": 5000,
    "prizePool": "10000",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-05T10:00:00.000Z",
    "daysRemaining": 85
  }
}
```

**Errors:**
- `404` - No active season

---

### GET /api/season/all
Get all seasons (past and present).

**Response:**
```json
{
  "success": true,
  "data": {
    "seasons": [
      {
        "id": 1,
        "seasonId": 1,
        "name": "Season 1: Genesis",
        "startTime": "2024-01-01T00:00:00.000Z",
        "endTime": "2024-03-31T23:59:59.000Z",
        "isActive": true,
        "totalPlayers": 1000,
        "totalMatches": 5000,
        "prizePool": "10000",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-05T10:00:00.000Z",
        "matchCount": 5000,
        "playerCount": 1000
      }
    ]
  }
}
```

---

### POST /api/season/create
Create a new season (admin only).

**Body:**
```json
{
  "seasonId": 2,
  "name": "Season 2: Evolution",
  "startTime": "2024-04-01T00:00:00.000Z",
  "endTime": "2024-06-30T23:59:59.000Z",
  "prizePool": "25000" // Optional
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "season": {
      // Season object
    },
    "message": "Season created successfully"
  }
}
```

**Errors:**
- `400` - Invalid dates or data
- `409` - Season ID already exists

---

## Challenge Endpoints

### GET /api/challenge/daily
Get today's daily challenge.

**Parameters:**
- `walletAddress` (query, optional) - Check if player has attempted

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "challengeDate": "2024-01-05",
    "challengeType": "STREAK_MASTER",
    "description": "Win 3 matches in a row",
    "targetValue": "3",
    "difficulty": "MEDIUM",
    "xpReward": 500,
    "badgeReward": null,
    "isActive": true,
    "totalAttempts": 50,
    "hasAttempted": false,
    "userAttempt": null
  }
}
```

**Errors:**
- `404` - No active daily challenge

---

### POST /api/challenge/daily/attempt
Submit daily challenge attempt.

**Body:**
```json
{
  "challengeId": "uuid",
  "walletAddress": "5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp",
  "attemptValue": "3" // Optional, depends on challenge type
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "isSuccessful": true,
    "xpEarned": 500,
    "badgeEarned": 5,
    "newXp": "15500",
    "newLevel": 12,
    "message": "Challenge completed successfully!"
  }
}
```

**Errors:**
- `404` - Challenge or player not found
- `400` - Challenge not active
- `409` - Already attempted today

---

## Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Invalid request data |
| `PLAYER_NOT_FOUND` | Player profile doesn't exist |
| `PLAYER_EXISTS` | Player already initialized |
| `DUPLICATE_ENTRY` | Unique constraint violation |
| `NOT_FOUND` | Resource not found |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `NO_ACTIVE_SEASON` | No active season |
| `CHALLENGE_NOT_FOUND` | Challenge doesn't exist |
| `CHALLENGE_INACTIVE` | Challenge not active |
| `ALREADY_ATTEMPTED` | Already attempted challenge |
| `INTERNAL_SERVER_ERROR` | Server error |

---

## Example Usage

### TypeScript/JavaScript (fetch)
```typescript
// Get player profile
const response = await fetch('http://localhost:3001/api/player/5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp');
const data = await response.json();

if (data.success) {
  console.log('Player:', data.data);
} else {
  console.error('Error:', data.error);
}

// Initialize player
const response = await fetch('http://localhost:3001/api/player/initialize', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    walletAddress: '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
    username: 'SolWhale'
  })
});
```

### curl
```bash
# Get leaderboard
curl -X GET "http://localhost:3001/api/leaderboard/top"

# Create player
curl -X POST "http://localhost:3001/api/player/initialize" \
  -H "Content-Type: application/json" \
  -d '{"walletAddress":"5eykt...","username":"SolWhale"}'
```

---

## Pagination

All endpoints that return lists support pagination:
- `limit`: Number of items (1-100, default varies)
- `offset`: Starting position (default: 0)

Example:
```
GET /api/player/:address/history?limit=20&offset=40
```

This returns items 41-60.

---

## Notes

1. **BigInt Values**: XP and season points are returned as strings to avoid precision loss
2. **Wallet Addresses**: Must be valid Solana addresses (32-44 characters, base58)
3. **Timestamps**: All dates are in ISO 8601 format (UTC)
4. **Rate Limiting**: Headers include `X-RateLimit-Limit` and `X-RateLimit-Remaining`
