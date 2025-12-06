import { expect, Locator, Page } from "@playwright/test";

type PredictionDirection = "up" | "down";

export class ArenaPage {
  private readonly connectButton: Locator;
  private readonly arenaSection: Locator;
  private readonly connectionStatus: Locator;

  constructor(private readonly page: Page) {
    this.connectButton = page.getByTestId("wallet-connect-button");
    this.arenaSection = page.getByTestId("arena-section");
    this.connectionStatus = page.getByTestId("wallet-connection-status");
  }

  async waitForWalletConnected() {
    await expect(this.connectButton).toBeVisible();
    const state = await this.page.evaluate(() => {
      const globalState = (window as typeof window & {
        __TEST_WALLET_STATE?: { connected: boolean; wallet: string | null };
      }).__TEST_WALLET_STATE;
      return globalState ?? null;
    });
    console.log("Current test wallet state", state);
    await expect(this.connectionStatus).toHaveText(/^Connected$/i, { timeout: 30_000 });
    await this.page.waitForFunction(() => {
      const globalState = (window as typeof window & {
        __TEST_WALLET_STATE?: { connected: boolean };
      }).__TEST_WALLET_STATE;
      return Boolean(globalState?.connected);
    }, null, { timeout: 30_000 });
  }

  async captureVisualBaseline(name: string) {
    await this.arenaSection.scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(200);
    await expect(this.arenaSection).toHaveScreenshot(name);
  }

  async makePrediction(direction: PredictionDirection) {
    await this.page.getByRole("button", { name: direction.toUpperCase() }).click();
  }

  async waitForWaitingIndicator() {
    await expect(this.page.getByTestId("prediction-waiting")).toBeVisible();
  }

  async waitForResultModal() {
    const modal = this.page.getByTestId("result-modal");
    await modal.waitFor({ state: "visible" });
    return modal;
  }

  async closeResultModal() {
    await this.page.getByRole("button", { name: /queue next round/i }).click();
    await expect(this.page.getByTestId("result-modal")).toBeHidden({ timeout: 10_000 });
  }
}
