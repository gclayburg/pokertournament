"use client";

import { useEffect, useRef } from "react";

import {
  initializeAudioAlerts,
  playBreakEndTone,
  playBreakStartTone,
  playLevelChangeTone,
  playWarningTone,
} from "@/audio/tones";
import type { TournamentState } from "@/types/tournament";

const ONE_MINUTE_MS = 60 * 1000;
const ACTIVE_STATUSES = new Set<TournamentState["status"]>(["running", "break"]);

export function useAudioAlerts(state: TournamentState): void {
  const previousTimeRemainingRef = useRef(state.timeRemainingMs);
  const previousLevelIndexRef = useRef(state.currentLevelIndex);
  const previousStatusRef = useRef(state.status);
  const warningLevelIndexRef = useRef<number | null>(null);

  useEffect(() => {
    initializeAudioAlerts();
  }, []);

  useEffect(() => {
    const previousLevelIndex = previousLevelIndexRef.current;

    if (state.currentLevelIndex !== previousLevelIndex) {
      warningLevelIndexRef.current = null;

      if (state.config.levels[state.currentLevelIndex]?.type === "blind") {
        playLevelChangeTone();
      }

      previousLevelIndexRef.current = state.currentLevelIndex;
    }
  }, [state.config.levels, state.currentLevelIndex]);

  useEffect(() => {
    const previousStatus = previousStatusRef.current;

    if (state.status === "break" && previousStatus !== "break") {
      playBreakStartTone();
    } else if (previousStatus === "break" && state.status === "running") {
      playBreakEndTone();
    }

    previousStatusRef.current = state.status;
  }, [state.status]);

  useEffect(() => {
    const previousTimeRemaining = previousTimeRemainingRef.current;

    if (warningLevelIndexRef.current !== state.currentLevelIndex) {
      const crossedOneMinuteBoundary =
        ACTIVE_STATUSES.has(state.status) &&
        previousTimeRemaining > ONE_MINUTE_MS &&
        state.timeRemainingMs <= ONE_MINUTE_MS;

      if (crossedOneMinuteBoundary) {
        warningLevelIndexRef.current = state.currentLevelIndex;
        playWarningTone();
      }
    }

    previousTimeRemainingRef.current = state.timeRemainingMs;
  }, [state.currentLevelIndex, state.status, state.timeRemainingMs]);
}
