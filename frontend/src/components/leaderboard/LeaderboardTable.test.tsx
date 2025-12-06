import { render, screen } from "@testing-library/react";

import LeaderboardTable from "./LeaderboardTable";

const baseEntries = [
  {
    rank: 1,
    wallet: "0xabc",
    username: "Alice",
    xp: 1250,
    wins: 22,
    losses: 3,
    winRate: 88
  },
  {
    rank: 2,
    wallet: "0xdef",
    username: "Bob",
    xp: 990,
    wins: 18,
    losses: 7,
    winRate: 72
  },
  {
    rank: 4,
    wallet: "0xghi",
    username: "Cara",
    xp: 800,
    wins: 12,
    losses: 10,
    winRate: 55
  }
];

describe("LeaderboardTable", () => {
  it("renders rows and highlights the current wallet", () => {
    render(<LeaderboardTable entries={baseEntries} currentWallet="0xabc" />);

    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
    const aliceRow = screen.getByText("Alice").closest(".grid");
    expect(aliceRow).toHaveClass("from-cyan-500/10");
  });

  it("shows medal icons for top ranks and numeric rank for others", () => {
    render(<LeaderboardTable entries={baseEntries} />);

  expect(screen.getByTestId("crown-icon")).toBeInTheDocument();
  expect(screen.getByTestId("medal-icon")).toBeInTheDocument();
    expect(screen.getByText("#4")).toBeInTheDocument();
  });
});
