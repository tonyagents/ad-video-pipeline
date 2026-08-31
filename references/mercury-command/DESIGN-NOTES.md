# Mercury /command — design reference for the NovaAgents ad creator

Source: https://mercury.com/command (saved 2026-06-17). Mercury's "Command" is an
AI-finance product page — conceptually the closest competitor look to NovaAgents,
so it's a strong reference for ad styling. Full HTML in `index.html`, stylesheets in
`css/`, fonts + images in `assets/`.

> ⚠️ Fonts (Arcadia, Tiempos) and Mercury imagery are Mercury's licensed property —
> use ONLY as visual reference for matching the *feel*. Do not ship Mercury's fonts or
> assets in a Nova ad. Substitute licensed/again-brand equivalents (see below).

## What makes the look work
- **Editorial serif + clean sans pairing.** Big headlines in a fine serif (Tiempos
  Headline), body/UI in a geometric sans (Arcadia), mono for data (IBM Plex Mono).
  This serif-headline move is the main thing that reads "premium fintech" vs. generic.
- **Multi-theme sections.** Each scroll section has its own soft-tinted palette (cream,
  mint, lavender, peach) on light, plus matching dark variants — not one flat bg.
- **Conversational UI cards.** The hero/feature visuals are chat-style cards showing the
  AI doing real finance tasks (create invoice, send payment, approval flow) with real
  numbers. Demo-as-design, exactly the NovaAgents artifact story.
- **Restraint + whitespace.** Generous spacing, thin borders, subtle frosted fills,
  dot-grid backgrounds on dark panels (see `assets/insights...png`).

## Design tokens (extracted from CSS)
**Primary accent (brand blue):** `#5266EB` (periwinkle indigo)
  - hover `#4354C8`, active `#3442A6`, on-dark `#9CB4E8`, text-on-primary `#FFF`

**Section background palettes** (`--background-default` / `--background-secondary`):
| Theme    | Light default | Light secondary | Dark default | Dark secondary |
|----------|---------------|-----------------|--------------|----------------|
| Neutral  | `#f6f5f2`     | `#efeee9`       | `#181818`    | `#201f1c`      |
| Mint     | `#f1f7f3`     | `#e7f1ea`       | `#161917`    | `#1a211d`      |
| Lavender | `#f5f4fd`     | `#edecfb`       | `#181623`    | `#1f1d2d`      |
| Sky      | `#eef7fa`     | `#e4f0f5`       | `#111a1d`    | `#112228`      |
| Peach    | `#fdf3ef`     | `#faeae3`       | `#1c1715`    | `#281c17`      |
| Cool     | `#fbfcfd`     | `#f4f5f9`       | `#171721`    | `#1e1e2a`      |

**Borders:** light `#c3c3cc`-ish per theme; frosted fills like `#afb2ce14` (low-alpha).

## Fonts (mapping → file in assets/)
- `arcadia-text.woff2` — Arcadia, the UI/body sans
- `arcadia-display.woff2` — Arcadia Display, large headings sans
- `tiempos-headline.woff2` — Tiempos Headline, serif headlines (4 weights on the page)
- IBM Plex Mono — for figures/data (Google-hosted, openly licensed — safe to use)

## How to apply to NovaAgents ads (recommended, brand-safe)
- Keep our base `#08070c` dark bg, but **steal the multi-theme idea**: give each scene a
  subtly different tint (lavender/sky/mint) instead of one flat black.
- **Add a serif headline option** to the ad engine for an editorial variant — pair a
  licensed serif (e.g. *Fraunces* or *Newsreader*, both OSS via Google Fonts) with our
  existing sans. Same effect as Tiempos, no licensing risk.
- Mono (IBM Plex Mono / *Geist Mono*) for the odds/percentages/USD figures in scenes.
- Use Nova purple `#7D00FF` where Mercury uses `#5266EB`.
- Lean into the **conversational-card framing** — we already screenshot the artifact UI;
  could also render synthetic chat cards in Remotion for B-roll between product shots.

## Files
- `index.html` (726KB) — full rendered markup
- `css/1072914060d69665.css` (255KB) — the design system (Tailwind + tokens)
- `assets/` — 6 woff2 fonts + 3 PNGs (insights chart, api, personal-banking)
- `asset-urls.txt`, `css-urls.txt` — source URLs
