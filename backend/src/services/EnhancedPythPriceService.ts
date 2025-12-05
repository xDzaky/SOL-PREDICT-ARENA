import { Connection, PublicKey } from "@solana/web3.js";
import { PythHttpClient, getPythProgramKeyForCluster } from "@pythnetwork/client";
import axios from "axios";

/**
 * Pyth Program IDs
 * Devnet: FsJ3A3u2vn5cTVofAjvy6y5kwABJAqYWpe4975bi2epH
 * Mainnet: FsJ3A3u2vn5cTVofAjvy6y5kwABJAqYWpe4975bi2epH
 */

export interface PriceData {
  price: number;
  confidence: number;
  exponent: number;
  timestamp: number;
  slot?: number;
}

export interface PriceUpdate {
  price: number;
  previousPrice: number;
  change: number;
  changePercent: number;
  timestamp: number;
}

type PriceCallback = (update: PriceUpdate) => void;

export interface PythServiceConfig {
  solanaRpcUrl: string;
  network: "devnet" | "mainnet-beta";
  enableFallback?: boolean;
  cacheMs?: number;
  retryAttempts?: number;
  retryDelayMs?: number;
}

export class PythPriceService {
  // Pyth SOL/USD Price Feed IDs
  private readonly SOL_USD_FEED_ID = "0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d";
  private readonly SOL_USD_PRICE_ACCOUNT = new PublicKey(
    "H6ARHf6YXhGYeQfUzQNGk6rDNnLBQKrenN712K4AQJEG" // Mainnet SOL/USD
  );

  // Pyth Hermes HTTP endpoint (faster for quick queries)
  private readonly PYTH_HERMES_ENDPOINT = "https://hermes.pyth.network";

  // Jupiter API fallback
  private readonly JUPITER_API = "https://price.jup.ag/v6/price?ids=SOL";

  private connection: Connection;
  private pythClient: PythHttpClient | null = null;
  private config: Required<PythServiceConfig>;

  // Cache
  private cache: PriceData | null = null;
  private lastFetch: number = 0;
  private previousPrice: number = 0;

  // Subscription
  private subscribers: Set<PriceCallback> = new Set();
  private subscriptionInterval: NodeJS.Timeout | null = null;

  // Retry state
  private fetchPromise: Promise<PriceData> | null = null;

  constructor(config: PythServiceConfig) {
    this.config = {
      enableFallback: true,
      cacheMs: 5000, // 5 seconds default cache
      retryAttempts: 3,
      retryDelayMs: 1000,
      ...config,
    };

    this.connection = new Connection(config.solanaRpcUrl, "confirmed");

    // Initialize Pyth HTTP client
    try {
      this.pythClient = new PythHttpClient(this.connection, getPythProgramKeyForCluster(config.network));
      console.log(`[Pyth] Initialized for ${config.network}`);
    } catch (error) {
      console.error("[Pyth] Failed to initialize client:", error);
    }
  }

  /**
   * Get current SOL/USD price with caching
   */
  async getCurrentPrice(): Promise<PriceData> {
    const now = Date.now();

    // Return cached price if still valid
    if (this.cache && now - this.lastFetch < this.config.cacheMs) {
      return this.cache;
    }

    // Deduplicate concurrent requests
    if (this.fetchPromise) {
      return this.fetchPromise;
    }

    this.fetchPromise = this._fetchPriceWithRetry();

    try {
      const price = await this.fetchPromise;
      this.cache = price;
      this.lastFetch = now;
      return price;
    } finally {
      this.fetchPromise = null;
    }
  }

  /**
   * Get historical price at a specific timestamp
   * Note: Pyth doesn't provide historical data natively, so this uses Hermes API
   */
  async getPriceAtTime(timestamp: number): Promise<PriceData> {
    try {
      const response = await axios.get(`${this.PYTH_HERMES_ENDPOINT}/v2/updates/price/${timestamp}`, {
        params: {
          ids: [this.SOL_USD_FEED_ID],
          parsed: true,
        },
        timeout: 8000,
      });

      const priceData = response.data?.parsed?.[0]?.price;
      if (!priceData) {
        throw new Error("No historical price data available");
      }

      return this._parsePythPrice(priceData);
    } catch (error) {
      console.error(`[Pyth] Failed to fetch historical price:`, error);
      throw new Error("Historical price not available");
    }
  }

  /**
   * Subscribe to real-time price updates
   * Callback receives price changes with percentage
   */
  subscribeToPriceUpdates(callback: PriceCallback, intervalMs: number = 2000): () => void {
    this.subscribers.add(callback);

    // Start subscription loop if not already running
    if (!this.subscriptionInterval) {
      this._startPriceSubscription(intervalMs);
    }

    // Return unsubscribe function
    return () => {
      this.subscribers.delete(callback);
      if (this.subscribers.size === 0) {
        this._stopPriceSubscription();
      }
    };
  }

  /**
   * Validate price (sanity checks)
   */
  private _validatePrice(price: number): boolean {
    // SOL should be between $1 and $10,000 (reasonable bounds)
    if (price < 1 || price > 10000) {
      console.warn(`[Pyth] Price ${price} outside reasonable range`);
      return false;
    }

    // Check for sudden jumps (>50% from previous)
    if (this.previousPrice > 0) {
      const changePercent = Math.abs((price - this.previousPrice) / this.previousPrice) * 100;
      if (changePercent > 50) {
        console.warn(`[Pyth] Suspicious price change: ${changePercent.toFixed(2)}%`);
        return false;
      }
    }

    return true;
  }

  /**
   * Fetch price with exponential backoff retry
   */
  private async _fetchPriceWithRetry(): Promise<PriceData> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < this.config.retryAttempts; attempt++) {
      try {
        // Try Pyth Hermes HTTP API first (faster)
        const price = await this._fetchFromHermes();
        
        if (this._validatePrice(price.price)) {
          return price;
        } else {
          throw new Error("Price failed validation");
        }
      } catch (error) {
        lastError = error as Error;
        console.error(`[Pyth] Attempt ${attempt + 1}/${this.config.retryAttempts} failed:`, error);

        if (attempt < this.config.retryAttempts - 1) {
          // Exponential backoff: 1s, 2s, 4s...
          const delay = this.config.retryDelayMs * Math.pow(2, attempt);
          await this._sleep(delay);
        }
      }
    }

    // Fallback to Jupiter if enabled
    if (this.config.enableFallback) {
      console.log("[Pyth] Falling back to Jupiter API...");
      try {
        return await this._fetchFromJupiter();
      } catch (error) {
        console.error("[Pyth] Jupiter fallback failed:", error);
      }
    }

    throw new Error(`Failed to fetch price after ${this.config.retryAttempts} attempts: ${lastError?.message}`);
  }

  /**
   * Fetch price from Pyth Hermes HTTP API
   */
  private async _fetchFromHermes(): Promise<PriceData> {
    const response = await axios.get(`${this.PYTH_HERMES_ENDPOINT}/v2/updates/price/latest`, {
      params: {
        ids: [this.SOL_USD_FEED_ID],
      },
      timeout: 8000,
    });

    const priceData = response.data?.parsed?.[0]?.price;
    if (!priceData) {
      throw new Error("Invalid Pyth Hermes response");
    }

    return this._parsePythPrice(priceData);
  }

  /**
   * Fetch price from Pyth on-chain (slower, more reliable)
   */
  private async _fetchFromOnChain(): Promise<PriceData> {
    if (!this.pythClient) {
      throw new Error("Pyth client not initialized");
    }

    const data = await this.pythClient.getAssetPricesFromAccounts([this.SOL_USD_PRICE_ACCOUNT]);
    
    if (!data || data.length === 0) {
      throw new Error("No on-chain price data");
    }

    const priceComponent = data[0] as any; // Type assertion for Pyth client compatibility
    const price = priceComponent.price || 0;
    const confidence = priceComponent.confidence || 0;

    return {
      price,
      confidence,
      exponent: priceComponent.expo || 0,
      timestamp: Date.now(),
      slot: priceComponent.slot?.toNumber?.() || undefined,
    };
  }

  /**
   * Fallback: Fetch price from Jupiter Aggregator
   */
  private async _fetchFromJupiter(): Promise<PriceData> {
    const response = await axios.get(this.JUPITER_API, { timeout: 5000 });
    
    const solData = response.data?.data?.SOL;
    if (!solData) {
      throw new Error("Invalid Jupiter API response");
    }

    return {
      price: parseFloat(solData.price),
      confidence: 0,
      exponent: 0,
      timestamp: Date.now(),
    };
  }

  /**
   * Parse Pyth price data from API response
   */
  private _parsePythPrice(priceData: any): PriceData {
    const price = parseFloat(priceData.price) * Math.pow(10, priceData.expo);
    const confidence = parseFloat(priceData.conf) * Math.pow(10, priceData.expo);
    const timestamp = parseInt(priceData.publish_time, 10) * 1000;

    if (isNaN(price) || price <= 0) {
      throw new Error("Invalid price value");
    }

    return {
      price,
      confidence,
      exponent: priceData.expo,
      timestamp,
    };
  }

  /**
   * Start real-time price subscription
   */
  private _startPriceSubscription(intervalMs: number): void {
    console.log(`[Pyth] Starting price subscription (${intervalMs}ms interval)`);

    this.subscriptionInterval = setInterval(async () => {
      try {
        const priceData = await this.getCurrentPrice();
        const previous = this.previousPrice || priceData.price;
        const change = priceData.price - previous;
        const changePercent = previous > 0 ? (change / previous) * 100 : 0;

        const update: PriceUpdate = {
          price: priceData.price,
          previousPrice: previous,
          change,
          changePercent,
          timestamp: priceData.timestamp,
        };

        this.previousPrice = priceData.price;

        // Notify all subscribers
        this.subscribers.forEach((callback) => {
          try {
            callback(update);
          } catch (error) {
            console.error("[Pyth] Subscriber callback error:", error);
          }
        });
      } catch (error) {
        console.error("[Pyth] Subscription update failed:", error);
      }
    }, intervalMs);
  }

  /**
   * Stop price subscription
   */
  private _stopPriceSubscription(): void {
    if (this.subscriptionInterval) {
      clearInterval(this.subscriptionInterval);
      this.subscriptionInterval = null;
      console.log("[Pyth] Stopped price subscription");
    }
  }

  /**
   * Clear price cache (force fresh fetch)
   */
  clearCache(): void {
    this.cache = null;
    this.lastFetch = 0;
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this._stopPriceSubscription();
    this.subscribers.clear();
    this.clearCache();
  }

  /**
   * Get service statistics
   */
  getStats() {
    return {
      cached: !!this.cache,
      cacheAge: this.cache ? Date.now() - this.lastFetch : null,
      subscribers: this.subscribers.size,
      lastPrice: this.cache?.price,
      lastUpdate: this.cache?.timestamp,
    };
  }

  private _sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Example usage
export async function exampleUsage() {
  const pythService = new PythPriceService({
    solanaRpcUrl: process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com",
    network: "devnet",
    enableFallback: true,
    cacheMs: 5000,
    retryAttempts: 3,
  });

  try {
    // Get current price
    const currentPrice = await pythService.getCurrentPrice();
    console.log(`Current SOL/USD: $${currentPrice.price.toFixed(2)}`);
    console.log(`Confidence: ±$${currentPrice.confidence.toFixed(4)}`);
    console.log(`Timestamp: ${new Date(currentPrice.timestamp).toISOString()}`);

    // Subscribe to real-time updates
    const unsubscribe = pythService.subscribeToPriceUpdates((update) => {
      console.log(`Price Update: $${update.price.toFixed(2)} (${update.changePercent > 0 ? "+" : ""}${update.changePercent.toFixed(2)}%)`);
    }, 2000);

    // Unsubscribe after 30 seconds
    setTimeout(() => {
      unsubscribe();
      pythService.destroy();
    }, 30000);
  } catch (error) {
    console.error("Failed to fetch price:", error);
  }
}
