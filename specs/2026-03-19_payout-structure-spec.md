## Payout Structure Display

- **Date:** `2026-03-19T10:58:25-06:00`
- **References:** `specs/done-reports/payout-structure.md`, `specs/done-reports/image.png`
- **Supersedes:** none
- **Plan:** `none`
- **Chunked:** `false`
- **State:** `IMPLEMENTED`

---

### Overview

Add a dynamic payout structure display to the main tournament screen. The payout tiers are determined by the total number of buy-ins (initial entries + rebuys) and update in real time as rebuys are added. The payout table is fixed (not admin-configurable) and based on a predefined tier chart. The admin can toggle an even-chop column at any time during the tournament to show what each remaining player would receive if the prize pool were split equally. The even-chop column is off by default and not visible until the admin enables it.

---

### 1. Payout Tier Table

The following fixed payout structure determines how many places are paid and at what percentage, based on the total number of buy-ins:

| Total Buy-ins | Places Paid | Payout Percentages           |
|---------------|-------------|------------------------------|
| 0–6           | 1           | 100%                         |
| 7–12          | 2           | 65%, 35%                     |
| 13–19         | 3           | 50%, 30%, 20%                |
| 20–29         | 4           | 40%, 30%, 20%, 10%           |
| 30–39         | 5           | 40%, 25%, 20%, 10%, 5%       |
| 40+           | 6           | 39%, 21%, 13%, 11%, 9%, 7%   |

- **Total buy-ins** = initial entries + all rebuys recorded during the rebuy period.
- For tournaments with 40 or more total buy-ins, the 40+ tier is used (no additional tiers beyond this).

#### 1.1 Tournament Fee

A flat tournament fee is deducted from the total prize pool before payout calculations.

- **Default fee:** $10.
- The fee is configurable on the tournament configuration screen (pre-start) as a dollar amount field labeled "Tournament Fee."
- **Prize pool for payouts** = (total buy-ins × buyin amount) − tournament fee.
- The fee is deducted once from the total pool, not per buy-in.
- The displayed "Prize Pool" on the main screen shows the **net prize pool** (after fee deduction). Both the main screen display and the payout panel use this same net value.

---

### 2. Main Screen Display

#### 2.1 Placement — Bottom-Left Corner

Add a payout structure panel to the bottom-left area of the main tournament screen (below the existing Prize Pool / Next Break section in the left panel).

#### 2.2 Content

The panel displays a list of paid positions with their dollar amounts:

```
Payouts (3 places)
  1st: $280
  2nd: $168
  3rd: $112
```

- The heading shows the number of places paid.
- Each line shows the place (1st, 2nd, 3rd, etc.) and the dollar amount.
- Dollar amounts are calculated as: `net prize pool × payout percentage` for each position (where net prize pool = gross prize pool − tournament fee).
- Dollar amounts should be rounded to whole dollars. Any rounding remainder is added to 1st place.

#### 2.3 Even Chop Column

The admin has a **"Show Even Chop"** toggle in the edit controls, available at any time during the tournament. It is **off by default**. When enabled:

1. An editable **"Remaining Players"** field appears in the edit controls, pre-populated with the current players remaining count from the tournament state. The admin can override this number to reflect the actual game state (e.g., if the tracker hasn't been updated yet).
2. The payout panel adds a second column showing what each remaining player would receive if the net prize pool were split equally:

```
Payouts (3 places)
  Place   Tiered    Even Chop (5 players)
  1st     $280      $110
  2nd     $168      $110
  3rd     $112      $110
```

- **Even chop amount** = net prize pool ÷ remaining players (from the editable field), rounded to whole dollars. Any rounding remainder is added to 1st place.
- The even chop column updates immediately when the admin changes the "Remaining Players" field or when the tournament's players remaining count changes (which also re-populates the field).
- The even chop column shows payouts for all remaining players, not just the paid places — this is the whole point of a chop (everyone gets paid equally regardless of the tier structure).
- This is purely informational — it does not change the actual payout or end the tournament. It is a visual aid for players deciding whether to agree to an even split.

#### 2.4 Dynamic Updates

The payout display must update immediately when:
- A rebuy is added (total buy-ins increases, which may change the payout tier and always changes dollar amounts).
- The number of initial entries changes (during configuration or if adjusted by admin).

---

### 3. Rebuy Integration

The existing "Add rebuy" control (spec section 3.3 of `2026-03-19_tournament-tracker-spec.md`) already increments total entries and updates prize pool, total chips, and average stack. This spec adds:

- When a rebuy is added, the payout structure display recalculates based on the new total buy-in count.
- If the new total buy-in count crosses a tier boundary (e.g., from 12 to 13 buy-ins), the number of paid places changes and the display updates accordingly.

---

### 4. Test Strategy

- **Unit tests** for:
  - Payout tier lookup: given a total buy-in count, returns the correct number of places and percentages.
  - Dollar amount calculation: given a net prize pool (after fee) and tier, returns correct dollar amounts for each place.
  - Tournament fee deduction: verify net prize pool = (buy-ins × buyin) − fee (e.g., 14 × $40 − $10 = $550).
  - Rounding: verify rounding remainder goes to 1st place (e.g., $550 pool with 50%/30%/20% = $275/$165/$110).
  - Boundary conditions: 0 entries, 6→7 transition, 12→13, 19→20, 29→30, 39→40, and 40+ entries.
  - Even chop calculation: given a net prize pool and remaining players, returns correct per-player amount.
  - Even chop rounding: verify remainder handling (e.g., $550 pool ÷ 3 players).
  - Even chop with admin override: uses the editable remaining players field, not necessarily the tournament's players remaining.
- **Component tests** for:
  - Payout panel renders the correct number of places and dollar amounts.
  - Payout panel updates when total entries change.
  - Even chop column appears/disappears based on toggle state.
  - "Show Even Chop" toggle is always available during the tournament.
  - "Remaining Players" field appears when even chop is enabled, pre-populated with current players remaining.
  - Editing the "Remaining Players" field recalculates the even chop amounts.
- **Integration test:**
  - Start tournament → add rebuys → verify payout display updates correctly across tier boundaries.
  - Enable even chop → verify remaining players field → override value → verify chop recalculates → bust a player → verify field re-populates.

---

## SPEC workflow

1. read `specs/CLAUDE.md` and follow all rules there to implement this DRAFT spec (DRAFT->IMPLEMENTED)
