import type { BlindLevel, TournamentConfig, TournamentState } from "@/types/tournament";

export const DEFAULT_LEVELS: BlindLevel[] = [
  { type: "blind", smallBlind: 25, bigBlind: 50 },
  { type: "blind", smallBlind: 50, bigBlind: 100 },
  { type: "blind", smallBlind: 100, bigBlind: 200 },
  { type: "blind", smallBlind: 150, bigBlind: 300 },
  { type: "blind", smallBlind: 200, bigBlind: 400 },
  { type: "break" },
  { type: "blind", smallBlind: 300, bigBlind: 600 },
  { type: "blind", smallBlind: 400, bigBlind: 800 },
  { type: "blind", smallBlind: 500, bigBlind: 1000 },
  { type: "blind", smallBlind: 1000, bigBlind: 1500 },
  { type: "blind", smallBlind: 1500, bigBlind: 3000 },
  { type: "break" },
  { type: "blind", smallBlind: 2000, bigBlind: 4000 },
  { type: "blind", smallBlind: 3000, bigBlind: 6000 },
  { type: "blind", smallBlind: 4000, bigBlind: 8000 },
  { type: "blind", smallBlind: 5000, bigBlind: 10000 },
];

export const DEFAULT_CONFIG: TournamentConfig = {
  levels: DEFAULT_LEVELS,
  levelDurationMinutes: 20,
  breakDurationMinutes: 10,
  buyinAmount: 40,
  startingStack: 10000,
  rebuysAllowed: true,
  maxRebuys: 20,
  rebuyCutoffLevel: 5,
  initialEntries: 8,
};

export function createInitialTournamentState(
  config: TournamentConfig = DEFAULT_CONFIG,
): TournamentState {
  return {
    config,
    status: "pre-start",
    currentLevelIndex: 0,
    timeRemainingMs: 0,
    totalEntries: config.initialEntries,
    playersRemaining: config.initialEntries,
    rebuys: 0,
  };
}

export const DEFAULT_TOURNAMENT_STATE = createInitialTournamentState();
