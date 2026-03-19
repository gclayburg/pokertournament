import { useEffect, useEffectEvent, useRef } from "react";

import type { TournamentAction, TournamentState } from "@/types/tournament";

type UseTimerOptions = {
  dispatch: React.Dispatch<TournamentAction>;
  state: TournamentState;
  onOneMinuteWarning?: () => void;
  onLevelChange?: (levelIndex: number, previousLevelIndex: number) => void;
};

const ACTIVE_STATUSES = new Set<TournamentState["status"]>(["running", "break"]);
const TICK_INTERVAL_MS = 100;
const ONE_MINUTE_MS = 60 * 1000;

export function useTimer({
  dispatch,
  state,
  onOneMinuteWarning,
  onLevelChange,
}: UseTimerOptions): void {
  const previousTimeRemainingRef = useRef(state.timeRemainingMs);
  const previousLevelIndexRef = useRef(state.currentLevelIndex);
  const warningLevelIndexRef = useRef<number | null>(null);

  const emitOneMinuteWarning = useEffectEvent(() => {
    onOneMinuteWarning?.();
  });

  const emitLevelChange = useEffectEvent(
    (levelIndex: number, previousLevelIndex: number) => {
      onLevelChange?.(levelIndex, previousLevelIndex);
    },
  );

  useEffect(() => {
    if (!ACTIVE_STATUSES.has(state.status)) {
      return undefined;
    }

    let lastTickAt = Date.now();
    const intervalId = window.setInterval(() => {
      const now = Date.now();
      const elapsedMs = now - lastTickAt;

      lastTickAt = now;
      dispatch({ type: "TICK", elapsedMs });
    }, TICK_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [dispatch, state.status]);

  useEffect(() => {
    const previousLevelIndex = previousLevelIndexRef.current;

    if (state.currentLevelIndex !== previousLevelIndex) {
      warningLevelIndexRef.current = null;
      emitLevelChange(state.currentLevelIndex, previousLevelIndex);
      previousLevelIndexRef.current = state.currentLevelIndex;
    }
  }, [emitLevelChange, state.currentLevelIndex]);

  useEffect(() => {
    const previousTimeRemaining = previousTimeRemainingRef.current;

    if (warningLevelIndexRef.current !== state.currentLevelIndex) {
      const crossedOneMinuteBoundary =
        ACTIVE_STATUSES.has(state.status) &&
        previousTimeRemaining > ONE_MINUTE_MS &&
        state.timeRemainingMs <= ONE_MINUTE_MS;

      if (crossedOneMinuteBoundary) {
        warningLevelIndexRef.current = state.currentLevelIndex;
        emitOneMinuteWarning();
      }
    }

    previousTimeRemainingRef.current = state.timeRemainingMs;
  }, [emitOneMinuteWarning, state.currentLevelIndex, state.status, state.timeRemainingMs]);
}
