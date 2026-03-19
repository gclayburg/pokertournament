import {
  calcEvenChop,
  calcNetPrizePool,
  calcPayoutAmounts,
  getPayoutTier,
} from "@/state/calculations";

describe("payout tier lookup", () => {
  test("0 entries returns 1 place", () => {
    const tier = getPayoutTier(0);
    expect(tier.placesPaid).toBe(1);
    expect(tier.percentages).toEqual([100]);
  });

  test("6 entries returns 1 place", () => {
    expect(getPayoutTier(6).placesPaid).toBe(1);
  });

  test("7 entries returns 2 places", () => {
    const tier = getPayoutTier(7);
    expect(tier.placesPaid).toBe(2);
    expect(tier.percentages).toEqual([65, 35]);
  });

  test("12 entries returns 2 places", () => {
    expect(getPayoutTier(12).placesPaid).toBe(2);
  });

  test("13 entries returns 3 places", () => {
    const tier = getPayoutTier(13);
    expect(tier.placesPaid).toBe(3);
    expect(tier.percentages).toEqual([50, 30, 20]);
  });

  test("19 entries returns 3 places", () => {
    expect(getPayoutTier(19).placesPaid).toBe(3);
  });

  test("20 entries returns 4 places", () => {
    const tier = getPayoutTier(20);
    expect(tier.placesPaid).toBe(4);
    expect(tier.percentages).toEqual([40, 30, 20, 10]);
  });

  test("29 entries returns 4 places", () => {
    expect(getPayoutTier(29).placesPaid).toBe(4);
  });

  test("30 entries returns 5 places", () => {
    const tier = getPayoutTier(30);
    expect(tier.placesPaid).toBe(5);
    expect(tier.percentages).toEqual([40, 25, 20, 10, 5]);
  });

  test("39 entries returns 5 places", () => {
    expect(getPayoutTier(39).placesPaid).toBe(5);
  });

  test("40 entries returns 6 places", () => {
    const tier = getPayoutTier(40);
    expect(tier.placesPaid).toBe(6);
    expect(tier.percentages).toEqual([39, 21, 13, 11, 9, 7]);
  });

  test("100 entries still returns 6 places (40+ cap)", () => {
    expect(getPayoutTier(100).placesPaid).toBe(6);
  });
});

describe("net prize pool", () => {
  test("deducts flat fee from gross pool", () => {
    expect(calcNetPrizePool(14, 40, 10)).toBe(550);
  });

  test("fee of 0 returns gross pool", () => {
    expect(calcNetPrizePool(10, 40, 0)).toBe(400);
  });

  test("fee larger than pool clamps to 0", () => {
    expect(calcNetPrizePool(1, 5, 100)).toBe(0);
  });
});

describe("payout amount calculation", () => {
  test("3-place tier with $550 pool", () => {
    const tier = getPayoutTier(14);
    const amounts = calcPayoutAmounts(550, tier);
    // 50% of 550 = 275, 30% = 165, 20% = 110 → total 550
    expect(amounts).toEqual([275, 165, 110]);
  });

  test("rounding remainder goes to 1st place", () => {
    const tier = getPayoutTier(8); // 2 places: 65%, 35%
    // 65% of 100 = 65, 35% of 100 = 35 → exact
    expect(calcPayoutAmounts(100, tier)).toEqual([65, 35]);

    // 65% of 99 = 64.35 → floor 64, 35% of 99 = 34.65 → floor 34
    // remainder = 99 - 64 - 34 = 1 → 1st gets 65
    expect(calcPayoutAmounts(99, tier)).toEqual([65, 34]);
  });

  test("1-place tier gives everything to 1st", () => {
    const tier = getPayoutTier(5);
    expect(calcPayoutAmounts(200, tier)).toEqual([200]);
  });

  test("0 prize pool returns empty", () => {
    const tier = getPayoutTier(10);
    expect(calcPayoutAmounts(0, tier)).toEqual([]);
  });
});

describe("even chop calculation", () => {
  test("even split among 3 players with $550", () => {
    const amounts = calcEvenChop(550, 3);
    // 550 / 3 = 183.33 → floor 183 each, remainder 1 to 1st
    expect(amounts).toEqual([184, 183, 183]);
  });

  test("exact split", () => {
    expect(calcEvenChop(300, 3)).toEqual([100, 100, 100]);
  });

  test("0 players returns empty", () => {
    expect(calcEvenChop(500, 0)).toEqual([]);
  });

  test("0 prize pool returns empty", () => {
    expect(calcEvenChop(0, 3)).toEqual([]);
  });

  test("1 player gets everything", () => {
    expect(calcEvenChop(500, 1)).toEqual([500]);
  });
});
