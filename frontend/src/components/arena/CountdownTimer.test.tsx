import { render, screen } from "@testing-library/react";

import CountdownTimer from "./CountdownTimer";

describe("CountdownTimer", () => {
  it("ceilings the remaining seconds and shows live label by default", () => {
    render(<CountdownTimer duration={60} timeLeft={12.3} label="Countdown" />);

    expect(screen.getByText("Countdown")).toBeInTheDocument();
    expect(screen.getByText("13s")).toBeInTheDocument();
    expect(screen.getByText("LIVE")).toBeInTheDocument();
  });

  it("switches to locked styling when waiting", () => {
    render(<CountdownTimer duration={120} timeLeft={0} label="Lock" isWaiting />);

    expect(screen.getByText("LOCKED")).toBeInTheDocument();
    const progress = screen.getByTestId("timer-progress");
    expect(progress).toHaveClass("from-purple-400");
  });
});
