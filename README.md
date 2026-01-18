# Boardgame Guide

## Purpose

Boardgame Guide is a cross-platform (mobile web + Expo React Native) companion
app that helps players set up and play board games. The app lets players pick a
game, choose a player count, and then follow guided setup and turn-by-turn
instructions.

### Current scope

- **Supported games (initial data):**
  - Risk (classic setup + turn guide)
  - Clue (classic setup + turn guide)
- **Core flows:** game selection → player count → setup checklist → turn guide
- **Platforms:** mobile web (Expo web) now, with iOS/Android support via Expo

### In progress / upcoming

- Add more detailed rules and step metadata (dice, calculators, timers).
- Add more games beyond Risk and Clue.
- Persist player progress so a guide can be resumed mid-game.

## Quick start

```sh
npm install
npm run web
```

Then open the URL printed by Expo (usually http://localhost:19006).

## Notes

- For native (iOS/Android), run `npm start` and use the Expo Go app or an
  emulator.
- Game data lives in `data/games` and is wired into `App.tsx`.
