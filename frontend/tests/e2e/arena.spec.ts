import { expect } from "@playwright/test";
import { test } from "./fixtures/test-fixture";

test("complete game flow updates profile stats", async ({ page, arenaPage, profilePanel }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });

  await arenaPage.waitForWalletConnected();
  await profilePanel.waitForProfileReady();
  await arenaPage.captureVisualBaseline("arena-section.png");

  const xpBefore = await profilePanel.getXpValue();

  await arenaPage.makePrediction("up");
  await arenaPage.waitForWaitingIndicator();
  const modal = await arenaPage.waitForResultModal();
  await expect(modal).toContainText(/winning direction/i);
  await arenaPage.closeResultModal();

  await profilePanel.updateStats({ wins: 1, losses: 0, xp: 75 });
  await profilePanel.expectXpValue(xpBefore + 75);
});
