# Changelog

## 2026-03-19

### Added
- Built the poker tournament tracker as a Next.js app with a reducer-driven tournament model, default blind structure, prize/chip/average-stack/estimate calculations, and Jest coverage for core state logic.
- Added a drift-corrected `useTimer` hook with one-minute warning and level-change callbacks plus hook tests.
- Added the main tournament display, shared tournament context, responsive styling, and component coverage for timer, blinds, and stat panels.
- Added the pre-start configuration modal with blind-structure editing, tournament settings validation, and tests for the configuration flow.
- Added the in-play control bar and level override modal for pause/resume, skip break, bust player, rebuy tracking, and manual level/time changes, with component tests.
- Added browser audio alerts for warning, level change, break start, and break end events using the Web Audio API, with audio and hook tests.
- Added an end-to-end integration test covering configure, start, level progression, rebuys, breaks, overrides, pause/resume, and tournament completion.

### Added (Payout Structure)
- Added payout structure display panel in the bottom-left of the main tournament screen, showing tiered payouts based on total buy-ins (6 tiers from 1–6 paid places).
- Added configurable tournament fee (default $10) deducted from gross prize pool; main screen now displays net prize pool.
- Added "Show Even Chop" toggle available during the tournament, with an editable "Remaining Players" field for what-if scenarios.
- Added payout calculation functions: tier lookup, net prize pool, payout amounts with rounding remainder to 1st place, and even chop calculation.
- Added unit tests for payout tiers, net prize pool, payout amounts, even chop, and boundary conditions.
- Added PayoutPanel component tests and integration tests for payout updates across tier boundaries and even chop toggling.

### Changed
- Normalized the Jest/Next dependency scaffold so the Jest 29 test toolchain installs and runs consistently.
