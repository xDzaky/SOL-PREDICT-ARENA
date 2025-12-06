import { expect, Locator, Page } from "@playwright/test";

export class LeaderboardPageModel {
  private readonly section: Locator;
  private readonly rows: Locator;

  constructor(private readonly page: Page) {
    this.section = page.getByTestId("leaderboard-section");
    this.rows = this.section.getByTestId("leaderboard-row");
  }

  async scrollIntoView() {
    await this.section.scrollIntoViewIfNeeded();
  }

  async captureVisualBaseline(name: string) {
    await this.section.scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(300);
    await expect(this.section).toHaveScreenshot(name);
  }

  async switchToSeasonScope() {
    await this.section.getByRole("button", { name: /current season/i }).click();
    await expect(this.section.getByRole("button", { name: /current season/i })).toHaveAttribute("aria-pressed", "true");
  }

  async search(term: string) {
    await this.section.getByTestId("leaderboard-search").fill(term);
  }

  async expectSearchResult(term: string) {
    const matches = this.rows.filter({ hasText: new RegExp(term, "i") });
    await expect(matches).toHaveCount(1);
    await expect(matches.first()).toBeVisible();
  }
}
