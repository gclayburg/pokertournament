import { renderHook } from "@testing-library/react";

import {
  initializeAudioAlerts,
  playBreakEndTone,
  playBreakStartTone,
  playLevelChangeTone,
  playWarningTone,
} from "@/audio/tones";
import { useAudioAlerts } from "@/hooks/useAudioAlerts";
import { createInitialTournamentState } from "@/state/defaults";
import type { TournamentState } from "@/types/tournament";

jest.mock("@/audio/tones", () => ({
  initializeAudioAlerts: jest.fn(),
  playBreakEndTone: jest.fn(),
  playBreakStartTone: jest.fn(),
  playLevelChangeTone: jest.fn(),
  playWarningTone: jest.fn(),
}));

function createState(overrides: Partial<TournamentState> = {}): TournamentState {
  return {
    ...createInitialTournamentState(),
    status: "running",
    timeRemainingMs: 2 * 60 * 1000,
    ...overrides,
  };
}

describe("useAudioAlerts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("fires_warning_at_one_minute", () => {
    const { rerender } = renderHook(({ state }) => useAudioAlerts(state), {
      initialProps: {
        state: createState({ timeRemainingMs: 61_000 }),
      },
    });

    rerender({
      state: createState({ timeRemainingMs: 60_000 }),
    });

    expect(playWarningTone).toHaveBeenCalledTimes(1);
  });

  test("fires_level_change", () => {
    const { rerender } = renderHook(({ state }) => useAudioAlerts(state), {
      initialProps: {
        state: createState({ currentLevelIndex: 0 }),
      },
    });

    rerender({
      state: createState({ currentLevelIndex: 1 }),
    });

    expect(playLevelChangeTone).toHaveBeenCalledTimes(1);
  });

  test("fires_break_start", () => {
    const { rerender } = renderHook(({ state }) => useAudioAlerts(state), {
      initialProps: {
        state: createState({ status: "running" }),
      },
    });

    rerender({
      state: createState({ status: "break" }),
    });

    expect(playBreakStartTone).toHaveBeenCalledTimes(1);
  });

  test("fires_break_end", () => {
    const { rerender } = renderHook(({ state }) => useAudioAlerts(state), {
      initialProps: {
        state: createState({ status: "break" }),
      },
    });

    rerender({
      state: createState({ status: "running" }),
    });

    expect(playBreakEndTone).toHaveBeenCalledTimes(1);
  });

  test("no_duplicate_warning", () => {
    const { rerender } = renderHook(({ state }) => useAudioAlerts(state), {
      initialProps: {
        state: createState({ timeRemainingMs: 61_000 }),
      },
    });

    rerender({
      state: createState({ timeRemainingMs: 60_000 }),
    });
    rerender({
      state: createState({ timeRemainingMs: 59_000 }),
    });
    rerender({
      state: createState({ timeRemainingMs: 58_000 }),
    });

    expect(playWarningTone).toHaveBeenCalledTimes(1);
  });

  test("bootstraps_audio_listeners_on_mount", () => {
    renderHook(({ state }) => useAudioAlerts(state), {
      initialProps: {
        state: createState(),
      },
    });

    expect(initializeAudioAlerts).toHaveBeenCalledTimes(1);
  });
});
