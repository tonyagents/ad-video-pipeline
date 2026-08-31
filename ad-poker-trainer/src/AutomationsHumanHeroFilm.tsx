import React from 'react';
import {
  Audio,
  AbsoluteFill,
  Img,
  OffthreadVideo,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {EndCard} from './Ad';

// AUTOMATIONS — HUMAN HERO (previz) — "Signal, Not Noise" spine, live-action lead.
//
// STATUS: INTERNAL PREVIZ. NOT FOR PUBLICATION.
// Copy is verbatim from company/content/moonagents-automation-video-approval-pack-2026-08-12.md.
// VO is a placeholder TTS read of that exact copy — swap for the real capture once
// Product + Legal/Compliance sign off (see approval record in that file) and a real
// presenter + real screen recording exist. The two "REAL CAPTURE NEEDED" cards below
// mark exactly where that footage drops in. Do not replace the placeholder cards with
// invented UI — capture checklist requires the actual production build.
//
// 0-3.0s noise (silent VO, reused from Signal-Not-Noise) -> 3.0-3.5s cut ->
// 3.5-8.2s hook (voiced) -> 8.2-15.6s build/placeholder (voiced) ->
// 15.6-24.4s monitor/lifestyle (voiced) -> 24.4-34.4s boundary/placeholder (voiced) ->
// 34.4-38.1s close + end card (voiced).

const FONT =
  "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif";
const MONO = "'SF Mono', ui-monospace, 'JetBrains Mono', Menlo, monospace";
const PURPLE = '#7D00FF';
const PURPLE_LIGHT = '#b8a8fc';
const AMBER = '#f5a623'; // placeholder-card accent — deliberately NOT brand purple
const GREEN = '#16c784';
const TEXT = '#f5f3ff';
const GRAY = '#9d9aa8';
const BG = '#08070c';

const AUDIO = (name: string) => staticFile(`audio/automations-human/${name}`);
const NOISE_AUDIO = (name: string) => staticFile(`audio/signal-not-noise/${name}`);
const NOISE_FOOTAGE = (name: string) => staticFile(`footage/signal-not-noise/${name}`);
const LIFESTYLE = (name: string) => staticFile(`footage/automations-hero/${name}`);

export const AUTOMATIONS_HUMAN_HERO_TOTAL = 1175; // ~39.2s @ 30fps, VO-paced (Fraser voice)

// ── shared glass shell (matches SignalNotNoiseFilm) ─────────────────────────
const Glass: React.FC<{
  children: React.ReactNode;
  width?: number;
  style?: React.CSSProperties;
  accent?: 'purple' | 'amber';
}> = ({children, width = 460, style, accent = 'purple'}) => {
  const glow = accent === 'amber' ? 'rgba(245,166,35,0.22)' : 'rgba(125,0,255,0.18)';
  const border = accent === 'amber' ? 'rgba(245,166,35,0.4)' : 'rgba(255,255,255,0.14)';
  return (
    <div
      style={{
        width,
        borderRadius: 24,
        padding: '24px 28px',
        background: 'linear-gradient(160deg, rgba(34,26,54,0.7) 0%, rgba(12,10,22,0.78) 100%)',
        border: `1px solid ${border}`,
        borderStyle: accent === 'amber' ? 'dashed' : 'solid',
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.25), 0 24px 80px rgba(0,0,0,0.5), 0 0 60px ${glow}`,
        backdropFilter: 'blur(20px) saturate(150%)',
        WebkitBackdropFilter: 'blur(20px) saturate(150%)',
        color: TEXT,
        fontFamily: FONT,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

const HelmetBadge: React.FC<{size?: number}> = ({size = 32}) => (
  <div style={{width: size, height: size, borderRadius: size * 0.3, overflow: 'hidden', flexShrink: 0}}>
    <Img src={staticFile('moonagents-helmet-icon.png')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
  </div>
);

// Persistent watermark so this file can never be mistaken for a finished asset.
const PrevizWatermark: React.FC = () => (
  <AbsoluteFill style={{pointerEvents: 'none'}}>
    <div
      style={{
        position: 'absolute',
        top: 24,
        right: 24,
        fontFamily: MONO,
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
      INTERNAL PREVIZ — NOT FOR PUBLICATION
    </div>
  </AbsoluteFill>
);

// A clearly-flagged stand-in for footage that must be a real capture before this
// asset can leave this repo.
const RealCaptureNeededCard: React.FC<{width?: number; label: string}> = ({width = 560, label}) => (
  <Glass width={width} accent="amber">
    <div style={{display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14}}>
      <div style={{fontSize: 22}}>🎬</div>
      <div style={{fontSize: 15, fontWeight: 800, color: AMBER, letterSpacing: 0.4}}>
        REAL CAPTURE NEEDED
      </div>
    </div>
    <div style={{fontSize: 18, fontWeight: 600, lineHeight: 1.4, color: TEXT}}>{label}</div>
    <div style={{fontSize: 13, color: GRAY, marginTop: 10}}>
      Test account · non-sensitive data · exact production build/version logged
    </div>
  </Glass>
);

// ══════════════════════════════════════════════════════════════════════════
// ACT 0 — NOISE (0-90f / 0-3.0s, silent VO): reused device from Signal-Not-Noise
// ══════════════════════════════════════════════════════════════════════════
const FloatingPrompt: React.FC<{text: string; x: number; y: number; from: number; to: number}> = ({
  text,
  x,
  y,
  from,
  to,
}) => {
  const frame = useCurrentFrame();
  if (frame < from || frame > to) return null;
  const local = frame - from;
  const inOp = Math.min(1, local / 5);
  const outOp = interpolate(frame, [to - 5, to], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <div
        style={{
          position: 'absolute',
          transform: `translate(${x}px, ${y}px)`,
          fontFamily: FONT,
          fontSize: 28,
          fontWeight: 700,
          color: TEXT,
          opacity: inOp * outOp,
          textShadow: '0 4px 20px rgba(0,0,0,0.6)',
          whiteSpace: 'nowrap',
        }}
      >
        &ldquo;{text}&rdquo;
      </div>
    </AbsoluteFill>
  );
};

const NoiseAct: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: BG}}>
    <Audio src={NOISE_AUDIO('noise-overwhelm.wav')} volume={0.6} />
    <Sequence from={0} durationInFrames={45}>
      <AbsoluteFill>
        <OffthreadVideo
          src={NOISE_FOOTAGE('screen-glow-face.mp4')}
          muted
          style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(0.7) brightness(0.85)'}}
        />
      </AbsoluteFill>
    </Sequence>
    <Sequence from={45} durationInFrames={45}>
      <AbsoluteFill>
        <OffthreadVideo
          src={NOISE_FOOTAGE('hand-refresh.mp4')}
          muted
          style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(0.7) brightness(0.85)'}}
        />
      </AbsoluteFill>
    </Sequence>
    <FloatingPrompt text="Anything yet?" x={-240} y={-240} from={4} to={26} />
    <FloatingPrompt text="Check again." x={230} y={-200} from={22} to={44} />
    <FloatingPrompt text="What about now?" x={-190} y={240} from={40} to={62} />
    <FloatingPrompt text="One more time." x={200} y={220} from={58} to={80} />
  </AbsoluteFill>
);

// ══════════════════════════════════════════════════════════════════════════
// ACT — CUT (90-105f / 3.0-3.5s, silent)
// ══════════════════════════════════════════════════════════════════════════
const CutAct: React.FC = () => {
  const frame = useCurrentFrame();
  const flash = interpolate(frame, [0, 3, 15], [0, 0.5, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{backgroundColor: BG}}>
      <Audio src={NOISE_AUDIO('sub-hit.wav')} />
      <AbsoluteFill style={{backgroundColor: '#fff', opacity: flash}} />
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// ACT 1 — HOOK (105-246f / 3.5-8.2s, voiced) — approved copy, verbatim
// ══════════════════════════════════════════════════════════════════════════
const HookAct: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame, fps, config: {damping: 17, stiffness: 120}});
  return (
    <AbsoluteFill style={{backgroundColor: BG, alignItems: 'center', justifyContent: 'center'}}>
      <Audio src={AUDIO('v0-hook-TEMP-VO.wav')} />
      <div
        style={{
          textAlign: 'center',
          opacity: p,
          transform: `translateY(${(1 - p) * 22}px)`,
          fontFamily: FONT,
        }}
      >
        <div style={{fontSize: 56, fontWeight: 800, color: TEXT, letterSpacing: -1, lineHeight: 1.15}}>
          Tell your agent what to watch.
          <br />
          Tell it when.
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// ACT 2 — BUILD (246-467f / 8.2-15.6s, voiced) — approved copy, verbatim
// ══════════════════════════════════════════════════════════════════════════
const Kicker: React.FC<{text: string}> = ({text}) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [6, 22], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <div
      style={{
        position: 'absolute',
        top: 60,
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
      {text}
    </div>
  );
};

const BuildAct: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - 12, fps, config: {damping: 16, stiffness: 110}});
  return (
    <AbsoluteFill style={{backgroundColor: BG, alignItems: 'center', justifyContent: 'center'}}>
      <Audio src={AUDIO('v1-build-TEMP-VO.wav')} />
      <Kicker text="AUTOMATIONS" />
      <div style={{transform: `scale(${0.92 + p * 0.08}) translateY(${(1 - p) * 20}px)`, opacity: p}}>
        <RealCaptureNeededCard
          width={620}
          label="Screen recording: describe the job in chat → review the setup → choose when it runs."
        />
      </div>
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// ACT 3 — MONITOR (467-730f / 15.6-24.4s, voiced) — approved copy, verbatim
// ══════════════════════════════════════════════════════════════════════════
const LIFESTYLE_CLIPS = [
  {src: 's3-street.mp4', slotFrames: 88},
  {src: 's4-coffee.mp4', slotFrames: 88},
  {src: 's5-commute.mp4', slotFrames: 87},
];
const LIFESTYLE_SOURCE_FRAMES = 120;

const LifestyleReel: React.FC = () => {
  let from = 0;
  return (
    <AbsoluteFill>
      {LIFESTYLE_CLIPS.map((c) => {
        const seq = (
          <Sequence key={c.src} from={from} durationInFrames={c.slotFrames}>
            <OffthreadVideo
              src={LIFESTYLE(c.src)}
              muted
              playbackRate={LIFESTYLE_SOURCE_FRAMES / c.slotFrames}
              style={{width: '100%', height: '100%', objectFit: 'cover'}}
            />
          </Sequence>
        );
        from += c.slotFrames;
        return seq;
      })}
      <AbsoluteFill
        style={{
          background:
            'linear-gradient(180deg, rgba(8,7,12,0.4) 0%, rgba(8,7,12,0.05) 30%, rgba(8,7,12,0.05) 60%, rgba(8,7,12,0.65) 100%)',
        }}
      />
    </AbsoluteFill>
  );
};

const DailyBriefCard: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - 20, fps, config: {damping: 17, stiffness: 130}});
  const checked = frame - 20 > 24;
  return (
    <AbsoluteFill style={{alignItems: 'flex-end', justifyContent: 'flex-end', padding: '0 70px 90px 0'}}>
      <div style={{opacity: p, transform: `translateY(${(1 - p) * 16}px)`, width: '30%', minWidth: 320}}>
        <Glass width={undefined as unknown as number} style={{width: '100%'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12}}>
            <HelmetBadge size={26} />
            <div style={{fontSize: 16, fontWeight: 700}}>Daily Brief</div>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '11px 13px',
              borderRadius: 13,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <div style={{fontSize: 18}}>{checked ? '✓' : '·'}</div>
            <div style={{fontSize: 14.5, fontWeight: 600}}>Ready · next run scheduled</div>
          </div>
        </Glass>
      </div>
    </AbsoluteFill>
  );
};

const MonitorAct: React.FC = () => (
  <AbsoluteFill>
    <Audio src={AUDIO('v2-monitor-TEMP-VO.wav')} />
    <LifestyleReel />
    <DailyBriefCard />
  </AbsoluteFill>
);

// ══════════════════════════════════════════════════════════════════════════
// ACT 4 — BOUNDARY (730-1030f / 24.4-34.4s, voiced) — approved copy, verbatim.
// Template names ONLY, immediately followed by the real review/approval state.
// ══════════════════════════════════════════════════════════════════════════
const TEMPLATE_NAMES = ['Stop loss', 'Profit target', 'Strategy builder', 'Copy trading'];

const TemplateNameRow: React.FC<{name: string; i: number}> = ({name, i}) => {
  const frame = useCurrentFrame();
  const local = frame - i * 9;
  const op = interpolate(local, [0, 10], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <div
      style={{
        opacity: op,
        transform: `translateY(${(1 - op) * 10}px)`,
        fontSize: 26,
        fontWeight: 700,
        color: GRAY,
        marginBottom: 8,
      }}
    >
      {name}
    </div>
  );
};

const BoundaryAct: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  // names appear first (0-50), then the placeholder approval card immediately after
  const cardP = spring({frame: frame - 70, fps, config: {damping: 16, stiffness: 110}});
  return (
    <AbsoluteFill
      style={{backgroundColor: BG, alignItems: 'center', justifyContent: 'center', flexDirection: 'column'}}
    >
      <Audio src={AUDIO('v3-boundary-TEMP-VO.wav')} />
      {/* desaturated, tighter — tone drop for the responsibility beat */}
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 50%, rgba(20,16,30,0.3), rgba(8,7,12,0.9))'}} />
      <div style={{textAlign: 'center', opacity: frame < 75 ? 1 : Math.max(0, 1 - (frame - 75) / 20)}}>
        {TEMPLATE_NAMES.map((n, i) => (
          <TemplateNameRow key={n} name={n} i={i} />
        ))}
      </div>
      {frame >= 68 ? (
        <div
          style={{
            position: 'absolute',
            transform: `scale(${0.92 + cardP * 0.08}) translateY(${(1 - cardP) * 20}px)`,
            opacity: cardP,
          }}
        >
          <RealCaptureNeededCard
            width={600}
            label="Real review/approval screen — what the agent is allowed to do, and how to revoke it. Not a reassurance line; the actual control."
          />
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// ACT 5 — CLOSE + END CARD (1030-1142f / 34.4-38.1s, voiced) — approved copy, verbatim
// ══════════════════════════════════════════════════════════════════════════

// ══════════════════════════════════════════════════════════════════════════
// Composition
// ══════════════════════════════════════════════════════════════════════════
export const AutomationsHumanHeroFilm: React.FC = () => {
  return (
    <AbsoluteFill style={{backgroundColor: BG}}>
      <Audio
        src={staticFile('music.wav')}
        volume={(frame) => {
          const boundary = frame >= 730 && frame < 1030;
          const voiced = frame >= 105; // duck under every voiced beat
          if (boundary) return 0.06; // hard duck for the responsibility beat
          return voiced ? 0.1 : 0.22;
        }}
      />

      <Sequence from={0} durationInFrames={90}>
        <NoiseAct />
      </Sequence>

      <Sequence from={90} durationInFrames={15}>
        <CutAct />
      </Sequence>

      <Sequence from={105} durationInFrames={141}>
        <HookAct />
      </Sequence>

      <Sequence from={246} durationInFrames={221}>
        <BuildAct />
      </Sequence>

      <Sequence from={467} durationInFrames={263}>
        <MonitorAct />
      </Sequence>

      <Sequence from={730} durationInFrames={300}>
        <BoundaryAct />
      </Sequence>

      <Sequence from={1030} durationInFrames={145}>
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

      <PrevizWatermark />
    </AbsoluteFill>
  );
};
