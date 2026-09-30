# Circuit//20

20-minute AMRAP circuit generator + log. Installable PWA, offline, data stored on the phone.

## Develop
```sh
npm install
npm run dev        # http://localhost:5173
npm test           # engine + stats tests
npm run build && npm run preview
```

## Getting it on your Android phone
Service workers, wake lock and `crypto.randomUUID` need a **secure origin** (https or localhost),
so plain `http://<lan-ip>` works for a quick look but won't install or stay awake.

- **Easiest:** deploy `dist/` to any static host (GitHub Pages, Netlify, Cloudflare Pages).
  Vite `base` is `./` and routing is hash-based, so any subpath works. Open in Chrome → ⋮ → *Install app*.
- **Local testing over USB:** `npm run dev`, then `chrome://inspect` → *Port forwarding* 5173 → open `localhost:5173` on the phone.

## Where things live
| | |
|---|---|
| `src/data/exercises.ts` | Exercise reference DB — edit freely (muscle scores 0–1, default reps/kg) |
| `src/engine/planner.ts` | Planning engine. Tuning knobs in `PLANNER_WEIGHTS` |
| `src/engine/history.ts` | History → per-muscle recent load, recent exercises, last weights |
| `src/engine/stats.ts` | Totals, pace, streak, comparisons |
| `src/db/` | IndexedDB (Dexie). `SessionRepo` is the seam for adding cloud sync later |
| `src/state/store.ts` | Prefs, current draft, in-progress run (localStorage — survives reloads) |

### How workouts are picked
Every 3-exercise combo from the available pool is scored: **full-body coverage** (primary),
bonus for muscles **under-trained in the last 14 days**, penalty for piling onto one muscle
and for exercises used in the last 2 sessions. Hard rules (Cindy-style): one legs / push / pull
movement at most, at most one full-body complex, must hit both upper and lower body.
One of the top combos is picked at random (seeded — the `#seed` in the header).

## Backup
History → *backup* → EXPORT (share sheet / download JSON), IMPORT merges by id.
