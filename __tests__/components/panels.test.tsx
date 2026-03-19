import { render, screen } from "@testing-library/react";

import { BuyinPanel } from "@/components/BuyinPanel";
import { EntriesPanel } from "@/components/EntriesPanel";
import { EstimatedDuration } from "@/components/EstimatedDuration";
import { PrizePoolPanel } from "@/components/PrizePoolPanel";

describe("display panels", () => {
  it("prize_pool_display", () => {
    render(<PrizePoolPanel prizePool={320} nextBreakMs={10 * 60 * 1000} />);

    expect(screen.getByText("$320.00")).toBeInTheDocument();
  });

  it("entries_display", () => {
    render(<EntriesPanel totalEntries={10} playersRemaining={7} />);

    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("7")).toBeInTheDocument();
  });

  it("buyin_details", () => {
    render(
      <BuyinPanel
        averageStack={12500}
        buyinAmount={40}
        rebuyCutoffLevel={5}
        rebuysAllowed={true}
        maxRebuys={10}
        rebuysOpen={true}
        startingStack={10000}
        totalChips={100000}
      />,
    );

    expect(screen.getByText("$40.00")).toBeInTheDocument();
    expect(screen.getByText("10,000")).toBeInTheDocument();
    expect(screen.getByText("100,000")).toBeInTheDocument();
    expect(screen.getByText("12,500")).toBeInTheDocument();
  });

  it("rebuys_open_indicator", () => {
    render(
      <BuyinPanel
        averageStack={12500}
        buyinAmount={40}
        rebuyCutoffLevel={5}
        rebuysAllowed={true}
        maxRebuys={10}
        rebuysOpen={false}
        startingStack={10000}
        totalChips={100000}
      />,
    );

    expect(screen.getByText("Yes")).toBeInTheDocument();
  });

  it("estimated_duration_display", () => {
    render(<EstimatedDuration estimatedMinutesRemaining={135} />);

    expect(screen.getByText("~2h 15m")).toBeInTheDocument();
  });
});
