import React from 'react';
import {z} from 'zod';
import {
  AbsoluteFill,
  Audio,
  Easing,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

// ── Replicates the MoonAgents "feature tour" reference: deep-space starfield,
// centered bold intro card, an "EVERYTHING, ON COMMAND" eyebrow, app windows that
// fly in through 3D space to the left with a big caption on the right, and a
// centered MoonAgents logo lockup to close. ──────────────────────────────────

const FONT =
  "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif";
const BG = '#040307';
const TEXT = '#f5f3ff';
const PURPLE = '#b8a8fc';
const PURPLE_DEEP = '#7D00FF';
const GRAY = '#8c869c';

export const tourSchema = z.object({
  intro: z.object({
    line1: z.string(),
    line2: z.string(),
    duration: z.number().int().min(30),
  }),
  eyebrow: z.string(),
  scenes: z.array(
    z.object({
      img: z.string(),
      title: z.string(),
      sub: z.string(),
      focusY: z.string().optional(),
      duration: z.number().int().min(30),
    })
  ),
  endCard: z.object({
    brand: z.string(),
    url: z.string(),
    duration: z.number().int().min(30),
  }),
  music: z.string(),
});

export type TourProps = z.infer<typeof tourSchema>;

export const TOUR_DEFAULT: TourProps = {
  intro: {line1: 'All of MoonAgents,', line2: 'on command.', duration: 100},
  eyebrow: 'EVERYTHING, ON COMMAND',
  scenes: [
    {img: 'sc-hook.png', title: 'Just ask.', sub: 'in plain English', focusY: '50%', duration: 120},
    {img: 'wc-03-tracker.png', title: 'Track any market.', sub: 'live odds, on-chain', focusY: '0%', duration: 120},
    {img: 'sc-leaderboard.png', title: 'Find smart money.', sub: 'in real time', focusY: '12%', duration: 120},
    {img: '03-table.jpg', title: 'Or just play.', sub: 'a real app, in seconds', focusY: '15%', duration: 120},
  ],
  endCard: {brand: 'MoonAgents', url: 'moonpay.com/agents', duration: 100},
  music: 'music-tour.wav',
};

export const tourDuration = (p: TourProps) =>
  p.intro.duration + p.scenes.reduce((a, s) => a + s.duration, 0) + p.endCard.duration;

// ── Deterministic starfield (seeded so stars don't flicker between frames) ──
const mulberry32 = (seed: number) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const STARS = (() => {
  const rnd = mulberry32(20260617);
  return Array.from({length: 180}, () => ({
    x: rnd() * 100,
    y: rnd() * 100,
    r: 0.5 + rnd() * 1.6,
    o: 0.15 + rnd() * 0.7,
    tw: rnd() * Math.PI * 2,
  }));
})();

const Starfield: React.FC = () => {
  const frame = useCurrentFrame();
  const drift = frame * 0.18; // slow downward parallax
  return (
    <AbsoluteFill style={{backgroundColor: BG}}>
      {/* central purple nebula glow */}
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(circle at 50% 42%, rgba(40,18,78,0.95) 0%, rgba(23,14,44,0.55) 26%, rgba(4,3,7,0) 60%)',
        }}
      />
      {STARS.map((s, i) => {
        const twinkle = 0.55 + 0.45 * Math.sin(frame * 0.05 + s.tw);
        const y = (s.y + drift / 10) % 100;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${s.x}%`,
              top: `${y}%`,
              width: s.r,
              height: s.r,
              borderRadius: '50%',
              backgroundColor: '#ffffff',
              opacity: s.o * twinkle,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

const Eyebrow: React.FC<{text: string; frame: number}> = ({text, frame}) => {
  const o = interpolate(frame, [0, 14], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <div
      style={{
        position: 'absolute',
        top: 92,
        left: 0,
        right: 0,
        textAlign: 'center',
        fontFamily: FONT,
        fontSize: 23,
        fontWeight: 600,
        letterSpacing: 8,
        color: GRAY,
        opacity: o * 0.85,
      }}
    >
      {text}
    </div>
  );
};

const Intro: React.FC<{intro: TourProps['intro']}> = ({intro}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const out = interpolate(frame, [intro.duration - 16, intro.duration], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const p = spring({frame, fps, config: {damping: 200, stiffness: 60}});
  const in1 = interpolate(frame, [6, 24], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const in2 = interpolate(frame, [16, 34], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const scale = 0.94 + p * 0.06;
  return (
    <AbsoluteFill style={{opacity: out, alignItems: 'center', justifyContent: 'center'}}>
      <div style={{fontFamily: FONT, textAlign: 'center', transform: `scale(${scale})`}}>
        <div
          style={{
            fontSize: 96,
            fontWeight: 800,
            color: TEXT,
            letterSpacing: -2,
            lineHeight: 1.05,
            opacity: in1,
            transform: `translateY(${(1 - in1) * 22}px)`,
          }}
        >
          {intro.line1}
        </div>
        <div
          style={{
            fontSize: 96,
            fontWeight: 800,
            color: PURPLE,
            letterSpacing: -2,
            lineHeight: 1.05,
            opacity: in2,
            transform: `translateY(${(1 - in2) * 22}px)`,
          }}
        >
          {intro.line2}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const FeatureScene: React.FC<{scene: TourProps['scenes'][number]; eyebrow: string}> = ({
  scene,
  eyebrow,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const dur = scene.duration;
  const fade = interpolate(frame, [0, 12, dur - 12, dur], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // window 3D fly-in
  const p = spring({frame, fps, config: {damping: 200, stiffness: 55}});
  const scale = 0.82 + p * 0.18 + frame * 0.00018;
  const rotateY = (1 - p) * 9 + 3.5;
  const tx = (1 - p) * 170;
  const winOpacity = interpolate(frame, [0, 14], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  // caption
  const tIn = interpolate(frame, [14, 32], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const sIn = interpolate(frame, [24, 42], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill style={{opacity: fade}}>
      <Eyebrow text={eyebrow} frame={frame} />
      {/* app window, flown in from the right, resting left, with 3D perspective */}
      <div style={{position: 'absolute', left: 150, top: 300, width: 860, height: 500, perspective: 1700}}>
        <div
          style={{
            width: '100%',
            height: '100%',
            transform: `translateX(${tx}px) scale(${scale}) rotateY(-${rotateY}deg)`,
            transformOrigin: 'center right',
            opacity: winOpacity,
            borderRadius: 18,
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.10)',
            boxShadow: '0 50px 140px rgba(0,0,0,0.7), 0 0 90px rgba(125,0,255,0.18)',
            backgroundColor: '#0c0b12',
          }}
        >
          <Img
            src={staticFile(scene.img)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: `50% ${scene.focusY ?? '50%'}`,
            }}
          />
        </div>
      </div>
      {/* caption right */}
      <div
        style={{
          position: 'absolute',
          left: 1090,
          top: 0,
          bottom: 0,
          width: 720,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          fontFamily: FONT,
        }}
      >
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: TEXT,
            letterSpacing: -1.5,
            lineHeight: 1.04,
            opacity: tIn,
            transform: `translateY(${(1 - tIn) * 20}px)`,
          }}
        >
          {scene.title}
        </div>
        <div
          style={{
            marginTop: 22,
            fontSize: 30,
            fontWeight: 500,
            color: GRAY,
            opacity: sIn,
            transform: `translateY(${(1 - sIn) * 16}px)`,
          }}
        >
          {scene.sub}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const LogoLockup: React.FC<{endCard: TourProps['endCard']}> = ({endCard}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const inAll = interpolate(frame, [0, 14], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const p = spring({frame, fps, config: {damping: 16, stiffness: 110}});
  const urlIn = interpolate(frame, [16, 32], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: inAll, fontFamily: FONT}}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 24,
          transform: `scale(${0.92 + p * 0.08})`,
        }}
      >
        {/* MoonPay glyph: big circle + small circle */}
        <div style={{position: 'relative', width: 66, height: 66}}>
          <div style={{position: 'absolute', left: 0, bottom: 0, width: 52, height: 52, borderRadius: '50%', backgroundColor: '#fff'}} />
          <div style={{position: 'absolute', right: 0, top: 0, width: 24, height: 24, borderRadius: '50%', backgroundColor: '#fff'}} />
        </div>
        <div style={{fontSize: 72, fontWeight: 700, color: TEXT, letterSpacing: -1}}>{endCard.brand}</div>
      </div>
      <div
        style={{
          marginTop: 30,
          fontSize: 32,
          fontWeight: 600,
          color: PURPLE,
          opacity: urlIn,
          transform: `translateY(${(1 - urlIn) * 12}px)`,
        }}
      >
        {endCard.url}
      </div>
    </AbsoluteFill>
  );
};

export const FeatureTour: React.FC<TourProps> = (props) => {
  let cursor = props.intro.duration;
  return (
    <AbsoluteFill style={{backgroundColor: BG}}>
      <Starfield />
      <Audio src={staticFile(props.music)} />
      <Sequence durationInFrames={props.intro.duration}>
        <Intro intro={props.intro} />
      </Sequence>
      {props.scenes.map((scene, idx) => {
        const from = cursor;
        cursor += scene.duration;
        return (
          <Sequence key={`${scene.img}-${idx}`} from={from} durationInFrames={scene.duration}>
            <FeatureScene scene={scene} eyebrow={props.eyebrow} />
          </Sequence>
        );
      })}
      <Sequence from={cursor} durationInFrames={props.endCard.duration}>
        <LogoLockup endCard={props.endCard} />
      </Sequence>
    </AbsoluteFill>
  );
};
