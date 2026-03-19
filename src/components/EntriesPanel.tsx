type EntriesPanelProps = {
  totalEntries: number;
  playersRemaining: number;
};

export function EntriesPanel({
  totalEntries,
  playersRemaining,
}: EntriesPanelProps) {
  return (
    <section className="panel" aria-label="Entries">
      <p className="panel__title">Entries</p>
      <dl className="stat-list">
        <div className="stat-list__row">
          <dt>Total entries</dt>
          <dd>{totalEntries}</dd>
        </div>
        <div className="stat-list__row">
          <dt>Players left</dt>
          <dd>{playersRemaining}</dd>
        </div>
      </dl>
    </section>
  );
}
