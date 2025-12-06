import { render, screen } from "@testing-library/react";
import PlayerCard from "./PlayerCard";

const samplePlayer = {
  address: "wallet-1",
  username: "alphaLegend",
  level: 7,
  winRate: 68,
  streak: 4
};

describe("PlayerCard", () => {
  it("shows player stats with fallback avatar", () => {
    render(<PlayerCard label="Challenger" player={samplePlayer} />);

    expect(screen.getByText("Challenger")).toBeInTheDocument();
    expect(screen.getByText("Level 7")).toBeInTheDocument();
    expect(screen.getByText(samplePlayer.username)).toBeInTheDocument();
    expect(screen.getByText(`${samplePlayer.winRate}%`)).toBeInTheDocument();
    expect(screen.getByText(`${samplePlayer.streak}🔥`)).toBeInTheDocument();
    expect(screen.queryByRole("img", { name: /alphaLegend avatar/i })).not.toBeInTheDocument();
  });

  it("renders victory banner when outcome is win", () => {
    render(<PlayerCard label="You" player={samplePlayer} outcome="win" />);

    expect(screen.getByText(/victory/i)).toBeInTheDocument();
    expect(screen.getByText(samplePlayer.username)).toBeInTheDocument();
  });
});
