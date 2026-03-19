import { act, fireEvent, render, screen, within } from "@testing-library/react";

import HomePage from "@/app/page";
import {
  initializeAudioAlerts,
  playBreakEndTone,
  playBreakStartTone,
  playLevelChangeTone,
  playWarningTone,
} from "@/audio/tones";

jest.mock("@/audio/tones", () => ({
  initializeAudioAlerts: jest.fn(),
  playBreakEndTone: jest.fn(),
  playBreakStartTone: jest.fn(),
  playLevelChangeTone: jest.fn(),
  playWarningTone: jest.fn(),
}));

function renderTournament() {
  return render(<HomePage />);
}

function getTimer() {
  return within(screen.getByLabelText("Tournament timer"));
}

function getBlinds() {
  return within(screen.getByLabelText("Blind levels"));
}

function getEntriesPanel() {
  return within(screen.getByLabelText("Entries"));
}

function getPrizePoolPanel() {
  return within(screen.getByLabelText("Prize pool"));
}

function getBuyinPanel() {
  return within(screen.getByLabelText("Buyin and reentry"));
}

function updateNumberField(label: string, value: number) {
  fireEvent.change(screen.getByLabelText(label), {
    target: { value: String(value) },
  });
}

function startFastTournament(entries = 4) {
  renderTournament();

  updateNumberField("Number of entries", entries);
  updateNumberField("Level duration (minutes)", 2);
  updateNumberField("Break duration (minutes)", 1);

  fireEvent.click(screen.getByRole("button", { name: "Start Tournament" }));
}

function advanceTime(ms: number) {
  act(() => {
    jest.advanceTimersByTime(ms);
  });
}

describe("tournament flow integration", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-03-19T00:00:00Z"));
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("full_tournament_lifecycle", () => {
    startFastTournament();

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(getTimer().getByText("02:00")).toBeInTheDocument();
    expect(getBlinds().getByText("25 / 50")).toBeInTheDocument();

    advanceTime(60_000);

    expect(getTimer().getByText("01:00")).toBeInTheDocument();
    expect(playWarningTone).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "Pause" }));
    expect(getTimer().getByText("PAUSED")).toBeInTheDocument();

    advanceTime(30_000);

    expect(getTimer().getByText("01:00")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Resume" }));
    advanceTime(60_000);

    expect(getBlinds().getByText("50 / 100")).toBeInTheDocument();
    expect(playLevelChangeTone).toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Bust Player" }));

    expect(getEntriesPanel().getByText("3")).toBeInTheDocument();
    expect(getBuyinPanel().getByText("13,333")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Add Rebuy" }));

    expect(getEntriesPanel().getByText("5")).toBeInTheDocument();
    expect(getPrizePoolPanel().getByText("$200.00")).toBeInTheDocument();
    expect(getBuyinPanel().getByText("50,000")).toBeInTheDocument();
    expect(getBuyinPanel().getByText("16,667")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Edit Level" }));
    fireEvent.change(screen.getByLabelText("Target level"), {
      target: { value: "2" },
    });
    fireEvent.change(screen.getByLabelText("Minutes"), {
      target: { value: "5" },
    });
    fireEvent.change(screen.getByLabelText("Seconds"), {
      target: { value: "0" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));

    expect(getBlinds().getByText("100 / 200")).toBeInTheDocument();
    expect(getBlinds().getByText("Level 3")).toBeInTheDocument();
    expect(getTimer().getByText("05:00")).toBeInTheDocument();

    advanceTime(540_000);

    expect(getTimer().getByText("Break")).toBeInTheDocument();
    expect(playBreakStartTone).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "Skip Break" }));

    expect(getBlinds().getByText("300 / 600")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Add Rebuy" })).not.toBeInTheDocument();
    expect(playBreakEndTone).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "Bust Player" }));
    fireEvent.click(screen.getByRole("button", { name: "Bust Player" }));

    expect(screen.getByText("Tournament Over")).toBeInTheDocument();
    expect(getEntriesPanel().getByText("1")).toBeInTheDocument();
  });

  test("config_to_start_transition", () => {
    renderTournament();

    expect(screen.getByRole("dialog")).toBeInTheDocument();

    updateNumberField("Number of entries", 6);

    fireEvent.click(screen.getByRole("button", { name: "Start Tournament" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(getTimer().getByText("20:00")).toBeInTheDocument();
    expect(getBlinds().getByText("25 / 50")).toBeInTheDocument();
    expect(getEntriesPanel().getAllByText("6")).toHaveLength(2);
    expect(getEntriesPanel().getByText("Players left")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Pause" })).toBeInTheDocument();
    expect(initializeAudioAlerts).toHaveBeenCalledTimes(1);
  });

  test("level_progression_and_rebuy_auto_close", () => {
    startFastTournament();

    advanceTime(600_000);

    expect(getTimer().getByText("Break")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Skip Break" })).toBeInTheDocument();
    expect(playBreakStartTone).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "Skip Break" }));

    expect(getBlinds().getByText("300 / 600")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Add Rebuy" })).not.toBeInTheDocument();
  });

  test("pause_resume_and_level_override", () => {
    startFastTournament();

    advanceTime(30_000);
    expect(getTimer().getByText("01:30")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Pause" }));
    expect(getTimer().getByText("PAUSED")).toBeInTheDocument();

    advanceTime(30_000);
    expect(getTimer().getByText("01:30")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Resume" }));
    advanceTime(1_000);
    expect(getTimer().getByText("01:29")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Edit Level" }));
    fireEvent.change(screen.getByLabelText("Target level"), {
      target: { value: "2" },
    });
    fireEvent.change(screen.getByLabelText("Minutes"), {
      target: { value: "5" },
    });
    fireEvent.change(screen.getByLabelText("Seconds"), {
      target: { value: "0" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));

    expect(getTimer().getByText("05:00")).toBeInTheDocument();
    expect(getBlinds().getByText("100 / 200")).toBeInTheDocument();
    expect(getBlinds().getByText("Level 3")).toBeInTheDocument();
  });

  test("player_tracking_updates_and_tournament_finish", () => {
    startFastTournament();

    fireEvent.click(screen.getByRole("button", { name: "Bust Player" }));
    expect(getEntriesPanel().getByText("3")).toBeInTheDocument();
    expect(getBuyinPanel().getByText("13,333")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Add Rebuy" }));
    expect(getEntriesPanel().getByText("5")).toBeInTheDocument();
    expect(getPrizePoolPanel().getByText("$200.00")).toBeInTheDocument();
    expect(getBuyinPanel().getByText("50,000")).toBeInTheDocument();
    expect(getBuyinPanel().getByText("16,667")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Bust Player" }));
    fireEvent.click(screen.getByRole("button", { name: "Bust Player" }));

    expect(screen.getByText("Tournament Over")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Pause" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Bust Player" })).not.toBeInTheDocument();
    expect(getEntriesPanel().getByText("1")).toBeInTheDocument();
  });
});
