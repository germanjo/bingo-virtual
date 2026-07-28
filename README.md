# bingo-virtual

A 90-number virtual bingo caller (Argentinian/European style). One screen, no player cards, no backend — Astro renders the page, React runs the board, Framer Motion handles the number pop.

## Quick start

```sh
npm install
npm run dev
```

Open http://localhost:4321.

## Commands

| Script | What it does |
|--------|--------------|
| `npm run dev` | Dev server with HMR |
| `npm run build` | Static build to `./dist` |
| `npm run preview` | Preview the build locally |
| `npx astro check` | TypeScript and Astro diagnostics |

## How to play

- **Sacar número** draws the next number. The current number pops in with a spring animation.
- The 10x9 grid shows every drawn number in red; the latest stays highlighted in yellow.
- **Auto** runs a hands-free draw loop. **Detener** pauses it. The interval (in seconds) is configurable below the buttons.
- **Reiniciar** starts a new game.

## Stack

| Layer | Choice |
|-------|--------|
| Framework | Astro 5 (static output) |
| UI | React 18 island (`client:load`) |
| Styling | Tailwind CSS 4 |
| Animation | Framer Motion 12 |

## Project layout

```
src/
  components/
    BingoBoard.tsx   # game state, controls, grid
  pages/
    index.astro      # mounts <BingoBoard client:load />
  styles/
    global.css       # tailwind import
```
