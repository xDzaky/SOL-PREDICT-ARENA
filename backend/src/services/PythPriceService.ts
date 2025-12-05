import axios from "axios";

export interface PythPrice {
  price: number;
  timestamp: number;
  confidence: number;
}

export class PythPriceService {
  private readonly PYTH_HERMES_ENDPOINT = "https://hermes.pyth.network";
  private readonly SOL_USD_FEED_ID = "0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d";
  private cache: PythPrice | null = null;
  private lastFetch: number = 0;
  private readonly CACHE_TTL_MS = 5000; // 5 seconds cache
  private fetchPromise: Promise<PythPrice> | null = null;

  async getLatestPrice(): Promise<PythPrice> {
    const now = Date.now();

    // Return cached price if still valid
    if (this.cache && now - this.lastFetch < this.CACHE_TTL_MS) {
      return this.cache;
    }

    // Deduplicate concurrent requests
    if (this.fetchPromise) {
      return this.fetchPromise;
    }

    this.fetchPromise = this.fetchPriceFromPyth();

    try {
      const price = await this.fetchPromise;
      this.cache = price;
      this.lastFetch = now;
      return price;
    } finally {
      this.fetchPromise = null;
    }
  }

  private async fetchPriceFromPyth(): Promise<PythPrice> {
    try {
      const response = await axios.get(
        `${this.PYTH_HERMES_ENDPOINT}/v2/updates/price/latest`,
        {
          params: {
            ids: [this.SOL_USD_FEED_ID],
          },
          timeout: 8000,
        }
      );

      const priceData = response.data?.parsed?.[0]?.price;
      if (!priceData) {
        throw new Error("Invalid Pyth response format");
      }

      const price = parseFloat(priceData.price) * Math.pow(10, priceData.expo);
      const confidence = parseFloat(priceData.conf) * Math.pow(10, priceData.expo);
      const timestamp = parseInt(priceData.publish_time, 10) * 1000; // Convert to ms

      if (isNaN(price) || price <= 0) {
        throw new Error("Invalid price value");
      }

      console.log(`[Pyth] Fetched SOL price: $${price.toFixed(2)}`);

      return {
        price,
        confidence,
        timestamp,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(`[Pyth] API Error: ${error.message}`);
        throw new Error(`Failed to fetch Pyth price: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Waits for a specific duration then fetches the price.
   * Useful for getting the end price after a challenge duration.
   */
  async getPriceAfterDelay(delayMs: number): Promise<PythPrice> {
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    // Clear cache to force fresh fetch
    this.cache = null;
    return this.getLatestPrice();
  }

  clearCache(): void {
    this.cache = null;
    this.lastFetch = 0;
  }
}
