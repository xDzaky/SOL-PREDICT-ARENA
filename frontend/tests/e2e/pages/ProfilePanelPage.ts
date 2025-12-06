import { expect, Locator, Page } from "@playwright/test";

interface UpdateStatsPayload {
  wins: number;
  losses: number;
  xp: number;
}

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export class ProfilePanelPage {
  private readonly panel: Locator;
  private readonly xpValue: Locator;

  constructor(private readonly page: Page) {
    this.panel = page.getByTestId("profile-panel");
    this.xpValue = page.getByTestId("profile-xp");
  }

  async scrollIntoView() {
    await expect(this.panel).toBeVisible();
    await this.panel.scrollIntoViewIfNeeded();
  }

  async waitForProfileReady() {
    await expect(this.panel).toContainText(/profile found/i, { timeout: 30_000 });
    await expect(this.xpValue).toBeVisible({ timeout: 30_000 });
  }

  async getXpValue() {
    await expect(this.xpValue).toBeVisible({ timeout: 30_000 });
    const text = await this.xpValue.innerText();
    return Number(text.replace(/,/g, ""));
  }

  async updateStats({ wins, losses, xp }: UpdateStatsPayload) {
    await this.panel.getByLabel("WINS").fill(String(wins));
    await this.panel.getByLabel("LOSSES").fill(String(losses));
    await this.panel.getByLabel("XP").fill(String(xp));
    await this.panel.getByRole("button", { name: /save stats/i }).click();
  }

  async expectXpValue(expected: number) {
    const pattern = escapeRegex(expected.toLocaleString());
    await expect(this.xpValue).toHaveText(new RegExp(pattern));
  }

  async awardBadge(badgeId: number) {
    await this.panel.getByTestId("badge-input").fill(String(badgeId));
    await this.panel.getByRole("button", { name: /award badge/i }).click();
  }

  async expectBadgeListVisible() {
    await this.waitForProfileReady();
    await expect(this.panel.getByText(/recent badges/i)).toBeVisible();
  }

  async expectMatchHistoryVisible() {
    await this.waitForProfileReady();
    await expect(this.page.getByTestId("match-history-list")).toBeVisible();
    await expect(this.page.getByTestId("match-history-list").locator("li")).toHaveCount(3);
  }
}
