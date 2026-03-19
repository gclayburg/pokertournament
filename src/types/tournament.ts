export type BlindLevel =
  | {
      type: "blind";
      smallBlind: number;
      bigBlind: number;
    }
  | {
      type: "break";
    };

export type TournamentConfig = {
  levels: BlindLevel[];
  levelDurationMinutes: number;
  breakDurationMinutes: number;
  buyinAmount: number;
  startingStack: number;
  rebuysAllowed: boolean;
  maxRebuys: number;
  rebuyCutoffLevel: number;
  initialEntries: number;
};

export type TournamentStatus =
  | "pre-start"
  | "running"
  | "paused"
  | "break"
  | "finished";

export type TournamentState = {
  config: TournamentConfig;
  status: TournamentStatus;
  currentLevelIndex: number;
  timeRemainingMs: number;
  totalEntries: number;
  playersRemaining: number;
  rebuys: number;
};

export type TournamentAction =
  | { type: "START" }
  | { type: "PAUSE" }
  | { type: "RESUME" }
  | { type: "TICK"; elapsedMs: number }
  | { type: "ADVANCE_LEVEL" }
  | { type: "SKIP_BREAK" }
  | { type: "SET_LEVEL"; levelIndex: number }
  | { type: "SET_TIME"; timeRemainingMs: number }
  | { type: "BUST_PLAYER" }
  | { type: "ADD_REBUY" }
  | { type: "UPDATE_CONFIG"; config: TournamentConfig };
