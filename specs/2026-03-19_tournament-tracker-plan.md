# Implementation Plan: Poker Tournament Tracker

**Parent spec:** `specs/2026-03-19_tournament-tracker-spec.md`

## Contents

- [x] **Chunk 1: Project Scaffolding & Tournament State**
- [x] **Chunk 2: Timer Engine**
- [x] **Chunk 3: Tournament Display UI**
- [ ] **Chunk 4: Configuration UI**
- [ ] **Chunk 5: Admin Controls & Player Tracking**
- [ ] **Chunk 6: Audio Alerts**
- [ ] **Chunk 7: Integration & Full Tournament Flow**


## Chunk Detail

### Chunk 1: Project Scaffolding & Tournament State

#### Description

Bootstrap the Next.js project and implement the core tournament state model — types, default data, and the reducer that drives all state transitions. This chunk produces no visible UI but establishes the foundation every other chunk depends on.

#### Spec Reference

See spec [Overview](./2026-03-19_tournament-tracker-spec.md#overview), sections 2.1, 2.2, 6.

#### Dependencies

- None

#### Produces

- `package.json`, `tsconfig.json`, `next.config.ts`, `jest.config.ts`
- `src/types/tournament.ts`
- `src/state/defaults.ts`
- `src/state/tournamentReducer.ts`
- `src/state/calculations.ts` (prize pool, average stack, total chips, estimated duration)
- `__tests__/state/tournamentReducer.test.ts`
- `__tests__/state/calculations.test.ts`

#### Implementation Details

1. **Initialize Next.js project:**
   - `npx create-next-app@latest . --typescript --app --tailwind --eslint`
   - Add Jest + React Testing Library: `npm install --save-dev jest @testing-library/react @testing-library/jest-dom ts-jest @types/jest jest-environment-jsdom`
   - Configure `jest.config.ts` for TypeScript with jsdom environment.

2. **Define tournament types** (`src/types/tournament.ts`):
   - `BlindLevel`: `{ type: 'blind'; smallBlind: number; bigBlind: number }` or `{ type: 'break' }`
   - `TournamentConfig`: `{ levels: BlindLevel[]; levelDurationMinutes: number; breakDurationMinutes: number; buyinAmount: number; startingStack: number; rebuysAllowed: boolean; maxRebuys: number; rebuyCutoffLevel: number; initialEntries: number }`
   - `TournamentStatus`: `'pre-start' | 'running' | 'paused' | 'break' | 'finished'`
   - `TournamentState`: `{ config: TournamentConfig; status: TournamentStatus; currentLevelIndex: number; timeRemainingMs: number; totalEntries: number; playersRemaining: number; rebuys: number }`

3. **Default configuration** (`src/state/defaults.ts`):
   - Export `DEFAULT_LEVELS` matching the 14-level + 2-break structure from spec section 2.1.
   - Export `DEFAULT_CONFIG` with 20-min levels, 10-min breaks, $40 buyin, 10k starting stack, rebuys allowed through level 5.

4. **Tournament reducer** (`src/state/tournamentReducer.ts`):
   - Actions: `START`, `PAUSE`, `RESUME`, `TICK` (decrement time), `ADVANCE_LEVEL`, `SKIP_BREAK`, `SET_LEVEL` (override), `SET_TIME` (override), `BUST_PLAYER`, `ADD_REBUY`, `UPDATE_CONFIG`.
   - `START` transitions status from `pre-start` → `running`, sets `currentLevelIndex` to 0, `timeRemainingMs` to level duration.
   - `TICK` decrements `timeRemainingMs`. When it reaches 0, auto-advances to next level.
   - `ADVANCE_LEVEL` increments `currentLevelIndex`, resets timer. If next level is a break, status → `break`.
   - `BUST_PLAYER` decrements `playersRemaining`. If `playersRemaining` === 1, status → `finished`.
   - `ADD_REBUY` only allowed when `currentLevelIndex` corresponds to a level ≤ `rebuyCutoffLevel` and rebuys are enabled. Increments `totalEntries` and `rebuys`.
   - `UPDATE_CONFIG` only allowed when status is `pre-start`.

5. **Calculation helpers** (`src/state/calculations.ts`):
   - `calcPrizePool(totalEntries, buyinAmount)` → number
   - `calcTotalChips(totalEntries, startingStack)` → number
   - `calcAverageStack(totalChips, playersRemaining)` → number
   - `calcEstimatedDuration(state)` → minutes remaining estimate. Use a simple heuristic: estimate how many levels remain until average stack covers all chips (one player has everything), multiply by level duration.
   - `isRebuysOpen(currentLevelIndex, levels, rebuyCutoffLevel)` → boolean. Must account for break levels in the index (the cutoff is by blind-level number, not array index).

#### Test Plan

**Test File:** `__tests__/state/tournamentReducer.test.ts`

| Test Case | Description | Spec Section |
|-----------|-------------|--------------|
| `start_tournament` | START sets status to running, level to 0, timer to level duration | 3.1 |
| `pause_and_resume` | PAUSE/RESUME toggle status correctly | 3.1 |
| `tick_decrements_time` | TICK reduces timeRemainingMs | 6 |
| `auto_advance_on_zero` | When TICK brings time to 0, level advances | 1.1 |
| `advance_to_break` | Advancing to a break level sets status to break | 1.1 |
| `skip_break` | SKIP_BREAK advances past break to next blind level | 3.1 |
| `set_level_override` | SET_LEVEL moves to arbitrary level | 3.2 |
| `set_time_override` | SET_TIME sets arbitrary remaining time | 3.2 |
| `bust_player_decrements` | BUST_PLAYER decrements playersRemaining | 3.3 |
| `bust_player_finishes` | BUST_PLAYER with 2 remaining → finished | 3.3 |
| `add_rebuy_allowed` | ADD_REBUY works when rebuys open | 3.3 |
| `add_rebuy_blocked` | ADD_REBUY rejected after cutoff level | 3.3 |
| `config_locked_after_start` | UPDATE_CONFIG rejected when not pre-start | 2.3 |

**Test File:** `__tests__/state/calculations.test.ts`

| Test Case | Description | Spec Section |
|-----------|-------------|--------------|
| `prize_pool_calculation` | entries × buyin | 1.2 |
| `total_chips_calculation` | entries × starting stack | 1.4 |
| `average_stack_calculation` | total chips / players remaining | 1.4 |
| `estimated_duration` | Returns reasonable estimate | 1.5 |
| `rebuys_open_before_cutoff` | Returns true for levels ≤ cutoff | 2.2 |
| `rebuys_closed_after_cutoff` | Returns false for levels > cutoff | 2.2 |
| `rebuys_skip_break_indexing` | Break levels don't count toward cutoff level number | 2.2 |

**Mocking Requirements:**
- None (pure logic)

**Dependencies:** None

#### Implementation Log

- Files changed: normalized the Jest/Next dependency scaffold in `package.json`, regenerated `package-lock.json`, and verified the existing state/reducer/calculation files and their unit tests under `src/state/`, `src/types/`, and `__tests__/state/`.
- Key decisions: kept the existing reducer and calculation implementations because they already matched the chunk requirements and passed the full unit suite once the dependency graph was repaired; removed the stray Jest 30 direct dependencies so the Jest 29 toolchain installs consistently.
- Notable for finalize: there are unrelated untracked UI scaffold files in the worktree for later chunks (`src/app/*` and related setup files). They were left untouched and should not be treated as completed chunk work yet.

---

### Chunk 2: Timer Engine

#### Description

Implement a React hook (`useTimer`) that drives the countdown with drift correction, handles level auto-advance, and triggers callbacks for warning/level-change events. This isolates timer complexity from UI rendering.

#### Spec Reference

See spec [Timer & Level Display](./2026-03-19_tournament-tracker-spec.md#11-timer--level-display), section 6 (timer accuracy).

#### Dependencies

- Chunk 1 (TournamentState types and reducer)

#### Produces

- `src/hooks/useTimer.ts`
- `__tests__/hooks/useTimer.test.ts`

#### Implementation Details

1. **`useTimer` hook** (`src/hooks/useTimer.ts`):
   - Accepts: `dispatch` function from the tournament reducer, `state` (to read status and timeRemainingMs).
   - When status is `running` or `break`:
     - Records `Date.now()` as the reference timestamp on each start/resume.
     - Runs `setInterval` at ~100ms.
     - On each tick, computes elapsed time via `Date.now() - reference`, dispatches `TICK` with the actual elapsed ms (drift-corrected).
     - Updates the reference timestamp.
   - When status is `paused`, `pre-start`, or `finished`: clears the interval.
   - Exposes callback registration for:
     - `onOneMinuteWarning`: fires once when `timeRemainingMs` crosses from >60000 to ≤60000.
     - `onLevelChange`: fires when the level index changes.
   - Cleans up interval on unmount.

2. **Drift correction approach:**
   - Do NOT rely on counting interval ticks. Instead, measure wall-clock elapsed time on every tick and dispatch the real delta.
   - The reducer clamps `timeRemainingMs` to not go below 0.

#### Test Plan

**Test File:** `__tests__/hooks/useTimer.test.ts`

| Test Case | Description | Spec Section |
|-----------|-------------|--------------|
| `starts_countdown_on_running` | Timer dispatches TICK when status is running | 6 |
| `stops_on_pause` | Timer stops dispatching when paused | 3.1 |
| `drift_correction` | Timer uses Date.now() delta, not tick count | 6 |
| `one_minute_warning_fires` | Callback fires when crossing 60s boundary | 4 |
| `one_minute_warning_fires_once` | Callback does not re-fire on subsequent ticks | 4 |
| `level_change_callback` | Callback fires when currentLevelIndex changes | 4 |
| `cleanup_on_unmount` | Interval is cleared on unmount | 6 |

**Mocking Requirements:**
- Mock `Date.now()` and `setInterval`/`clearInterval` using Jest fake timers.

**Dependencies:** Chunk 1 (types and reducer)

#### Implementation Log

- Files changed: added the timer hook in `src/hooks/useTimer.ts`, added hook coverage in `__tests__/hooks/useTimer.test.ts`, and updated this plan entry.
- Key decisions: implemented drift correction with `Date.now()` deltas on a 100ms interval, kept warning and level-change detection in separate effects, and used `useEffectEvent` so callback consumers can register handlers without stale closures or extra interval churn.
- Notable for finalize: the local `react-dom` install was corrupted with NUL bytes in `node_modules`, which broke hook rendering in Jest; it was repaired from the published `react-dom@19.2.4` tarball, but no tracked dependency files changed.

---

### Chunk 3: Tournament Display UI

#### Description

Build the main tournament display page — the visual layout matching the reference image. This renders the timer, blinds, prize pool, entries, chip stats, and estimated duration. No controls or configuration UI yet — just the read-only display wired to the tournament state.

#### Spec Reference

See spec [Tournament Display](./2026-03-19_tournament-tracker-spec.md#1-tournament-display-main-screen), section 5 (visual design).

#### Dependencies

- Chunk 1 (state, types, calculations)
- Chunk 2 (useTimer hook)

#### Produces

- `src/app/page.tsx` (main page)
- `src/app/layout.tsx` (root layout)
- `src/app/globals.css` (global styles, orange gradient)
- `src/components/TimerDisplay.tsx`
- `src/components/BlindsDisplay.tsx`
- `src/components/PrizePoolPanel.tsx`
- `src/components/EntriesPanel.tsx`
- `src/components/BuyinPanel.tsx`
- `src/components/EstimatedDuration.tsx`
- `src/context/TournamentContext.tsx` (React context providing state + dispatch)
- `__tests__/components/TimerDisplay.test.tsx`
- `__tests__/components/BlindsDisplay.test.tsx`
- `__tests__/components/panels.test.tsx`

#### Implementation Details

1. **Tournament context** (`src/context/TournamentContext.tsx`):
   - Create a React context that wraps `useReducer(tournamentReducer, initialState)`.
   - Provide `state` and `dispatch` to all children.
   - Initialize the `useTimer` hook inside the provider.

2. **Main page** (`src/app/page.tsx`):
   - Wrap content in `TournamentProvider`.
   - Three-column layout: left panel, center (timer + blinds), right panel.
   - Responsive via Tailwind: stack vertically on small screens, three-column on larger screens.

3. **TimerDisplay component:**
   - Shows `MM:SS` countdown in large bold text.
   - Shows "Break" or "PAUSED" label when applicable.
   - Flashing animation when paused (CSS animation via Tailwind `animate-pulse`).

4. **BlindsDisplay component:**
   - Shows current level's small/big blind prominently.
   - Shows "Next up" level below.
   - Shows the level after that in smaller text.
   - Handle edge cases: last level (no "next up"), break levels.

5. **Panel components:**
   - `PrizePoolPanel`: prize pool amount, next break countdown.
   - `EntriesPanel`: total entries, players remaining.
   - `BuyinPanel`: buyin amount, starting stack, total chips, average stack, rebuy status, rebuy cutoff level.
   - `EstimatedDuration`: "Est. remaining: ~Xh Ym" label.

6. **Styling:**
   - Orange gradient background (`bg-gradient-to-br from-orange-400 to-orange-600`).
   - White text (`text-white`).
   - Large typography for timer (`text-8xl` or similar responsive sizing).
   - Use Tailwind responsive classes for mobile → TV scaling.

#### Test Plan

**Test File:** `__tests__/components/TimerDisplay.test.tsx`

| Test Case | Description | Spec Section |
|-----------|-------------|--------------|
| `renders_time_formatted` | Displays MM:SS from timeRemainingMs | 1.1 |
| `shows_break_label` | Shows "Break" when status is break | 1.1 |
| `shows_paused_label` | Shows "PAUSED" when status is paused | 3.1 |

**Test File:** `__tests__/components/BlindsDisplay.test.tsx`

| Test Case | Description | Spec Section |
|-----------|-------------|--------------|
| `shows_current_blinds` | Renders current small/big blind | 1.1 |
| `shows_next_up` | Renders next level blinds | 1.1 |
| `shows_two_ahead` | Renders level after next in smaller text | 1.1 |
| `handles_last_level` | No "next up" when on final level | 1.1 |

**Test File:** `__tests__/components/panels.test.tsx`

| Test Case | Description | Spec Section |
|-----------|-------------|--------------|
| `prize_pool_display` | Shows formatted dollar amount | 1.2 |
| `entries_display` | Shows total entries and players remaining | 1.3 |
| `buyin_details` | Shows buyin, stack, chips, average | 1.4 |
| `rebuys_open_indicator` | Shows Yes/No for reentry closed | 1.4 |
| `estimated_duration_display` | Shows formatted estimate | 1.5 |

**Mocking Requirements:**
- Mock TournamentContext to provide controlled state values.

**Dependencies:** Chunk 1, Chunk 2

#### Implementation Log

- Files changed: replaced the stub app shell in `src/app/page.tsx`, expanded `src/app/globals.css`, added `src/context/TournamentContext.tsx`, added display components under `src/components/`, and added component coverage in `__tests__/components/`.
- Key decisions: kept the page as a single client boundary around a `TournamentProvider`, rendered break mode using the next playable blind level to match the reference screen, and used lightweight shared formatters for clock/currency/estimate display consistency.
- Notable for finalize: the display is intentionally read-only for this chunk; config/admin/audio flows remain unimplemented and should land in later chunks without reworking the new layout structure.

---

### Chunk 4: Configuration UI

#### Description

Build the pre-start configuration overlay/modal where the admin can edit the blind structure, level duration, buyin, starting stack, rebuy settings, and entry count before starting the tournament.

#### Spec Reference

See spec [Tournament Configuration](./2026-03-19_tournament-tracker-spec.md#2-tournament-configuration-setup--pre-start), sections 2.1, 2.2, 2.3.

#### Dependencies

- Chunk 1 (state types, reducer UPDATE_CONFIG action)
- Chunk 3 (TournamentContext for dispatch, main page for mounting)

#### Produces

- `src/components/ConfigPanel.tsx`
- `src/components/BlindStructureEditor.tsx`
- `src/components/TournamentSettingsForm.tsx`
- `__tests__/components/ConfigPanel.test.tsx`
- `__tests__/components/BlindStructureEditor.test.tsx`

#### Implementation Details

1. **ConfigPanel** (`src/components/ConfigPanel.tsx`):
   - Rendered as an overlay/modal when tournament status is `pre-start`.
   - Contains `BlindStructureEditor` and `TournamentSettingsForm`.
   - Has a "Start Tournament" button that dispatches `START`.
   - Hidden/inaccessible once tournament status is not `pre-start` (spec section 2.3 lockout).

2. **BlindStructureEditor** (`src/components/BlindStructureEditor.tsx`):
   - Displays the current blind structure as an editable list.
   - Each row shows: level number, small blind input, big blind input, or "BREAK" label.
   - Controls per row: edit (inline), delete.
   - "Add Level" button at the bottom — appends a new blind level with empty/default values.
   - "Add Break" button — inserts a break entry.
   - Reorder via move-up/move-down buttons.
   - All edits dispatch `UPDATE_CONFIG` with the new levels array.

3. **TournamentSettingsForm** (`src/components/TournamentSettingsForm.tsx`):
   - Fields: number of entries, buyin amount ($), starting stack, level duration (minutes), break duration (minutes).
   - Rebuys section: toggle (on/off), max rebuys (number), rebuy cutoff level (number).
   - All fields dispatch `UPDATE_CONFIG` on change.
   - Basic validation: no negative numbers, level duration > 0, entries ≥ 2.

4. **Styling:**
   - Semi-transparent dark overlay behind modal.
   - White/light card for the configuration content.
   - Form inputs styled with Tailwind for clarity.

#### Test Plan

**Test File:** `__tests__/components/ConfigPanel.test.tsx`

| Test Case | Description | Spec Section |
|-----------|-------------|--------------|
| `visible_pre_start` | Config panel renders when status is pre-start | 2 |
| `hidden_after_start` | Config panel not rendered when running | 2.3 |
| `start_button_dispatches` | Start button dispatches START action | 3.1 |

**Test File:** `__tests__/components/BlindStructureEditor.test.tsx`

| Test Case | Description | Spec Section |
|-----------|-------------|--------------|
| `renders_default_levels` | Shows all 14 levels + 2 breaks | 2.1 |
| `edit_blind_values` | Changing input updates level values | 2.1 |
| `add_level` | Add level button appends new entry | 2.1 |
| `add_break` | Add break button inserts break | 2.1 |
| `remove_level` | Delete button removes level | 2.1 |
| `reorder_levels` | Move up/down changes position | 2.1 |
| `settings_form_fields` | All setting fields render with defaults | 2.2 |
| `rebuy_toggle` | Toggling rebuys shows/hides rebuy options | 2.2 |
| `validation_rejects_negative` | Negative values show error | 2.2 |

**Mocking Requirements:**
- Mock TournamentContext with pre-start state.

**Dependencies:** Chunk 1, Chunk 3

#### Implementation Log

<!-- Filled in by the implementing agent after completing this chunk. -->

---

### Chunk 5: Admin Controls & Player Tracking

#### Description

Build the admin control bar shown during active tournament play — start/pause/resume, skip break, level override, bust player, and add rebuy.

#### Spec Reference

See spec [Tournament Controls](./2026-03-19_tournament-tracker-spec.md#3-tournament-controls-during-play), sections 3.1, 3.2, 3.3.

#### Dependencies

- Chunk 1 (reducer actions: PAUSE, RESUME, SKIP_BREAK, SET_LEVEL, SET_TIME, BUST_PLAYER, ADD_REBUY)
- Chunk 3 (TournamentContext, main page layout)

#### Produces

- `src/components/ControlBar.tsx`
- `src/components/LevelOverrideModal.tsx`
- `__tests__/components/ControlBar.test.tsx`
- `__tests__/components/LevelOverrideModal.test.tsx`

#### Implementation Details

1. **ControlBar** (`src/components/ControlBar.tsx`):
   - Fixed at the bottom of the screen.
   - Shows different controls based on tournament status:
     - `pre-start`: nothing (config panel handles start).
     - `running`: Pause, Bust Player, Add Rebuy (if open), Edit Level.
     - `paused`: Resume, Bust Player, Add Rebuy (if open), Edit Level.
     - `break`: Skip Break, Bust Player.
     - `finished`: "Tournament Over" label (no controls).
   - "Bust Player" button: dispatches `BUST_PLAYER`. Disabled if `playersRemaining <= 1`.
   - "Add Rebuy" button: dispatches `ADD_REBUY`. Disabled/hidden if rebuys are closed.
   - "Edit Level" button: opens `LevelOverrideModal`.

2. **LevelOverrideModal** (`src/components/LevelOverrideModal.tsx`):
   - Dropdown or list to select target level (shows all blind levels by number and blind amounts).
   - Number input for remaining time (minutes and seconds).
   - "Apply" button dispatches `SET_LEVEL` and `SET_TIME`, then closes modal.
   - "Cancel" button closes modal without changes.

3. **Styling:**
   - Control bar has a semi-transparent dark background.
   - Buttons use consistent styling (white text on darker orange or dark bg).
   - Disabled buttons are visually dimmed.

#### Test Plan

**Test File:** `__tests__/components/ControlBar.test.tsx`

| Test Case | Description | Spec Section |
|-----------|-------------|--------------|
| `shows_pause_when_running` | Pause button visible during running | 3.1 |
| `shows_resume_when_paused` | Resume button visible during paused | 3.1 |
| `shows_skip_break` | Skip Break button visible during break | 3.1 |
| `bust_player_dispatches` | Bust player decrements | 3.3 |
| `bust_player_disabled_at_one` | Disabled when 1 player remains | 3.3 |
| `add_rebuy_visible_when_open` | Add Rebuy shown when rebuys open | 3.3 |
| `add_rebuy_hidden_when_closed` | Add Rebuy hidden after cutoff | 3.3 |
| `no_controls_when_finished` | No action buttons when finished | 3.1 |

**Test File:** `__tests__/components/LevelOverrideModal.test.tsx`

| Test Case | Description | Spec Section |
|-----------|-------------|--------------|
| `lists_all_levels` | Dropdown shows all blind levels | 3.2 |
| `apply_dispatches_set_level` | Apply dispatches SET_LEVEL action | 3.2 |
| `apply_dispatches_set_time` | Apply dispatches SET_TIME action | 3.2 |
| `cancel_closes_modal` | Cancel closes without dispatch | 3.2 |

**Mocking Requirements:**
- Mock TournamentContext with various tournament states.

**Dependencies:** Chunk 1, Chunk 3

#### Implementation Log

<!-- Filled in by the implementing agent after completing this chunk. -->

---

### Chunk 6: Audio Alerts

#### Description

Implement browser-based audio alerts for the 1-minute warning, level change, break start, and break end events using the Web Audio API.

#### Spec Reference

See spec [Audio Alerts](./2026-03-19_tournament-tracker-spec.md#4-audio-alerts), section 4.

#### Dependencies

- Chunk 2 (useTimer callbacks: onOneMinuteWarning, onLevelChange)
- Chunk 1 (state for detecting break start/end transitions)

#### Produces

- `src/hooks/useAudioAlerts.ts`
- `src/audio/tones.ts`
- `__tests__/hooks/useAudioAlerts.test.ts`
- `__tests__/audio/tones.test.ts`

#### Implementation Details

1. **Tone generator** (`src/audio/tones.ts`):
   - Use the Web Audio API (`AudioContext`, `OscillatorNode`, `GainNode`).
   - Export functions that produce distinct sounds:
     - `playWarningTone()`: short double-beep (e.g., 800Hz, 200ms on, 100ms off, 200ms on).
     - `playLevelChangeTone()`: longer ascending chime (e.g., 600Hz → 900Hz, 500ms).
     - `playBreakStartTone()`: mellow tone (e.g., 500Hz, 300ms).
     - `playBreakEndTone()`: upbeat tone (e.g., 700Hz → 1000Hz, 400ms).
   - Handle AudioContext creation lazily (browsers require user gesture before audio can play — create on first user interaction).

2. **useAudioAlerts hook** (`src/hooks/useAudioAlerts.ts`):
   - Subscribes to timer/state events:
     - When `timeRemainingMs` crosses ≤60000 from above → `playWarningTone()`.
     - When `currentLevelIndex` changes and new level is a blind → `playLevelChangeTone()`.
     - When status transitions to `break` → `playBreakStartTone()`.
     - When status transitions from `break` to `running` → `playBreakEndTone()`.
   - Uses `useRef` to track previous values and avoid duplicate fires.
   - Integrate into `TournamentContext` provider so it runs globally.

3. **AudioContext user-gesture bootstrap:**
   - On first click/keypress on the page, create the `AudioContext` and resume it.
   - Store in a module-level variable or ref.

#### Test Plan

**Test File:** `__tests__/audio/tones.test.ts`

| Test Case | Description | Spec Section |
|-----------|-------------|--------------|
| `warning_tone_plays` | playWarningTone creates oscillator with correct frequency | 4 |
| `level_change_tone_plays` | playLevelChangeTone creates ascending oscillator | 4 |
| `break_start_tone_plays` | playBreakStartTone plays correct tone | 4 |
| `break_end_tone_plays` | playBreakEndTone plays correct tone | 4 |

**Test File:** `__tests__/hooks/useAudioAlerts.test.ts`

| Test Case | Description | Spec Section |
|-----------|-------------|--------------|
| `fires_warning_at_one_minute` | Calls playWarningTone when crossing 60s | 4 |
| `fires_level_change` | Calls playLevelChangeTone on level advance | 4 |
| `fires_break_start` | Calls playBreakStartTone on break transition | 4 |
| `fires_break_end` | Calls playBreakEndTone on break→running | 4 |
| `no_duplicate_warning` | Warning tone fires only once per level | 4 |

**Mocking Requirements:**
- Mock `AudioContext`, `OscillatorNode`, `GainNode` (Web Audio API not available in jsdom).

**Dependencies:** Chunk 1, Chunk 2

#### Implementation Log

<!-- Filled in by the implementing agent after completing this chunk. -->

---

### Chunk 7: Integration & Full Tournament Flow

#### Description

Write integration tests that exercise the full tournament lifecycle: configure → start → play through levels with busts and rebuys → breaks → finish. Verify all components work together. Fix any integration issues discovered.

#### Spec Reference

See spec [Test Strategy](./2026-03-19_tournament-tracker-spec.md#7-test-strategy), integration test section.

#### Dependencies

- Chunk 1, Chunk 2, Chunk 3, Chunk 4, Chunk 5, Chunk 6 (all prior chunks)

#### Produces

- `__tests__/integration/tournamentFlow.test.tsx`

#### Implementation Details

1. **Full flow integration test** (`__tests__/integration/tournamentFlow.test.tsx`):
   - Render the full `page.tsx` with all providers.
   - Use Jest fake timers to control time progression.
   - Test sequence:
     a. App starts in pre-start with config panel visible.
     b. Modify settings (change entries to 8, verify display updates).
     c. Click "Start Tournament" — config panel hides, timer starts at level 1 (25/50).
     d. Advance timer to 1 minute remaining — verify warning state.
     e. Advance timer to 0 — verify level advances to 2 (50/100), display updates.
     f. Click "Bust Player" — verify players remaining decrements, average stack updates.
     g. Click "Add Rebuy" — verify total entries increments, prize pool updates.
     h. Advance to level 5 (200/400), then past it — verify rebuys close automatically.
     i. Advance to break — verify "Break" displayed, skip break works.
     j. Click "Pause" — verify timer stops, "PAUSED" shown.
     k. Click "Resume" — verify timer resumes.
     l. Use level override to go back to level 3 with 5:00 on clock — verify display.
     m. Bust all but 1 player — verify "finished" state.

2. **Fix integration issues:**
   - If any wiring between chunks is broken (context not passed, callbacks not connected), fix in this chunk.
   - Ensure audio alert hooks are properly integrated in the provider.

#### Test Plan

**Test File:** `__tests__/integration/tournamentFlow.test.tsx`

| Test Case | Description | Spec Section |
|-----------|-------------|--------------|
| `full_tournament_lifecycle` | Complete flow from config through finish | 7 |
| `config_to_start_transition` | Config panel hides, timer starts | 2.3, 3.1 |
| `level_progression` | Levels advance correctly through structure | 1.1, 2.1 |
| `player_tracking_updates` | Busts and rebuys update all derived values | 3.3, 1.4 |
| `rebuy_auto_close` | Rebuys close after cutoff level | 2.2, 3.3 |
| `break_handling` | Break display and skip break work | 1.1, 3.1 |
| `pause_resume` | Pause stops timer, resume continues | 3.1 |
| `level_override` | Manual level/time change works | 3.2 |
| `tournament_finish` | Last bust triggers finished state | 3.3 |

**Mocking Requirements:**
- Jest fake timers for time control.
- Mock Web Audio API for audio alert verification.

**Dependencies:** All prior chunks (1–6)

#### Implementation Log

<!-- Filled in by the implementing agent after completing this chunk. -->


## SPEC Workflow

**Parent spec:** `specs/2026-03-19_tournament-tracker-spec.md`

Read `specs/CLAUDE.md` for full workflow rules. The workflow below applies to multi-chunk plan implementation.

### Per-Chunk Workflow (every chunk must follow these steps)

1. **Run all unit tests** before starting. Do not proceed if tests are failing.
   - `npx jest --passWithNoTests`
2. **Implement the chunk** as described in its Implementation Details section.
3. **Write or update unit tests** as described in the chunk's Test Plan section.
4. **Run all unit tests** and confirm they pass (both new and existing).
5. **Fill in the `#### Implementation Log`** for the chunk you implemented — summarize files changed, key decisions, and anything notable.
6. **Commit and push** with a commit message that includes the chunk number (e.g., `"chunk 3/7: implement tournament display UI"`).
7. **Verify** the CI build succeeds with no test failures. If it fails, fix and push again.

### Finalize Workflow (after ALL chunks are complete)

After all chunks have been implemented, a finalize step runs automatically to complete the remaining SPEC workflow tasks. The finalize agent reads the entire plan file (including all Implementation Log entries) and performs:

1. **Update `CHANGELOG.md`** (at the repository root).
2. **Update `README.md`** (at the repository root) if CLI options or usage changed.
3. **Update the spec file:** Change its `State:` field to `IMPLEMENTED` and add it to the spec index in `specs/README.md`.
4. **Handle referenced files:** If the spec lists files in its `References:` header, move those files to `specs/done-reports/` and update the reference paths in the spec.
5. **Update `CLAUDE.md`** (at the repository root) if any user-facing interface changes.
6. **Commit and push** and verify CI passes.
