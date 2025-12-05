# Enhanced Pyth Price Service Documentation

Comprehensive SOL/USD price oracle service with Pyth Network integration, fallback mechanisms, and real-time subscriptions.

## Features

✅ **Multiple Data Sources**
- Primary: Pyth Hermes HTTP API (fastest)
- Secondary: Pyth On-Chain via Solana RPC (most reliable)
- Fallback: Jupiter Aggregator API (redundancy)

✅ **Smart Caching**
- Configurable TTL (default: 5 seconds)
- Request deduplication for concurrent calls
- Automatic cache invalidation

✅ **Resilience**
- Exponential backoff retry (default: 3 attempts)
- Automatic failover to backup data sources
- Price validation with sanity checks

✅ **Real-Time Updates**
- WebSocket-style subscription pattern
- Multiple subscribers support
- Configurable polling interval

✅ **Type Safety**
- Full TypeScript support
- Comprehensive interfaces
- Runtime validation

## Installation

```bash
pnpm add @pythnetwork/client @solana/web3.js axios
```

## Quick Start

```typescript
import { PythPriceService } from "./services/EnhancedPythPriceService";

const pythService = new PythPriceService({
  solanaRpcUrl: "https://api.mainnet-beta.solana.com",
  network: "mainnet-beta",
  enableFallback: true,
  cacheMs: 5000,
});

// Get current price
const price = await pythService.getCurrentPrice();
console.log(`SOL/USD: $${price.price.toFixed(2)}`);
```

## API Reference

### Constructor

```typescript
new PythPriceService(config: PythServiceConfig)
```

**Config Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `solanaRpcUrl` | string | required | Solana RPC endpoint URL |
| `network` | "devnet" \| "mainnet-beta" | required | Solana network |
| `enableFallback` | boolean | true | Enable Jupiter API fallback |
| `cacheMs` | number | 5000 | Cache TTL in milliseconds |
| `retryAttempts` | number | 3 | Number of retry attempts |
| `retryDelayMs` | number | 1000 | Initial retry delay (exponential backoff) |

### Methods

#### `getCurrentPrice(): Promise<PriceData>`

Fetches the latest SOL/USD price with caching.

**Returns:**
```typescript
{
  price: number;        // SOL price in USD
  confidence: number;   // Confidence interval
  exponent: number;     // Price exponent
  timestamp: number;    // Unix timestamp (ms)
  slot?: number;        // Solana slot (if from on-chain)
}
```

**Example:**
```typescript
const price = await pythService.getCurrentPrice();
console.log(`Price: $${price.price.toFixed(2)}`);
console.log(`Confidence: ±$${price.confidence.toFixed(4)}`);
console.log(`Time: ${new Date(price.timestamp).toISOString()}`);
```

#### `getPriceAtTime(timestamp: number): Promise<PriceData>`

Fetches historical price at a specific timestamp.

**Parameters:**
- `timestamp`: Unix timestamp in seconds

**Example:**
```typescript
const historicalPrice = await pythService.getPriceAtTime(1733356800);
console.log(`SOL was $${historicalPrice.price.toFixed(2)} at that time`);
```

**Note:** Historical data availability depends on Pyth Hermes API retention.

#### `subscribeToPriceUpdates(callback: PriceCallback, intervalMs?: number): () => void`

Subscribe to real-time price updates.

**Parameters:**
- `callback`: Function called on each price update
- `intervalMs`: Polling interval (default: 2000ms)

**Returns:** Unsubscribe function

**Callback receives:**
```typescript
{
  price: number;           // Current price
  previousPrice: number;   // Previous price
  change: number;          // Absolute change
  changePercent: number;   // Percentage change
  timestamp: number;       // Update timestamp
}
```

**Example:**
```typescript
const unsubscribe = pythService.subscribeToPriceUpdates((update) => {
  console.log(`Price: $${update.price.toFixed(2)}`);
  console.log(`Change: ${update.changePercent.toFixed(2)}%`);
}, 2000);

// Stop subscription
unsubscribe();
```

#### `clearCache(): void`

Manually clears the price cache, forcing fresh fetch on next call.

**Example:**
```typescript
pythService.clearCache();
const freshPrice = await pythService.getCurrentPrice(); // Guaranteed fresh
```

#### `destroy(): void`

Cleanup all resources (subscriptions, cache, timers).

**Example:**
```typescript
pythService.destroy();
```

#### `getStats(): object`

Get service statistics for debugging.

**Returns:**
```typescript
{
  cached: boolean;       // Is price cached?
  cacheAge: number | null;  // Cache age in ms
  subscribers: number;   // Active subscribers count
  lastPrice: number | undefined;  // Last fetched price
  lastUpdate: number | undefined; // Last update timestamp
}
```

## Usage Examples

### Example 1: Simple Price Fetch

```typescript
const pythService = new PythPriceService({
  solanaRpcUrl: process.env.SOLANA_RPC_URL!,
  network: "mainnet-beta",
});

try {
  const price = await pythService.getCurrentPrice();
  console.log(`SOL: $${price.price.toFixed(2)}`);
} catch (error) {
  console.error("Failed to fetch price:", error);
}
```

### Example 2: Real-Time Price Monitor

```typescript
const pythService = new PythPriceService({
  solanaRpcUrl: process.env.SOLANA_RPC_URL!,
  network: "mainnet-beta",
});

const unsubscribe = pythService.subscribeToPriceUpdates((update) => {
  const arrow = update.changePercent >= 0 ? "↑" : "↓";
  const color = update.changePercent >= 0 ? "\x1b[32m" : "\x1b[31m";
  
  console.log(
    `${color}${arrow} $${update.price.toFixed(2)} ` +
    `(${update.changePercent >= 0 ? "+" : ""}${update.changePercent.toFixed(2)}%)\x1b[0m`
  );
}, 1000); // 1 second updates

// Stop after 60 seconds
setTimeout(() => {
  unsubscribe();
  pythService.destroy();
}, 60000);
```

### Example 3: Game Price Resolution

```typescript
class GameManager {
  private pythService: PythPriceService;
  
  constructor() {
    this.pythService = new PythPriceService({
      solanaRpcUrl: process.env.SOLANA_RPC_URL!,
      network: "mainnet-beta",
      cacheMs: 2000, // Short cache for games
    });
  }
  
  async startGame(): Promise<void> {
    // Get start price
    const startPrice = await this.pythService.getCurrentPrice();
    console.log(`Game started at $${startPrice.price.toFixed(2)}`);
    
    // Wait 30 seconds
    await new Promise(resolve => setTimeout(resolve, 30000));
    
    // Get end price (cache cleared for fresh data)
    this.pythService.clearCache();
    const endPrice = await this.pythService.getCurrentPrice();
    
    const direction = endPrice.price > startPrice.price ? "UP" : "DOWN";
    const change = ((endPrice.price - startPrice.price) / startPrice.price) * 100;
    
    console.log(`Game ended at $${endPrice.price.toFixed(2)} (${direction} ${Math.abs(change).toFixed(2)}%)`);
  }
}
```

### Example 4: Price Alert System

```typescript
const pythService = new PythPriceService({
  solanaRpcUrl: process.env.SOLANA_RPC_URL!,
  network: "mainnet-beta",
});

const TARGET_PRICE = 150;
let alerted = false;

pythService.subscribeToPriceUpdates((update) => {
  if (!alerted && update.price >= TARGET_PRICE) {
    console.log(`🚨 ALERT: SOL reached $${update.price.toFixed(2)}`);
    alerted = true;
  }
}, 5000);
```

### Example 5: Multiple Subscribers

```typescript
const pythService = new PythPriceService({
  solanaRpcUrl: process.env.SOLANA_RPC_URL!,
  network: "mainnet-beta",
});

// Logger subscriber
const unsubLogger = pythService.subscribeToPriceUpdates((update) => {
  console.log(`[LOG] Price: $${update.price.toFixed(2)}`);
}, 2000);

// Database subscriber
const unsubDB = pythService.subscribeToPriceUpdates(async (update) => {
  await db.prices.insert({
    price: update.price,
    timestamp: update.timestamp,
  });
}, 10000); // Every 10 seconds

// WebSocket broadcaster
const unsubWS = pythService.subscribeToPriceUpdates((update) => {
  io.emit("price_update", update);
}, 1000);
```

## Error Handling

The service implements comprehensive error handling with automatic retries:

```typescript
try {
  const price = await pythService.getCurrentPrice();
} catch (error) {
  if (error.message.includes("Failed to fetch price after")) {
    // All retry attempts exhausted
    console.error("Price service unavailable");
  } else if (error.message.includes("validation")) {
    // Price failed sanity check
    console.error("Invalid price data");
  }
}
```

## Price Validation

The service validates prices to prevent anomalies:

1. **Range Check**: SOL must be between $1 and $10,000
2. **Change Check**: Price cannot jump >50% from previous value
3. **NaN Check**: Ensures price is a valid number

## Pyth Program IDs

### Mainnet-Beta
```
Program ID: FsJ3A3u2vn5cTVofAjvy6y5kwABJAqYWpe4975bi2epH
SOL/USD Account: H6ARHf6YXhGYeQfUzQNGk6rDNnLBQKrenN712K4AQJEG
Feed ID: 0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d
```

### Devnet
```
Program ID: gSbePebfvPy7tRqimPoVecS2UsBvYv46ynrzWocc92s
SOL/USD Account: J83w4HKfqxwcq3BEMMkPFSppX3gqekLyLJBexebFVkix
Feed ID: 0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d
```

## Testing

Run the comprehensive test suite:

```bash
pnpm run test:pyth
```

Tests include:
- Current price fetching
- Cache functionality
- Retry logic with fallback
- Price subscription
- Multiple subscribers
- Price validation

## Performance

- **Hermes API**: ~100-200ms latency
- **On-Chain**: ~500-1000ms latency (RPC dependent)
- **Jupiter Fallback**: ~300-500ms latency
- **Cache Hit**: <1ms

## Best Practices

1. **Use caching appropriately**: 5s cache is good for most use cases
2. **Enable fallback**: Always set `enableFallback: true` in production
3. **Clean up subscriptions**: Always call unsubscribe functions
4. **Use premium RPC**: Helius/QuickNode for better reliability
5. **Monitor stats**: Use `getStats()` for observability

## Troubleshooting

### "Failed to fetch price after X attempts"
- Check RPC URL is accessible
- Verify network connectivity
- Try enabling fallback mode
- Check Pyth Hermes status

### "Invalid price value"
- RPC may be out of sync
- Pyth feed may be stale
- Try different RPC endpoint

### Subscription not receiving updates
- Verify service not destroyed
- Check interval is reasonable (>1000ms)
- Ensure callback doesn't throw errors

## License

MIT
