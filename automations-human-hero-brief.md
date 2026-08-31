# MoonAgents Automations — human hero film brief
"Signal, Not Noise" (live-action treatment)

Status: **pre-production draft. No capture, no publish, until the approvals below are visible in the source thread.** Copy below is verbatim from `company/content/moonagents-automation-video-approval-pack-2026-08-12.md` — nothing added, cut, or reworded. If that source file changes, this brief must be re-synced before shooting.

## Why this spine
Three motion-graphics versions of the Automations launch film already exist (`AutomationsHeroFilm.tsx`/"You shouldn't have to ask twice", `SetTheRulesFilm.tsx`, `SignalNotNoiseFilm.tsx`, rendered Aug 4–5) — all code-drawn glass UI, no one on camera. They **predate** the Aug 12 approval pack's tightened claims table and have not been re-checked against it — flag before anyone assumes they're cleared.

Of the three, "Signal, Not Noise" (constant pinging vs. one calm brief) is the only emotional hook that survives the compliance table untouched: it's about attention, not performance. This brief upgrades it from pure motion graphics to a live-action lead, using the WalkthroughSpot engine (real talking-head + floating glass cards) that's already built and unused for this feature.

## Cast & location
- One protagonist, ideally a real MoonPay builder (not agency talent) — matches the "builder-to-builder" voice already set for the newsletter draft.
- One contained location (kitchen table / coffee shop). Single day, multiple takes per beat — shoot loose per `PLAYBOOK.md`'s method (Whisper-transcribe every take, let the edit pick the best one).
- Comedy is in restraint and timing, not mugging. Think underplayed, not sketch-broad.

## Shot list (beat → verbatim copy → direction)

**0–4s — Hook**
- On-screen: "Tell your agent what to watch. Tell it when."
- VO: "MoonAgents can now run scheduled automations from the desktop app."
- Handheld, tight on protagonist mid-doomscroll, refreshing a chart repeatedly, phone-glow key light, cold/blue grade, fast jump cuts. Hard SFX cut to silence at 4s (reuse the noise→silence transition already proven in `SignalNotNoiseFilm.tsx`).

**4–14s — Build**
- VO: "Describe the job in chat, review the setup, and choose when it runs."
- Protagonist goes still. Real screen capture (test account, non-sensitive sample data) floats in as a WalkthroughSpot glass card (`kind: automations`) beside their face. Grade shifts cold → warm brand purple.

**14–25s — Monitor**
- VO: "Use it for recurring research, briefs, and watchlists without rebuilding the prompt every time."
- Time-jump cue (light/wardrobe change). One calm notification read in ~2s, phone face-down, cut to existing b-roll (`s3-street.mp4`, `s4-coffee.mp4`, `s5-commute.mp4`). Payoff is "got my evening back" — never a performance/outcome claim.

**25–35s — Higher-risk template boundary**
- VO: "Templates can help structure more complex decisions. You stay responsible for reviewing what the agent is allowed to do."
- Tone drop: music ducks, tighter frame. Real approval/revoke screen on camera — protagonist taps "approve," doesn't walk away. Do not substitute a reassurance line for the real control UI (per approval-pack rule).

**35–45s — Close**
- On-screen: "Schedule the work. Keep the judgment."
- VO: "Start with a monitoring task in MoonAgents Desktop."
- Existing `EndCard` component, `moonpay.com/agents`, #7D00FF.

**15s cutdown** (verbatim approved 15s copy): Hook → Monitor → end card only. Highest-leverage single unit for social.

## Sound & edit
- Notification-chime salad under the Hook; one soft chime at Monitor; near-silence under the Boundary beat; brand sting on end card.
- Grade: cold/blue through 4s, hard cut to warm/purple brand grade for the rest.
- Reuse existing lifestyle b-roll (`public/footage/automations-hero/`, `public/footage/signal-not-noise/`) — real footage already shot, not stock.

## Compliance gate (non-negotiable, per approval pack)
- No profit/APY/win-rate/"set and forget"/guaranteed-execution language anywhere, on-screen or spoken.
- Recurring buys excluded entirely (not in v1).
- Higher-risk template names (stop loss, profit target, strategy builder, copy trading) may appear **only** if named alongside their real approval-state disclosure — not shown as working demos here.
- Capture checklist: test account, non-sensitive data, no wallet addresses/emails/keys/balances, no unsupported geos, exact build/version logged with the capture.
- Sign-off required before capture: Product (confirms live build/behavior) + Legal/Compliance (copy, disclosures, higher-risk template treatment) — see approval record in the source pack. GTM publishes only once both are visible in the source thread.

## Open follow-up (not done yet, flagging so it doesn't get lost)
Word-for-word audit of the three existing rendered films' on-screen/VO copy against this claims table — none of them have been checked against the Aug 12 guardrails.
