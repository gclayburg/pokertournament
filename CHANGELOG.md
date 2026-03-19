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

### Changed
- Normalized the Jest/Next dependency scaffold so the Jest 29 test toolchain installs and runs consistently.
