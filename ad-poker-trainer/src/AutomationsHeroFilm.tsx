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

// "You shouldn't have to ask twice" — NovaAgents Automations hero launch film.
// Re-timed to let the voiceover finish every line naturally (voice pacing
// drives section length, not a fixed fast-cut runtime):
// 0-3s hook -> 3-13.3s transformation -> 13.3-31.3s lifestyle + product cards
// -> 31.3-42s notification/dashboard -> 42-46s trust proof -> 46-50.7s end card.

const FONT =
  "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif";
const MONO = "'SF Mono', ui-monospace, 'JetBrains Mono', Menlo, monospace";
const PURPLE = '#7D00FF';
const PURPLE_LIGHT = '#b8a8fc';
const GREEN = '#16c784';
const TEXT = '#f5f3ff';
const GRAY = '#9d9aa8';
const BG = '#08070c';

const VOICE = (name: string) => staticFile(`audio/automations-hero/${name}`);

export const AUTOMATIONS_HERO_TOTAL = 1520; // ~50.7s @ 30fps, sized to the voiceover

// ── shared animation + glass shell ──────────────────────────────────────────
const useEnter = (appearFrame: number, leaveFrame: number | null = null) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const local = frame - appearFrame;
  const p = spring({frame: local, fps, config: {damping: 16, stiffness: 120}});
  let opacity = interpolate(local, [0, 10], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  if (leaveFrame !== null) {
    const out = interpolate(frame, [leaveFrame - 10, leaveFrame], [1, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    opacity *= out;
  }
  return {opacity, translateY: (1 - p) * 30, scale: 0.9 + p * 0.1};
};

const Glass: React.FC<{
  children: React.ReactNode;
  width?: number;
  style?: React.CSSProperties;
}> = ({children, width = 460, style}) => (
  <div
    style={{
      width,
      borderRadius: 28,
      padding: '28px 32px',
      background:
        'linear-gradient(160deg, rgba(34,26,54,0.68) 0%, rgba(12,10,22,0.76) 100%)',
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

const CardHeader: React.FC<{title: string; badge?: string}> = ({title, badge}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16}}>
    <div
      style={{
        width: 34,
        height: 34,
        borderRadius: 10,
        overflow: 'hidden',
        boxShadow: `0 0 18px rgba(125,0,255,0.5)`,
      }}
    >
      <Img
        src={staticFile('novaagents-helmet-icon.png')}
        style={{width: '100%', height: '100%', objectFit: 'cover'}}
      />
    </div>
    <div style={{fontSize: 21, fontWeight: 700, letterSpacing: -0.3}}>{title}</div>
    {badge ? (
      <div style={{marginLeft: 'auto', fontSize: 13, fontWeight: 600, color: GRAY}}>
        {badge}
      </div>
    ) : null}
  </div>
);

// ── Section A: hook (0-3s, silent) ──────────────────────────────────────────
const Headline: React.FC<{text: string; from: number; to: number; size?: number}> = ({
  text,
  from,
  to,
  size = 62,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const local = frame - from;
  if (frame < from || frame > to) return null;
  const p = spring({frame: local, fps, config: {damping: 18, stiffness: 130}});
  const out = interpolate(frame, [to - 10, to], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <div
        style={{
          fontFamily: FONT,
          fontSize: size,
          fontWeight: 800,
          color: TEXT,
          letterSpacing: -1.5,
          textAlign: 'center',
          maxWidth: '80%',
          opacity: (0.4 + 0.6 * p) * out,
          transform: `scale(${0.92 + 0.08 * p}) translateY(${(1 - p) * 20}px)`,
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};

const RepeatedPrompt: React.FC<{day: string; from: number; to: number}> = ({
  day,
  from,
  to,
}) => {
  const frame = useCurrentFrame();
  if (frame < from || frame > to) return null;
  const local = frame - from;
  const p = Math.min(1, local / 5);
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <Glass width={520} style={{opacity: p}}>
        <div style={{fontSize: 14, fontWeight: 700, color: GRAY, marginBottom: 10, letterSpacing: 1}}>
          {day.toUpperCase()}
        </div>
        <div style={{fontSize: 26, fontWeight: 700}}>&ldquo;What&rsquo;s happening with SOL?&rdquo;</div>
      </Glass>
    </AbsoluteFill>
  );
};

// ── Section B: transformation (voiced) ──────────────────────────────────────
const ChatBubble: React.FC<{
  text: string;
  who: 'user' | 'agent';
  from: number;
  to: number | null;
  voice?: string;
}> = ({text, who, from, to, voice}) => {
  const anim = useEnter(from, to);
  const frame = useCurrentFrame();
  if (frame < from) return null;
  const align = who === 'user' ? 'flex-end' : 'flex-start';
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      {voice ? (
        <Sequence from={from} durationInFrames={9000} layout="none">
          <Audio src={VOICE(voice)} />
        </Sequence>
      ) : null}
      <div style={{width: 640, display: 'flex', flexDirection: 'column', gap: 16}}>
        <div style={{alignSelf: align}}>
          <div
            style={{
              opacity: anim.opacity,
              transform: `translateY(${anim.translateY}px) scale(${anim.scale})`,
              background: who === 'user' ? PURPLE : 'rgba(255,255,255,0.08)',
              border: who === 'user' ? 'none' : '1px solid rgba(255,255,255,0.12)',
              borderRadius: 22,
              padding: '18px 26px',
              fontFamily: FONT,
              fontSize: 26,
              fontWeight: 600,
              color: TEXT,
              maxWidth: 520,
            }}
          >
            {text}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const TransformCard: React.FC<{from: number; voice: string}> = ({from, voice}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const local = frame - from;
  if (local < 0) return null;
  const p = spring({frame: local, fps, config: {damping: 15, stiffness: 110}});
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <Sequence from={from} durationInFrames={9000} layout="none">
        <Audio src={VOICE(voice)} />
      </Sequence>
      <div
        style={{
          transform: `scale(${0.85 + 0.15 * p}) translateY(${(1 - p) * 40}px)`,
          opacity: p,
        }}
      >
        <Glass width={520}>
          <CardHeader title="Price Alert" badge="Automations" />
          <div style={{fontSize: 30, fontWeight: 800, marginBottom: 18}}>SOL above $210</div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 14,
              padding: '12px 16px',
            }}
          >
            <span style={{fontSize: 20}}>⏱</span>
            <span style={{fontSize: 18, fontWeight: 600}}>Checks every 15 minutes</span>
          </div>
        </Glass>
      </div>
    </AbsoluteFill>
  );
};

// ── Section C: lifestyle video + floating cards (voiced) ───────────────────
const LIFESTYLE_CLIPS = [
  {src: 'footage/automations-hero/s2-elevator.mp4', slotFrames: 135},
  {src: 'footage/automations-hero/s3-street.mp4', slotFrames: 135},
  {src: 'footage/automations-hero/s4-coffee.mp4', slotFrames: 135},
  {src: 'footage/automations-hero/s5-commute.mp4', slotFrames: 135},
];
const LIFESTYLE_SOURCE_FRAMES = 120; // each source clip is 4s @ 30fps

const LifestyleReel: React.FC = () => {
  let from = 0;
  return (
    <AbsoluteFill>
      {LIFESTYLE_CLIPS.map((c) => {
        const seq = (
          <Sequence key={c.src} from={from} durationInFrames={c.slotFrames}>
            <OffthreadVideo
              src={staticFile(c.src)}
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
            'linear-gradient(180deg, rgba(8,7,12,0.55) 0%, rgba(8,7,12,0.15) 30%, rgba(8,7,12,0.15) 60%, rgba(8,7,12,0.75) 100%)',
        }}
      />
    </AbsoluteFill>
  );
};

const FloatingCard: React.FC<{
  from: number;
  to: number;
  title: string;
  badge: string;
  voice: string;
  children: React.ReactNode;
}> = ({from, to, title, badge, voice, children}) => {
  const anim = useEnter(from, to);
  const frame = useCurrentFrame();
  if (frame < from || frame > to) return null;
  return (
    <AbsoluteFill style={{alignItems: 'flex-end', justifyContent: 'flex-end', padding: '0 90px 110px 0'}}>
      <Sequence from={from} durationInFrames={9000} layout="none">
        <Audio src={VOICE(voice)} />
      </Sequence>
      <div
        style={{
          opacity: anim.opacity,
          transform: `translateY(${anim.translateY}px) scale(${anim.scale})`,
        }}
      >
        <Glass width={440}>
          <CardHeader title={title} badge={badge} />
          {children}
        </Glass>
      </div>
    </AbsoluteFill>
  );
};

const Row: React.FC<{icon: string; label: string; detail: string}> = ({icon, label, detail}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      padding: '11px 4px',
    }}
  >
    <div style={{fontSize: 20, width: 26, textAlign: 'center'}}>{icon}</div>
    <div>
      <div style={{fontSize: 17, fontWeight: 700}}>{label}</div>
      <div style={{fontSize: 13.5, color: GRAY}}>{detail}</div>
    </div>
  </div>
);

// ── Section D: notification + dashboard (voiced) ────────────────────────────
const NotificationPop: React.FC<{from: number; to: number; voice: string}> = ({
  from,
  to,
  voice,
}) => {
  const anim = useEnter(from, to);
  const frame = useCurrentFrame();
  if (frame < from || frame > to) return null;
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'flex-start', paddingTop: '16%'}}>
      <Sequence from={from} durationInFrames={9000} layout="none">
        <Audio src={VOICE(voice)} />
      </Sequence>
      <div
        style={{
          opacity: anim.opacity,
          transform: `translateY(${anim.translateY}px) scale(${anim.scale})`,
        }}
      >
        <Glass width={560} style={{padding: '22px 30px'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
            <div style={{width: 40, height: 40, borderRadius: 12, overflow: 'hidden', flexShrink: 0}}>
              <Img
                src={staticFile('novaagents-helmet-icon.png')}
                style={{width: '100%', height: '100%', objectFit: 'cover'}}
              />
            </div>
            <div>
              <div style={{fontSize: 20, fontWeight: 800}}>Price Alert</div>
              <div style={{fontSize: 17, color: GRAY, marginTop: 2}}>SOL crossed your target.</div>
            </div>
          </div>
        </Glass>
      </div>
    </AbsoluteFill>
  );
};

const DashboardCard: React.FC<{from: number; voice: string}> = ({from, voice}) => {
  const anim = useEnter(from, null);
  const frame = useCurrentFrame();
  if (frame < from) return null;
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <Sequence from={from} durationInFrames={9000} layout="none">
        <Audio src={VOICE(voice)} />
      </Sequence>
      <div
        style={{
          opacity: anim.opacity,
          transform: `translateY(${anim.translateY}px) scale(${anim.scale})`,
        }}
      >
        <Glass width={560}>
          <CardHeader title="Price Alert" badge="Automations" />
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(22,199,132,0.14)',
              border: `1px solid rgba(22,199,132,0.5)`,
              borderRadius: 999,
              padding: '6px 14px',
              fontSize: 13,
              fontWeight: 700,
              color: GREEN,
              marginBottom: 16,
            }}
          >
            Active
          </div>
          <Row icon="✓" label="Last run successful" detail="SOL crossed $210" />
          <Row icon="⏱" label="Next run" detail="Today, 10:45" />
          <div style={{display: 'flex', gap: 12, marginTop: 18}}>
            <div
              style={{
                flex: 1,
                textAlign: 'center',
                borderRadius: 14,
                padding: '12px 0',
                background: PURPLE,
                fontSize: 15,
                fontWeight: 700,
              }}
            >
              Run now
            </div>
            <div
              style={{
                flex: 1,
                textAlign: 'center',
                borderRadius: 14,
                padding: '12px 0',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                fontSize: 15,
                fontWeight: 700,
                color: GRAY,
              }}
            >
              Disable
            </div>
          </div>
        </Glass>
      </div>
    </AbsoluteFill>
  );
};

// ── Section E: trust proof (silent) ─────────────────────────────────────────
const TrustProof: React.FC<{from: number}> = ({from}) => {
  const frame = useCurrentFrame();
  const local = frame - from;
  if (local < 0) return null;
  const {fps} = useVideoConfig();
  const templates = [
    {title: 'Price Alert', icon: '📈'},
    {title: 'Wallet Watch', icon: '👀'},
    {title: 'Watchlist Moves', icon: '⚡'},
  ];
  const textIn = interpolate(local, [40, 60], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column'}}>
      <div style={{display: 'flex', gap: 28}}>
        {templates.map((t, i) => {
          const p = spring({frame: local - i * 6, fps, config: {damping: 16, stiffness: 130}});
          return (
            <div
              key={t.title}
              style={{
                opacity: p,
                transform: `translateY(${(1 - p) * 24}px) scale(${0.9 + 0.1 * p})`,
              }}
            >
              <Glass width={230} style={{textAlign: 'center', padding: '30px 20px'}}>
                <div style={{fontSize: 32, marginBottom: 10}}>{t.icon}</div>
                <div style={{fontSize: 18, fontWeight: 700}}>{t.title}</div>
              </Glass>
            </div>
          );
        })}
      </div>
      <div
        style={{
          marginTop: 44,
          fontFamily: FONT,
          fontSize: 34,
          fontWeight: 800,
          color: TEXT,
          textAlign: 'center',
          opacity: textIn,
          transform: `translateY(${(1 - textIn) * 14}px)`,
        }}
      >
        Three templates.
        <br />
        None can move funds.
      </div>
    </AbsoluteFill>
  );
};

// ── Composition ──────────────────────────────────────────────────────────────
export const AutomationsHeroFilm: React.FC = () => {
  return (
    <AbsoluteFill style={{backgroundColor: BG}}>
      {/* A: hook, 0-90 (3.0s, silent) */}
      <Sequence from={0} durationInFrames={90}>
        <Headline text="Now your agent can follow through." from={0} to={48} />
        <RepeatedPrompt day="Mon" from={50} to={63} />
        <RepeatedPrompt day="Tue" from={64} to={77} />
        <RepeatedPrompt day="Wed" from={78} to={90} />
      </Sequence>

      {/* B: transformation, 90-399 (10.3s, voiced) */}
      <Sequence from={90} durationInFrames={309}>
        <ChatBubble text="Alert me if SOL crosses $210." who="user" from={0} to={30} />
        <ChatBubble
          text="Want me to keep watching?"
          who="agent"
          from={30}
          to={90}
          voice="v0-keep-watching.wav"
        />
        <TransformCard from={90} voice="v1-price-alert-setup.wav" />
      </Sequence>

      {/* C: lifestyle + product cards, 399-939 (18.0s, voiced) */}
      <Sequence from={399} durationInFrames={540}>
        <LifestyleReel />
        <FloatingCard
          from={0}
          to={135}
          title="Price Alert"
          badge="Automations"
          voice="v2-price-alert-active.wav"
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(22,199,132,0.14)',
              border: '1px solid rgba(22,199,132,0.5)',
              borderRadius: 999,
              padding: '8px 16px',
              fontSize: 15,
              fontWeight: 700,
              color: GREEN,
            }}
          >
            Active · Next check 10:30
          </div>
        </FloatingCard>
        <FloatingCard
          from={135}
          to={315}
          title="Wallet Watch"
          badge="Automations"
          voice="v3-wallet-watch.wav"
        >
          <div style={{fontSize: 15, color: GRAY, marginBottom: 8}}>Monitoring</div>
          <div style={{fontFamily: MONO, fontSize: 17, color: PURPLE_LIGHT, marginBottom: 12}}>
            0x7A4f…3C9e
          </div>
          <div style={{fontSize: 15, fontWeight: 600}}>Alert above $10,000</div>
        </FloatingCard>
        <FloatingCard
          from={315}
          to={540}
          title="Watchlist Moves"
          badge="Automations"
          voice="v4-watchlist-moves.wav"
        >
          <div style={{fontSize: 17, fontWeight: 700, marginBottom: 8}}>BTC · ETH · SOL</div>
          <div style={{fontSize: 15, color: GRAY}}>Flag moves above 10%</div>
        </FloatingCard>
      </Sequence>

      {/* D: notification + dashboard, 939-1260 (10.7s, voiced) */}
      <Sequence from={939} durationInFrames={321}>
        <NotificationPop from={0} to={113} voice="v5-notification.wav" />
        <DashboardCard from={118} voice="v6-dashboard.wav" />
      </Sequence>

      {/* E: trust proof, 1260-1380 (4.0s, silent) */}
      <Sequence from={1260} durationInFrames={120}>
        <TrustProof from={0} />
      </Sequence>

      {/* F: end card, 1380-1520 (4.7s, voiced) */}
      <Sequence from={1380} durationInFrames={140}>
        <Sequence from={10} durationInFrames={9000} layout="none">
          <Audio src={VOICE('v7-closing.wav')} />
        </Sequence>
        <EndCard
          endCard={{
            logo: 'nova-logo-white-on-purple.png',
            title: "You shouldn't have to ask twice.",
            brand: 'NovaAgents',
            tagline: 'Open Automations',
            url: 'example.com/agents',
            disclaimer: 'Cannot move funds · Not investment advice.',
            duration: 140,
          }}
        />
      </Sequence>
    </AbsoluteFill>
  );
};
