import type { BlindLevel, TournamentState } from "@/types/tournament";

export function calcPrizePool(totalEntries: number, buyinAmount: number): number {
  return totalEntries * buyinAmount;
}

export function calcTotalChips(totalEntries: number, startingStack: number): number {
  return totalEntries * startingStack;
}

export function calcAverageStack(
  totalChips: number,
  playersRemaining: number,
): number {
  if (playersRemaining <= 0) {
    return 0;
  }

  return totalChips / playersRemaining;
}

export function isRebuysOpen(
  currentLevelIndex: number,
  levels: BlindLevel[],
  rebuyCutoffLevel: number,
): boolean {
  if (rebuyCutoffLevel < 1 || levels.length === 0) {
    return false;
  }

  const safeIndex = Math.min(Math.max(currentLevelIndex, 0), levels.length - 1);
  const blindLevelsSeen = levels.slice(0, safeIndex + 1).filter((level) => level.type === "blind").length;
  const currentLevel = levels[safeIndex];

  if (currentLevel?.type === "break") {
    return blindLevelsSeen + 1 <= rebuyCutoffLevel;
  }

  return blindLevelsSeen <= rebuyCutoffLevel;
}

export function calcEstimatedDuration(state: TournamentState): number {
  const { config, currentLevelIndex, playersRemaining, timeRemainingMs } = state;
  const totalChips = calcTotalChips(state.totalEntries, config.startingStack);
  const averageStack = calcAverageStack(totalChips, playersRemaining);

  if (averageStack <= 0 || config.levels.length === 0) {
    return 0;
  }

  let minutes = Math.ceil(timeRemainingMs / 60000);

  for (let index = currentLevelIndex; index < config.levels.length; index += 1) {
    const level = config.levels[index];

    if (index !== currentLevelIndex) {
      minutes += level.type === "break" ? config.breakDurationMinutes : config.levelDurationMinutes;
    }

    if (level.type === "blind" && level.bigBlind >= averageStack) {
      return minutes;
    }
  }

  return minutes;
}
