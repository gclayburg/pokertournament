import { formatClock } from "@/components/displayFormatting";
import type { TournamentState } from "@/types/tournament";

type TimerDisplayProps = {
  status: TournamentState["status"];
  timeRemainingMs: number;
};

export function TimerDisplay({ status, timeRemainingMs }: TimerDisplayProps) {
  const statusLabel =
    status === "break" ? "Break" : status === "paused" ? "PAUSED" : "Tournament Clock";

  const timerClassName =
    status === "paused" ? "timer-display__value timer-display__value--paused" : "timer-display__value";

  return (
    <section className="timer-display" aria-label="Tournament timer">
      <p className="timer-display__label">{statusLabel}</p>
      <p className={timerClassName}>{formatClock(timeRemainingMs)}</p>
    </section>
  );
}
