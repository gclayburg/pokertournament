"use client";

import { useState } from "react";

import { LevelOverrideModal } from "@/components/LevelOverrideModal";
import { useTournament } from "@/context/TournamentContext";
import { isRebuysOpen } from "@/state/calculations";

function getControlBarStatusLabel(status: ReturnType<typeof useTournament>["state"]["status"]) {
  switch (status) {
    case "running":
      return "Tournament live";
    case "paused":
      return "Clock paused";
    case "break":
      return "Break in progress";
    case "finished":
      return "Tournament Over";
    default:
      return "";
  }
}

export function ControlBar() {
  const { state, dispatch } = useTournament();
  const [isLevelModalOpen, setIsLevelModalOpen] = useState(false);

  if (state.status === "pre-start") {
    return null;
  }

  const rebuysOpen =
    state.config.rebuysAllowed &&
    state.rebuys < state.config.maxRebuys &&
    isRebuysOpen(
      state.currentLevelIndex,
      state.config.levels,
      state.config.rebuyCutoffLevel,
    );
  const bustDisabled = state.playersRemaining <= 1;
  const statusLabel = getControlBarStatusLabel(state.status);

  return (
    <>
      <section className="control-bar" aria-label="Tournament controls">
        <p className="control-bar__status">{statusLabel}</p>
        <div className="control-bar__actions">
          {state.status === "running" ? (
            <button
              className="config-button config-button--primary"
              type="button"
              onClick={() => {
                dispatch({ type: "PAUSE" });
              }}
            >
              Pause
            </button>
          ) : null}

          {state.status === "paused" ? (
            <button
              className="config-button config-button--primary"
              type="button"
              onClick={() => {
                dispatch({ type: "RESUME" });
              }}
            >
              Resume
            </button>
          ) : null}

          {state.status === "break" ? (
            <button
              className="config-button config-button--primary"
              type="button"
              onClick={() => {
                dispatch({ type: "SKIP_BREAK" });
              }}
            >
              Skip Break
            </button>
          ) : null}

          {state.status !== "finished" ? (
            <button
              className="config-button config-button--ghost"
              disabled={bustDisabled}
              type="button"
              onClick={() => {
                dispatch({ type: "BUST_PLAYER" });
              }}
            >
              Bust Player
            </button>
          ) : null}

          {(state.status === "running" || state.status === "paused") && rebuysOpen ? (
            <button
              className="config-button config-button--secondary"
              type="button"
              onClick={() => {
                dispatch({ type: "ADD_REBUY" });
              }}
            >
              Add Rebuy
            </button>
          ) : null}

          {state.status === "running" || state.status === "paused" ? (
            <button
              className="config-button config-button--ghost"
              type="button"
              onClick={() => {
                setIsLevelModalOpen(true);
              }}
            >
              Edit Level
            </button>
          ) : null}

          {state.status !== "finished" ? (
            <button
              className={`config-button ${state.showEvenChop ? "config-button--secondary" : "config-button--ghost"}`}
              type="button"
              onClick={() => {
                dispatch({ type: "TOGGLE_EVEN_CHOP" });
              }}
            >
              {state.showEvenChop ? "Hide Even Chop" : "Show Even Chop"}
            </button>
          ) : null}

          {state.showEvenChop && state.status !== "finished" ? (
            <label className="control-bar__inline-field">
              <span>Remaining Players</span>
              <input
                aria-label="Remaining Players"
                className="config-input config-input--inline"
                min={1}
                type="number"
                value={state.evenChopPlayers}
                onChange={(event) => {
                  const value = Number(event.target.value);
                  if (Number.isFinite(value) && value >= 1) {
                    dispatch({ type: "SET_EVEN_CHOP_PLAYERS", players: value });
                  }
                }}
              />
            </label>
          ) : null}
        </div>
      </section>

      <LevelOverrideModal
        isOpen={isLevelModalOpen}
        onClose={() => {
          setIsLevelModalOpen(false);
        }}
      />
    </>
  );
}
