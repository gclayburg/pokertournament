import type { BlindLevel } from "@/types/tournament";

type BlindsDisplayProps = {
  currentLevelIndex: number;
  levels: BlindLevel[];
};

type BlindLevelSummary = {
  label: string;
  levelIndex: number;
  levelNumber: number;
  smallBlind: number;
  bigBlind: number;
};

function getBlindLevelNumber(levels: BlindLevel[], levelIndex: number): number {
  return levels
    .slice(0, levelIndex + 1)
    .filter((level) => level.type === "blind").length;
}

function getUpcomingBlindLevels(
  levels: BlindLevel[],
  currentLevelIndex: number,
): BlindLevelSummary[] {
  const startIndex =
    levels[currentLevelIndex]?.type === "break" ? currentLevelIndex + 1 : currentLevelIndex;
  const upcomingLevels: BlindLevelSummary[] = [];

  for (let index = startIndex; index < levels.length; index += 1) {
    const level = levels[index];

    if (level?.type !== "blind") {
      continue;
    }

    upcomingLevels.push({
      label: `${level.smallBlind} / ${level.bigBlind}`,
      levelIndex: index,
      levelNumber: getBlindLevelNumber(levels, index),
      smallBlind: level.smallBlind,
      bigBlind: level.bigBlind,
    });
  }

  return upcomingLevels;
}

export function BlindsDisplay({ currentLevelIndex, levels }: BlindsDisplayProps) {
  const [currentLevel, nextLevel, followingLevel] = getUpcomingBlindLevels(
    levels,
    currentLevelIndex,
  );

  if (!currentLevel) {
    return (
      <section className="blinds-display" aria-label="Blind levels">
        <p className="eyebrow">Blinds</p>
        <p className="blinds-display__empty">Blind structure complete</p>
      </section>
    );
  }

  return (
    <section className="blinds-display" aria-label="Blind levels">
      <p className="eyebrow">Blinds</p>
      <p className="blinds-display__current">{currentLevel.label}</p>
      <p className="blinds-display__meta">Level {currentLevel.levelNumber}</p>
      {nextLevel ? (
        <>
          <p className="blinds-display__next-label">Next up</p>
          <p className="blinds-display__next">{nextLevel.label}</p>
        </>
      ) : null}
      {followingLevel ? (
        <p className="blinds-display__following">{followingLevel.label}</p>
      ) : null}
    </section>
  );
}
