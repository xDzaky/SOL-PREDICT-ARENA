import { test } from "./fixtures/test-fixture";

test("leaderboard flow with filters and search", async ({ page, leaderboardPage, profilePanel }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await profilePanel.waitForProfileReady();

  await leaderboardPage.scrollIntoView();
  await leaderboardPage.captureVisualBaseline("leaderboard-section.png");
  await leaderboardPage.switchToSeasonScope();
  await leaderboardPage.search("5EY001");
  await leaderboardPage.expectSearchResult("5EY001");

  await profilePanel.scrollIntoView();
  await profilePanel.expectBadgeListVisible();
});
