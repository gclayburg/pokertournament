import { render, screen } from "@testing-library/react";

import { BlindsDisplay } from "@/components/BlindsDisplay";
import type { BlindLevel } from "@/types/tournament";

const levels: BlindLevel[] = [
  { type: "blind", smallBlind: 100, bigBlind: 200 },
  { type: "blind", smallBlind: 200, bigBlind: 400 },
  { type: "break" },
  { type: "blind", smallBlind: 300, bigBlind: 600 },
  { type: "blind", smallBlind: 400, bigBlind: 800 },
];

describe("BlindsDisplay", () => {
  it("shows_current_blinds", () => {
    render(<BlindsDisplay currentLevelIndex={1} levels={levels} />);

    expect(screen.getByText("200 / 400")).toBeInTheDocument();
  });

  it("shows_next_up", () => {
    render(<BlindsDisplay currentLevelIndex={1} levels={levels} />);

    expect(screen.getByText("Next up")).toBeInTheDocument();
    expect(screen.getByText("300 / 600")).toBeInTheDocument();
  });

  it("shows_two_ahead", () => {
    render(<BlindsDisplay currentLevelIndex={1} levels={levels} />);

    expect(screen.getByText("400 / 800")).toBeInTheDocument();
  });

  it("handles_last_level", () => {
    render(<BlindsDisplay currentLevelIndex={4} levels={levels} />);

    expect(screen.queryByText("Next up")).not.toBeInTheDocument();
  });
});
