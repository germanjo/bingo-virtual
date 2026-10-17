# bingo-virtual

A 90-number virtual bingo caller (Argentinian/European style). One screen, no player cards, no backend — Astro renders the page, React runs the board, Framer Motion handles the number pop.

## Quick start

```sh
npm install
npm run dev
```

Open http://localhost:4321.

## Commands

| Script                  | What it does                      |
| ----------------------- | --------------------------------- |
| `npm run dev`           | Dev server with HMR               |
| `npm run build`         | Static build to `./dist`          |
| `npm run preview`       | Preview the build locally         |
| `npx astro check`       | TypeScript and Astro diagnostics  |
| `npm test`              | Hook, component and utility tests |
| `npm run test:coverage` | Text and HTML coverage reports    |
| `npm run lint`          | ESLint checks                     |
| `npm run format:check`  | Prettier checks                   |

## How to play

- **Sacar número** draws the next number. The current number pops in with a spring animation.
- The 10x9 grid shows every drawn number in the selected primary color; the latest stays highlighted in yellow.
- **Auto** runs a hands-free draw loop. **Detener** pauses it. The interval (in seconds) is configurable below the buttons.
- **Reiniciar** starts a new game.
- The progress counter and completion banner make it clear when all 90 numbers have been drawn. The completed board stays visible until restart.

## Local recovery and personalization

The draw sequence and interval are saved automatically in this browser. Reloading restores the board **paused**; press **Auto** to resume. Restart clears the saved draw sequence, but keeps the interval and personalization.

- **Color principal** changes the main interface color. Number and button text switch between black and white for contrast.
- Color preferences are remembered separately from the game.

Storage uses versioned `bingo-game` and `bingo-preferences` localStorage entries. Invalid saves fall back to defaults. If browser storage is unavailable or full, play continues with a warning, but recovery cannot be guaranteed. This is local recovery, not cross-device sync, a multi-game archive, or multi-tab collaboration; closing all private windows or clearing site data can erase it.

## Stack

| Layer     | Choice                          |
| --------- | ------------------------------- |
| Framework | Astro 7 (static output)         |
| UI        | React 18 island (`client:load`) |
| Styling   | Tailwind CSS 4                  |
| Animation | Framer Motion 12                |

## Project layout

```
src/
  components/
    BingoBoard.tsx   # controls, preferences, progress and grid
  hooks/
    useBingoGame.ts  # draw/reset state and timers
    useStoredState.ts # post-mount localStorage recovery and saving
  lib/
    bingoStorage.ts # shared defaults, save validation and contrast
  pages/
    index.astro      # mounts <BingoBoard client:load />
  styles/
    global.css       # tailwind import
```
