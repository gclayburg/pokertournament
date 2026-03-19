import { formatClock, formatCurrency } from "@/components/displayFormatting";

type PrizePoolPanelProps = {
  prizePool: number;
  nextBreakMs: number | null;
};

export function PrizePoolPanel({ prizePool, nextBreakMs }: PrizePoolPanelProps) {
  return (
    <section className="panel" aria-label="Prize pool">
      <div>
        <p className="panel__title">Prize Pool</p>
        <p className="panel__headline">{formatCurrency(prizePool)}</p>
      </div>
      <div className="panel__split">
        <p className="panel__title">Next Break</p>
        <p className="panel__value">
          {nextBreakMs === null ? "No more breaks" : formatClock(nextBreakMs)}
        </p>
      </div>
    </section>
  );
}
