import { formatCurrency } from "@/components/displayFormatting";

type PayoutPanelProps = {
  payoutAmounts: number[];
  placesPaid: number;
  showEvenChop: boolean;
  evenChopAmounts: number[];
  evenChopPlayers: number;
};

const ORDINALS = ["1st", "2nd", "3rd", "4th", "5th", "6th"];

export function PayoutPanel({
  payoutAmounts,
  placesPaid,
  showEvenChop,
  evenChopAmounts,
  evenChopPlayers,
}: PayoutPanelProps) {
  return (
    <section className="panel" aria-label="Payout structure">
      <p className="panel__title">
        Payouts ({placesPaid} {placesPaid === 1 ? "place" : "places"})
      </p>
      <table className="payout-table">
        <thead>
          <tr>
            <th className="payout-table__header">Place</th>
            <th className="payout-table__header payout-table__header--amount">
              {showEvenChop ? "Tiered" : "Amount"}
            </th>
            {showEvenChop ? (
              <th className="payout-table__header payout-table__header--amount">
                Even Chop ({evenChopPlayers})
              </th>
            ) : null}
          </tr>
        </thead>
        <tbody>
          {payoutAmounts.map((amount, index) => (
            <tr key={ORDINALS[index]}>
              <td className="payout-table__cell">{ORDINALS[index]}</td>
              <td className="payout-table__cell payout-table__cell--amount">
                {formatCurrency(amount)}
              </td>
              {showEvenChop ? (
                <td className="payout-table__cell payout-table__cell--amount">
                  {index < evenChopAmounts.length
                    ? formatCurrency(evenChopAmounts[index])
                    : "—"}
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
