# "Editorial / Public.com" ad style — for NovaAgents MCP

Source reference: https://x.com/public/status/2070167228826177639 (saved `source.mp4`).
We're using this style for **NovaAgents, showing the MCP connection** (Nova plugging
into AI clients). Built as `src/McpAd.tsx`, composition `McpAd`. Decisions (Jun 2026):
Nova **purple** (not Public's teal), AI client = **Perplexity**, proof beats from
real screenshots Efren provides.

## The style (what makes it this "type" of video)
- **Background:** purple-tinted near-black `#07050d` + a faint **blueprint grid** (90px cells,
  rgba(139,92,246,0.06) lines, slow vertical drift), a soft radial purple glow top-center,
  heavy vignette.
- **Two typefaces, two jobs:** headlines = high-contrast **SERIF** (Fraunces, in public/),
  building **line-by-line**, last line in purple `#b8a8fc`. CTA + UI + disclaimers = clean
  **sans**. Mono (IBM Plex Mono) for eyebrows/labels.
- **Signature beats:**
  1. **Serif title** that builds line by line.
  2. **Integration pill** — a glowing rounded-rect with app-icon tiles + a **light-sweep
     streak** across the top edge. For us: Nova tile ⟷ (MCP, animated flowing dots) ⟷
     Perplexity tile. Eyebrow "THE NOVA MCP".
  3. **Macro composer** — full screen, a client's input field with a typed command, then an
     **extreme zoom into the send button + cursor click**. (needs screenshot or code-draw)
  4. **Real result** — a clean client window full-screen showing the Nova MCP tool call +
     result (e.g. "order filled"). (needs screenshot)
  5. **Serif title 2** ("Ask. Buy. Done.")
  6. **CTA** (sans) "Connect Nova to your AI." + example.com/agents + risk disclaimer.
- **Pacing:** ~2–3s per beat, one idea per screen, calm/premium. Alternate dark serif-title
  beats with full product beats.

## Status
- `McpAd.tsx` style preview rendered (`out/novaagents-mcp-preview-16x9.mp4`): beats 1, 2, 5, 6
  done in code (serif titles, MCP pill, CTA). Assets: `public/perplexity-icon.png` (rendered
  from Perplexity favicon SVG), `nova-logo-white-on-purple.png`, Fraunces/PlexMono fonts.
- **TODO when screenshots arrive:** insert beats 3 (macro composer/click) and 4 (real result
  in Perplexity with Nova MCP tool call). Then re-time music to full length.

## Distinct from FeatureTour
FeatureTour = starfield + bold sans + 3D fly-in windows. This editorial style = blueprint grid
+ SERIF + full-screen beats + glowing integration pill + macro UI zoom. Different register.
