import { calcAverageStack, calcEstimatedDuration, calcPrizePool, calcTotalChips, isRebuysOpen } from "@/state/calculations";
import { DEFAULT_CONFIG, createInitialTournamentState } from "@/state/defaults";

describe("calculations", () => {
  test("prize_pool_calculation", () => {
    expect(calcPrizePool(12, 40)).toBe(480);
  });

  test("total_chips_calculation", () => {
    expect(calcTotalChips(12, 10000)).toBe(120000);
  });

  test("average_stack_calculation", () => {
    expect(calcAverageStack(120000, 6)).toBe(20000);
  });

  test("estimated_duration", () => {
    const state = {
      ...createInitialTournamentState(),
      status: "running" as const,
      currentLevelIndex: 0,
      timeRemainingMs: 10 * 60 * 1000,
      totalEntries: 10,
      playersRemaining: 10,
    };

    expect(calcEstimatedDuration(state)).toBe(290);
  });

  test("rebuys_open_before_cutoff", () => {
    expect(isRebuysOpen(4, DEFAULT_CONFIG.levels, 5)).toBe(true);
  });

  test("rebuys_closed_after_cutoff", () => {
    expect(isRebuysOpen(6, DEFAULT_CONFIG.levels, 5)).toBe(false);
  });

  test("rebuys_skip_break_indexing", () => {
    expect(isRebuysOpen(5, DEFAULT_CONFIG.levels, 5)).toBe(false);
    expect(isRebuysOpen(4, DEFAULT_CONFIG.levels, 5)).toBe(true);
  });
});
