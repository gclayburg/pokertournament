"use client";

import { BlindsDisplay } from "@/components/BlindsDisplay";
import { BuyinPanel } from "@/components/BuyinPanel";
import { EntriesPanel } from "@/components/EntriesPanel";
import { EstimatedDuration } from "@/components/EstimatedDuration";
import { PrizePoolPanel } from "@/components/PrizePoolPanel";
import { TimerDisplay } from "@/components/TimerDisplay";
import {
  calcAverageStack,
  calcEstimatedDuration,
  calcPrizePool,
  calcTotalChips,
  isRebuysOpen,
} from "@/state/calculations";
import { TournamentProvider, useTournament } from "@/context/TournamentContext";
import type { TournamentState } from "@/types/tournament";

function getNextBreakCountdownMs(state: TournamentState) {
  let totalMs = state.timeRemainingMs;

  for (
    let index = state.currentLevelIndex + 1;
    index < state.config.levels.length;
    index += 1
  ) {
    const level = state.config.levels[index];

    if (level?.type === "break") {
      return totalMs;
    }

    totalMs += state.config.levelDurationMinutes * 60 * 1000;
  }

  return null;
}

function TournamentDashboard() {
  const { state } = useTournament();
  const prizePool = calcPrizePool(state.totalEntries, state.config.buyinAmount);
  const totalChips = calcTotalChips(state.totalEntries, state.config.startingStack);
  const averageStack = calcAverageStack(totalChips, state.playersRemaining);
  const estimatedMinutesRemaining = calcEstimatedDuration(state);
  const rebuysOpen =
    state.config.rebuysAllowed &&
    state.rebuys < state.config.maxRebuys &&
    isRebuysOpen(
      state.currentLevelIndex,
      state.config.levels,
      state.config.rebuyCutoffLevel,
    );

  return (
    <main className="tournament-app">
      <div className="tournament-app__backdrop" aria-hidden="true" />
      <section className="tournament-stage">
        <aside className="tournament-stage__side">
          <PrizePoolPanel
            prizePool={prizePool}
            nextBreakMs={getNextBreakCountdownMs(state)}
          />
        </aside>

        <section className="tournament-stage__center">
          <TimerDisplay
            status={state.status}
            timeRemainingMs={state.timeRemainingMs}
          />
          <BlindsDisplay
            currentLevelIndex={state.currentLevelIndex}
            levels={state.config.levels}
          />
          <EstimatedDuration
            estimatedMinutesRemaining={estimatedMinutesRemaining}
          />
        </section>

        <aside className="tournament-stage__side tournament-stage__side--right">
          <EntriesPanel
            totalEntries={state.totalEntries}
            playersRemaining={state.playersRemaining}
          />
          <BuyinPanel
            averageStack={averageStack}
            buyinAmount={state.config.buyinAmount}
            rebuyCutoffLevel={state.config.rebuyCutoffLevel}
            rebuysAllowed={state.config.rebuysAllowed}
            maxRebuys={state.config.maxRebuys}
            startingStack={state.config.startingStack}
            totalChips={totalChips}
            rebuysOpen={rebuysOpen}
          />
        </aside>
      </section>
    </main>
  );
}

export default function HomePage() {
  return (
    <TournamentProvider>
      <TournamentDashboard />
    </TournamentProvider>
  );
}
