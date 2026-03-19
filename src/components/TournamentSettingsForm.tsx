"use client";

import { useState } from "react";

import type { TournamentConfig } from "@/types/tournament";

type TournamentSettingsFormProps = {
  config: TournamentConfig;
  onConfigChange: (config: TournamentConfig) => void;
};

type NumericConfigField =
  | "initialEntries"
  | "buyinAmount"
  | "startingStack"
  | "levelDurationMinutes"
  | "breakDurationMinutes"
  | "maxRebuys"
  | "rebuyCutoffLevel";

const FIELD_LABELS: Record<NumericConfigField, string> = {
  breakDurationMinutes: "Break duration must be 1 minute or more.",
  buyinAmount: "Buyin amount cannot be negative.",
  initialEntries: "Entries must be at least 2.",
  levelDurationMinutes: "Level duration must be 1 minute or more.",
  maxRebuys: "Max rebuys cannot be negative.",
  rebuyCutoffLevel: "Rebuy cutoff level must be at least 1.",
  startingStack: "Starting stack cannot be negative.",
};

function validateField(name: NumericConfigField, value: number) {
  switch (name) {
    case "initialEntries":
      return value >= 2;
    case "levelDurationMinutes":
    case "breakDurationMinutes":
    case "rebuyCutoffLevel":
      return value > 0;
    default:
      return value >= 0;
  }
}

export function TournamentSettingsForm({
  config,
  onConfigChange,
}: TournamentSettingsFormProps) {
  const [errors, setErrors] = useState<Partial<Record<NumericConfigField, string>>>({});

  const updateNumberField = (field: NumericConfigField, rawValue: string) => {
    const nextValue = Number(rawValue);

    if (!Number.isFinite(nextValue) || !validateField(field, nextValue)) {
      setErrors((currentErrors) => ({
        ...currentErrors,
        [field]: FIELD_LABELS[field],
      }));
      return;
    }

    setErrors((currentErrors) => {
      const nextErrors = { ...currentErrors };
      delete nextErrors[field];
      return nextErrors;
    });

    onConfigChange({
      ...config,
      [field]: nextValue,
    });
  };

  return (
    <section className="config-section" aria-labelledby="settings-form-heading">
      <div className="config-section__header">
        <div>
          <p className="config-section__eyebrow">Tournament</p>
          <h2 id="settings-form-heading" className="config-section__title">
            Core settings
          </h2>
        </div>
        <p className="config-section__hint">
          Numbers update the pre-start state immediately and stay locked once the
          clock begins.
        </p>
      </div>

      <div className="settings-grid">
        <label className="config-field">
          <span>Number of entries</span>
          <input
            aria-label="Number of entries"
            className="config-input"
            min={2}
            type="number"
            value={config.initialEntries}
            onChange={(event) => {
              updateNumberField("initialEntries", event.target.value);
            }}
          />
          {errors.initialEntries ? (
            <span className="config-error" role="alert">
              {errors.initialEntries}
            </span>
          ) : null}
        </label>

        <label className="config-field">
          <span>Buyin amount ($)</span>
          <input
            aria-label="Buyin amount ($)"
            className="config-input"
            min={0}
            type="number"
            value={config.buyinAmount}
            onChange={(event) => {
              updateNumberField("buyinAmount", event.target.value);
            }}
          />
          {errors.buyinAmount ? (
            <span className="config-error" role="alert">
              {errors.buyinAmount}
            </span>
          ) : null}
        </label>

        <label className="config-field">
          <span>Starting stack</span>
          <input
            aria-label="Starting stack"
            className="config-input"
            min={0}
            type="number"
            value={config.startingStack}
            onChange={(event) => {
              updateNumberField("startingStack", event.target.value);
            }}
          />
          {errors.startingStack ? (
            <span className="config-error" role="alert">
              {errors.startingStack}
            </span>
          ) : null}
        </label>

        <label className="config-field">
          <span>Level duration (minutes)</span>
          <input
            aria-label="Level duration (minutes)"
            className="config-input"
            min={1}
            type="number"
            value={config.levelDurationMinutes}
            onChange={(event) => {
              updateNumberField("levelDurationMinutes", event.target.value);
            }}
          />
          {errors.levelDurationMinutes ? (
            <span className="config-error" role="alert">
              {errors.levelDurationMinutes}
            </span>
          ) : null}
        </label>

        <label className="config-field">
          <span>Break duration (minutes)</span>
          <input
            aria-label="Break duration (minutes)"
            className="config-input"
            min={1}
            type="number"
            value={config.breakDurationMinutes}
            onChange={(event) => {
              updateNumberField("breakDurationMinutes", event.target.value);
            }}
          />
          {errors.breakDurationMinutes ? (
            <span className="config-error" role="alert">
              {errors.breakDurationMinutes}
            </span>
          ) : null}
        </label>
      </div>

      <div className="settings-rebuys">
        <div className="settings-rebuys__header">
          <div>
            <p className="config-section__eyebrow">Reentry</p>
            <h3 className="settings-rebuys__title">Rebuy policy</h3>
          </div>
          <label className="config-toggle">
            <input
              aria-label="Allow rebuys"
              checked={config.rebuysAllowed}
              type="checkbox"
              onChange={(event) => {
                onConfigChange({
                  ...config,
                  rebuysAllowed: event.target.checked,
                });
              }}
            />
            <span>{config.rebuysAllowed ? "Enabled" : "Disabled"}</span>
          </label>
        </div>

        {config.rebuysAllowed ? (
          <div className="settings-grid">
            <label className="config-field">
              <span>Max rebuys</span>
              <input
                aria-label="Max rebuys"
                className="config-input"
                min={0}
                type="number"
                value={config.maxRebuys}
                onChange={(event) => {
                  updateNumberField("maxRebuys", event.target.value);
                }}
              />
              {errors.maxRebuys ? (
                <span className="config-error" role="alert">
                  {errors.maxRebuys}
                </span>
              ) : null}
            </label>

            <label className="config-field">
              <span>Rebuy cutoff level</span>
              <input
                aria-label="Rebuy cutoff level"
                className="config-input"
                min={1}
                type="number"
                value={config.rebuyCutoffLevel}
                onChange={(event) => {
                  updateNumberField("rebuyCutoffLevel", event.target.value);
                }}
              />
              {errors.rebuyCutoffLevel ? (
                <span className="config-error" role="alert">
                  {errors.rebuyCutoffLevel}
                </span>
              ) : null}
            </label>
          </div>
        ) : null}
      </div>
    </section>
  );
}
