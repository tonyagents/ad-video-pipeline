# MoonAgents Ads — code-only video pipeline

Efren drops screenshots + context; Claude produces a finished ad video. No video
editor is ever used — the edit is React (Remotion), the music is synthesized Python.
Full background: `PLAYBOOK.md`.

## Layout
- `references/` — design references mined from other sites (e.g. `mercury-command/` —
  Mercury's AI-finance page, see its `DESIGN-NOTES.md` for tokens/fonts/layout to borrow)
- `inbox/` — Efren drops raw screenshots here (or pastes them into chat)
- `footage/<ad-name>/` — raw + `cropped/` processed screenshots per ad
- `ad-poker-trainer/` — the reusable Remotion ad engine (name is historical; it renders ANY ad)
  - `src/Ad.tsx` — composition; all content is zod-schema props (hook / scenes / endCard / music)
  - `src/FeatureTour.tsx` — **the house feature-tour style** (composition `FeatureTour`,
    props in TOUR_DEFAULT or a props file): deep-space seeded starfield + purple nebula,
    centered bold intro card (line2 purple), "EVERYTHING, ON COMMAND" eyebrow, app windows
    that fly in through 3D perspective to the LEFT with a big bold caption on the RIGHT, and a
    centered MoonAgents glyph+wordmark + moonpay.com/agents end card. Replicates the reference
    `~/Downloads/moonagents-feature-tour.mp4`. Colors: bg #040307, glow #170e2c/#28124e,
    purple #b8a8fc, gray #8c869c. Bold sans (no serif). Use this when Efren wants the polished
    "Apple-keynote-in-space" look. Feed it landscape-ish full app-window screenshots.
  - `src/MascotAd.tsx`, `src/DayAd.tsx` — fully code-drawn character ads (no screenshots needed):
    SVG characters/cities + HTML notification cards, hardcoded scenes, reuse `EndCard` from Ad.tsx.
    Pattern for new character spots: draw in SVG, verify frames with ffmpeg, iterate.
  - `props/<ad-name>.json` — one props file per ad (poker-trainer.json is the reference)
  - `public/` — screenshots + music.wav the composition references
  - `music/make_music.py` — UKG/deep-house generator (numpy/scipy)
  - `out/` — rendered MP4s

## Workflow for a new ad
1. **Ingest screenshots** from `inbox/` or chat paste. If pasted images' temp files are
   gone, recover them from the session transcript jsonl (`~/.claude/projects/-Users-eplasencia/*.jsonl`,
   base64 image blocks).
2. **PII pass (mandatory)**: crop the MoonAgents sidebar (`crop=iw-430:ih:430:0` on ~1999px-wide
   shots) — it shows Efren's email. Read the cropped files to verify visually. Check for other
   PII (wallet addresses, balances Efren wouldn't want public — ask only if genuinely sensitive).
3. **Write the story**: hook (one-prompt moment) → 6–8 product scenes → end card with
   `moonpay.com/agents`. Punchy captions; kicker = feature name. Save as `props/<ad-name>.json`.
4. **Copy images** to `public/`, prefixed to avoid collisions (e.g. `myad-01.jpg`).
5. **Music**: reuse `public/music.wav` if duration matches, else regenerate:
   `uv run --system-certs --with numpy --with scipy music/make_music.py --duration <s> --drop <hook-end-s> --out public/<name>.wav`
   (duration = totalFrames/30; drop = hook.duration/30).
6. **Register in Studio**: add a `<Composition>` for the new ad in `src/Root.tsx` (import the
   props JSON as defaultProps) so Efren can preview/tweak it at localhost:3001.
7. **Render**: `npx remotion render MoonAgentsAd out/<ad-name>-16x9.mp4 --props=props/<ad-name>.json`
   (add `--concurrency=4` if Chrome flakes with "got no response"; needs non-sandboxed shell).
7. **Verify**: extract 3–4 frames with ffmpeg, Read them, check captions/crops/PII. Then `open` the MP4.

## Conventions
- Brand: bg `#08070c`, accent purples `#a78bfa`/`#7D00FF`. Do NOT use the orange `✺` starburst
  (it's the Claude mark — Efren asked for it to be removed). Use the MoonPay logo instead.
- **Official MoonPay brand**: purple is exactly `#7D00FF` (sampled from logo). Logos in
  `assets/brand/` (+ copies in `ad-poker-trainer/public/`):
  `moonpay-logo-white-on-purple.png` (280×280, for dark/purple backgrounds),
  `moonpay-logo-purple-on-light.png` (630×630, light backgrounds)
- End card CTA is always `moonpay.com/agents`
- Keep gambling/trading disclaimers when the source app shows one
- 16:9 is default; 9:16/1:1 variants need layout variants in Ad.tsx (not built yet)
- **Style:** props `style: 'dark' | 'mercury'` (default dark). `mercury` = editorial look
  inspired by `references/mercury-command/`: Fraunces serif headlines, IBM Plex Mono kickers,
  per-scene dark tints (lavender/sky/mint/peach/cool), dot-grid panels, MoonPay purple #7D00FF.
  Fonts (fraunces-600/400.woff2, plexmono-500.woff2) live in public/, loaded via FontFace +
  delayRender in Ad.tsx. Mercury hooks clamp the pan + use a strong scrim (handles WIDE,
  short-at-full-width screenshots cleanly).
- Remotion Studio (`npm run studio`, port 3001) = Efren's live preview/tweak UI

## Environment quirks
- No Homebrew. Static `ffmpeg`/`ffprobe`/`yt-dlp` + `uv` live in `~/.local/bin`
- HuggingFace blocked by org policy (Koi). Whisper via `uvx --system-certs --from openai-whisper whisper` (Azure-hosted models)
- Corporate TLS interception: always pass `--system-certs` to uv
- Remotion uses installed Chrome (set in remotion.config.ts) — Headless Shell download may be blocked
