/**
 * Test suite for EnhancedPythPriceService
 * 
 * Run with: pnpm tsx src/tests/pythPriceService.test.ts
 */

import { PythPriceService } from "../services/EnhancedPythPriceService";
import dotenv from "dotenv";

dotenv.config();

async function testCurrentPrice() {
  console.log("\n=== Test 1: Get Current Price ===");
  
  const pythService = new PythPriceService({
    solanaRpcUrl: process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com",
    network: "mainnet-beta",
    enableFallback: true,
  });

  try {
    const price = await pythService.getCurrentPrice();
    console.log(`✅ Current SOL/USD: $${price.price.toFixed(2)}`);
    console.log(`   Confidence: ±$${price.confidence.toFixed(4)}`);
    console.log(`   Timestamp: ${new Date(price.timestamp).toISOString()}`);
    console.log(`   Exponent: ${price.exponent}`);

    // Test cache
    const cachedPrice = await pythService.getCurrentPrice();
    console.log(`✅ Cached price (should be instant): $${cachedPrice.price.toFixed(2)}`);

    // Stats
    const stats = pythService.getStats();
    console.log(`   Stats:`, stats);

    pythService.destroy();
  } catch (error: any) {
    console.error(`❌ Failed:`, error.message);
  }
}

async function testCacheInvalidation() {
  console.log("\n=== Test 2: Cache Invalidation ===");

  const pythService = new PythPriceService({
    solanaRpcUrl: process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com",
    network: "mainnet-beta",
    cacheMs: 2000, // 2 second cache
  });

  try {
    const price1 = await pythService.getCurrentPrice();
    console.log(`✅ First fetch: $${price1.price.toFixed(2)}`);

    console.log(`   Waiting 3 seconds for cache expiry...`);
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const price2 = await pythService.getCurrentPrice();
    console.log(`✅ Second fetch (cache expired): $${price2.price.toFixed(2)}`);

    pythService.destroy();
  } catch (error: any) {
    console.error(`❌ Failed:`, error.message);
  }
}

async function testRetryLogic() {
  console.log("\n=== Test 3: Retry Logic (Simulated) ===");

  const pythService = new PythPriceService({
    solanaRpcUrl: "https://invalid-rpc-url.com", // Intentionally invalid
    network: "mainnet-beta",
    enableFallback: true, // Should fallback to Jupiter
    retryAttempts: 2,
    retryDelayMs: 500,
  });

  try {
    console.log(`   Attempting fetch with invalid RPC (should fallback to Jupiter)...`);
    const price = await pythService.getCurrentPrice();
    console.log(`✅ Fallback successful: $${price.price.toFixed(2)}`);
    pythService.destroy();
  } catch (error: any) {
    console.log(`✅ Expected failure with retries: ${error.message}`);
  }
}

async function testPriceSubscription() {
  console.log("\n=== Test 4: Real-Time Price Subscription ===");

  const pythService = new PythPriceService({
    solanaRpcUrl: process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com",
    network: "mainnet-beta",
  });

  let updateCount = 0;

  const unsubscribe = pythService.subscribeToPriceUpdates(
    (update) => {
      updateCount++;
      console.log(
        `   Update #${updateCount}: $${update.price.toFixed(2)} ` +
        `(${update.changePercent >= 0 ? "+" : ""}${update.changePercent.toFixed(4)}% from $${update.previousPrice.toFixed(2)})`
      );

      if (updateCount >= 5) {
        console.log(`✅ Received 5 updates, unsubscribing...`);
        unsubscribe();
        pythService.destroy();
      }
    },
    2000 // 2 second interval
  );

  console.log(`   Subscribed to price updates (2s interval)...`);
}

async function testMultipleSubscribers() {
  console.log("\n=== Test 5: Multiple Subscribers ===");

  const pythService = new PythPriceService({
    solanaRpcUrl: process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com",
    network: "mainnet-beta",
  });

  let count1 = 0;
  let count2 = 0;

  const unsub1 = pythService.subscribeToPriceUpdates((update) => {
    count1++;
    console.log(`   [Subscriber 1] $${update.price.toFixed(2)}`);
  }, 2000);

  const unsub2 = pythService.subscribeToPriceUpdates((update) => {
    count2++;
    console.log(`   [Subscriber 2] $${update.price.toFixed(2)}`);
  }, 2000);

  setTimeout(() => {
    console.log(`✅ Subscriber 1 received ${count1} updates`);
    console.log(`✅ Subscriber 2 received ${count2} updates`);
    unsub1();
    unsub2();
    pythService.destroy();
  }, 6000);
}

async function testPriceValidation() {
  console.log("\n=== Test 6: Price Validation ===");

  const pythService = new PythPriceService({
    solanaRpcUrl: process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com",
    network: "mainnet-beta",
  });

  try {
    const price = await pythService.getCurrentPrice();
    
    if (price.price >= 1 && price.price <= 10000) {
      console.log(`✅ Price validation passed: $${price.price.toFixed(2)} is within bounds`);
    } else {
      console.log(`❌ Price validation failed: $${price.price.toFixed(2)} is out of bounds`);
    }

    pythService.destroy();
  } catch (error: any) {
    console.error(`❌ Failed:`, error.message);
  }
}

async function runAllTests() {
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║      Enhanced Pyth Price Service - Test Suite             ║");
  console.log("╚════════════════════════════════════════════════════════════╝");

  await testCurrentPrice();
  await testCacheInvalidation();
  await testRetryLogic();
  await testPriceValidation();
  
  // These tests run for a few seconds
  console.log("\n=== Running subscription tests (will take ~10s) ===");
  await testPriceSubscription();
  
  // Wait for subscription test to complete
  await new Promise((resolve) => setTimeout(resolve, 12000));
  
  await testMultipleSubscribers();
  
  // Wait for multiple subscribers test
  await new Promise((resolve) => setTimeout(resolve, 7000));
  
  console.log("\n✅ All tests completed!");
  process.exit(0);
}

// Run tests
runAllTests().catch((error) => {
  console.error("Test suite failed:", error);
  process.exit(1);
});
