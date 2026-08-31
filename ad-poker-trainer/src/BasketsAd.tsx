import React from 'react';
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

// Moongate "Baskets" spotlight — single feature, problem → solution.
// Matches the moongate launch look (MoongateAd): dark bg, purple glow, bold sans,
// browser-window scenes, gate-mark end card.

const FONT =
  "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif";
const BG = '#08070c';
const PURPLE = '#a78bfa';
const PURPLE_DEEP = '#8B5CF6';
const TEXT = '#f5f3ff';
const SUB = '#9d9aa8';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const sceneFade = (frame: number, d: number) =>
  interpolate(frame, [0, 10, d - 10, d], [0, 1, 1, 0], clamp);

const Wordmark: React.FC<{size?: number}> = ({size = 54}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: size * 0.26, fontFamily: FONT}}>
    <svg width={size * 1.18} height={size * 0.82} viewBox="11.5 32.5 52 36" fill="none">
      <g stroke={PURPLE_DEEP} strokeWidth={6.5} strokeLinecap="round" fill="none">
        <line x1="15" y1="65" x2="15" y2="36" />
        <path d="M 15 36 A 22.5 22.5 0 0 0 60 36" />
        <line x1="60" y1="36" x2="60" y2="65" />
      </g>
    </svg>
    <div style={{fontSize: size, fontWeight: 800, color: TEXT, letterSpacing: -size * 0.02}}>
      moongate
    </div>
  </div>
);

// ---------------------------------------------------------------- hook ------
const HOOK_D = 100;
const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const opacity = sceneFade(frame, HOOK_D);
  // beat 1: the pain (fades out); beat 2: the solution (springs in)
  const painOut = interpolate(frame, [40, 52], [1, 0], clamp);
  const painUp = interpolate(frame, [0, 18], [0, 1], clamp);
  const solIn = spring({frame: frame - 50, fps, config: {damping: 16, stiffness: 110}});
  const solShow = frame >= 48 ? 1 : 0;
  return (
    <AbsoluteFill style={{backgroundColor: BG, opacity, fontFamily: FONT, alignItems: 'center', justifyContent: 'center'}}>
      <div style={{position: 'absolute', width: 1500, height: 1500, background: 'radial-gradient(circle, rgba(139,92,246,0.18) 0%, rgba(139,92,246,0) 60%)'}} />
      {frame < 52 ? (
        <div style={{fontSize: 66, fontWeight: 700, color: SUB, textAlign: 'center', letterSpacing: -1, opacity: painOut * painUp, transform: `translateY(${(1 - painUp) * 18}px)`}}>
          Tired of picking winners?
        </div>
      ) : (
        <div style={{textAlign: 'center', opacity: solShow, transform: `scale(${0.9 + solIn * 0.1})`}}>
          <div style={{fontSize: 104, fontWeight: 800, color: TEXT, letterSpacing: -3, lineHeight: 1.04}}>
            Buy the
            <br />
            <span style={{color: PURPLE}}>whole narrative.</span>
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};

// --------------------------------------------------------------- scenes -----
type Scene = {img: string; kicker: string; caption: string; sub?: string; focusY: string; duration: number};
const SCENES: Scene[] = [
  {
    img: 'bk-list.jpg',
    kicker: 'Baskets',
    caption: 'Curated narratives.\nOne tap.',
    sub: 'AI, frontier tech, sovereign crypto — ready to buy.',
    focusY: '0%',
    duration: 110,
  },
  {
    img: 'bk-detail.png',
    kicker: 'The Compute Stack',
    caption: "See what's inside.",
    sub: 'NVIDIA · OpenAI · Anthropic · xAI · Render',
    focusY: '46%',
    duration: 115,
  },
  {
    img: 'bk-invest.png',
    kicker: 'One tap',
    caption: 'Buy the mix instantly.',
    sub: 'A ready-made portfolio. Network fees covered from your SOL.',
    focusY: '12%',
    duration: 110,
  },
  {
    img: 'bk-positions.png',
    kicker: 'Set & forget',
    caption: 'It rebalances itself.',
    sub: 'Auto-rebalance holds your target mix — every month.',
    focusY: '6%',
    duration: 120,
  },
];

const SceneView: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const opacity = sceneFade(frame, scene.duration);
  const slide = spring({frame, fps, config: {damping: 200, stiffness: 60}});
  const zoom = interpolate(frame, [0, scene.duration], [1.04, 1.1], {easing: Easing.out(Easing.quad)});
  return (
    <AbsoluteFill style={{backgroundColor: BG, opacity, fontFamily: FONT}}>
      <div style={{position: 'absolute', width: 1500, height: 1500, left: -460, top: -420, background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, rgba(139,92,246,0) 60%)'}} />
      <div style={{position: 'absolute', left: 110, top: 60, opacity: slide, transform: `translateY(${(1 - slide) * 26}px)`}}>
        <div style={{fontSize: 24, fontWeight: 700, color: PURPLE, letterSpacing: 4, textTransform: 'uppercase', marginBottom: 12}}>
          {scene.kicker}
        </div>
        <div style={{fontSize: 58, fontWeight: 800, color: TEXT, letterSpacing: -1.5, lineHeight: 1.05, whiteSpace: 'pre-line'}}>
          {scene.caption}
        </div>
        {scene.sub ? <div style={{fontSize: 26, fontWeight: 500, color: SUB, marginTop: 14}}>{scene.sub}</div> : null}
      </div>
      <div
        style={{
          position: 'absolute',
          left: 230,
          top: 272,
          width: 1460,
          borderRadius: 20,
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.10)',
          boxShadow: '0 40px 120px rgba(0,0,0,0.65), 0 0 90px rgba(139,92,246,0.14)',
          backgroundColor: '#101014',
          transform: `scale(${0.98 + slide * 0.02})`,
          transformOrigin: '50% 0%',
        }}
      >
        <div style={{height: 48, background: '#15121f', display: 'flex', alignItems: 'center', padding: '0 22px', gap: 9, borderBottom: '1px solid rgba(255,255,255,0.06)'}}>
          <div style={{width: 13, height: 13, borderRadius: 7, background: '#ff5f57'}} />
          <div style={{width: 13, height: 13, borderRadius: 7, background: '#febc2e'}} />
          <div style={{width: 13, height: 13, borderRadius: 7, background: '#28c840'}} />
          <div style={{marginLeft: 26, padding: '7px 22px', borderRadius: 9, background: '#0d0b14', fontSize: 17, fontWeight: 600, color: SUB}}>
            moongate.one
          </div>
        </div>
        <div style={{height: 738, overflow: 'hidden'}}>
          <Img
            src={staticFile(scene.img)}
            style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: `50% ${scene.focusY}`, transform: `scale(${zoom})`, transformOrigin: `50% ${scene.focusY}`}}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};

// -------------------------------------------------------------- end card ----
const END_D = 105;
const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const opacity = interpolate(frame, [0, 10], [0, 1], clamp);
  const pop = spring({frame, fps, config: {damping: 14, stiffness: 120}});
  const subIn = interpolate(frame, [18, 34], [0, 1], clamp);
  return (
    <AbsoluteFill style={{backgroundColor: BG, opacity, fontFamily: FONT, alignItems: 'center', justifyContent: 'center'}}>
      <div style={{position: 'absolute', width: 1600, height: 1600, background: 'radial-gradient(circle, rgba(139,92,246,0.22) 0%, rgba(139,92,246,0) 60%)'}} />
      <div style={{fontSize: 116, fontWeight: 800, color: TEXT, letterSpacing: -3, textAlign: 'center', lineHeight: 1.06, transform: `scale(${0.9 + pop * 0.1})`}}>
        Buy the narrative.
      </div>
      <div style={{marginTop: 44, opacity: subIn}}>
        <Wordmark size={44} />
      </div>
      <div
        style={{
          marginTop: 40,
          padding: '20px 54px',
          borderRadius: 999,
          border: `2px solid ${PURPLE_DEEP}`,
          background: 'rgba(139,92,246,0.14)',
          fontSize: 38,
          fontWeight: 700,
          color: TEXT,
          letterSpacing: 0.5,
          opacity: subIn,
          transform: `translateY(${(1 - subIn) * 16}px)`,
        }}
      >
        moongate.one
      </div>
      <div style={{position: 'absolute', bottom: 44, fontSize: 18, color: '#55525e', opacity: subIn}}>
        Trading involves risk. Availability varies by region. Not investment advice.
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- root ------
export const BASKETS_TOTAL = HOOK_D + SCENES.reduce((a, s) => a + s.duration, 0) + END_D;

export const BasketsAd: React.FC = () => {
  let cursor = HOOK_D;
  return (
    <AbsoluteFill style={{backgroundColor: BG}}>
      <Audio src={staticFile('music-baskets.wav')} />
      <Sequence durationInFrames={HOOK_D}>
        <Hook />
      </Sequence>
      {SCENES.map((scene, i) => {
        const from = cursor;
        cursor += scene.duration;
        return (
          <Sequence key={`${scene.img}-${i}`} from={from} durationInFrames={scene.duration}>
            <SceneView scene={scene} />
          </Sequence>
        );
      })}
      <Sequence from={cursor} durationInFrames={END_D}>
        <EndCard />
      </Sequence>
    </AbsoluteFill>
  );
};
