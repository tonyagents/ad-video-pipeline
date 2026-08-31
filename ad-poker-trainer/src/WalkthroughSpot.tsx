import React from 'react';
import {z} from 'zod';
import {
  AbsoluteFill,
  Audio,
  Img,
  OffthreadVideo,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

// ── "Cinematic product walkthrough" engine ──────────────────────────────────
// Full-frame graded talking-head footage as the scene; liquid-glass MoonAgents
// UI cards float into the negative space, timed to the exact word spoken. Apple
// / visionOS / Anthropic-keynote feel. One props file (a "spot") per feature.

const FONT =
  "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif";
const MONO = "'SF Mono', ui-monospace, 'JetBrains Mono', Menlo, monospace";
const TEXT = '#f5f3ff';
const PURPLE = '#b8a8fc';
const PURPLE_DEEP = '#7D00FF';
const GRAY = '#9b95ad';
const GREEN = '#4ade80';
const BG = '#040307';

// ── Props ────────────────────────────────────────────────────────────────────
const anchorEnum = z.enum([
  'topLeft',
  'left',
  'topCenter',
  'topRight',
  'right',
  'bottomLeft',
  'center',
]);

const rowSchema = z.object({
  label: z.string(),
  detail: z.string().optional(),
  icon: z.string().optional(), // emoji or short glyph
  at: z.number(), // seconds, when this row checks in
});

const cardSchema = z.object({
  id: z.string(),
  kind: z.enum([
    'automations',
    'wallet',
    'buy',
    'virtualAccount',
    'kyc',
    'watchlist',
    'screenshot',
    'note',
  ]),
  anchor: anchorEnum,
  at: z.number(), // appear (seconds)
  until: z.number().optional(), // leave (seconds); default = end
  width: z.number().optional(),
  tilt: z.number().optional(), // degrees rotateY, default small
  title: z.string().optional(),
  subtitle: z.string().optional(),
  src: z.string().optional(), // for screenshot
  focusY: z.string().optional(),
  rows: z.array(rowSchema).optional(),
  body: z.string().optional(), // for note
});

const lowerThirdSchema = z.object({
  at: z.number(),
  until: z.number().optional(),
  text: z.string(),
  sub: z.string().optional(),
});

export const spotSchema = z.object({
  video: z.string(),
  durationInFrames: z.number().int(),
  music: z.string().optional(),
  kicker: z.string(), // eyebrow, top-center
  scrim: z.enum(['left', 'top', 'right', 'none']).default('left'),
  cards: z.array(cardSchema),
  lowerThirds: z.array(lowerThirdSchema).default([]),
  endCard: z.object({
    at: z.number(),
    headline: z.string(),
    url: z.string().default('moonpay.com/agents'),
  }),
});

export type SpotProps = z.infer<typeof spotSchema>;
type CardProps = z.infer<typeof cardSchema>;

// ── Animation helpers ─────────────────────────────────────────────────────────
const useEnter = (appearFrame: number, leaveFrame: number | null) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const local = frame - appearFrame;
  const p = spring({frame: local, fps, config: {damping: 18, stiffness: 90, mass: 0.9}});
  const inOpacity = interpolate(local, [0, 12], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  let opacity = inOpacity;
  let exitShift = 0;
  if (leaveFrame !== null) {
    const out = interpolate(frame, [leaveFrame - 12, leaveFrame], [1, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    opacity *= out;
    exitShift = (1 - out) * -16;
  }
  const translateY = (1 - p) * 26 + exitShift;
  const scale = 0.92 + p * 0.08;
  const blur = interpolate(local, [0, 14], [10, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  // gentle float
  const bob = Math.sin((frame + appearFrame) * 0.035) * 4;
  return {opacity, translateY: translateY + bob, scale, blur, local, p};
};

const ANCHORS: Record<string, React.CSSProperties> = {
  topLeft: {top: 70, left: 80},
  left: {top: 300, left: 80},
  topCenter: {top: 70, left: 660},
  topRight: {top: 70, right: 90},
  right: {top: 280, right: 90},
  bottomLeft: {bottom: 90, left: 80},
  center: {top: 360, left: 660},
};

// ── The frosted-glass shell every card lives in ───────────────────────────────
const Glass: React.FC<{
  width: number;
  tilt: number;
  anim: ReturnType<typeof useEnter>;
  anchor: string;
  children: React.ReactNode;
  accent?: boolean;
}> = ({width, tilt, anim, anchor, children, accent}) => {
  return (
    <div
      style={{
        position: 'absolute',
        ...ANCHORS[anchor],
        width,
        perspective: 1600,
        opacity: anim.opacity,
        filter: anim.blur > 0.2 ? `blur(${anim.blur}px)` : undefined,
      }}
    >
      <div
        style={{
          transform: `translateY(${anim.translateY}px) scale(${anim.scale}) rotateY(${tilt}deg)`,
          transformOrigin: 'center center',
          borderRadius: 24,
          padding: 22,
          background:
            'linear-gradient(160deg, rgba(34,26,54,0.58) 0%, rgba(12,10,22,0.66) 100%)',
          border: '1px solid rgba(255,255,255,0.14)',
          boxShadow: `inset 0 1px 0 rgba(255,255,255,0.28), inset 0 0 30px rgba(184,168,252,0.06), 0 30px 90px rgba(0,0,0,0.55), 0 0 70px rgba(125,0,255,${accent ? 0.28 : 0.16})`,
          backdropFilter: 'blur(22px) saturate(150%)',
          WebkitBackdropFilter: 'blur(22px) saturate(150%)',
          fontFamily: FONT,
          color: TEXT,
          overflow: 'hidden',
        }}
      >
        {/* top specular sheen */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 70,
            background:
              'linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0))',
            pointerEvents: 'none',
          }}
        />
        {children}
      </div>
    </div>
  );
};

// shared header
const CardHeader: React.FC<{title: string; subtitle?: string; glyph?: React.ReactNode}> = ({
  title,
  subtitle,
  glyph,
}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16}}>
    <div
      style={{
        width: 34,
        height: 34,
        borderRadius: 10,
        background: 'linear-gradient(135deg, #7D00FF, #b8a8fc)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 18,
        boxShadow: '0 0 18px rgba(125,0,255,0.5)',
      }}
    >
      {glyph ?? '◆'}
    </div>
    <div>
      <div style={{fontSize: 22, fontWeight: 700, letterSpacing: -0.4}}>{title}</div>
      {subtitle && (
        <div style={{fontSize: 14, color: GRAY, fontWeight: 500, marginTop: 1}}>{subtitle}</div>
      )}
    </div>
  </div>
);

// row that "checks in" at a given local frame
const CheckRow: React.FC<{
  row: z.infer<typeof rowSchema>;
  appearFrame: number;
  fps: number;
}> = ({row, appearFrame, fps}) => {
  const frame = useCurrentFrame();
  const rowAppear = Math.round(row.at * fps);
  const local = frame - rowAppear;
  const p = spring({frame: local, fps, config: {damping: 16, stiffness: 120}});
  const op = interpolate(local, [0, 8], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const check = interpolate(local, [4, 16], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '13px 14px',
        marginTop: 10,
        borderRadius: 14,
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.08)',
        opacity: op,
        transform: `translateX(${(1 - p) * 18}px)`,
      }}
    >
      <div style={{fontSize: 20, width: 26, textAlign: 'center'}}>{row.icon ?? '⚡'}</div>
      <div style={{flex: 1}}>
        <div style={{fontSize: 17, fontWeight: 600}}>{row.label}</div>
        {row.detail && <div style={{fontSize: 13, color: GRAY, marginTop: 2}}>{row.detail}</div>}
      </div>
      <div
        style={{
          width: 24,
          height: 24,
          borderRadius: '50%',
          background: check > 0.5 ? GREEN : 'rgba(255,255,255,0.10)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 13,
          color: '#04140a',
          fontWeight: 800,
          opacity: check,
          transform: `scale(${0.6 + check * 0.4})`,
        }}
      >
        ✓
      </div>
    </div>
  );
};

const chip = (text: string, color = PURPLE): React.CSSProperties => ({});

const Chip: React.FC<{children: React.ReactNode; tone?: 'purple' | 'green' | 'gray'}> = ({
  children,
  tone = 'purple',
}) => {
  const colors = {
    purple: {bg: 'rgba(125,0,255,0.18)', fg: PURPLE, bd: 'rgba(184,168,252,0.35)'},
    green: {bg: 'rgba(74,222,128,0.14)', fg: GREEN, bd: 'rgba(74,222,128,0.35)'},
    gray: {bg: 'rgba(255,255,255,0.07)', fg: GRAY, bd: 'rgba(255,255,255,0.12)'},
  }[tone];
  return (
    <span
      style={{
        fontSize: 12.5,
        fontWeight: 600,
        padding: '4px 10px',
        borderRadius: 999,
        background: colors.bg,
        color: colors.fg,
        border: `1px solid ${colors.bd}`,
        letterSpacing: 0.2,
      }}
    >
      {children}
    </span>
  );
};

// ── Mocked MoonAgents UI per card kind ────────────────────────────────────────
const CardBody: React.FC<{card: CardProps}> = ({card}) => {
  const {fps} = useVideoConfig();
  const frame = useCurrentFrame();
  const appearFrame = Math.round(card.at * fps);

  switch (card.kind) {
    case 'automations':
      return (
        <>
          <CardHeader title={card.title ?? 'Automations'} subtitle={card.subtitle ?? 'Always on'} glyph="⚙︎" />
          {(card.rows ?? []).map((r) => (
            <CheckRow key={r.label} row={r} appearFrame={appearFrame} fps={fps} />
          ))}
        </>
      );

    case 'wallet':
      return (
        <>
          <CardHeader title={card.title ?? 'Wallet created'} subtitle={card.subtitle ?? 'on your computer'} glyph="🔑" />
          <div style={{display: 'flex', gap: 8, marginBottom: 14}}>
            <Chip tone="green">Stored locally</Chip>
            <Chip>Your keys</Chip>
            <Chip tone="gray">Self-custody</Chip>
          </div>
          <div
            style={{
              fontFamily: MONO,
              fontSize: 15,
              color: PURPLE,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 12,
              padding: '12px 14px',
              letterSpacing: 0.5,
            }}
          >
            0x7a4f…3c9e
          </div>
        </>
      );

    case 'buy':
      return (
        <>
          <CardHeader title={card.title ?? 'Buy crypto'} subtitle={card.subtitle ?? 'funded with MoonPay'} glyph="＄" />
          {[
            {s: 'USDC', n: 'US Dollar Coin', c: '#2775ca', a: '$250.00'},
            {s: 'BTC', n: 'Bitcoin', c: '#f7931a', a: '0.0021'},
            {s: 'ETH', n: 'Ethereum', c: '#627eea', a: '0.14'},
            {s: 'SOL', n: 'Solana', c: '#14f195', a: '3.20'},
          ].map((t, i) => {
            const local = frame - appearFrame - i * 4;
            const op = interpolate(local, [0, 8], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
            return (
              <div
                key={t.s}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '11px 12px',
                  marginTop: 9,
                  borderRadius: 13,
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  opacity: op,
                  transform: `translateY(${(1 - op) * 10}px)`,
                }}
              >
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: '50%',
                    background: t.c,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    fontWeight: 800,
                    color: '#fff',
                  }}
                >
                  {t.s[0]}
                </div>
                <div style={{flex: 1}}>
                  <div style={{fontSize: 16, fontWeight: 700}}>{t.s}</div>
                  <div style={{fontSize: 12.5, color: GRAY}}>{t.n}</div>
                </div>
                <div style={{fontSize: 15, fontWeight: 600, color: TEXT}}>{t.a}</div>
              </div>
            );
          })}
        </>
      );

    case 'virtualAccount':
      return (
        <>
          <CardHeader title={card.title ?? 'Virtual account'} subtitle={card.subtitle ?? 'USD / EUR → stablecoins'} glyph="🏦" />
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 16px',
              borderRadius: 14,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <div>
              <div style={{fontSize: 12.5, color: GRAY}}>Account</div>
              <div style={{fontFamily: MONO, fontSize: 16, fontWeight: 600}}>•••• 4921</div>
            </div>
            <div style={{fontSize: 22, color: PURPLE}}>→</div>
            <div style={{textAlign: 'right'}}>
              <div style={{fontSize: 12.5, color: GRAY}}>Lands as</div>
              <div style={{fontSize: 16, fontWeight: 700, color: GREEN}}>USDC</div>
            </div>
          </div>
          <div style={{display: 'flex', gap: 8, marginTop: 14}}>
            <Chip tone="green">Direct deposit</Chip>
            <Chip>Paycheck → wallet</Chip>
          </div>
        </>
      );

    case 'kyc':
      return (
        <>
          <CardHeader title={card.title ?? 'Verify identity'} subtitle={card.subtitle ?? 'one-time KYC'} glyph="🪪" />
          {['Identity', 'Document', 'Bank account'].map((s, i) => {
            const local = frame - appearFrame - i * 9;
            const done = interpolate(local, [6, 18], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
            const op = interpolate(local, [0, 8], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
            return (
              <div key={s} style={{display: 'flex', alignItems: 'center', gap: 12, marginTop: 11, opacity: op}}>
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    background: done > 0.5 ? GREEN : 'rgba(255,255,255,0.12)',
                    color: '#04140a',
                    fontSize: 12,
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {done > 0.5 ? '✓' : ''}
                </div>
                <div style={{fontSize: 16, fontWeight: 600}}>{s}</div>
              </div>
            );
          })}
        </>
      );

    case 'watchlist':
      return (
        <>
          <CardHeader title={card.title ?? 'Watchlist'} subtitle={card.subtitle ?? 'auto-updating'} glyph="★" />
          {[
            {s: 'SOL', n: 'Solana', p: '+4.2%', up: true},
            {s: 'RENDER', n: 'Render', p: '+11.8%', up: true},
            {s: 'TIA', n: 'Celestia', p: '-2.1%', up: false},
            {s: 'JUP', n: 'Jupiter', p: '+6.5%', up: true},
          ].map((t, i) => {
            const local = frame - appearFrame - i * 5;
            const op = interpolate(local, [0, 8], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
            return (
              <div
                key={t.s}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 12px',
                  marginTop: 8,
                  borderRadius: 12,
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  opacity: op,
                  transform: `translateX(${(1 - op) * 16}px)`,
                }}
              >
                <div style={{flex: 1}}>
                  <div style={{fontSize: 16, fontWeight: 700}}>{t.s}</div>
                  <div style={{fontSize: 12, color: GRAY}}>{t.n}</div>
                </div>
                {/* tiny sparkline */}
                <svg width="58" height="22" viewBox="0 0 58 22">
                  <polyline
                    points={t.up ? '0,18 14,12 28,14 42,6 58,2' : '0,6 14,10 28,8 42,15 58,18'}
                    fill="none"
                    stroke={t.up ? GREEN : '#f87171'}
                    strokeWidth="2"
                  />
                </svg>
                <div style={{fontSize: 14, fontWeight: 700, color: t.up ? GREEN : '#f87171', width: 56, textAlign: 'right'}}>
                  {t.p}
                </div>
              </div>
            );
          })}
        </>
      );

    case 'note':
      return (
        <>
          {card.title && <CardHeader title={card.title} subtitle={card.subtitle} />}
          <div style={{fontSize: 18, lineHeight: 1.45, color: TEXT, fontWeight: 500}}>{card.body}</div>
        </>
      );

    case 'screenshot':
      return (
        <div style={{margin: -22, borderRadius: 24, overflow: 'hidden'}}>
          <Img
            src={staticFile(card.src!)}
            style={{
              display: 'block',
              width: '100%',
              objectFit: 'cover',
              objectPosition: `50% ${card.focusY ?? '50%'}`,
            }}
          />
        </div>
      );

    default:
      return null;
  }
};

const Card: React.FC<{card: CardProps}> = ({card}) => {
  const {fps} = useVideoConfig();
  const frame = useCurrentFrame();
  const appearFrame = Math.round(card.at * fps);
  const leaveFrame = card.until ? Math.round(card.until * fps) : null;
  const anim = useEnter(appearFrame, leaveFrame);
  // gate AFTER all hooks have run (rules of hooks)
  if (frame < appearFrame) return null;
  if (leaveFrame !== null && frame > leaveFrame) return null;
  const width = card.width ?? 360;
  const defaultTilt = card.anchor.includes('Right') || card.anchor === 'right' ? 5 : -5;
  return (
    <Glass
      width={width}
      tilt={card.tilt ?? defaultTilt}
      anim={anim}
      anchor={card.anchor}
      accent={card.kind === 'automations' || card.kind === 'buy'}
    >
      <CardBody card={card} />
    </Glass>
  );
};

// ── Eyebrow (feature kicker, top center) ──────────────────────────────────────
const Kicker: React.FC<{text: string; endAt: number}> = ({text, endAt}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const o = interpolate(frame, [10, 26], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const out = interpolate(frame, [endAt * fps - 16, endAt * fps], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <div
      style={{
        position: 'absolute',
        top: 54,
        left: 0,
        right: 0,
        textAlign: 'center',
        fontFamily: FONT,
        fontSize: 20,
        fontWeight: 700,
        letterSpacing: 7,
        color: PURPLE,
        opacity: o * out * 0.92,
        textShadow: '0 2px 20px rgba(0,0,0,0.6)',
      }}
    >
      {text}
    </div>
  );
};

// ── Lower-third caption ───────────────────────────────────────────────────────
const LowerThird: React.FC<{lt: z.infer<typeof lowerThirdSchema>}> = ({lt}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const a = lt.at * fps;
  const u = (lt.until ?? lt.at + 3) * fps;
  if (frame < a || frame > u) return null;
  const op = interpolate(frame, [a, a + 10, u - 10, u], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const rise = interpolate(frame, [a, a + 14], [22, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <div
      style={{
        position: 'absolute',
        left: 80,
        bottom: 80,
        maxWidth: 900,
        opacity: op,
        transform: `translateY(${rise}px)`,
        fontFamily: FONT,
      }}
    >
      <div style={{fontSize: 52, fontWeight: 800, letterSpacing: -1.2, color: TEXT, lineHeight: 1.05, textShadow: '0 4px 30px rgba(0,0,0,0.7)', whiteSpace: 'pre-line'}}>
        {lt.text}
      </div>
      {lt.sub && (
        <div style={{marginTop: 12, fontSize: 24, fontWeight: 500, color: PURPLE, textShadow: '0 2px 16px rgba(0,0,0,0.7)'}}>
          {lt.sub}
        </div>
      )}
    </div>
  );
};

// ── Scrim that darkens negative space so glass cards pop ───────────────────────
const Scrim: React.FC<{side: SpotProps['scrim']}> = ({side}) => {
  if (side === 'none') return null;
  const dir = {
    left: 'to right',
    right: 'to left',
    top: 'to bottom',
  }[side];
  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(${dir}, rgba(4,3,7,0.72) 0%, rgba(4,3,7,0.34) 34%, rgba(4,3,7,0) 60%)`,
      }}
    />
  );
};

// ── End-card lockup (footage dims behind) ─────────────────────────────────────
const EndLockup: React.FC<{endCard: SpotProps['endCard']; startFrame: number}> = ({
  endCard,
  startFrame,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const local = frame - startFrame;
  if (local < 0) return null;
  const dim = interpolate(local, [0, 18], [0, 0.92], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const inAll = interpolate(local, [8, 24], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const p = spring({frame: local - 8, fps, config: {damping: 16, stiffness: 110}});
  const urlIn = interpolate(local, [22, 40], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const headIn = interpolate(local, [14, 30], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <>
      {/* solid dark blanket — guarantees footage + cards fully disappear */}
      <AbsoluteFill style={{backgroundColor: '#040307', opacity: interpolate(local, [0, 18], [0, 0.97], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}} />
      {/* purple nebula glow on top */}
      <AbsoluteFill
        style={{
          background: 'radial-gradient(circle at 50% 45%, rgba(40,18,78,0.95) 0%, rgba(23,14,44,0.5) 32%, rgba(4,3,7,0) 64%)',
          opacity: dim / 0.92,
        }}
      />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: inAll, fontFamily: FONT}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 22, transform: `scale(${0.92 + p * 0.08})`}}>
          {/* MoonPay glyph */}
          <div style={{position: 'relative', width: 60, height: 60}}>
            <div style={{position: 'absolute', left: 0, bottom: 0, width: 48, height: 48, borderRadius: '50%', backgroundColor: '#fff'}} />
            <div style={{position: 'absolute', right: 0, top: 0, width: 22, height: 22, borderRadius: '50%', backgroundColor: '#fff'}} />
          </div>
          <div style={{fontSize: 66, fontWeight: 700, color: TEXT, letterSpacing: -1}}>MoonAgents</div>
        </div>
        <div
          style={{
            marginTop: 26,
            fontSize: 40,
            fontWeight: 800,
            color: TEXT,
            letterSpacing: -1,
            opacity: headIn,
            transform: `translateY(${(1 - headIn) * 14}px)`,
            textAlign: 'center',
            maxWidth: 1100,
          }}
        >
          {endCard.headline}
        </div>
        <div
          style={{
            marginTop: 22,
            fontSize: 30,
            fontWeight: 600,
            color: PURPLE,
            opacity: urlIn,
            transform: `translateY(${(1 - urlIn) * 12}px)`,
          }}
        >
          {endCard.url}
        </div>
      </AbsoluteFill>
    </>
  );
};

// ── Composition ───────────────────────────────────────────────────────────────
export const WalkthroughSpot: React.FC<SpotProps> = (props) => {
  return (
    <AbsoluteFill style={{backgroundColor: BG}}>
      <OffthreadVideo src={staticFile(props.video)} volume={1} />
      <Scrim side={props.scrim} />
      {props.music && <Audio src={staticFile(props.music)} volume={0.1} />}
      <Kicker text={props.kicker} endAt={props.endCard.at} />
      {props.cards.map((c) => (
        <Card key={c.id} card={c} />
      ))}
      {props.lowerThirds.map((lt, i) => (
        <LowerThird key={i} lt={lt} />
      ))}
      <EndLockup endCard={props.endCard} startFrame={Math.round(props.endCard.at * 30)} />
    </AbsoluteFill>
  );
};
