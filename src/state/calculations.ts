import type { BlindLevel, TournamentState } from "@/types/tournament";

export type PayoutTier = {
  placesPaid: number;
  percentages: number[];
};

const PAYOUT_TIERS: { maxEntries: number; tier: PayoutTier }[] = [
  { maxEntries: 6, tier: { placesPaid: 1, percentages: [100] } },
  { maxEntries: 12, tier: { placesPaid: 2, percentages: [65, 35] } },
  { maxEntries: 19, tier: { placesPaid: 3, percentages: [50, 30, 20] } },
  { maxEntries: 29, tier: { placesPaid: 4, percentages: [40, 30, 20, 10] } },
  { maxEntries: 39, tier: { placesPaid: 5, percentages: [40, 25, 20, 10, 5] } },
  { maxEntries: Infinity, tier: { placesPaid: 6, percentages: [39, 21, 13, 11, 9, 7] } },
];

export function getPayoutTier(totalBuyins: number): PayoutTier {
  const safeBuyins = Math.max(0, totalBuyins);
  for (const { maxEntries, tier } of PAYOUT_TIERS) {
    if (safeBuyins <= maxEntries) {
      return tier;
    }
  }
  return PAYOUT_TIERS[PAYOUT_TIERS.length - 1].tier;
}

export function calcNetPrizePool(
  totalEntries: number,
  buyinAmount: number,
  tournamentFee: number,
): number {
  return Math.max(0, totalEntries * buyinAmount - tournamentFee);
}

export function calcPayoutAmounts(netPrizePool: number, tier: PayoutTier): number[] {
  if (tier.placesPaid === 0 || netPrizePool <= 0) {
    return [];
  }

  const rawAmounts = tier.percentages.map((pct) => Math.floor((netPrizePool * pct) / 100));
  const totalDistributed = rawAmounts.reduce((sum, amt) => sum + amt, 0);
  const remainder = netPrizePool - totalDistributed;
  rawAmounts[0] += remainder;

  return rawAmounts;
}

export function calcEvenChop(netPrizePool: number, playersRemaining: number): number[] {
  if (playersRemaining <= 0 || netPrizePool <= 0) {
    return [];
  }

  const perPlayer = Math.floor(netPrizePool / playersRemaining);
  const remainder = netPrizePool - perPlayer * playersRemaining;
  const amounts = Array(playersRemaining).fill(perPlayer) as number[];
  amounts[0] += remainder;

  return amounts;
}

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
