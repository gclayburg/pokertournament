import { act, renderHook } from "@testing-library/react";

import { createInitialTournamentState } from "@/state/defaults";
import { useTimer } from "@/hooks/useTimer";
import type { TournamentAction, TournamentState } from "@/types/tournament";

function createState(overrides: Partial<TournamentState> = {}): TournamentState {
  return {
    ...createInitialTournamentState(),
    status: "running",
    timeRemainingMs: 2 * 60 * 1000,
    ...overrides,
  };
}

describe("useTimer", () => {
  let nowMs: number;
  let dateNowSpy: jest.SpyInstance<number, []>;

  beforeEach(() => {
    jest.useFakeTimers();
    nowMs = 1_000;
    dateNowSpy = jest.spyOn(Date, "now").mockImplementation(() => nowMs);
  });

  afterEach(() => {
    dateNowSpy.mockRestore();
    jest.useRealTimers();
  });

  test("starts_countdown_on_running", () => {
    const dispatch = jest.fn<void, [TournamentAction]>();

    renderHook(({ state }) => useTimer({ dispatch, state }), {
      initialProps: { state: createState() },
    });

    act(() => {
      nowMs = 1_120;
      jest.advanceTimersByTime(100);
    });

    expect(dispatch).toHaveBeenCalledWith({ type: "TICK", elapsedMs: 120 });
  });

  test("stops_on_pause", () => {
    const dispatch = jest.fn<void, [TournamentAction]>();
    const { rerender } = renderHook(({ state }) => useTimer({ dispatch, state }), {
      initialProps: { state: createState() },
    });

    act(() => {
      nowMs = 1_100;
      jest.advanceTimersByTime(100);
    });

    rerender({
      state: createState({
        status: "paused",
        timeRemainingMs: 119_900,
      }),
    });

    act(() => {
      nowMs = 1_400;
      jest.advanceTimersByTime(300);
    });

    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenLastCalledWith({ type: "TICK", elapsedMs: 100 });
  });

  test("drift_correction", () => {
    const dispatch = jest.fn<void, [TournamentAction]>();

    renderHook(({ state }) => useTimer({ dispatch, state }), {
      initialProps: { state: createState() },
    });

    act(() => {
      nowMs = 1_350;
      jest.advanceTimersByTime(100);
    });

    expect(dispatch).toHaveBeenCalledWith({ type: "TICK", elapsedMs: 350 });
  });

  test("one_minute_warning_fires", () => {
    const dispatch = jest.fn<void, [TournamentAction]>();
    const onOneMinuteWarning = jest.fn();
    const { rerender } = renderHook(
      ({ state }) => useTimer({ dispatch, state, onOneMinuteWarning }),
      {
        initialProps: {
          state: createState({ timeRemainingMs: 61_000 }),
        },
      },
    );

    rerender({
      state: createState({ timeRemainingMs: 60_000 }),
    });

    expect(onOneMinuteWarning).toHaveBeenCalledTimes(1);
  });

  test("one_minute_warning_fires_once", () => {
    const dispatch = jest.fn<void, [TournamentAction]>();
    const onOneMinuteWarning = jest.fn();
    const { rerender } = renderHook(
      ({ state }) => useTimer({ dispatch, state, onOneMinuteWarning }),
      {
        initialProps: {
          state: createState({ timeRemainingMs: 61_000 }),
        },
      },
    );

    rerender({
      state: createState({ timeRemainingMs: 60_000 }),
    });
    rerender({
      state: createState({ timeRemainingMs: 59_000 }),
    });
    rerender({
      state: createState({ timeRemainingMs: 58_000 }),
    });

    expect(onOneMinuteWarning).toHaveBeenCalledTimes(1);
  });

  test("level_change_callback", () => {
    const dispatch = jest.fn<void, [TournamentAction]>();
    const onLevelChange = jest.fn();
    const { rerender } = renderHook(
      ({ state }) => useTimer({ dispatch, state, onLevelChange }),
      {
        initialProps: {
          state: createState({ currentLevelIndex: 0 }),
        },
      },
    );

    rerender({
      state: createState({ currentLevelIndex: 1 }),
    });

    expect(onLevelChange).toHaveBeenCalledTimes(1);
    expect(onLevelChange).toHaveBeenCalledWith(1, 0);
  });

  test("cleanup_on_unmount", () => {
    const dispatch = jest.fn<void, [TournamentAction]>();
    const clearIntervalSpy = jest.spyOn(window, "clearInterval");
    const { unmount } = renderHook(({ state }) => useTimer({ dispatch, state }), {
      initialProps: { state: createState() },
    });

    unmount();

    expect(clearIntervalSpy).toHaveBeenCalledTimes(1);

    clearIntervalSpy.mockRestore();
  });
});
