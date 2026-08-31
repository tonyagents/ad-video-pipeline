import React from 'react';
import {
  Audio,
  AbsoluteFill,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {EndCard} from './Ad';

// AUTOMATIONS — TEMPLATES DEMO (draft) — product-demo-focused, not narrative.
// Three read-only monitoring templates, straight "user says -> result" pattern,
// same structure WalkResearch/WalkBroker/WalkVirtual/WalkAuto use, but code-drawn
// (no screen recording exists yet) instead of a talking-head video track.
//
// STATUS: INTERNAL DRAFT. NOT FOR PUBLICATION.
// Template copy is verbatim from Efren's automations-template brief (2026-08-12):
// Price Alert, Wallet Watch, Watchlist Moves — the three he flagged as already
// matching existing GTM/creative and the ones to launch first. Deliberately
// excludes every prepared-action / recurring-buy template from that same brief —
// those remain gated per the Aug-12 approval pack until transaction controls and
// Legal/Compliance sign-off exist. Close VO/copy reused verbatim from the
// approved 45s hero script (v4-close-TEMP-VO.wav, same approval pack).
//
// IMPORTANT — before this leaves the repo: the chat-bubble/result cards below are
// illustrative concept UI, not a screen recording. The Aug-12 capture checklist
// wants real product screens for anything presented as live behavior. Fine for an
// internal draft; swap for real capture before anyone calls this finished.
//
// 0-5.0s intro (voiced) -> 5.0-12.5s Price Alert -> 12.5-20.0s Wallet Watch ->
// 20.0-27.5s Watchlist Moves -> 27.5-31.2s close + end card (voiced).

const FONT =
  "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif";
const PURPLE = '#7D00FF';
const PURPLE_LIGHT = '#b8a8fc';
const GREEN = '#16c784';
const TEXT = '#f5f3ff';
const GRAY = '#9d9aa8';
const BG = '#08070c';

const AUDIO = (name: string) => staticFile(`audio/automations-human/${name}`);

export const AUTOMATIONS_TEMPLATES_DEMO_TOTAL = 1040; // ~34.7s @ 30fps, VO-paced (Fraser voice)

const HelmetBadge: React.FC<{size?: number}> = ({size = 30}) => (
  <div style={{width: size, height: size, borderRadius: size * 0.3, overflow: 'hidden', flexShrink: 0}}>
    <Img src={staticFile('moonagents-helmet-icon.png')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
  </div>
);

const DraftWatermark: React.FC = () => (
  <AbsoluteFill style={{pointerEvents: 'none'}}>
    <div
      style={{
        position: 'absolute',
        top: 24,
        right: 24,
        fontFamily: "'SF Mono', ui-monospace, monospace",
        fontSize: 13,
        fontWeight: 700,
        letterSpacing: 0.5,
        color: 'rgba(245,166,35,0.85)',
        background: 'rgba(8,7,12,0.55)',
        border: '1px solid rgba(245,166,35,0.4)',
        borderRadius: 8,
        padding: '6px 10px',
      }}
    >
      INTERNAL DRAFT — NOT FOR PUBLICATION
    </div>
  </AbsoluteFill>
);

// ── ambient background: calm studio glow, no lifestyle footage — this is a
// product demo, not a lifestyle narrative ──────────────────────────────────
const Backdrop: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: BG}}>
    <AbsoluteFill
      style={{
        background:
          'radial-gradient(circle at 50% 38%, rgba(40,18,78,0.55) 0%, rgba(23,14,44,0.28) 32%, rgba(8,7,12,0) 62%)',
      }}
    />
  </AbsoluteFill>
);

const Kicker: React.FC = () => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [6, 22], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <div
      style={{
        position: 'absolute',
        top: 56,
        left: 0,
        right: 0,
        textAlign: 'center',
        fontFamily: FONT,
        fontSize: 18,
        fontWeight: 700,
        letterSpacing: 6,
        color: PURPLE_LIGHT,
        opacity: o * 0.9,
      }}
    >
      AUTOMATIONS
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// INTRO (0-150f / 0-5.0s, voiced)
// ══════════════════════════════════════════════════════════════════════════
const IntroAct: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame, fps, config: {damping: 17, stiffness: 120}});
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <Audio src={AUDIO('v5-templates-intro-TEMP-VO.wav')} />
      <Kicker />
      <div
        style={{
          textAlign: 'center',
          opacity: p,
          transform: `translateY(${(1 - p) * 20}px)`,
          fontFamily: FONT,
          fontSize: 50,
          fontWeight: 800,
          color: TEXT,
          letterSpacing: -1,
        }}
      >
        Three ways to keep watch.
      </div>
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// TEMPLATE BEAT — chat bubble ("user says") -> result card ("result")
// ══════════════════════════════════════════════════════════════════════════
const ChatBubble: React.FC<{text: string; appear: number}> = ({text, appear}) => {
  const frame = useCurrentFrame();
  const local = frame - appear;
  const {fps} = useVideoConfig();
  const p = spring({frame: local, fps, config: {damping: 17, stiffness: 130}});
  if (local < 0) return null;
  return (
    <div
      style={{
        opacity: p,
        transform: `translate(${(1 - p) * -24}px, 0)`,
        maxWidth: 520,
        alignSelf: 'flex-start',
      }}
    >
      <div style={{fontSize: 13, fontWeight: 700, color: GRAY, marginBottom: 8, letterSpacing: 0.4}}>YOU SAY</div>
      <div
        style={{
          background: 'rgba(255,255,255,0.07)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '22px 22px 22px 6px',
          padding: '18px 24px',
          fontFamily: FONT,
          fontSize: 26,
          fontWeight: 600,
          color: TEXT,
          lineHeight: 1.35,
        }}
      >
        &ldquo;{text}&rdquo;
      </div>
    </div>
  );
};

const ResultCard: React.FC<{text: string; label: string; appear: number}> = ({text, label, appear}) => {
  const frame = useCurrentFrame();
  const local = frame - appear;
  const {fps} = useVideoConfig();
  const p = spring({frame: local, fps, config: {damping: 16, stiffness: 120}});
  if (local < 0) return null;
  return (
    <>
      {local === 0 ? <Audio src={staticFile('audio/set-the-rules/confirm-chime.wav')} /> : null}
      <div
        style={{
          opacity: p,
          transform: `translate(${(1 - p) * 24}px, 0)`,
          maxWidth: 560,
          alignSelf: 'flex-end',
        }}
      >
        <div
          style={{
            borderRadius: 24,
            padding: '22px 26px',
            background: 'linear-gradient(160deg, rgba(34,26,54,0.72) 0%, rgba(12,10,22,0.8) 100%)',
            border: '1px solid rgba(255,255,255,0.14)',
            boxShadow:
              'inset 0 1px 0 rgba(255,255,255,0.25), 0 24px 80px rgba(0,0,0,0.5), 0 0 60px rgba(125,0,255,0.16)',
            fontFamily: FONT,
            color: TEXT,
          }}
        >
          <div style={{display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12}}>
            <HelmetBadge size={26} />
            <div style={{fontSize: 12.5, fontWeight: 800, color: GREEN, letterSpacing: 0.6}}>{label}</div>
          </div>
          <div style={{fontSize: 24, fontWeight: 700, lineHeight: 1.3}}>{text}</div>
        </div>
      </div>
    </>
  );
};

const TemplateBeat: React.FC<{userSays: string; result: string; label: string}> = ({
  userSays,
  result,
  label,
}) => (
  <AbsoluteFill style={{justifyContent: 'center', padding: '0 140px'}}>
    <div style={{display: 'flex', flexDirection: 'column', gap: 34}}>
      <ChatBubble text={userSays} appear={10} />
      <ResultCard text={result} label={label} appear={75} />
    </div>
  </AbsoluteFill>
);

// ══════════════════════════════════════════════════════════════════════════
// Composition
// ══════════════════════════════════════════════════════════════════════════
export const AutomationsTemplatesDemoFilm: React.FC = () => {
  return (
    <AbsoluteFill style={{backgroundColor: BG}}>
      <Backdrop />
      <Audio
        src={staticFile('music.wav')}
        volume={(frame) => (frame < 220 || frame > 895 ? 0.14 : 0.08)}
      />

      <Sequence from={0} durationInFrames={220}>
        <IntroAct />
      </Sequence>

      <Sequence from={220} durationInFrames={225}>
        <Kicker />
        <TemplateBeat
          userSays="Tell me when SOL crosses $210."
          result="SOL crossed your $210 target."
          label="PRICE ALERT"
        />
      </Sequence>

      <Sequence from={445} durationInFrames={225}>
        <Kicker />
        <TemplateBeat
          userSays="Tell me when this wallet moves more than $10K."
          result="$12,400 moved from the wallet you follow."
          label="WALLET WATCH"
        />
      </Sequence>

      <Sequence from={670} durationInFrames={225}>
        <Kicker />
        <TemplateBeat
          userSays="Tell me if anything on my list moves more than 8% today."
          result="ETH is up 10.4%—the largest move on your list."
          label="WATCHLIST MOVES"
        />
      </Sequence>

      <Sequence from={895} durationInFrames={145}>
        <Sequence from={0} durationInFrames={9000} layout="none">
          <Audio src={AUDIO('v4-close-TEMP-VO.wav')} />
        </Sequence>
        <EndCard
          endCard={{
            logo: 'moonpay-logo-white-on-purple.png',
            title: 'Schedule the work. Keep the judgment.',
            brand: 'MoonAgents',
            tagline: 'Start with a monitoring task',
            url: 'moonpay.com/agents',
            disclaimer: '',
            duration: 145,
          }}
        />
      </Sequence>

      <DraftWatermark />
    </AbsoluteFill>
  );
};
