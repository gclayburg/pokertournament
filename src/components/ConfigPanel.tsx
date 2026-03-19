"use client";

import { BlindStructureEditor } from "@/components/BlindStructureEditor";
import { TournamentSettingsForm } from "@/components/TournamentSettingsForm";
import { useTournament } from "@/context/TournamentContext";
import type { TournamentConfig } from "@/types/tournament";

export function ConfigPanel() {
  const { state, dispatch } = useTournament();

  if (state.status !== "pre-start") {
    return null;
  }

  const updateConfig = (nextConfig: TournamentConfig) => {
    dispatch({
      type: "UPDATE_CONFIG",
      config: nextConfig,
    });
  };

  return (
    <div className="config-overlay" role="presentation">
      <section
        aria-labelledby="config-panel-heading"
        aria-modal="true"
        className="config-modal"
        role="dialog"
      >
        <div className="config-modal__intro">
          <p className="config-modal__eyebrow">Pre-start setup</p>
          <h1 id="config-panel-heading" className="config-modal__title">
            Tournament Configuration
          </h1>
          <p className="config-modal__copy">
            Adjust the structure, buyin model, and player count now. The config
            locks automatically after the tournament starts.
          </p>
        </div>

        <div className="config-modal__content">
          <BlindStructureEditor
            levels={state.config.levels}
            onLevelsChange={(levels) => {
              updateConfig({
                ...state.config,
                levels,
              });
            }}
          />
          <TournamentSettingsForm
            config={state.config}
            onConfigChange={updateConfig}
          />
        </div>

        <div className="config-modal__footer">
          <p className="config-modal__lockout">
            Start locks blind edits, buyin settings, and rebuy policy for the rest
            of the event.
          </p>
          <button
            className="config-button config-button--primary"
            type="button"
            onClick={() => {
              dispatch({ type: "START" });
            }}
          >
            Start Tournament
          </button>
        </div>
      </section>
    </div>
  );
}
