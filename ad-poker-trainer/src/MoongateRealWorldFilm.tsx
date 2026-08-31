import React from 'react';
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

const BG = '#08070c';
const PURPLE = '#8b5cf6';
const LILAC = '#c4b5fd';
const TEXT = '#faf8ff';
const MUTED = '#aaa5b3';
const GREEN = '#37d49a';
const FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif";
const MONO = "'SF Mono', ui-monospace, Menlo, monospace";
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const LIFE = (name: string) => staticFile(`footage/automations-hero/${name}`);
const STRESS = (name: string) => staticFile(`footage/signal-not-noise/${name}`);

export const MOONGATE_REAL_WORLD_TOTAL = 993;

const GateMark: React.FC<{size?: number; color?: string}> = ({size = 88, color = TEXT}) => (
  <svg width={size * 1.22} height={size} viewBox="8 27 60 48" fill="none">
    <g stroke={color} strokeWidth="7" strokeLinecap="round">
      <line x1="15" y1="68" x2="15" y2="35" />
      <path d="M 15 35 A 22.5 22.5 0 0 0 60 35" />
      <line x1="60" y1="35" x2="60" y2="68" />
    </g>
  </svg>
);

const Logo: React.FC = () => (
  <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
    <GateMark size={32} color={PURPLE} />
    <span style={{fontFamily: FONT, color: TEXT, fontSize: 29, fontWeight: 850, letterSpacing: -0.8}}>moongate</span>
  </div>
);

const FilmGrade: React.FC<{dark?: number}> = ({dark = 0.28}) => (
  <AbsoluteFill
    style={{
      background: `linear-gradient(90deg, rgba(8,7,12,${Math.min(0.82, dark + 0.38)}) 0%, rgba(8,7,12,${dark}) 46%, rgba(8,7,12,.1) 100%), radial-gradient(circle at 25% 48%, rgba(139,92,246,.22), transparent 55%)`,
    }}
  />
);

const StressOpen: React.FC = () => {
  const frame = useCurrentFrame();
  const cardWords = ['BROKER', 'EXCHANGE', 'MARKETS', 'BRIDGE'];
  const headline = interpolate(frame, [55, 72], [0, 1], clamp);
  return (
    <AbsoluteFill style={{backgroundColor: BG, overflow: 'hidden'}}>
      <Sequence from={0} durationInFrames={58}>
        <OffthreadVideo src={STRESS('screen-glow-face.mp4')} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      </Sequence>
      <Sequence from={58} durationInFrames={71}>
        <OffthreadVideo src={STRESS('hand-refresh.mp4')} muted startFrom={12} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      </Sequence>
      <AbsoluteFill style={{background: 'rgba(4,3,8,.38)'}} />
      {cardWords.map((word, i) => {
        const p = spring({frame: frame - i * 10, fps: 30, config: {damping: 15, stiffness: 165}});
        const positions = [[120, 130], [1390, 120], [145, 790], [1410, 800]];
        return (
          <div key={word} style={{position: 'absolute', left: positions[i][0], top: positions[i][1], width: 360, padding: '22px 26px', borderRadius: 20, background: 'rgba(14,12,20,.84)', border: '1px solid rgba(255,255,255,.17)', boxShadow: '0 24px 70px rgba(0,0,0,.6)', opacity: p, transform: `scale(${0.86 + 0.14 * p})`, fontFamily: MONO, color: i === 2 ? GREEN : LILAC, fontWeight: 900, fontSize: 19, letterSpacing: 2}}>
            {word}
            <div style={{height: 8, borderRadius: 8, background: 'rgba(255,255,255,.1)', marginTop: 16, overflow: 'hidden'}}><div style={{width: `${42 + i * 13}%`, height: '100%', background: i === 2 ? GREEN : PURPLE}} /></div>
          </div>
        );
      })}
      <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, color: TEXT, fontSize: 80, fontWeight: 950, letterSpacing: -3.5, textAlign: 'center', lineHeight: 0.98, textShadow: '0 5px 35px #000', opacity: headline}}>
        FOUR MARKETS.
        <br />
        FOUR APPS.
      </div>
    </AbsoluteFill>
  );
};

const OneBeat: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame, fps, config: {damping: 13, stiffness: 125}});
  const words = interpolate(frame, [23, 38], [0, 1], clamp);
  return (
    <AbsoluteFill style={{backgroundColor: BG, alignItems: 'center', justifyContent: 'center', overflow: 'hidden'}}>
      <div style={{position: 'absolute', width: 1300, height: 1300, borderRadius: 650, background: 'radial-gradient(circle, rgba(139,92,246,.3), transparent 66%)'}} />
      <div style={{transform: `scale(${0.55 + 0.45 * p})`, opacity: p}}><GateMark size={170} /></div>
      <div style={{position: 'absolute', top: 765, fontFamily: FONT, color: TEXT, fontWeight: 900, fontSize: 44, opacity: words}}>OR ONE.</div>
    </AbsoluteFill>
  );
};

const Thesis: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame, fps, config: {damping: 16, stiffness: 90}});
  return (
    <AbsoluteFill style={{backgroundColor: BG, alignItems: 'center', justifyContent: 'center', fontFamily: FONT}}>
      <div style={{position: 'absolute', width: 1500, height: 1500, borderRadius: 750, background: 'radial-gradient(circle, rgba(139,92,246,.27), transparent 64%)'}} />
      <div style={{position: 'absolute', top: 95, opacity: p}}><Logo /></div>
      <div style={{fontSize: 126, fontWeight: 950, letterSpacing: -6, lineHeight: 0.96, color: TEXT, textAlign: 'center', transform: `scale(${0.9 + 0.1 * p})`, opacity: p}}>
        Every market.
        <br />
        <span style={{color: LILAC}}>One gate.</span>
      </div>
    </AbsoluteFill>
  );
};

type FloatProductProps = {image: string; align: 'left' | 'right'; delay?: number; crop?: string};
const FloatProduct: React.FC<FloatProductProps> = ({image, align, delay = 14, crop = '50% 0%'}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - delay, fps, config: {damping: 17, stiffness: 110}});
  return (
    <div style={{position: 'absolute', zIndex: 4, top: 195, [align]: 80, width: 880, height: 570, borderRadius: 28, overflow: 'hidden', border: '1px solid rgba(255,255,255,.2)', background: '#0d0c11', boxShadow: '0 40px 110px rgba(0,0,0,.72), 0 0 75px rgba(139,92,246,.2)', opacity: p, transform: `translateX(${(1 - p) * (align === 'left' ? -50 : 50)}px) scale(${0.94 + 0.06 * p})`}}>
      <div style={{height: 36, display: 'flex', alignItems: 'center', gap: 7, padding: '0 15px', background: '#17131e'}}>
        {['#ff5f57', '#febc2e', '#28c840'].map((c) => <span key={c} style={{width: 9, height: 9, borderRadius: 7, background: c}} />)}
        <span style={{fontFamily: FONT, color: MUTED, fontSize: 12, marginLeft: 12}}>web.moongate.one</span>
      </div>
      <Img src={staticFile(image)} style={{width: '100%', height: 534, objectFit: 'cover', objectPosition: crop}} />
    </div>
  );
};

type LifeSceneProps = {video: string; eyebrow: string; line1: string; line2: string; product: React.ReactNode; copySide: 'left' | 'right'};
const LifeScene: React.FC<LifeSceneProps> = ({video, eyebrow, line1, line2, product, copySide}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - 5, fps, config: {damping: 18, stiffness: 100}});
  return (
    <AbsoluteFill style={{backgroundColor: BG, overflow: 'hidden'}}>
      <OffthreadVideo src={LIFE(video)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      <FilmGrade dark={copySide === 'left' ? 0.3 : 0.16} />
      <div style={{position: 'absolute', top: 66, left: 72, zIndex: 6}}><Logo /></div>
      {product}
      <div style={{position: 'absolute', zIndex: 6, top: 395, [copySide]: 90, width: 740, fontFamily: FONT, textAlign: copySide === 'right' ? 'right' : 'left', opacity: p, transform: `translateY(${(1 - p) * 24}px)`, textShadow: '0 5px 30px rgba(0,0,0,.7)'}}>
        <div style={{fontFamily: MONO, color: LILAC, fontWeight: 900, fontSize: 20, letterSpacing: 3, marginBottom: 14}}>{eyebrow}</div>
        <div style={{fontSize: 72, lineHeight: 0.98, letterSpacing: -3.2, color: TEXT, fontWeight: 950}}>{line1}<br /><span style={{color: LILAC}}>{line2}</span></div>
      </div>
    </AbsoluteFill>
  );
};

const PredictionCard: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - 14, fps, config: {damping: 16, stiffness: 115}});
  return (
    <div style={{position: 'absolute', zIndex: 4, left: 90, top: 260, width: 610, padding: 34, borderRadius: 28, background: 'linear-gradient(150deg, rgba(30,24,45,.96), rgba(11,10,15,.98))', border: '1px solid rgba(196,181,253,.3)', boxShadow: '0 40px 110px #000b, 0 0 70px rgba(139,92,246,.22)', opacity: p, transform: `translateX(${(1 - p) * -50}px)`, fontFamily: FONT}}>
      <div style={{fontFamily: MONO, color: GREEN, fontWeight: 900, fontSize: 16, letterSpacing: 2, marginBottom: 18}}>LIVE · CRYPTO</div>
      <div style={{fontSize: 34, fontWeight: 850, color: TEXT, lineHeight: 1.18}}>Will BTC close above $100k this year?</div>
      <div style={{display: 'flex', gap: 14, marginTop: 26}}>
        <div style={{flex: 1, padding: 18, borderRadius: 15, background: 'rgba(55,212,154,.17)', color: GREEN, textAlign: 'center', fontSize: 21, fontWeight: 900}}>YES · 64¢</div>
        <div style={{flex: 1, padding: 18, borderRadius: 15, background: 'rgba(255,255,255,.07)', color: MUTED, textAlign: 'center', fontSize: 21, fontWeight: 900}}>NO · 36¢</div>
      </div>
    </div>
  );
};

const ProductFlash: React.FC = () => {
  const frame = useCurrentFrame();
  const shots = [
    {from: 0, to: 44, image: 'mg-04-search.png', word: '12,000+ ASSETS'},
    {from: 44, to: 88, image: 'mg-06-txns.png', word: '20+ CHAINS'},
    {from: 88, to: 129, image: 'mg-01-home.png', word: 'ONE WALLET'},
  ];
  return (
    <AbsoluteFill style={{backgroundColor: BG, overflow: 'hidden'}}>
      {shots.map((shot) => frame >= shot.from && frame < shot.to ? (
        <AbsoluteFill key={shot.word}>
          <Img src={staticFile(shot.image)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
          <AbsoluteFill style={{background: 'rgba(5,4,8,.45)', alignItems: 'center', justifyContent: 'center'}}>
            <div style={{fontFamily: FONT, fontSize: 96, fontWeight: 950, color: TEXT, letterSpacing: -4, textShadow: '0 5px 35px #000'}}>{shot.word}</div>
          </AbsoluteFill>
        </AbsoluteFill>
      ) : null)}
    </AbsoluteFill>
  );
};

const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame, fps, config: {damping: 14, stiffness: 105}});
  const cta = interpolate(frame, [24, 38], [0, 1], clamp);
  return (
    <AbsoluteFill style={{backgroundColor: BG, alignItems: 'center', justifyContent: 'center', fontFamily: FONT}}>
      <div style={{position: 'absolute', width: 1500, height: 1500, borderRadius: 750, background: 'radial-gradient(circle, rgba(139,92,246,.3), transparent 65%)'}} />
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: p, transform: `scale(${0.88 + 0.12 * p})`}}>
        <GateMark size={115} />
        <div style={{fontSize: 108, lineHeight: 0.98, fontWeight: 950, letterSpacing: -5, color: TEXT, textAlign: 'center', marginTop: 25}}>Every market.<br /><span style={{color: LILAC}}>One gate.</span></div>
      </div>
      <div style={{marginTop: 34, padding: '16px 40px', borderRadius: 999, background: PURPLE, color: '#fff', fontSize: 28, fontWeight: 900, opacity: cta, transform: `translateY(${(1 - cta) * 15}px)`}}>moongate.one</div>
      <div style={{position: 'absolute', bottom: 30, color: '#5e5965', fontSize: 14, opacity: cta}}>Trading involves risk. Availability varies by region. Not investment advice.</div>
    </AbsoluteFill>
  );
};

export const MoongateRealWorldFilm: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: BG}}>
    <Audio src={staticFile('music-moongate.wav')} volume={0.84} />
    <Sequence from={0} durationInFrames={129}><StressOpen /></Sequence>
    <Sequence from={129} durationInFrames={66}><OneBeat /></Sequence>
    <Sequence from={195} durationInFrames={90}><Thesis /></Sequence>
    <Sequence from={285} durationInFrames={120}>
      <LifeScene video="s2-elevator.mp4" eyebrow="ONE WALLET" line1="ALL OF IT." line2="ONE BALANCE." copySide="left" product={<FloatProduct image="mg-01-home.png" align="right" />} />
    </Sequence>
    <Sequence from={405} durationInFrames={120}>
      <LifeScene video="s3-street.mp4" eyebrow="STOCKS + CRYPTO" line1="NVIDIA." line2="OR SOL." copySide="left" product={<FloatProduct image="mg-03-nvidia.png" align="right" />} />
    </Sequence>
    <Sequence from={525} durationInFrames={120}>
      <LifeScene video="s4-coffee.mp4" eyebrow="PREDICTIONS" line1="TRADE WHAT" line2="HAPPENS NEXT." copySide="right" product={<PredictionCard />} />
    </Sequence>
    <Sequence from={645} durationInFrames={120}>
      <LifeScene video="s5-commute.mp4" eyebrow="BASKETS" line1="BUY THE WHOLE" line2="NARRATIVE." copySide="right" product={<FloatProduct image="mg-05-baskets.png" align="left" />} />
    </Sequence>
    <Sequence from={765} durationInFrames={129}><ProductFlash /></Sequence>
    <Sequence from={894} durationInFrames={99}><EndCard /></Sequence>
  </AbsoluteFill>
);
