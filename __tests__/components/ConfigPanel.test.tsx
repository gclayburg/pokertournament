import { fireEvent, render, screen } from "@testing-library/react";

import { ConfigPanel } from "@/components/ConfigPanel";
import { useTournament } from "@/context/TournamentContext";
import { createInitialTournamentState } from "@/state/defaults";

jest.mock("@/context/TournamentContext", () => ({
  useTournament: jest.fn(),
}));

const mockedUseTournament = jest.mocked(useTournament);

describe("ConfigPanel", () => {
  it("visible_pre_start", () => {
    mockedUseTournament.mockReturnValue({
      dispatch: jest.fn(),
      state: createInitialTournamentState(),
    });

    render(<ConfigPanel />);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Start Tournament")).toBeInTheDocument();
  });

  it("hidden_after_start", () => {
    mockedUseTournament.mockReturnValue({
      dispatch: jest.fn(),
      state: {
        ...createInitialTournamentState(),
        status: "running",
        timeRemainingMs: 20 * 60 * 1000,
      },
    });

    render(<ConfigPanel />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("start_button_dispatches", () => {
    const dispatch = jest.fn();

    mockedUseTournament.mockReturnValue({
      dispatch,
      state: createInitialTournamentState(),
    });

    render(<ConfigPanel />);
    fireEvent.click(screen.getByRole("button", { name: "Start Tournament" }));

    expect(dispatch).toHaveBeenCalledWith({ type: "START" });
  });
});
