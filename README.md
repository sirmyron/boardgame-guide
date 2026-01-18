# Boardgame Guide

## Purpose

Boardgame Guide is a cross-platform (mobile web + Expo React Native) companion
app that helps players set up and play board games. The app will let users pick
from multiple games, select the number of players, and then walk through setup
steps and turn-by-turn guidance. Risk is the first fully modeled game, with more
(e.g., Clue) planned next.

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
