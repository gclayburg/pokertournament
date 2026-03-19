"use client";

import type { BlindLevel } from "@/types/tournament";

type BlindStructureEditorProps = {
  levels: BlindLevel[];
  onLevelsChange: (levels: BlindLevel[]) => void;
};

function getBlindLevelNumber(levels: BlindLevel[], index: number) {
  let blindLevelNumber = 0;

  for (let cursor = 0; cursor <= index; cursor += 1) {
    if (levels[cursor]?.type === "blind") {
      blindLevelNumber += 1;
    }
  }

  return blindLevelNumber;
}

function updateBlindValue(
  levels: BlindLevel[],
  index: number,
  field: "smallBlind" | "bigBlind",
  rawValue: string,
) {
  const nextValue = Number(rawValue);

  if (!Number.isFinite(nextValue) || nextValue < 0) {
    return null;
  }

  return levels.map((level, currentIndex) => {
    if (currentIndex !== index || level.type !== "blind") {
      return level;
    }

    return {
      ...level,
      [field]: nextValue,
    };
  });
}

export function BlindStructureEditor({
  levels,
  onLevelsChange,
}: BlindStructureEditorProps) {
  return (
    <section className="config-section" aria-labelledby="blind-structure-heading">
      <div className="config-section__header">
        <div>
          <p className="config-section__eyebrow">Structure</p>
          <h2 id="blind-structure-heading" className="config-section__title">
            Blind schedule
          </h2>
        </div>
        <p className="config-section__hint">
          Edit levels inline, keep breaks where you want them, and reorder the run
          before lock-in.
        </p>
      </div>

      <ol className="blind-editor__list">
        {levels.map((level, index) => {
          const moveUpDisabled = index === 0;
          const moveDownDisabled = index === levels.length - 1;

          return (
            <li key={`${level.type}-${index}`} className="blind-editor__row">
              <div>
                <p className="blind-editor__level-label">
                  {level.type === "break"
                    ? `Break ${levels
                        .slice(0, index + 1)
                        .filter((entry) => entry.type === "break").length}`
                    : `Level ${getBlindLevelNumber(levels, index)}`}
                </p>
                {level.type === "break" ? (
                  <p className="blind-editor__break-pill">BREAK</p>
                ) : (
                  <div className="blind-editor__inputs">
                    <label className="config-field">
                      <span>Small blind</span>
                      <input
                        aria-label={`Small blind for level ${getBlindLevelNumber(levels, index)}`}
                        className="config-input"
                        min={0}
                        type="number"
                        value={level.smallBlind}
                        onChange={(event) => {
                          const nextLevels = updateBlindValue(
                            levels,
                            index,
                            "smallBlind",
                            event.target.value,
                          );

                          if (nextLevels) {
                            onLevelsChange(nextLevels);
                          }
                        }}
                      />
                    </label>
                    <label className="config-field">
                      <span>Big blind</span>
                      <input
                        aria-label={`Big blind for level ${getBlindLevelNumber(levels, index)}`}
                        className="config-input"
                        min={0}
                        type="number"
                        value={level.bigBlind}
                        onChange={(event) => {
                          const nextLevels = updateBlindValue(
                            levels,
                            index,
                            "bigBlind",
                            event.target.value,
                          );

                          if (nextLevels) {
                            onLevelsChange(nextLevels);
                          }
                        }}
                      />
                    </label>
                  </div>
                )}
              </div>

              <div className="blind-editor__actions">
                <button
                  className="config-button config-button--ghost"
                  disabled={moveUpDisabled}
                  type="button"
                  onClick={() => {
                    if (moveUpDisabled) {
                      return;
                    }

                    const nextLevels = levels.slice();
                    const currentLevel = nextLevels[index];
                    const previousLevel = nextLevels[index - 1];

                    if (!currentLevel || !previousLevel) {
                      return;
                    }

                    nextLevels[index - 1] = currentLevel;
                    nextLevels[index] = previousLevel;
                    onLevelsChange(nextLevels);
                  }}
                >
                  Move Up
                </button>
                <button
                  className="config-button config-button--ghost"
                  disabled={moveDownDisabled}
                  type="button"
                  onClick={() => {
                    if (moveDownDisabled) {
                      return;
                    }

                    const nextLevels = levels.slice();
                    const currentLevel = nextLevels[index];
                    const followingLevel = nextLevels[index + 1];

                    if (!currentLevel || !followingLevel) {
                      return;
                    }

                    nextLevels[index] = followingLevel;
                    nextLevels[index + 1] = currentLevel;
                    onLevelsChange(nextLevels);
                  }}
                >
                  Move Down
                </button>
                <button
                  className="config-button config-button--danger"
                  type="button"
                  onClick={() => {
                    onLevelsChange(levels.filter((_, currentIndex) => currentIndex !== index));
                  }}
                >
                  Delete
                </button>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="blind-editor__footer">
        <button
          className="config-button config-button--secondary"
          type="button"
          onClick={() => {
            onLevelsChange([
              ...levels,
              { type: "blind", smallBlind: 0, bigBlind: 0 },
            ]);
          }}
        >
          Add Level
        </button>
        <button
          className="config-button config-button--secondary"
          type="button"
          onClick={() => {
            onLevelsChange([...levels, { type: "break" }]);
          }}
        >
          Add Break
        </button>
      </div>
    </section>
  );
}
