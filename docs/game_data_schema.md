# Game data schema

This schema is intended to organize multiple board games under a single app, with
consistent structure for selecting a game, choosing player count, walking through
setup, and guiding turn-by-turn play.

## Directory layout

```
data/
  games/
    index.json
    risk.json
    clue.json
```

- `index.json` lists all supported games and the metadata needed for the game
  picker screen.
- Each game file stores setup, turn structure, and any game-specific content.

## index.json

```json
{
  "games": [
    {
      "id": "risk",
      "name": "Risk",
      "minPlayers": 2,
      "maxPlayers": 6,
      "supportsTeams": false,
      "setupFlowId": "classic",
      "turnFlowId": "classic"
    }
  ]
}
```

## Game file shape

```json
{
  "id": "risk",
  "name": "Risk",
  "minPlayers": 2,
  "maxPlayers": 6,
  "playerCounts": [2, 3, 4, 5, 6],
  "setupFlows": {
    "classic": {
      "title": "Classic setup",
      "steps": [
        {
          "id": "deal-territories",
          "title": "Deal territory cards",
          "text": "Shuffle all territory cards and deal them evenly to players.",
          "ui": "instruction"
        }
      ]
    }
  },
  "turnFlows": {
    "classic": {
      "title": "Classic turn",
      "phases": [
        {
          "id": "reinforce",
          "title": "Reinforcement",
          "steps": [
            {
              "id": "reinforcement-calc",
              "text": "Gain armies based on territories and continent bonuses.",
              "ui": "instruction"
            }
          ]
        }
      ]
    }
  }
}
```

## Field notes

- `playerCounts` is explicit so the UI can quickly render a picker and show any
  rules for specific counts (like 2-player setup variants).
- `setupFlows` and `turnFlows` are keyed by IDs so variants can exist for the
  same game (e.g., classic vs. custom, timed, or house rules).
- Each `step` has `id`, `title` (optional), `text`, and a `ui` hint.
- `ui` can be used by the app to choose display controls (instruction, checklist,
  calculator, dice roller, etc.).
