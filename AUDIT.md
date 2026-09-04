# Short Notice — Audit Flow for Future Agents

**Purpose:** Verify every claim on `https://short-notice-ballad-of-alec.vercel.app` before shipping. This is the backend provenance + checklist — how each datum was sourced, transformed, and how to re-verify.

**Stack:** Vite + `src/data/*.json` (ND `ndgf.json`, SD `sdgfp.json`, MT `mt.json`, MN `mn.json`, WY `wy.json`) → `src/App.jsx` → Vercel (`api/` serverless). Scraper: `~/.config/opencode/skills/web-scraper/scrape.py` (ignores robots, 1s delay).

---

## 1) Provenance — How We Came Up With Each Claim

**ND (primary, live pull 2026-09-03/04):**
- Season dates: `python3 ~/.config/opencode/skills/web-scraper/scrape.py https://gf.nd.gov/hunting/season-dates --out /tmp/ndgf2` (620 lines, table with Start/End per species). Cross-checked vs `https://gf.nd.gov/regulations/deer` (55KB, Sep 4–Jan 3 bow, Nov 6–22 gun, 39,100 tags, 4B/4C 2.5-day, CWD head tag).
- Bag/sex/gear: Parsed from `gf.nd.gov/regulations/deer` prose (centerfire ≥.22, muzzy ≥.45, bow ≥35lb, etc.), `regulations/fishing`, `regulations/hunting-general`, `wildlife/diseases/cwd` (head/photo method), `licensing/residency`.
- Pricing: `gf.nd.gov/licensing/resident` (62$ combo, 35$ deer, 20$ small game, 20$ habitat, 5$ restoration, 29$ federal) and `licensing/nonresident` (355$ deer gun, 150$ small game 14-day, 153$ waterfowl, 68$ fishing). Computed all-in: cert + habitat + small/fur + stamps per species (e.g., deer bow res $35+2+20=57, nonres $350+5+20=375). Stored in `pricing{resident,nonresident}.total` + `mark $/$$/$$$/$$$$` + `breakdown`.
- Trash talk: authored, friendly, not from NDGF — flagged as `trashTalk`.

**SD (live pull 2026-09-04):**
- Key dates: `scrape.py https://gfp.sd.gov/events/keydates` (13KB, 80+ rows: pheasant Oct 17-Jan 31, deer archery Sep 1-Jan 1, West River Nov 14-29, etc., with online app dates Mar–Apr). Confirmed via `gfp.sd.gov/pages/regulations/` and `2026biggameregs.pdf`.
- Pricing: SD not yet scraped for fees — proxied from ND tiers with `(proxy)` suffix until SD fee scrape (`gfp.sd.gov/hunt-fish-license/`). Marked as proxy in JSON.

**MT (live pull 2026-09-04):**
- Seasons: `scrape.py https://fwp.mt.gov/hunt/seasons` (9.6KB HTML + `2026-dea-regulations-final...pdf`). Extracted: deer/elk archery Sep 5-Oct 18, general Oct 24-Nov 29, muzzy Dec 12-20, antelope Sep 5-Oct 9 etc. HD-specific quotas noted as “check Hunt Planner”.
- Pricing: proxied from ND until FWP license page scrape.

**MN / WY (live pulls 2026-09-04):**
- MN: `dnr.state.mn.us/hunting/seasons.html` + `files.dnr.state.mn.us/rlp/regulations/hunting/full_regs.pdf` (archery Sep 19, firearms 100/200, teal Sep 5, pintail 3).
- WY: `wgfd.wyo.gov/regulations` (Ch 5-9 PDFs, Hunt Area specific Oct 1-31 etc.). Both proxied pricing.

**Email deadlines:** Manually curated from `season-dates` lottery deadlines + `keydates` app dates (e.g., ND deer gun Jun 3, MT Apr 1/Jun 1, SD Aug 19 swan, MN May 2 bear). Stored in `deadlines[]` with `id, species, deadline, note`. 2-week reminder calc in UI: `days = ceil((deadline - now)/86400000)` → urgent if 0-14.

**New hunter todo:** 6 steps per state authored from license pages (hunter ed, habitat, lottery, HIP, E-Posting/440yd etc.), with `link` to NDGF/GFP/FWP/DNR. Checkbox persist `localStorage alec-todo`.

**Other claims:** HeadsUp (fire, CWD, E-Posting) from `ndresponse.gov/burn-restrictions`, `gf.nd.gov/wildlife/diseases/cwd`, `gfp.sd.gov/electronic-posting`; Access rules (440yd ND, 660ft SD) from NDCC 20.1-01-18 / SDCL 41-9.

---

## 2) Claims Inventory (what to verify)

**Per species (14 ND + 10 SD + 10 MT + 10 MN + 10 WY, 7 cats):** `season.open/close/status`, `resident/nonresident` text, `briefing{sex,bag,gear,unchanged}`, `unitNotes`, `proclamation{url,highlight,removed,added}`, `yoy3[3], major5[]`, `trashTalk`, `firstTime{resident,nonresident}[]`, `pricing{resident,nonresident}.total/mark/breakdown`, `bagTable?`.

**Per state:** `meta.sources`, `headsUp[3]`, `residency{resident,nonresident}`, `access{rules,links}`, `deadlines[]`, `newHunterTodo[6]`.

**Global:** stateThemes `bg/header/accent` per state, dark mode, pricing legend `$ <100 | $$ 101-300 | $$$ 301-699 | $$$$ 700+`, email `api/subscribe.js` + `api/deadlines.js`.

---

## 3) Audit Checklist — Run Before Every Deploy

**Automated (run in `~/Projects/short-notice-ballad-of-alec`):**
```bash
# 1. Scrape fresh
python3 ~/.config/opencode/skills/web-scraper/scrape.py https://gf.nd.gov/hunting/season-dates --out /tmp/verify_nd
python3 ~/.config/opencode/skills/web-scraper/scrape.py https://gf.nd.gov/regulations/deer --out /tmp/verify_nd2
python3 ~/.config/opencode/skills/web-scraper/scrape.py https://gfp.sd.gov/events/keydates --out /tmp/verify_sd
python3 ~/.config/opencode/skills/web-scraper/scrape.py https://fwp.mt.gov/hunt/seasons --out /tmp/verify_mt
# 2. Diff vs src/data/*.json
diff -u /tmp/verify_nd/gf-nd-gov-hunting-season-dates.md src/data/ndgf.json || echo "diff — update JSON"
# 3. JSON valid + pricing marks
python3 -m json.tool src/data/ndgf.json > /dev/null && echo "ND OK" && grep -c "pricing" src/data/ndgf.json
python3 -m json.tool src/data/sdgfp.json > /dev/null && echo "SD OK"
# 4. Check deadlines not stale (within 365d)
python3 -c "import json, datetime; d=json.load(open('src/data/ndgf.json')); [print(x['id'], x['deadline']) for x in d['deadlines'] if datetime.date.fromisoformat(x['deadline']) < datetime.date.today()]"
# 5. Build
npm run build # must be ✓ 21 modules, 0 errors
# 6. Playwright spot checks
NODE_PATH=./node_modules node /tmp/check-all.cjs # expects 0 placeholder for live states
NODE_PATH=./node_modules node /tmp/check-pricing.cjs # expects $57, $375
# 7. API
curl -s https://short-notice-ballad-of-alec.vercel.app/api/deadlines | head
curl -s -X POST https://short-notice-ballad-of-alec.vercel.app/api/subscribe -H "Content-Type: application/json" -d '{"email":"audit@test.com","categories":["deer-gun"]}' | grep ok
```

**Manual (spot-check 2 species per state):**
- [ ] Open proclamation URL `proclamation.url`, confirm `season.open/close` matches page (e.g., ND deer bow Sep 4 12 noon–Jan 3).
- [ ] Confirm `proclamation.highlight` `<mark>` is actually updated text on that page (view-source search).
- [ ] Confirm `resident` vs `nonresident` reflects `licensing/resident` vs `nonresident` fee/table + building rule (ND 440yd, SD 660ft).
- [ ] Confirm `briefing.bag` matches regs PDF (e.g., ND ducks 6/18, mallard 4/2 hens — check `gf.nd.gov/hunting/waterfowl`).
- [ ] Confirm `pricing.total` math: e.g., ND deer bow res $35+2+20=57 → `$`, nonres $350+5+20=375 → `$$$`; fur youth `n/a`.
- [ ] Confirm `yoy3`/`major5` still true (check 2025 vs 2026 date card).
- [ ] Confirm `trashTalk` is flagged as authored, not NDGF.
- [ ] Confirm `firstTime` steps links resolve (200).
- [ ] Confirm `access` rules match NDCC 20.1-01-18 / SDCL 41-9 (non-posted open, E-posted = posted, try-to-post skip, building 440/660).
- [ ] Confirm deadlines `deadline` date matches application page (e.g., ND deer gun Jun 3, MT Apr 1).
- [ ] Confirm `newHunterTodo` 6 steps cover hunter ed → habitat → lottery → stamps → posting.
- [ ] Confirm state theme `bg/header/accent` distinct per state (Playwright rgb check).
- [ ] Confirm dark toggle + resident toggle + state tabs + category pills per-state (Playwright).

**If any check fails:** update `src/data/*.json` with new scrape, re-run `npm run build`, `git commit`, `git push` → Vercel auto-deploys.

---

## 4) Update Workflow (future agent)

1. `grep -rn "pat" src/data --include="*.json"` then `read` with `offset/limit` (token-saver).
2. Re-scrape as above, edit `src/data/*.json` (keep `trashTalk`/`firstTime` authored, mark proxy pricing as `(proxy)` until real fees scraped).
3. `npm run build` + Playwright checks (see `debug.cjs` patterns in repo).
4. `git add -A && git commit -m "feat: ..." && git push` → `vercel ls` should show new `● Ready` aliased to `https://short-notice-ballad-of-alec.vercel.app`.
5. Update this AUDIT.md `generated` dates and `yoy3` if season rolled.

---

## 5) Known Gaps (mark as proxy)

- SD/MT/MN/WY pricing = ND proxy with `(proxy)` — scrape real fee pages (`gfp.sd.gov/hunt-fish-license`, `fwp.mt.gov/buyandapply`, `dnr.state.mn.us`, `wgfd.wyo.gov/licenses`) to replace.
- WY Hunt Area specific dates — currently generic Oct 1-31 — needs per-area parse of PDFs (`CH 6` etc.).
- MN permit areas — currently generic — needs DPA table parse from `full_regs.pdf`.
- Email cron: `api/subscribe.js` currently logs + returns 200; needs Resend/Supabase + Vercel Cron (daily 14d check) to actually email.

---

*Last audit: 2026-09-04 by Muse Spark — ND live pull 2026-09-03, SD/MT/MN/WY pulls 2026-09-04.*
