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

// SIGNAL, NOT NOISE — hero launch film.
// 0-4.3s noise (loud) -> 4.3-5.3s cut (silent) -> 5.3-9.8s signal setup ->
// 9.8-20.8s attention reclaimed (lifestyle) -> 20.8-24.8s the moment ->
// 24.8-28.3s proof -> 28.3-31.8s end card.

const FONT =
  "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif";
const MONO = "'SF Mono', ui-monospace, 'JetBrains Mono', Menlo, monospace";
const PURPLE = '#7D00FF';
const PURPLE_LIGHT = '#b8a8fc';
const GREEN = '#16c784';
const RED = '#ff5c5c';
const TEXT = '#f5f3ff';
const GRAY = '#9d9aa8';
const BG = '#08070c';

const AUDIO = (name: string) => staticFile(`audio/signal-not-noise/${name}`);
const FOOTAGE = (name: string) => staticFile(`footage/signal-not-noise/${name}`);
const LIFESTYLE = (name: string) => staticFile(`footage/automations-hero/${name}`);

export const SIGNAL_NOT_NOISE_TOTAL = 954; // 31.8s @ 30fps

// ── shared glass shell ───────────────────────────────────────────────────────
const Glass: React.FC<{children: React.ReactNode; width?: number; style?: React.CSSProperties}> = ({
  children,
  width = 460,
  style,
}) => (
  <div
    style={{
      width,
      borderRadius: 24,
      padding: '24px 28px',
      background: 'linear-gradient(160deg, rgba(34,26,54,0.7) 0%, rgba(12,10,22,0.78) 100%)',
      border: '1px solid rgba(255,255,255,0.14)',
      boxShadow:
        'inset 0 1px 0 rgba(255,255,255,0.25), 0 24px 80px rgba(0,0,0,0.5), 0 0 60px rgba(125,0,255,0.18)',
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

const HelmetBadge: React.FC<{size?: number}> = ({size = 32}) => (
  <div style={{width: size, height: size, borderRadius: size * 0.3, overflow: 'hidden', flexShrink: 0}}>
    <Img src={staticFile('novaagents-helmet-icon.png')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
  </div>
);

// ══════════════════════════════════════════════════════════════════════════
// ACT 1 — THE NOISE (0-129f / 0-4.3s): behavioral repetition, not fake prices
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
          fontSize: 30,
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

type CardCfg = {x: number; y: number; scale: number; appear: number; text: string};
const WALL_CARDS: CardCfg[] = [
  {x: 0, y: 10, scale: 1.0, appear: 0, text: 'Anything yet?'},
  {x: 190, y: 40, scale: 0.93, appear: 8, text: 'Check again.'},
  {x: -170, y: -30, scale: 0.9, appear: 16, text: 'What about now?'},
  {x: 40, y: 160, scale: 0.84, appear: 24, text: 'Anything changed?'},
  {x: -230, y: -110, scale: 0.8, appear: 32, text: 'Check one more time.'},
  {x: 210, y: 170, scale: 0.76, appear: 40, text: 'Now?'},
];

// Repeated human questions make the problem legible without system-status copy.
const ManualCheckCard: React.FC<{cfg: CardCfg; wallLocal: number; compressProgress: number}> = ({
  cfg,
  wallLocal,
  compressProgress,
}) => {
  const local = wallLocal - cfg.appear;
  if (local < 0) return null;
  const enter = Math.min(1, local / 8);
  const cx = cfg.x * (1 - compressProgress);
  const cy = cfg.y * (1 - compressProgress);
  const cscale = cfg.scale * (1 - 0.94 * compressProgress);
  const opacity = enter * (1 - compressProgress);
  return (
    <div
      style={{
        position: 'absolute',
        transform: `translate(${cx}px, ${cy}px) scale(${cscale})`,
        opacity,
        width: 260,
        borderRadius: 18,
        padding: '16px 20px',
        background: 'linear-gradient(145deg, rgba(125,0,255,0.34), rgba(38,29,55,0.82))',
        border: '1px solid rgba(184,168,252,0.28)',
        boxShadow: '0 16px 50px rgba(0,0,0,0.45), 0 0 28px rgba(125,0,255,0.12)',
        fontFamily: FONT,
        color: TEXT,
      }}
    >
      <div style={{fontSize: 20, fontWeight: 750}}>&ldquo;{cfg.text}&rdquo;</div>
    </div>
  );
};

// Cards accumulate (none disappear) then compress into one point at the end.
const ResultWall: React.FC<{from: number}> = ({from}) => {
  const frame = useCurrentFrame();
  const local = frame - from;
  if (local < 0) return null;
  const compressProgress = interpolate(local, [51, 69], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      {WALL_CARDS.map((cfg, i) => (
        <ManualCheckCard key={i} cfg={cfg} wallLocal={local} compressProgress={compressProgress} />
      ))}
    </AbsoluteFill>
  );
};

const StopWatching: React.FC<{from: number}> = ({from}) => {
  const frame = useCurrentFrame();
  const local = frame - from;
  if (local < 0) return null;
  const {fps} = useVideoConfig();
  const p = spring({frame: local, fps, config: {damping: 14, stiffness: 200}});
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <div
        style={{
          fontFamily: FONT,
          fontSize: 68,
          fontWeight: 900,
          color: 'white',
          letterSpacing: -1,
          textAlign: 'center',
          opacity: p,
          transform: `scale(${0.9 + 0.1 * p})`,
        }}
      >
        STOP WATCHING
        <br />
        EVERYTHING.
      </div>
    </AbsoluteFill>
  );
};

const NoiseAct: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: BG}}>
    <Audio src={AUDIO('noise-overwhelm.wav')} />

    {/* 0-60: human behavior — screen glow + hand refresh, prompts stacking around her */}
    <Sequence from={0} durationInFrames={22}>
      <AbsoluteFill>
        <OffthreadVideo src={FOOTAGE('screen-glow-face.mp4')} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      </AbsoluteFill>
    </Sequence>
    <Sequence from={22} durationInFrames={16}>
      <AbsoluteFill>
        <OffthreadVideo src={FOOTAGE('hand-refresh.mp4')} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      </AbsoluteFill>
    </Sequence>
    <Sequence from={38} durationInFrames={22}>
      <AbsoluteFill>
        <OffthreadVideo
          src={FOOTAGE('screen-glow-face.mp4')}
          muted
          startFrom={45}
          style={{width: '100%', height: '100%', objectFit: 'cover'}}
        />
      </AbsoluteFill>
    </Sequence>
    <FloatingPrompt text="Anything yet?" x={-260} y={-260} from={5} to={26} />
    <FloatingPrompt text="Check again." x={240} y={-220} from={22} to={43} />
    <FloatingPrompt text="What about now?" x={-200} y={260} from={39} to={60} />

    {/* 60-129: result wall accumulates (manual checks), then compresses into the headline */}
    <Sequence from={60} durationInFrames={69}>
      <AbsoluteFill style={{backgroundColor: BG}}>
        <AbsoluteFill style={{opacity: 0.22}}>
          <OffthreadVideo
            src={FOOTAGE('screen-glow-face.mp4')}
            muted
            startFrom={20}
            style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(0.4)'}}
          />
        </AbsoluteFill>
        <ResultWall from={0} />
      </AbsoluteFill>
    </Sequence>
    <Sequence from={111} durationInFrames={18}>
      <StopWatching from={0} />
    </Sequence>
  </AbsoluteFill>
);

// ══════════════════════════════════════════════════════════════════════════
// ACT 2 — THE CUT (129-159f / 4.3-5.3s)
// ══════════════════════════════════════════════════════════════════════════
const CutAct: React.FC = () => {
  const frame = useCurrentFrame();
  const p = Math.min(1, frame / 8);
  return (
    <AbsoluteFill style={{backgroundColor: BG, alignItems: 'center', justifyContent: 'center'}}>
      <Audio src={AUDIO('sub-hit.wav')} />
      <div
        style={{
          fontFamily: FONT,
          fontSize: 60,
          fontWeight: 900,
          color: 'white',
          letterSpacing: -0.5,
          opacity: p,
          transform: `scale(${0.94 + 0.06 * p})`,
        }}
      >
        KNOW WHEN IT MATTERS.
      </div>
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// ACT 3 — SIGNAL SETUP (165-300f / 5.5-10s, voiced)
// ══════════════════════════════════════════════════════════════════════════
const SignalSetupAct: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const bubbleOut = interpolate(frame, [30, 45], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const cardP = spring({frame: frame - 40, fps, config: {damping: 15, stiffness: 110}});
  return (
    <AbsoluteFill style={{backgroundColor: BG, alignItems: 'center', justifyContent: 'center'}}>
      <Audio src={AUDIO('v0-one-signal.wav')} />
      {frame < 46 ? (
        <div
          style={{
            opacity: bubbleOut,
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 20,
            padding: '16px 24px',
            fontFamily: FONT,
            fontSize: 26,
            fontWeight: 600,
            color: TEXT,
            maxWidth: 480,
          }}
        >
          &ldquo;Alert me if SOL crosses $210.&rdquo;
        </div>
      ) : null}
      {frame >= 40 ? (
        <div style={{transform: `scale(${0.85 + 0.15 * cardP}) translateY(${(1 - cardP) * 30}px)`, opacity: cardP}}>
          <Glass width={420}>
            <div style={{display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14}}>
              <HelmetBadge />
              <div style={{fontSize: 20, fontWeight: 700}}>Price Alert</div>
            </div>
            <div style={{fontSize: 26, fontWeight: 800, marginBottom: 10}}>SOL above $210</div>
            <div style={{fontSize: 15, fontWeight: 600, color: GRAY}}>Checking every 15 minutes</div>
          </Glass>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// ACT 4 — ATTENTION RECLAIMED (300-630f / 10-21s)
// ══════════════════════════════════════════════════════════════════════════
const LIFESTYLE_CLIPS = [
  {src: 's2-elevator.mp4', slotFrames: 110},
  {src: 's3-street.mp4', slotFrames: 110},
  {src: 's4-coffee.mp4', slotFrames: 110},
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
            'linear-gradient(180deg, rgba(8,7,12,0.45) 0%, rgba(8,7,12,0.1) 30%, rgba(8,7,12,0.1) 60%, rgba(8,7,12,0.7) 100%)',
        }}
      />
    </AbsoluteFill>
  );
};

const EvolvingCard: React.FC = () => {
  const frame = useCurrentFrame();
  const states = [
    {
      title: 'Price Alert',
      kicker: 'WATCHING',
      headline: 'SOL is still below $210',
      detail: 'No alert sent · Next check 10:30',
      color: PURPLE_LIGHT,
    },
    {
      title: 'Wallet Watch',
      kicker: 'WORTH A LOOK',
      headline: '$12,400 moved from 0x7A4f…3C9e',
      detail: 'Above your $10,000 threshold',
      color: GREEN,
    },
    {
      title: 'Watchlist Moves',
      kicker: 'BIGGEST MOVE',
      headline: 'ETH is up 10.4% today',
      detail: 'Flagged from BTC · ETH · SOL',
      color: GREEN,
    },
  ];
  const idx = Math.min(states.length - 1, Math.floor(frame / 110));
  const local = frame - idx * 110;
  const {fps} = useVideoConfig();
  const p = spring({frame: local, fps, config: {damping: 18, stiffness: 140}});
  const drift = Math.sin(frame * 0.02) * 6;
  const s = states[idx];
  return (
    <AbsoluteFill style={{alignItems: 'flex-end', justifyContent: 'flex-end', padding: '0 70px 90px 0'}}>
      <div
        style={{
          opacity: 0.4 + 0.6 * p,
          transform: `translate(${drift}px, ${(1 - p) * 16}px)`,
          width: '28%',
          minWidth: 300,
        }}
      >
        <Glass width={undefined as unknown as number} style={{width: '100%', padding: '18px 22px'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12}}>
            <HelmetBadge size={26} />
            <div style={{fontSize: 16, fontWeight: 700}}>{s.title}</div>
          </div>
          <div style={{fontSize: 11, fontWeight: 900, color: s.color, letterSpacing: 0.8, marginBottom: 5}}>
            {s.kicker}
          </div>
          <div style={{fontSize: 18, fontWeight: 800, color: TEXT, lineHeight: 1.2}}>{s.headline}</div>
          <div style={{fontSize: 13, color: GRAY, marginTop: 5}}>{s.detail}</div>
        </Glass>
      </div>
    </AbsoluteFill>
  );
};

const ReclaimedAct: React.FC = () => (
  <AbsoluteFill>
    <LifestyleReel />
    <EvolvingCard />
  </AbsoluteFill>
);

// ══════════════════════════════════════════════════════════════════════════
// ACT 5 — THE MOMENT (630-750f / 21-25s, voiced)
// ══════════════════════════════════════════════════════════════════════════
const MomentAct: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame, fps, config: {damping: 16, stiffness: 120}});
  return (
    <AbsoluteFill>
      <Audio src={AUDIO('v1-sol-crossed.wav')} />
      <AbsoluteFill>
        <OffthreadVideo
          src={LIFESTYLE('s4-coffee.mp4')}
          muted
          startFrom={40}
          style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.35)'}}
        />
      </AbsoluteFill>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
        <div style={{transform: `scale(${0.9 + 0.1 * p}) translateY(${(1 - p) * 20}px)`, opacity: p}}>
          <Glass width={520}>
            <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
              <HelmetBadge size={40} />
              <div>
                <div style={{fontSize: 13, fontWeight: 900, color: GREEN, letterSpacing: 0.8}}>THIS ONE MATTERS</div>
                <div style={{fontSize: 24, fontWeight: 800, marginTop: 4}}>SOL just crossed $210</div>
                <div style={{fontSize: 16, color: GRAY, marginTop: 5}}>Your alert fired after 18 checks</div>
              </div>
            </div>
          </Glass>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// ACT 6 — PROOF (750-855f / 25-28.5s)
// ══════════════════════════════════════════════════════════════════════════
const ProofAct: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const templates = [
    {title: 'Price Alert', icon: '📈', promise: 'KNOW WHEN IT HITS'},
    {title: 'Wallet Watch', icon: '👀', promise: 'KNOW WHEN IT MOVES'},
    {title: 'Watchlist Moves', icon: '⚡', promise: 'KNOW WHAT’S MOVING'},
  ];
  const textIn = interpolate(frame, [40, 60], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{backgroundColor: BG, alignItems: 'center', justifyContent: 'center', flexDirection: 'column'}}>
      <div style={{display: 'flex', gap: 26}}>
        {templates.map((t, i) => {
          const p = spring({frame: frame - i * 6, fps, config: {damping: 16, stiffness: 130}});
          return (
            <div key={t.title} style={{opacity: p, transform: `translateY(${(1 - p) * 22}px) scale(${0.9 + 0.1 * p})`}}>
              <Glass width={220} style={{textAlign: 'center', padding: '28px 18px'}}>
                <div style={{fontSize: 30, marginBottom: 8}}>{t.icon}</div>
                <div style={{fontSize: 17, fontWeight: 700, marginBottom: 10}}>{t.title}</div>
                <div style={{fontSize: 11, fontWeight: 800, color: GREEN, letterSpacing: 0.5}}>{t.promise}</div>
              </Glass>
            </div>
          );
        })}
      </div>
      <div
        style={{
          marginTop: 40,
          fontFamily: FONT,
          fontSize: 32,
          fontWeight: 800,
          color: TEXT,
          textAlign: 'center',
          opacity: textIn,
          transform: `translateY(${(1 - textIn) * 12}px)`,
        }}
      >
        They keep watch.
        <br />
        You decide what happens next.
      </div>
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// Composition
// ══════════════════════════════════════════════════════════════════════════
export const SignalNotNoiseFilm: React.FC = () => {
  return (
    <AbsoluteFill style={{backgroundColor: BG}}>
      <Audio
        src={staticFile('music.wav')}
        volume={(frame) => {
          const underVoice =
            (frame >= 159 && frame < 294) ||
            (frame >= 624 && frame < 744) ||
            frame >= 849;
          return underVoice ? 0.12 : frame < 129 ? 0.2 : 0.28;
        }}
      />
      {/* Act 1: noise, 0-129 (4.3s, loud) */}
      <Sequence from={0} durationInFrames={129}>
        <NoiseAct />
      </Sequence>

      {/* Act 2: cut, 129-159 (1.0s, silent + sub hit) */}
      <Sequence from={129} durationInFrames={30}>
        <CutAct />
      </Sequence>

      {/* Act 3: signal setup, 165-300 (4.5s, voiced) */}
      <Sequence from={159} durationInFrames={135}>
        <SignalSetupAct />
      </Sequence>

      {/* Act 4: attention reclaimed, 300-630 (11.0s, silent) */}
      <Sequence from={294} durationInFrames={330}>
        <ReclaimedAct />
      </Sequence>

      {/* Act 5: the moment, 630-750 (4.0s, voiced) */}
      <Sequence from={624} durationInFrames={120}>
        <MomentAct />
      </Sequence>

      {/* Act 6: proof, 750-855 (3.5s, silent) */}
      <Sequence from={744} durationInFrames={105}>
        <ProofAct />
      </Sequence>

      {/* Act 7: end card, 855-960 (3.5s, voiced) */}
      <Sequence from={849} durationInFrames={105}>
        <Sequence from={0} durationInFrames={9000} layout="none">
          <Audio src={AUDIO('v2-signal-not-noise.wav')} />
        </Sequence>
        <EndCard
          endCard={{
            logo: 'nova-logo-white-on-purple.png',
            title: 'Signal, not noise.',
            brand: 'NovaAgents',
            tagline: 'Open Automations',
            url: 'example.com/agents',
            disclaimer: '',
            duration: 105,
          }}
        />
      </Sequence>
    </AbsoluteFill>
  );
};
