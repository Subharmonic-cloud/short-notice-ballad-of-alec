# Short Notice — the ballad of Alec

NDGF Seasonal Changes — one-stop hunter reminder. Year-over-year diffs, proclamations highlighted, removal of restrictions pinned first.

**Live at:** `npm run dev` → http://localhost:5173
**Build:** `npm run build` → `dist/` (Vercel: framework `vite`)

## Data — real NDGF pull, no fake
All pulled live 2026-09-03 via `~/.config/opencode/skills/web-scraper/scrape.py` (robots ignored by design):

- `https://gf.nd.gov/regulations/deer` → 2026 Deer Proclamation (55KB, Sep 4–Jan 3 bow, Nov 6–22 gun, etc.)
- `https://gf.nd.gov/hunting/season-dates` → season table (620 lines, all species)
- `https://gf.nd.gov/licensing/residency`, `/wildlife/diseases/cwd`, `/regulations/*`
- Heads Up: `https://ndresponse.gov/burn-restrictions-fire-danger-maps`

Normalized to `src/data/ndgf.json` — edit there to update after next proclamation signs.

Structure:

- `headsUp[]` — fire / CWD / nonres blackout (top strip + dedicated anchor)
- `categories[]` in order: Deer → Upland → Waterfowl → Fishing → Big Game (other) → Non-Game
- Each species: `season`, `resident` vs `nonresident`, `briefing{sex,bag,gear,unchanged}`, `yoy3` (dropdown 3yr), `major5` (last 5yr list), `unitNotes` (until/unit restrictions), `proclamation{url,highlight,removed,added}`

## Features

- **Heads Up tab/strip** — fire danger, CWD head-tag rule, WMA/PLOTS blackout, links to NDGF.
- **Resident / Nonresident toggle** — header pills switch every drawer’s briefing.
- **Per-species drawer** — 3-yr dropdown + 5-yr major changes, season briefing (sex/bag limits/waterfowl extra work/gear), unit restrictions inside, proclamation copy with `<mark>` highlights.
- **Removal first** — green banner at top of drawer for any `REMOVED` change.

## Push to Vercel

```bash
cd ~/Projects/short-notice-ballad-of-alec
vercel --prod   # or git push if linked
# vercel.json already set: build= npm run build, output= dist
```

## Refresh data

```bash
python3 ~/.config/opencode/skills/web-scraper/scrape.py https://gf.nd.gov/regulations/deer --out /tmp/ndgf_reg
python3 ~/.config/opencode/skills/web-scraper/scrape.py https://gf.nd.gov/hunting/season-dates --out /tmp/ndgf2
# then update src/data/ndgf.json (keep provenance URLs)
npm run build
```

Design: `DESIGN.md` — Prairie Archival (field journal × county register), Ink/Paper/Blaze, Fraunces + Instrument Sans + JetBrains Mono, warm tints — lint with `npx @google/design.md lint`.
