# UI Scripts

TypeScript sources for Bedrock JSON UI, authored with [`mcbe-ts-ui`](https://github.com/smell-of-curry/mcbe-ts-ui) fluent builders.

```
scripts/ui/**/*.ts  →  npm run generate:ui  →  ui/__generated__/**/*.json
```

Compiler preserves subdirectory structure and updates `ui/_ui_defs.json`. Prefer builders over `addRaw` / raw JSON blobs. API helpers (`phudVisibility`, `first`, `slice`, bindings, etc.) live in `mcbe-ts-ui` — see that package README.

## Layout

```
scripts/ui/
├── hud_screen.ts          # redefine vanilla HUD; mounts PHUD + ping
├── serverForm.ts          # redefine server_form; routes by title flags
├── chestServerForm.ts     # chest-style form layouts (bag, quests, AH, …)
├── searchServerForm.ts    # search UI overlay
│
├── phud/                  # persistent HUD (&_ title tokens from BEH)
│   ├── phud.ts            # shell: data controls + element mounts
│   ├── currency.ts
│   ├── phone.ts           # tutorial / Rotom phone portrait
│   ├── battleWait.ts
│   ├── evolutionWait.ts
│   ├── loadingScreen.ts
│   ├── sidebar.ts         # party sidebar (padded | protocol)
│   └── playerPing.ts
│
├── pokemon/
│   ├── pokemon.ts         # party / summary forms
│   ├── pokedex.ts
│   ├── pc.ts
│   ├── shared.ts          # shared pokemon form helpers
│   └── attackScreen/      # battle UI
│       ├── index.ts       # entry; composes modules below
│       ├── actors.ts
│       ├── buttons.ts
│       ├── progress.ts
│       └── shared.ts
│
└── rotomPhone/
    ├── first.ts | second.ts | third.ts
    └── shared.ts
```

| Path | Role |
|------|------|
| `hud_screen.ts` | Patches vanilla `hud_screen`; inserts `phud.main` into root, ping into chat stack |
| `serverForm.ts` | Patches vanilla `server_form`; shows custom screens when `#title_text` matches a flag |
| `chestServerForm.ts` | Namespace `chest_ui` — inventory/quest/AH/pokebuilder chest variants |
| `searchServerForm.ts` | Namespace `search_server_form` |
| `phud/*` | Always-on HUD pieces driven by BEH `setTitle` `&_<token>:` strings |
| `pokemon/*` | Modal forms opened via `serverForm` flags |
| `rotomPhone/*` | Multi-page Rotom phone forms |

## Routing (`serverForm.ts`)

BEH sets form title with a color-code flag. `serverForm` binds visibility off `#title_text`:

| Flag | Screen |
|------|--------|
| `§p§o§k§e§1` / `§p§o§k§e§s` | Pokemon party/summary |
| `§d§e§k§x` / `§d§e§d§e§t§k` | Pokedex / details |
| `§b§a§t§l§e` | Battle (`attackScreen`) |
| `§c§h§e§s§t` | Chest GUI |
| `§s§e§a§r§c` | Search |
| `§1§r` / `§2§r` / `§3§r` | Rotom phone pages |
| `§p§c` | PC |

Chest sub-layouts use longer flags inside `chestServerForm.ts` (`§c§h§e§s§t…`).

## PHUD tokens

`phud/phud.ts` registers each component with an `&_` prefix. BEH writes via `setTitle` / `setPhudToken` — never change two tokens same tick (see BEH `phud-title-same-tick` rule).

| Token | Module |
|-------|--------|
| `&_currency:` | `currency.ts` |
| `&_phone:` | `phone.ts` |
| `&_battleWait:` | `battleWait.ts` |
| `&_loadingScreen:` | `loadingScreen.ts` |
| `&_evolutionWait:` | `evolutionWait.ts` |
| `&_sidebar:` | `sidebar.ts` |
| `&_playerPing:` | `playerPing.ts` |

## Conventions

- **New screen**: `defineUI("namespace", …)` under the right folder; wire into `serverForm.ts` (or `hud_screen.ts` for HUD) if it needs routing/mount.
- **Patch vanilla**: `redefineUI("hud_screen" | "server_form", …)` only — keep patches thin.
- **Shared helpers**: keep local (`pokemon/shared.ts`, `rotomPhone/shared.ts`, `attackScreen/shared.ts`); don't dump one-offs into a global utils file.
- **Gold references**: `phud/*`, `pokemon/pc.ts` — near-zero `addRaw`.
- After edits: `npm run generate:ui`, then reload resource pack in-game.
