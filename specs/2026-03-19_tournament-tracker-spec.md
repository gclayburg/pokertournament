## Poker Tournament Tracker — Web Application

- **Date:** `2026-03-19T00:00:00-06:00`
- **References:** `specs/done-reports/tournament-tracker.md`, `specs/done-reports/IMG_5315.jpg`
- **Supersedes:** none
- **Plan:** `specs/2026-03-19_tournament-tracker-plan.md`
- **Chunked:** `true`
- **State:** `IMPLEMENTED`

---

### Overview

A single-page web application (Next.js / React / TypeScript) that acts as a poker tournament clock and tracker for No-Limit Texas Hold'em tournaments. The app displays a countdown timer, current and upcoming blind levels, player/entry counts, prize pool, and chip statistics. An administrator (anyone with keyboard/mouse access) can configure, start, pause, and edit the tournament from the same screen.

---

### 1. Tournament Display (Main Screen)

The main screen shows all tournament information at a glance, designed to be readable on screens ranging from mobile devices to large TVs.

#### 1.1 Timer & Level Display (center)
- Large countdown timer showing `MM:SS` for the current level.
- Current blind level displayed prominently (e.g., **200 / 400**).
- "Next up" blind level shown below the current level (e.g., 300 / 600).
- The level after "next up" shown in smaller text (e.g., 400 / 800).
- During a break, the display shows **"Break"** as the status with the break countdown.

#### 1.2 Left Panel
- **Prize Pool:** total prize pool in dollars (entries × buyin amount).
- **Next Break:** countdown timer showing time until the next scheduled break.

#### 1.3 Right Panel — Entries
- Total entries (initial entries + rebuys).
- Players remaining (manually updated by admin as players bust out).

#### 1.4 Right Panel — Buyin & Reentry
- Buyin amount (e.g., $40.00).
- Starting stack (e.g., 10,000).
- Total chips in play (entries × starting stack).
- Average stack (total chips / players remaining).
- Allowed rebuys count.
- Reentry closed: Yes/No (automatically set to Yes after the configured rebuy cutoff level).
- Reentry until level: (e.g., level 5).

#### 1.5 Estimated Duration
- Display an estimate of remaining tournament time based on:
  - Total chips in play.
  - Players remaining.
  - Current blind level and upcoming levels.
  - Level duration.
- This is a rough estimate and should be labeled as such (e.g., "Est. remaining: ~2h 15m").

---

### 2. Tournament Configuration (Setup / Pre-Start)

Before the tournament starts, the admin can configure all settings. Configuration is presented as an overlay/modal or inline editing area — not a separate page (single-screen app).

#### 2.1 Blind Structure
Default levels (all levels are 20 minutes by default):

| Level | Small Blind | Big Blind |
|-------|------------|-----------|
| 1     | 25         | 50        |
| 2     | 50         | 100       |
| 3     | 100        | 200       |
| 4     | 150        | 300       |
| 5     | 200        | 400       |
| —     | **BREAK**  |           |
| 6     | 300        | 600       |
| 7     | 400        | 800       |
| 8     | 500        | 1,000     |
| 9     | 1,000      | 1,500     |
| 10    | 1,500      | 3,000     |
| —     | **BREAK**  |           |
| 11    | 2,000      | 4,000     |
| 12    | 3,000      | 6,000     |
| 13    | 4,000      | 8,000     |
| 14    | 5,000      | 10,000    |

- Admin can add, remove, and reorder levels.
- Admin can edit small blind and big blind values for each level.
- Admin can insert or remove break levels at any position.
- Admin can change the level duration (applies to all levels uniformly, e.g., 15, 20, or 30 minutes).

#### 2.2 Tournament Settings
- **Number of entries:** text input for initial player count.
- **Buyin amount:** dollar amount per entry (default: $40.00).
- **Starting stack:** chip count per entry (default: 10,000).
- **Rebuys allowed:** toggle on/off, with configurable max rebuys per player or total.
- **Rebuy cutoff level:** the last level during which rebuys are permitted (default: level 5). After this level ends, rebuys are automatically closed.
- **Break duration:** configurable duration for breaks (default: 10 minutes).

#### 2.3 Lockout
- Once the tournament is started, the blind structure (levels, amounts) cannot be edited through the normal configuration UI.
- Tournament settings (entries, buyin) are also locked after start, except as noted in the admin controls below.

---

### 3. Tournament Controls (During Play)

Admin controls are accessible via a control bar or button panel at the bottom of the screen.

#### 3.1 Core Controls
- **Start:** begins the tournament at level 1. Starts the countdown timer.
- **Pause / Resume:** pauses the countdown timer. Paused state should be visually obvious (e.g., flashing timer or "PAUSED" overlay).
- **Skip Break:** if currently on a break, skip the remaining break time and advance to the next blind level.

#### 3.2 Level Override
- Admin can manually move to any level (forward or backward).
- Admin can set the remaining time on the clock to any value (e.g., go back to level 4 with 5:00 on the clock).
- After an override, pressing resume/start continues the countdown from the new position.

#### 3.3 Player Tracking (During Play)
- **Bust player:** button or control to decrement the "players remaining" count.
- **Add rebuy:** button to record a rebuy (increments total entries, adds chips to total, only available while rebuys are open).
- Both actions immediately update the display (prize pool, average stack, total chips, players remaining).

---

### 4. Audio Alerts

All audio is browser-based (Web Audio API or simple audio element playback).

- **1-minute warning:** a short alert sound plays when 1 minute remains in the current level.
- **Level change:** a distinct alert sound plays when the timer reaches 0:00 and the level advances.
- **Break start:** an alert when a break begins.
- **Break end:** an alert when a break ends and play resumes.
- Sounds should be simple tones/chimes — no voice or music required.

---

### 5. Visual Design

- Orange gradient background (as shown in the reference image `IMG_5315.jpg`).
- White text throughout for readability.
- Large, bold typography for the timer and current blind level.
- Responsive layout that works on mobile screens through large TV displays.
- High contrast for readability at a distance.

---

### 6. Technical Requirements

- **Framework:** Next.js with React and TypeScript.
- **State management:** React state (useState/useReducer) or a lightweight state library. No backend/database required — all state is in-memory for this version.
- **No authentication:** anyone with access to the device can control the tournament.
- **Timer accuracy:** use `setInterval` with drift correction (compare against `Date.now()` rather than trusting interval timing) to ensure the countdown stays accurate.
- **Browser compatibility:** modern evergreen browsers (Chrome, Firefox, Safari, Edge).

---

### 7. Test Strategy

- **Unit tests** for:
  - Timer logic (countdown, pause, resume, drift correction).
  - Level progression (advance to next level, skip break, manual override).
  - Chip/stack calculations (total chips, average stack, prize pool).
  - Rebuy logic (allowed/closed based on current level vs cutoff).
  - Estimated duration calculation.
- **Component tests** for:
  - Display components render correct values.
  - Admin controls trigger correct state changes.
  - Configuration form validation.
- **Integration test:**
  - Full tournament flow: configure → start → advance through levels → bust players → rebuys → break → end.

---

## SPEC workflow

1. read `specs/CLAUDE.md` and follow all rules there to implement this DRAFT spec (DRAFT->IMPLEMENTED)
