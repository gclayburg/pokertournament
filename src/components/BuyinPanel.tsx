import { formatCurrency, formatNumber } from "@/components/displayFormatting";

type BuyinPanelProps = {
  averageStack: number;
  buyinAmount: number;
  rebuyCutoffLevel: number;
  rebuysAllowed: boolean;
  maxRebuys: number;
  startingStack: number;
  totalChips: number;
  rebuysOpen: boolean;
};

export function BuyinPanel({
  averageStack,
  buyinAmount,
  rebuyCutoffLevel,
  rebuysAllowed,
  maxRebuys,
  startingStack,
  totalChips,
  rebuysOpen,
}: BuyinPanelProps) {
  return (
    <section className="panel" aria-label="Buyin and reentry">
      <p className="panel__title">Buyin &amp; Reentry</p>
      <dl className="stat-list">
        <div className="stat-list__row">
          <dt>Buyin</dt>
          <dd>{formatCurrency(buyinAmount)}</dd>
        </div>
        <div className="stat-list__row">
          <dt>Starting stack</dt>
          <dd>{formatNumber(startingStack)}</dd>
        </div>
        <div className="stat-list__row">
          <dt>Total chips</dt>
          <dd>{formatNumber(totalChips)}</dd>
        </div>
        <div className="stat-list__row">
          <dt>Average stack</dt>
          <dd>{formatNumber(averageStack)}</dd>
        </div>
        <div className="stat-list__row">
          <dt>Allowed reentries</dt>
          <dd>{rebuysAllowed ? maxRebuys : 0}</dd>
        </div>
        <div className="stat-list__row">
          <dt>(Re)entry closed</dt>
          <dd>{rebuysAllowed && rebuysOpen ? "No" : "Yes"}</dd>
        </div>
        <div className="stat-list__row">
          <dt>(Re)entry until level</dt>
          <dd>{rebuyCutoffLevel}</dd>
        </div>
      </dl>
    </section>
  );
}
