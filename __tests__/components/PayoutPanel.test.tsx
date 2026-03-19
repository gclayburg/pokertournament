import { render, screen } from "@testing-library/react";

import { PayoutPanel } from "@/components/PayoutPanel";

describe("PayoutPanel", () => {
  test("renders payout amounts for 3 places", () => {
    render(
      <PayoutPanel
        payoutAmounts={[275, 165, 110]}
        placesPaid={3}
        showEvenChop={false}
        evenChopAmounts={[]}
        evenChopPlayers={5}
      />,
    );

    expect(screen.getByText("Payouts (3 places)")).toBeInTheDocument();
    expect(screen.getByText("1st")).toBeInTheDocument();
    expect(screen.getByText("$275.00")).toBeInTheDocument();
    expect(screen.getByText("2nd")).toBeInTheDocument();
    expect(screen.getByText("$165.00")).toBeInTheDocument();
    expect(screen.getByText("3rd")).toBeInTheDocument();
    expect(screen.getByText("$110.00")).toBeInTheDocument();
  });

  test("renders singular 'place' for 1 payout", () => {
    render(
      <PayoutPanel
        payoutAmounts={[200]}
        placesPaid={1}
        showEvenChop={false}
        evenChopAmounts={[]}
        evenChopPlayers={3}
      />,
    );

    expect(screen.getByText("Payouts (1 place)")).toBeInTheDocument();
  });

  test("does not show even chop column when off", () => {
    render(
      <PayoutPanel
        payoutAmounts={[275, 165, 110]}
        placesPaid={3}
        showEvenChop={false}
        evenChopAmounts={[]}
        evenChopPlayers={5}
      />,
    );

    expect(screen.queryByText(/Even Chop/)).not.toBeInTheDocument();
    expect(screen.getByText("Amount")).toBeInTheDocument();
  });

  test("shows even chop column when enabled", () => {
    render(
      <PayoutPanel
        payoutAmounts={[275, 165, 110]}
        placesPaid={3}
        showEvenChop={true}
        evenChopAmounts={[184, 183, 183]}
        evenChopPlayers={3}
      />,
    );

    expect(screen.getByText("Tiered")).toBeInTheDocument();
    expect(screen.getByText("Even Chop (3)")).toBeInTheDocument();
    expect(screen.getByText("$184.00")).toBeInTheDocument();
    expect(screen.getAllByText("$183.00")).toHaveLength(2);
  });

  test("shows dash for even chop entries beyond player count", () => {
    render(
      <PayoutPanel
        payoutAmounts={[275, 165, 110]}
        placesPaid={3}
        showEvenChop={true}
        evenChopAmounts={[275, 275]}
        evenChopPlayers={2}
      />,
    );

    expect(screen.getByText("—")).toBeInTheDocument();
  });
});
