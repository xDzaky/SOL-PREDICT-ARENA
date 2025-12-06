import { test as base } from "@playwright/test";
import { ArenaPage } from "../pages/ArenaPage";
import { ProfilePanelPage } from "../pages/ProfilePanelPage";
import { LeaderboardPageModel } from "../pages/LeaderboardPage";

interface Fixtures {
  arenaPage: ArenaPage;
  profilePanel: ProfilePanelPage;
  leaderboardPage: LeaderboardPageModel;
}

export const test = base.extend<Fixtures>({
  arenaPage: async ({ page }, use) => {
    await use(new ArenaPage(page));
  },
  profilePanel: async ({ page }, use) => {
    await use(new ProfilePanelPage(page));
  },
  leaderboardPage: async ({ page }, use) => {
    await use(new LeaderboardPageModel(page));
  },
});

export { expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.route("https://hermes.pyth.network/api/latest_price_feeds?*", (route) =>
    route.fulfill({
      status: 200,
      body: JSON.stringify([
        {
          id: "mock-feed",
          price: { price: 145_000_000, conf: 10_000, expo: -6, publish_time: Date.now() / 1000 },
          ema_price: { price: 144_500_000, expo: -6 },
        },
      ]),
      headers: { "content-type": "application/json" },
    })
  );
  await page.addStyleTag({
    content: `*, *::before, *::after { transition-duration: 0s !important; animation-duration: 0s !important; animation-delay: 0s !important; }`,
  });
});
