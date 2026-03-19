import { render, screen } from "@testing-library/react";

import { TimerDisplay } from "@/components/TimerDisplay";

describe("TimerDisplay", () => {
  it("renders_time_formatted", () => {
    render(<TimerDisplay status="running" timeRemainingMs={4 * 60 * 1000 + 9 * 1000} />);

    expect(screen.getByText("04:09")).toBeInTheDocument();
  });

  it("shows_break_label", () => {
    render(<TimerDisplay status="break" timeRemainingMs={6 * 60 * 1000 + 55 * 1000} />);

    expect(screen.getByText("Break")).toBeInTheDocument();
  });

  it("shows_paused_label", () => {
    render(<TimerDisplay status="paused" timeRemainingMs={90 * 1000} />);

    expect(screen.getByText("PAUSED")).toBeInTheDocument();
  });
});
