# Poker Tournament Tracker

A single-page web app for managing No-Limit Texas Hold'em poker tournaments. Displays a large countdown timer, blind levels, and tournament statistics — designed for screens ranging from phones to large TVs.

## Features

- **Countdown timer** with drift-corrected accuracy
- **Blind structure editor** — customize levels, durations, and breaks before or during play
- **Live tournament stats** — entries, players remaining, prize pool, average stack, estimated duration
- **Admin controls** — start, pause, resume, skip break, override level, bust player, add rebuy
- **Audio alerts** — 1-minute warning, level change, break start/end (Web Audio API, no files needed)
- **Responsive design** — works on mobile, tablets, and large displays
- **No backend required** — runs entirely in the browser

## Tech Stack

- [Next.js](https://nextjs.org/) 16 + React 19
- TypeScript
- Tailwind CSS 4
- Jest + React Testing Library

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install & Run

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Other Commands

```bash
npm run build    # Production build
npm run start    # Run production server
npm run lint     # Run ESLint
npm test         # Run tests
```

## Deploy to Vercel

The easiest way to deploy is with [Vercel](https://vercel.com):

1. Push this repo to GitHub
2. Go to [vercel.com/new](https://vercel.com/new) and import the repository
3. Vercel auto-detects Next.js — no configuration needed
4. Click **Deploy**

That's it. Vercel handles builds, preview deployments on PRs, and production deploys on push to `main`.

Alternatively, deploy from the CLI:

```bash
npm i -g vercel
vercel
```

## License

MIT
