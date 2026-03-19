import { formatEstimatedDuration } from "@/components/displayFormatting";

type EstimatedDurationProps = {
  estimatedMinutesRemaining: number;
};

export function EstimatedDuration({
  estimatedMinutesRemaining,
}: EstimatedDurationProps) {
  return (
    <section className="estimate-panel" aria-label="Estimated duration">
      <p className="estimate-panel__label">Est. remaining</p>
      <p className="estimate-panel__value">
        {formatEstimatedDuration(estimatedMinutesRemaining)}
      </p>
    </section>
  );
}
