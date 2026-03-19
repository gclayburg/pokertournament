import { fireEvent, render, screen } from "@testing-library/react";

import { LevelOverrideModal } from "@/components/LevelOverrideModal";
import { useTournament } from "@/context/TournamentContext";
import { createInitialTournamentState } from "@/state/defaults";

jest.mock("@/context/TournamentContext", () => ({
  useTournament: jest.fn(),
}));

const mockedUseTournament = jest.mocked(useTournament);

describe("LevelOverrideModal", () => {
  it("lists_all_levels", () => {
    mockedUseTournament.mockReturnValue({
      dispatch: jest.fn(),
      state: {
        ...createInitialTournamentState(),
        status: "running",
        timeRemainingMs: 20 * 60 * 1000,
      },
    });

    render(<LevelOverrideModal isOpen onClose={jest.fn()} />);

    expect(screen.getByRole("option", { name: "Level 1: 25 / 50" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Level 14: 5000 / 10000" })).toBeInTheDocument();
  });

  it("apply_dispatches_set_level", () => {
    const dispatch = jest.fn();

    mockedUseTournament.mockReturnValue({
      dispatch,
      state: {
        ...createInitialTournamentState(),
        status: "running",
        timeRemainingMs: 20 * 60 * 1000,
      },
    });

    render(<LevelOverrideModal isOpen onClose={jest.fn()} />);

    fireEvent.change(screen.getByLabelText("Target level"), {
      target: { value: "8" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));

    expect(dispatch).toHaveBeenCalledWith({ type: "SET_LEVEL", levelIndex: 8 });
  });

  it("apply_dispatches_set_time", () => {
    const dispatch = jest.fn();

    mockedUseTournament.mockReturnValue({
      dispatch,
      state: {
        ...createInitialTournamentState(),
        status: "running",
        timeRemainingMs: 20 * 60 * 1000,
      },
    });

    render(<LevelOverrideModal isOpen onClose={jest.fn()} />);

    fireEvent.change(screen.getByLabelText("Minutes"), {
      target: { value: "5" },
    });
    fireEvent.change(screen.getByLabelText("Seconds"), {
      target: { value: "30" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));

    expect(dispatch).toHaveBeenCalledWith({
      type: "SET_TIME",
      timeRemainingMs: 330000,
    });
  });

  it("cancel_closes_modal", () => {
    const onClose = jest.fn();

    mockedUseTournament.mockReturnValue({
      dispatch: jest.fn(),
      state: {
        ...createInitialTournamentState(),
        status: "running",
        timeRemainingMs: 20 * 60 * 1000,
      },
    });

    render(<LevelOverrideModal isOpen onClose={onClose} />);
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(onClose).toHaveBeenCalled();
  });
});
