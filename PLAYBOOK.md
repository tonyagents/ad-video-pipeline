# NovaAgents Video/Ad Production Playbook

Based on Thariq's (@trq212) walkthrough of how Claude edited its own launch video
entirely with code — no video editor touched.
Reference tweet: https://x.com/trq212/status/2064826394589442448
(the downloaded reference clip + transcript that used to live in this folder were removed
for the public release — they're a third party's tweet video, not this repo's own work)

## The workflow (as described in the video)

1. **Shoot loose, let Claude pick.** He filmed 4 scenes × multiple takes (17 takes, ~25GB raw).
   No labeling of which file belongs to which scene.

2. **Transcribe everything.** Claude ran Whisper on every clip, producing a per-word
   timestamp array per video. From the transcripts it deduped takes, grouped them into
   scenes, and scored which take was best (fewest "ums", usually the later takes).

3. **Edit decision as JSON.** Claude compiled an `edit.json`: every scene, the candidate
   takes, the reason it chose each take, and start/end timestamps per scene. The edit is
   data, not a timeline file.

4. **First cut with ffmpeg.** ffmpeg stitches the chosen clips per the JSON into a rough cut.

5. **Color grading in code.** Starting from flat/neutral Rec.709 footage, he asked Claude to
   write several color-grade variants (he knew nothing about grading) and picked one.

6. **Motion graphics with Remotion.** Claude built React components (Remotion) for the UI
   overlays, using the transcription JSON to time when each component appears — e.g. a
   component swap fires on the exact beat a word is spoken. All timing knobs are adjustable.

7. **Design team loop via Figma MCP.** First-pass design exported to Figma; design team
   polished it; then one prompt — "the design has been updated in Figma, update the video to
   match" — and Claude pulled the changes via the Figma MCP and re-rendered.

8. **Final render.** `npx remotion render` composes everything: cut + grade + Remotion UI.

**Key idea: the entire edit is code + JSON artifacts** (transcripts, edit.json, grading
files, React components, final-edit composition), so every step is repeatable, diffable,
and re-promptable.

## Replicating for NovaAgents ads

Inputs needed:
- Raw footage: screen recordings of NovaAgents in action (terminal/phone PWA), and/or
  talking-head takes. Multiple takes are fine — that's the point.
- Brand assets: Nova/NovaAgents colors, logo, fonts (or a Figma file + Figma MCP).
- An ad script or just bullet points per scene.

Pipeline (all tools already installed locally):
- `~/.local/bin/ffmpeg`, `~/.local/bin/ffprobe` — cutting, grading (static builds)
- `~/.local/bin/yt-dlp` — pulling reference videos
- Whisper transcription: `uvx --native-tls --from openai-whisper whisper <file> --model base`
  (note: HuggingFace is blocked by org policy; OpenAI whisper models come from Azure and work)
- Remotion: `npx create-video@latest` when ready to build the overlay components

Suggested ad formats from one source session:
- 15–30s cuts (9:16 for TikTok/Reels/Shorts, 1:1 for feeds, 16:9 for X/YouTube)
- Hook in first 2s, captions burned in (most ads watched muted), end card with CTA

## Files in this folder
(the reference clip, thumbnail, tweet metadata, and Whisper transcript that used to be
listed here were removed for the public release — see note above)
