import { isRebuysOpen } from "@/state/calculations";
import type { BlindLevel, TournamentAction, TournamentState } from "@/types/tournament";

function getLevelDurationMs(level: BlindLevel, state: TournamentState): number {
  const minutes =
    level.type === "break"
      ? state.config.breakDurationMinutes
      : state.config.levelDurationMinutes;

  return minutes * 60 * 1000;
}

function getStatusForLevel(level: BlindLevel, currentStatus: TournamentState["status"]) {
  if (currentStatus === "paused") {
    return "paused";
  }

  return level.type === "break" ? "break" : "running";
}

function moveToLevel(state: TournamentState, levelIndex: number): TournamentState {
  const safeIndex = Math.min(Math.max(levelIndex, 0), state.config.levels.length - 1);
  const nextLevel = state.config.levels[safeIndex];

  if (!nextLevel) {
    return { ...state, timeRemainingMs: 0 };
  }

  return {
    ...state,
    currentLevelIndex: safeIndex,
    status: getStatusForLevel(nextLevel, state.status),
    timeRemainingMs: getLevelDurationMs(nextLevel, state),
  };
}

function advanceLevel(state: TournamentState): TournamentState {
  const nextIndex = state.currentLevelIndex + 1;

  if (nextIndex >= state.config.levels.length) {
    return {
      ...state,
      timeRemainingMs: 0,
    };
  }

  return moveToLevel(state, nextIndex);
}

function tickTournament(state: TournamentState, elapsedMs: number): TournamentState {
  if ((state.status !== "running" && state.status !== "break") || elapsedMs <= 0) {
    return state;
  }

  let remainingElapsed = elapsedMs;
  let nextState = state;

  while (remainingElapsed > 0) {
    if (nextState.timeRemainingMs <= 0) {
      const advancedState = advanceLevel(nextState);

      if (advancedState.currentLevelIndex === nextState.currentLevelIndex) {
        return advancedState;
      }

      nextState = advancedState;
      continue;
    }

    if (nextState.timeRemainingMs > remainingElapsed) {
      return {
        ...nextState,
        timeRemainingMs: nextState.timeRemainingMs - remainingElapsed,
      };
    }

    remainingElapsed -= nextState.timeRemainingMs;
    const advancedState = advanceLevel({
      ...nextState,
      timeRemainingMs: 0,
    });

    if (advancedState.currentLevelIndex === nextState.currentLevelIndex) {
      return advancedState;
    }

    nextState = advancedState;
  }

  return nextState;
}

export function tournamentReducer(
  state: TournamentState,
  action: TournamentAction,
): TournamentState {
  switch (action.type) {
    case "START": {
      if (state.status !== "pre-start" || state.config.levels.length === 0) {
        return state;
      }

      const firstLevel = state.config.levels[0];
      const firstStatus = firstLevel.type === "break" ? "break" : "running";

      return {
        ...state,
        currentLevelIndex: 0,
        status: firstStatus,
        timeRemainingMs: getLevelDurationMs(firstLevel, state),
        totalEntries: state.config.initialEntries,
        playersRemaining: state.config.initialEntries,
        rebuys: 0,
        showEvenChop: false,
        evenChopPlayers: state.config.initialEntries,
      };
    }
    case "PAUSE":
      if (state.status === "running" || state.status === "break") {
        return { ...state, status: "paused" };
      }

      return state;
    case "RESUME": {
      if (state.status !== "paused") {
        return state;
      }

      const currentLevel = state.config.levels[state.currentLevelIndex];

      if (!currentLevel) {
        return state;
      }

      return {
        ...state,
        status: currentLevel.type === "break" ? "break" : "running",
      };
    }
    case "TICK":
      return tickTournament(state, action.elapsedMs);
    case "ADVANCE_LEVEL":
      return advanceLevel(state);
    case "SKIP_BREAK":
      if (state.config.levels[state.currentLevelIndex]?.type !== "break") {
        return state;
      }

      return advanceLevel(state);
    case "SET_LEVEL":
      return moveToLevel(state, action.levelIndex);
    case "SET_TIME":
      return {
        ...state,
        timeRemainingMs: Math.max(0, action.timeRemainingMs),
      };
    case "BUST_PLAYER": {
      if (state.playersRemaining <= 1) {
        return state;
      }

      const playersRemaining = state.playersRemaining - 1;

      return {
        ...state,
        playersRemaining,
        evenChopPlayers: playersRemaining,
        status: playersRemaining === 1 ? "finished" : state.status,
      };
    }
    case "ADD_REBUY": {
      const rebuysOpen =
        state.config.rebuysAllowed &&
        state.rebuys < state.config.maxRebuys &&
        isRebuysOpen(
          state.currentLevelIndex,
          state.config.levels,
          state.config.rebuyCutoffLevel,
        );

      if (!rebuysOpen) {
        return state;
      }

      return {
        ...state,
        totalEntries: state.totalEntries + 1,
        rebuys: state.rebuys + 1,
      };
    }
    case "TOGGLE_EVEN_CHOP":
      return {
        ...state,
        showEvenChop: !state.showEvenChop,
      };
    case "SET_EVEN_CHOP_PLAYERS":
      return {
        ...state,
        evenChopPlayers: Math.max(1, action.players),
      };
    case "UPDATE_CONFIG":
      if (state.status !== "pre-start") {
        return state;
      }

      return {
        ...state,
        config: action.config,
        totalEntries: action.config.initialEntries,
        playersRemaining: action.config.initialEntries,
        rebuys: 0,
        currentLevelIndex: 0,
        timeRemainingMs: 0,
        showEvenChop: false,
        evenChopPlayers: action.config.initialEntries,
      };
    default:
      return state;
  }
}
