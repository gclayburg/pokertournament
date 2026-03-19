import { DEFAULT_CONFIG, createInitialTournamentState } from "@/state/defaults";
import { tournamentReducer } from "@/state/tournamentReducer";

describe("tournamentReducer", () => {
  test("start_tournament", () => {
    const state = createInitialTournamentState();
    const nextState = tournamentReducer(state, { type: "START" });

    expect(nextState.status).toBe("running");
    expect(nextState.currentLevelIndex).toBe(0);
    expect(nextState.timeRemainingMs).toBe(20 * 60 * 1000);
  });

  test("pause_and_resume", () => {
    const runningState = {
      ...createInitialTournamentState(),
      status: "running" as const,
      timeRemainingMs: 20 * 60 * 1000,
    };

    const pausedState = tournamentReducer(runningState, { type: "PAUSE" });
    const resumedState = tournamentReducer(pausedState, { type: "RESUME" });

    expect(pausedState.status).toBe("paused");
    expect(resumedState.status).toBe("running");
  });

  test("tick_decrements_time", () => {
    const runningState = {
      ...createInitialTournamentState(),
      status: "running" as const,
      timeRemainingMs: 20 * 60 * 1000,
    };

    const nextState = tournamentReducer(runningState, { type: "TICK", elapsedMs: 15000 });

    expect(nextState.timeRemainingMs).toBe(20 * 60 * 1000 - 15000);
  });

  test("auto_advance_on_zero", () => {
    const runningState = {
      ...createInitialTournamentState(),
      status: "running" as const,
      timeRemainingMs: 5000,
    };

    const nextState = tournamentReducer(runningState, { type: "TICK", elapsedMs: 5000 });

    expect(nextState.currentLevelIndex).toBe(1);
    expect(nextState.status).toBe("running");
    expect(nextState.timeRemainingMs).toBe(20 * 60 * 1000);
  });

  test("advance_to_break", () => {
    const state = {
      ...createInitialTournamentState(),
      status: "running" as const,
      currentLevelIndex: 4,
      timeRemainingMs: 1000,
    };

    const nextState = tournamentReducer(state, { type: "ADVANCE_LEVEL" });

    expect(nextState.currentLevelIndex).toBe(5);
    expect(nextState.status).toBe("break");
    expect(nextState.timeRemainingMs).toBe(10 * 60 * 1000);
  });

  test("skip_break", () => {
    const state = {
      ...createInitialTournamentState(),
      status: "break" as const,
      currentLevelIndex: 5,
      timeRemainingMs: 10 * 60 * 1000,
    };

    const nextState = tournamentReducer(state, { type: "SKIP_BREAK" });

    expect(nextState.currentLevelIndex).toBe(6);
    expect(nextState.status).toBe("running");
  });

  test("set_level_override", () => {
    const state = {
      ...createInitialTournamentState(),
      status: "running" as const,
    };

    const nextState = tournamentReducer(state, { type: "SET_LEVEL", levelIndex: 3 });

    expect(nextState.currentLevelIndex).toBe(3);
    expect(nextState.timeRemainingMs).toBe(20 * 60 * 1000);
  });

  test("set_time_override", () => {
    const state = createInitialTournamentState();
    const nextState = tournamentReducer(state, { type: "SET_TIME", timeRemainingMs: 123000 });

    expect(nextState.timeRemainingMs).toBe(123000);
  });

  test("bust_player_decrements", () => {
    const state = {
      ...createInitialTournamentState(),
      status: "running" as const,
      playersRemaining: 4,
    };

    const nextState = tournamentReducer(state, { type: "BUST_PLAYER" });

    expect(nextState.playersRemaining).toBe(3);
    expect(nextState.status).toBe("running");
  });

  test("bust_player_finishes", () => {
    const state = {
      ...createInitialTournamentState(),
      status: "running" as const,
      playersRemaining: 2,
    };

    const nextState = tournamentReducer(state, { type: "BUST_PLAYER" });

    expect(nextState.playersRemaining).toBe(1);
    expect(nextState.status).toBe("finished");
  });

  test("add_rebuy_allowed", () => {
    const state = {
      ...createInitialTournamentState(),
      status: "running" as const,
      currentLevelIndex: 4,
      totalEntries: 8,
      rebuys: 0,
    };

    const nextState = tournamentReducer(state, { type: "ADD_REBUY" });

    expect(nextState.totalEntries).toBe(9);
    expect(nextState.rebuys).toBe(1);
  });

  test("add_rebuy_blocked", () => {
    const state = {
      ...createInitialTournamentState(),
      status: "running" as const,
      currentLevelIndex: 6,
      totalEntries: 8,
      rebuys: 0,
    };

    const nextState = tournamentReducer(state, { type: "ADD_REBUY" });

    expect(nextState.totalEntries).toBe(8);
    expect(nextState.rebuys).toBe(0);
  });

  test("config_locked_after_start", () => {
    const state = {
      ...createInitialTournamentState(),
      status: "running" as const,
    };
    const nextConfig = {
      ...DEFAULT_CONFIG,
      buyinAmount: 75,
    };

    const nextState = tournamentReducer(state, {
      type: "UPDATE_CONFIG",
      config: nextConfig,
    });

    expect(nextState.config.buyinAmount).toBe(DEFAULT_CONFIG.buyinAmount);
  });
});
