"use client";

import { useEffect, useState } from "react";

import { useTournament } from "@/context/TournamentContext";
import type { BlindLevel } from "@/types/tournament";

type LevelOverrideModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type BlindLevelOption = {
  index: number;
  label: string;
};

function getBlindLevelOptions(levels: BlindLevel[]) {
  let blindLevelNumber = 0;

  return levels.flatMap((level, index) => {
    if (level.type !== "blind") {
      return [];
    }

    blindLevelNumber += 1;

    return [
      {
        index,
        label: `Level ${blindLevelNumber}: ${level.smallBlind} / ${level.bigBlind}`,
      },
    ];
  });
}

function splitTimeRemaining(timeRemainingMs: number) {
  const totalSeconds = Math.max(0, Math.floor(timeRemainingMs / 1000));

  return {
    minutes: Math.floor(totalSeconds / 60),
    seconds: totalSeconds % 60,
  };
}

export function LevelOverrideModal({
  isOpen,
  onClose,
}: LevelOverrideModalProps) {
  const { state, dispatch } = useTournament();
  const blindLevelOptions = getBlindLevelOptions(state.config.levels);
  const [selectedLevelIndex, setSelectedLevelIndex] = useState<number>(
    blindLevelOptions[0]?.index ?? 0,
  );
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const currentBlindLevel =
      state.config.levels[state.currentLevelIndex]?.type === "blind"
        ? state.currentLevelIndex
        : blindLevelOptions[0]?.index ?? 0;
    const timeParts = splitTimeRemaining(state.timeRemainingMs);

    setSelectedLevelIndex(currentBlindLevel);
    setMinutes(timeParts.minutes);
    setSeconds(timeParts.seconds);
  }, [
    isOpen,
    state.config.levels,
    state.currentLevelIndex,
    state.timeRemainingMs,
  ]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="control-modal-overlay" role="presentation">
      <section
        aria-labelledby="level-override-heading"
        aria-modal="true"
        className="control-modal"
        role="dialog"
      >
        <div className="control-modal__header">
          <div>
            <p className="config-section__eyebrow">Admin override</p>
            <h2 id="level-override-heading" className="control-modal__title">
              Edit level and clock
            </h2>
          </div>
          <p className="control-modal__copy">
            Jump to any blind level and set a specific time remaining.
          </p>
        </div>

        <div className="control-modal__body">
          <label className="config-field" htmlFor="level-override-select">
            <span>Target level</span>
            <select
              id="level-override-select"
              aria-label="Target level"
              className="config-input"
              value={selectedLevelIndex}
              onChange={(event) => {
                setSelectedLevelIndex(Number(event.target.value));
              }}
            >
              {blindLevelOptions.map((level) => (
                <option key={level.index} value={level.index}>
                  {level.label}
                </option>
              ))}
            </select>
          </label>

          <div className="control-modal__time-grid">
            <label className="config-field">
              <span>Minutes</span>
              <input
                aria-label="Minutes"
                className="config-input"
                min={0}
                type="number"
                value={minutes}
                onChange={(event) => {
                  setMinutes(Math.max(0, Number(event.target.value) || 0));
                }}
              />
            </label>

            <label className="config-field">
              <span>Seconds</span>
              <input
                aria-label="Seconds"
                className="config-input"
                max={59}
                min={0}
                type="number"
                value={seconds}
                onChange={(event) => {
                  const nextSeconds = Number(event.target.value) || 0;
                  setSeconds(Math.min(59, Math.max(0, nextSeconds)));
                }}
              />
            </label>
          </div>
        </div>

        <div className="control-modal__actions">
          <button
            className="config-button config-button--ghost"
            type="button"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="config-button config-button--primary"
            type="button"
            onClick={() => {
              dispatch({ type: "SET_LEVEL", levelIndex: selectedLevelIndex });
              dispatch({
                type: "SET_TIME",
                timeRemainingMs: (minutes * 60 + seconds) * 1000,
              });
              onClose();
            }}
          >
            Apply
          </button>
        </div>
      </section>
    </div>
  );
}
