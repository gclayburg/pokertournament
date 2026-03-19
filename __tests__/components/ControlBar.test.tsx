import { fireEvent, render, screen } from "@testing-library/react";

import { ControlBar } from "@/components/ControlBar";
import { useTournament } from "@/context/TournamentContext";
import { createInitialTournamentState } from "@/state/defaults";

jest.mock("@/context/TournamentContext", () => ({
  useTournament: jest.fn(),
}));

const mockedUseTournament = jest.mocked(useTournament);

describe("ControlBar", () => {
  it("shows_pause_when_running", () => {
    mockedUseTournament.mockReturnValue({
      dispatch: jest.fn(),
      state: {
        ...createInitialTournamentState(),
        status: "running",
        timeRemainingMs: 20 * 60 * 1000,
      },
    });

    render(<ControlBar />);

    expect(screen.getByRole("button", { name: "Pause" })).toBeInTheDocument();
  });

  it("shows_resume_when_paused", () => {
    mockedUseTournament.mockReturnValue({
      dispatch: jest.fn(),
      state: {
        ...createInitialTournamentState(),
        status: "paused",
        timeRemainingMs: 20 * 60 * 1000,
      },
    });

    render(<ControlBar />);

    expect(screen.getByRole("button", { name: "Resume" })).toBeInTheDocument();
  });

  it("shows_skip_break", () => {
    mockedUseTournament.mockReturnValue({
      dispatch: jest.fn(),
      state: {
        ...createInitialTournamentState(),
        status: "break",
        currentLevelIndex: 5,
        timeRemainingMs: 10 * 60 * 1000,
      },
    });

    render(<ControlBar />);

    expect(screen.getByRole("button", { name: "Skip Break" })).toBeInTheDocument();
  });

  it("bust_player_dispatches", () => {
    const dispatch = jest.fn();

    mockedUseTournament.mockReturnValue({
      dispatch,
      state: {
        ...createInitialTournamentState(),
        status: "running",
        timeRemainingMs: 20 * 60 * 1000,
      },
    });

    render(<ControlBar />);
    fireEvent.click(screen.getByRole("button", { name: "Bust Player" }));

    expect(dispatch).toHaveBeenCalledWith({ type: "BUST_PLAYER" });
  });

  it("bust_player_disabled_at_one", () => {
    mockedUseTournament.mockReturnValue({
      dispatch: jest.fn(),
      state: {
        ...createInitialTournamentState(),
        status: "running",
        playersRemaining: 1,
        timeRemainingMs: 20 * 60 * 1000,
      },
    });

    render(<ControlBar />);

    expect(screen.getByRole("button", { name: "Bust Player" })).toBeDisabled();
  });

  it("add_rebuy_visible_when_open", () => {
    const dispatch = jest.fn();

    mockedUseTournament.mockReturnValue({
      dispatch,
      state: {
        ...createInitialTournamentState(),
        status: "running",
        currentLevelIndex: 2,
        timeRemainingMs: 20 * 60 * 1000,
      },
    });

    render(<ControlBar />);
    fireEvent.click(screen.getByRole("button", { name: "Add Rebuy" }));

    expect(dispatch).toHaveBeenCalledWith({ type: "ADD_REBUY" });
  });

  it("add_rebuy_hidden_when_closed", () => {
    mockedUseTournament.mockReturnValue({
      dispatch: jest.fn(),
      state: {
        ...createInitialTournamentState(),
        status: "running",
        currentLevelIndex: 7,
        timeRemainingMs: 20 * 60 * 1000,
      },
    });

    render(<ControlBar />);

    expect(screen.queryByRole("button", { name: "Add Rebuy" })).not.toBeInTheDocument();
  });

  it("no_controls_when_finished", () => {
    mockedUseTournament.mockReturnValue({
      dispatch: jest.fn(),
      state: {
        ...createInitialTournamentState(),
        status: "finished",
      },
    });

    render(<ControlBar />);

    expect(screen.getByText("Tournament Over")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
