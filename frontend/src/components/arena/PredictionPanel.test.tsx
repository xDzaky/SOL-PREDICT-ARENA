import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import PredictionPanel from "./PredictionPanel";

describe("PredictionPanel", () => {
  it("calls onSelect when a direction is chosen", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(<PredictionPanel onSelect={onSelect} selected={null} isWaiting={false} />);

    await user.click(screen.getByRole("button", { name: /up/i }));
    expect(onSelect).toHaveBeenCalledWith("up");
  });

  it("disables unselected buttons when panel is disabled", () => {
    render(<PredictionPanel onSelect={vi.fn()} selected="up" disabled isWaiting={false} />);

    const upButton = screen.getByRole("button", { name: /up/i });
    const downButton = screen.getByRole("button", { name: /down/i });

    expect(upButton).not.toBeDisabled();
    expect(downButton).toBeDisabled();
  });

  it("shows waiting banner while awaiting outcome", () => {
    render(<PredictionPanel onSelect={vi.fn()} selected={null} disabled isWaiting />);

    expect(screen.getByText(/waiting for opponent/i)).toBeInTheDocument();
  });
});
