import { expect } from "@playwright/test";
import { test } from "./fixtures/test-fixture";

test("profile flow surfaces stats, badges, and history", async ({ page, arenaPage, profilePanel }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await arenaPage.waitForWalletConnected();
  await profilePanel.waitForProfileReady();

  await profilePanel.scrollIntoView();
  await profilePanel.expectBadgeListVisible();
  await profilePanel.expectMatchHistoryVisible();

  const xpBefore = await profilePanel.getXpValue();
  await profilePanel.awardBadge(9);
  await expect(page.getByText(/Badge awarded/i)).toBeVisible();

  await profilePanel.updateStats({ wins: 0, losses: 1, xp: 25 });
  await profilePanel.expectXpValue(xpBefore + 25);
});
