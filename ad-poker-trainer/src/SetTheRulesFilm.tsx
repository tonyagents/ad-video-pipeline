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

// SET THE RULES — trust/control companion film. Spine: a top-up NovaAgents
// prepares but a human must approve before any Nova-rails execution.
// 0-3s balance watch -> 3-6s prepared -> 6-8s ready/pause -> 8-9.2s approve ->
// 9.2-12.2s topped up -> 12.2-16.2s daily summary -> 16.2-22.7s end card.
// 22.7s total @ 30fps = 681 frames.

const FONT =
  "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif";
const PURPLE = '#7D00FF';
const PURPLE_LIGHT = '#b8a8fc';
const GREEN = '#16c784';
const TEXT = '#f5f3ff';
const GRAY = '#9d9aa8';
const BG = '#08070c';

const AUDIO = (name: string) => staticFile(`audio/set-the-rules/${name}`);
const LIFESTYLE = (name: string) => staticFile(`footage/automations-hero/${name}`);

export const SET_THE_RULES_TOTAL = 681; // 22.7s @ 30fps

const useEnter = (appearFrame: number, leaveFrame: number | null = null) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const local = frame - appearFrame;
  const p = spring({frame: local, fps, config: {damping: 16, stiffness: 120}});
  let opacity = interpolate(local, [0, 10], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  if (leaveFrame !== null) {
    const out = interpolate(frame, [leaveFrame - 10, leaveFrame], [1, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    opacity *= out;
  }
  return {opacity, translateY: (1 - p) * 26, scale: 0.92 + p * 0.08};
};

const Glass: React.FC<{children: React.ReactNode; width?: number; style?: React.CSSProperties}> = ({
  children,
  width = 480,
  style,
}) => (
  <div
    style={{
      width,
      borderRadius: 26,
      padding: '28px 32px',
      background: 'linear-gradient(160deg, rgba(34,26,54,0.72) 0%, rgba(12,10,22,0.8) 100%)',
      border: '1px solid rgba(255,255,255,0.14)',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.25), 0 24px 80px rgba(0,0,0,0.5), 0 0 60px rgba(125,0,255,0.18)',
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

const HelmetBadge: React.FC<{size?: number}> = ({size = 34}) => (
  <div style={{width: size, height: size, borderRadius: size * 0.3, overflow: 'hidden', flexShrink: 0}}>
    <Img src={staticFile('novaagents-helmet-icon.png')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
  </div>
);

const CardHeader: React.FC<{title: string; kicker?: string}> = ({title, kicker}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16}}>
    <HelmetBadge />
    <div style={{fontSize: 20, fontWeight: 700}}>{title}</div>
    {kicker ? <div style={{marginLeft: 'auto', fontSize: 13, fontWeight: 600, color: GRAY}}>{kicker}</div> : null}
  </div>
);

const Btn: React.FC<{children: React.ReactNode; tone: 'fill' | 'outline'; pressed?: boolean}> = ({
  children,
  tone,
  pressed,
}) => (
  <div
    style={{
      flex: 1,
      textAlign: 'center',
      borderRadius: 14,
      padding: '13px 0',
      fontSize: 15,
      fontWeight: 700,
      transform: pressed ? 'scale(0.94)' : 'scale(1)',
      transition: 'none',
      background: tone === 'fill' ? PURPLE : 'rgba(255,255,255,0.06)',
      border: tone === 'fill' ? 'none' : '1px solid rgba(255,255,255,0.14)',
      color: tone === 'fill' ? 'white' : GRAY,
      boxShadow: tone === 'fill' && pressed ? '0 0 26px rgba(125,0,255,0.7)' : undefined,
    }}
  >
    {children}
  </div>
);

const Backdrop: React.FC<{clip: string}> = ({clip}) => (
  <AbsoluteFill>
    <OffthreadVideo src={LIFESTYLE(clip)} muted style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.4)'}} />
    <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(8,7,12,0.5) 0%, rgba(8,7,12,0.25) 50%, rgba(8,7,12,0.6) 100%)'}} />
  </AbsoluteFill>
);

// ── Phase 0: Balance Watch (0-90f) ──────────────────────────────────────────
const BalanceWatch: React.FC = () => {
  const anim = useEnter(0, null);
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <Backdrop clip="s3-street.mp4" />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
        <div style={{opacity: anim.opacity, transform: `translateY(${anim.translateY}px) scale(${anim.scale})`}}>
          <Glass>
            <CardHeader title="Balance Watch" kicker="Automations" />
            <div style={{fontSize: 17, color: GRAY, marginBottom: 6}}>Running low on USDC</div>
            <div style={{fontSize: 26, fontWeight: 800, marginBottom: 20}}>$50 top-up ready</div>
            <div style={{display: 'flex', gap: 12}}>
              <Btn tone="fill">Review</Btn>
              <Btn tone="outline">Not now</Btn>
            </div>
          </Glass>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── Phase 1: Prepared (90-180f, voiced) ─────────────────────────────────────
const Prepared: React.FC = () => {
  const anim = useEnter(0, null);
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <Audio src={AUDIO('v0-prepared.wav')} />
      <Backdrop clip="s3-street.mp4" />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
        <div style={{opacity: anim.opacity, transform: `translateY(${anim.translateY}px) scale(${anim.scale})`}}>
          <Glass>
            <CardHeader title="Balance Watch" kicker="Human approval required" />
            <div style={{fontSize: 26, fontWeight: 800, marginBottom: 8}}>I&rsquo;ve prepared a $50 top-up</div>
            <div style={{fontSize: 15, color: GRAY}}>USDC · via Nova</div>
          </Glass>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── Phase 2: Ready / pause (180-240f, voiced) ───────────────────────────────
const ReadyPause: React.FC = () => {
  const anim = useEnter(0, null);
  const frame = useCurrentFrame();
  const pulse = 0.6 + 0.4 * Math.abs(Math.sin(frame * 0.12));
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <Audio src={AUDIO('v1-ready.wav')} />
      <Backdrop clip="s3-street.mp4" />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
        <div style={{opacity: anim.opacity, transform: `translateY(${anim.translateY}px) scale(${anim.scale})`}}>
          <Glass>
            <CardHeader title="Balance Watch" />
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginBottom: 18,
                fontSize: 14,
                fontWeight: 700,
                color: PURPLE_LIGHT,
                letterSpacing: 0.3,
              }}
            >
              <div style={{width: 8, height: 8, borderRadius: 4, background: PURPLE_LIGHT, opacity: pulse}} />
              WAITING FOR YOUR APPROVAL
            </div>
            <div style={{fontSize: 26, fontWeight: 800, marginBottom: 20}}>Ready when you are.</div>
            <div style={{display: 'flex', gap: 12}}>
              <Btn tone="fill">Approve</Btn>
              <Btn tone="outline">Not now</Btn>
            </div>
          </Glass>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── Phase 3: Approve tap (240-276f) ─────────────────────────────────────────
const ApproveTap: React.FC = () => {
  const frame = useCurrentFrame();
  const pressed = frame >= 8 && frame < 20;
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      {frame === 8 ? <Audio src={AUDIO('confirm-chime.wav')} /> : null}
      <Backdrop clip="s3-street.mp4" />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
        <Glass>
          <CardHeader title="Balance Watch" />
          <div style={{fontSize: 26, fontWeight: 800, marginBottom: 20}}>Ready when you are.</div>
          <div style={{display: 'flex', gap: 12}}>
            <Btn tone="fill" pressed={pressed}>
              Approve
            </Btn>
            <Btn tone="outline">Not now</Btn>
          </div>
        </Glass>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── Phase 4: Topped up (276-366f, voiced) ───────────────────────────────────
const ToppedUp: React.FC = () => {
  const {fps} = useVideoConfig();
  const frame = useCurrentFrame();
  const p = spring({frame, fps, config: {damping: 15, stiffness: 130}});
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <Audio src={AUDIO('v2-topped-up.wav')} />
      <Backdrop clip="s4-coffee.mp4" />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
        <div style={{opacity: p, transform: `scale(${0.88 + 0.12 * p}) translateY(${(1 - p) * 24}px)`}}>
          <Glass>
            <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: 'rgba(22,199,132,0.16)',
                  border: `1px solid ${GREEN}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 22,
                  color: GREEN,
                  flexShrink: 0,
                }}
              >
                ✓
              </div>
              <div>
                <div style={{fontSize: 22, fontWeight: 800}}>You&rsquo;re topped up</div>
                <div style={{fontSize: 16, color: GRAY, marginTop: 2}}>$50 USDC added · approved by you</div>
              </div>
            </div>
          </Glass>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── Phase 5: Daily summary (366-486f, voiced) ───────────────────────────────
const Row: React.FC<{children: React.ReactNode; strong?: boolean}> = ({children, strong}) => (
  <div style={{fontSize: strong ? 18 : 16, fontWeight: strong ? 800 : 600, color: strong ? TEXT : GRAY, padding: '5px 0'}}>
    {children}
  </div>
);

const DailySummary: React.FC = () => {
  const anim = useEnter(0, null);
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <Audio src={AUDIO('v3-only-approved.wav')} />
      <Backdrop clip="s4-coffee.mp4" />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
        <div style={{opacity: anim.opacity, transform: `translateY(${anim.translateY}px) scale(${anim.scale})`}}>
          <Glass width={520}>
            <CardHeader title="Today" kicker="Summary" />
            <Row>32 checks completed</Row>
            <Row>1 price alert</Row>
            <Row>1 wallet move worth flagging</Row>
            <Row>1 top-up prepared</Row>
            <Row>1 approved by you</Row>
            <div style={{height: 1, background: 'rgba(255,255,255,0.1)', margin: '10px 0'}} />
            <Row strong>Only the action you approved was executed.</Row>
          </Glass>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── Composition ──────────────────────────────────────────────────────────────
export const SetTheRulesFilm: React.FC = () => {
  return (
    <AbsoluteFill style={{backgroundColor: BG}}>
      <Sequence from={0} durationInFrames={90}>
        <BalanceWatch />
      </Sequence>
      <Sequence from={90} durationInFrames={90}>
        <Prepared />
      </Sequence>
      <Sequence from={180} durationInFrames={60}>
        <ReadyPause />
      </Sequence>
      <Sequence from={240} durationInFrames={36}>
        <ApproveTap />
      </Sequence>
      <Sequence from={276} durationInFrames={90}>
        <ToppedUp />
      </Sequence>
      <Sequence from={366} durationInFrames={120}>
        <DailySummary />
      </Sequence>
      <Sequence from={486} durationInFrames={195}>
        <Sequence from={8} durationInFrames={9000} layout="none">
          <Audio src={AUDIO('v4-closing.wav')} />
        </Sequence>
        <EndCard
          endCard={{
            logo: 'nova-logo-white-on-purple.png',
            title: 'Your agent keeps watch.',
            brand: 'NovaAgents',
            tagline: 'You decide when money moves.',
            url: 'example.com/agents',
            disclaimer: 'Every Nova-rails action requires your approval.',
            duration: 195,
          }}
        />
      </Sequence>
    </AbsoluteFill>
  );
};
