"use client";

import {
  createContext,
  useContext,
  useReducer,
  type Dispatch,
  type ReactNode,
} from "react";

import { useAudioAlerts } from "@/hooks/useAudioAlerts";
import { useTimer } from "@/hooks/useTimer";
import { createInitialTournamentState } from "@/state/defaults";
import { tournamentReducer } from "@/state/tournamentReducer";
import type { TournamentAction, TournamentState } from "@/types/tournament";

type TournamentContextValue = {
  dispatch: Dispatch<TournamentAction>;
  state: TournamentState;
};

const TournamentContext = createContext<TournamentContextValue | null>(null);

export function TournamentProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(
    tournamentReducer,
    undefined,
    createInitialTournamentState,
  );

  useTimer({ dispatch, state });
  useAudioAlerts(state);

  return (
    <TournamentContext.Provider value={{ dispatch, state }}>
      {children}
    </TournamentContext.Provider>
  );
}

export function useTournament() {
  const context = useContext(TournamentContext);

  if (!context) {
    throw new Error("useTournament must be used within a TournamentProvider");
  }

  return context;
}
