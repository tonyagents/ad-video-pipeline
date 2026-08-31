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

// MOONGATE — EVERY MARKET. ONE GATE.
// Product-led launch film based on the live site and the current application UI.

const BG = '#08070c';
const PANEL = '#111016';
const PURPLE = '#8b5cf6';
const LILAC = '#c4b5fd';
const TEXT = '#f7f5fb';
const MUTED = '#9a96a3';
const GREEN = '#34d399';
const FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif";
const MONO = "'SF Mono', ui-monospace, Menlo, monospace";
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

export const MOONGATE_ONE_GATE_TOTAL = 993; // 33.1s; matches music-moongate.wav

const fade = (frame: number, duration: number, edge = 10) =>
  interpolate(frame, [0, edge, duration - edge, duration], [0, 1, 1, 0], clamp);

const GateMark: React.FC<{size?: number; color?: string}> = ({size = 88, color = TEXT}) => (
  <svg width={size * 1.22} height={size} viewBox="8 27 60 48" fill="none">
    <g stroke={color} strokeWidth="7" strokeLinecap="round">
      <line x1="15" y1="68" x2="15" y2="35" />
      <path d="M 15 35 A 22.5 22.5 0 0 0 60 35" />
      <line x1="60" y1="35" x2="60" y2="68" />
    </g>
  </svg>
);

const Glow: React.FC<{x?: number; y?: number; size?: number; opacity?: number}> = ({
  x = 960,
  y = 540,
  size = 1300,
  opacity = 0.2,
}) => (
  <div
    style={{
      position: 'absolute',
      left: x - size / 2,
      top: y - size / 2,
      width: size,
      height: size,
      borderRadius: '50%',
      background: `radial-gradient(circle, rgba(139,92,246,${opacity}) 0%, rgba(139,92,246,0) 66%)`,
    }}
  />
);

const Brand: React.FC<{size?: number}> = ({size = 42}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 12, fontFamily: FONT}}>
    <GateMark size={size * 0.9} color={PURPLE} />
    <span style={{fontSize: size, fontWeight: 800, color: TEXT, letterSpacing: -1}}>moongate</span>
  </div>
);

const AppTile: React.FC<{
  title: string;
  sub: string;
  accent: string;
  x: number;
  y: number;
  rotate: number;
  delay: number;
}> = ({title, sub, accent, x, y, rotate, delay}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enter = spring({frame: frame - delay, fps, config: {damping: 15, stiffness: 170}});
  const jitter = Math.sin((frame + delay) * 0.22) * 3;
  return (
    <div
      style={{
        position: 'absolute',
        left: 960 + x,
        top: 540 + y,
        width: 420,
        height: 190,
        padding: 28,
        borderRadius: 26,
        background: 'linear-gradient(155deg, rgba(30,28,38,.96), rgba(12,11,16,.98))',
        border: '1px solid rgba(255,255,255,.13)',
        boxShadow: '0 35px 90px rgba(0,0,0,.55)',
        transform: `translate(-50%,-50%) rotate(${rotate + jitter * 0.08}deg) scale(${0.78 + 0.22 * enter})`,
        opacity: enter,
      }}
    >
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <div style={{fontFamily: MONO, color: accent, fontWeight: 800, fontSize: 17, letterSpacing: 2}}>{title}</div>
        <div style={{width: 11, height: 11, borderRadius: 10, background: accent, boxShadow: `0 0 20px ${accent}`}} />
      </div>
      <div style={{height: 48, marginTop: 22, display: 'flex', alignItems: 'end', gap: 8}}>
        {[30, 42, 24, 49, 34, 58, 44, 66, 57, 72].map((h, i) => (
          <div key={i} style={{height: h * 0.62, flex: 1, borderRadius: 6, background: `${accent}55`}} />
        ))}
      </div>
      <div style={{fontFamily: FONT, fontSize: 21, fontWeight: 650, color: MUTED, marginTop: 18}}>{sub}</div>
    </div>
  );
};

const Fragmentation: React.FC<{duration: number}> = ({duration}) => {
  const frame = useCurrentFrame();
  const opacity = fade(frame, duration);
  const headline = interpolate(frame, [54, 74], [0, 1], clamp);
  return (
    <AbsoluteFill style={{backgroundColor: BG, opacity, overflow: 'hidden'}}>
      <Glow opacity={0.12} />
      <AppTile title="BROKER" sub="Stocks live here" accent="#60a5fa" x={-490} y={-235} rotate={-6} delay={0} />
      <AppTile title="EXCHANGE" sub="Crypto lives here" accent="#a78bfa" x={500} y={-220} rotate={5} delay={8} />
      <AppTile title="MARKETS" sub="Predictions live here" accent="#34d399" x={-500} y={225} rotate={4} delay={16} />
      <AppTile title="BRIDGE" sub="Chains live over here" accent="#f59e0b" x={500} y={230} rotate={-5} delay={24} />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: FONT,
          fontSize: 64,
          fontWeight: 900,
          letterSpacing: -2.5,
          color: TEXT,
          opacity: headline,
          textAlign: 'center',
          lineHeight: 1.02,
          textShadow: '0 5px 35px #000',
        }}
      >
        MARKETS WERE
        <br />
        BUILT APART.
      </div>
    </AbsoluteFill>
  );
};

const GateCollapse: React.FC<{duration: number}> = ({duration}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame, fps, config: {damping: 18, stiffness: 105}});
  const line = interpolate(frame, [25, 45], [0, 1], clamp);
  return (
    <AbsoluteFill style={{backgroundColor: BG, fontFamily: FONT, alignItems: 'center', justifyContent: 'center', overflow: 'hidden'}}>
      <Glow opacity={0.25 + p * 0.08} size={1200} />
      {[[-600, -230], [610, -210], [-620, 230], [620, 220]].map(([x, y], i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: 960,
            top: 540,
            width: 230,
            height: 90,
            borderRadius: 18,
            border: '1px solid rgba(255,255,255,.15)',
            background: '#17141f',
            transform: `translate(-50%,-50%) translate(${x * (1 - p)}px,${y * (1 - p)}px) scale(${1 - p * 0.7})`,
            opacity: 1 - p,
          }}
        />
      ))}
      <div style={{transform: `scale(${0.7 + p * 0.3})`, opacity: p}}>
        <GateMark size={150} color={TEXT} />
      </div>
      <div style={{position: 'absolute', top: 745, fontSize: 38, fontWeight: 700, color: MUTED, opacity: line}}>
        So why trade like they still are?
      </div>
    </AbsoluteFill>
  );
};

const Thesis: React.FC<{duration: number}> = ({duration}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pop = spring({frame, fps, config: {damping: 16, stiffness: 95}});
  const chips = ['CRYPTO', 'STOCKS', 'PREDICTIONS', 'BASKETS'];
  return (
    <AbsoluteFill style={{backgroundColor: BG, opacity: fade(frame, duration), fontFamily: FONT, alignItems: 'center', justifyContent: 'center'}}>
      <Glow opacity={0.27} />
      <div style={{position: 'absolute', top: 120, opacity: pop}}><Brand size={38} /></div>
      <div style={{fontSize: 120, fontWeight: 900, color: TEXT, letterSpacing: -5, lineHeight: 0.98, textAlign: 'center', transform: `scale(${0.92 + 0.08 * pop})`}}>
        Every market.
        <br />
        <span style={{color: LILAC}}>One gate.</span>
      </div>
      <div style={{position: 'absolute', bottom: 140, display: 'flex', gap: 18}}>
        {chips.map((chip, i) => {
          const chipIn = spring({frame: frame - 24 - i * 6, fps, config: {damping: 17, stiffness: 150}});
          return (
            <div key={chip} style={{padding: '14px 22px', borderRadius: 999, border: '1px solid rgba(196,181,253,.35)', background: 'rgba(139,92,246,.12)', fontFamily: MONO, color: LILAC, fontWeight: 800, fontSize: 18, letterSpacing: 1.5, opacity: chipIn, transform: `translateY(${(1 - chipIn) * 18}px)`}}>
              {chip}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

type ProductSceneProps = {
  duration: number;
  image: string;
  eyebrow: string;
  headline: React.ReactNode;
  sub: string;
  focus?: string;
  children?: React.ReactNode;
};

const ProductScene: React.FC<ProductSceneProps> = ({duration, image, eyebrow, headline, sub, focus = '50% 0%', children}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const opacity = fade(frame, duration, 9);
  const enter = spring({frame, fps, config: {damping: 19, stiffness: 90}});
  const zoom = interpolate(frame, [0, duration], [1.015, 1.07], {easing: Easing.out(Easing.quad)});
  return (
    <AbsoluteFill style={{backgroundColor: BG, opacity, overflow: 'hidden', fontFamily: FONT}}>
      <Glow x={340} y={300} size={1200} opacity={0.17} />
      <div style={{position: 'absolute', left: 92, top: 64, zIndex: 3, opacity: enter, transform: `translateY(${(1 - enter) * 26}px)`}}>
        <div style={{fontFamily: MONO, fontSize: 20, fontWeight: 800, letterSpacing: 3, color: LILAC, marginBottom: 12}}>{eyebrow}</div>
        <div style={{fontSize: 58, fontWeight: 900, color: TEXT, letterSpacing: -2, lineHeight: 1.05}}>{headline}</div>
        <div style={{fontSize: 25, fontWeight: 520, color: MUTED, marginTop: 13}}>{sub}</div>
      </div>
      <div style={{position: 'absolute', left: 205, top: 250, width: 1510, height: 760, borderRadius: 24, overflow: 'hidden', border: '1px solid rgba(255,255,255,.13)', background: PANEL, boxShadow: '0 45px 120px rgba(0,0,0,.62), 0 0 100px rgba(139,92,246,.13)', transform: `scale(${0.985 + enter * 0.015})`, transformOrigin: '50% 0%'}}>
        <div style={{height: 46, display: 'flex', alignItems: 'center', padding: '0 20px', gap: 9, background: '#15121d', borderBottom: '1px solid rgba(255,255,255,.06)'}}>
          {['#ff5f57', '#febc2e', '#28c840'].map((c) => <div key={c} style={{width: 12, height: 12, borderRadius: 8, background: c}} />)}
          <div style={{marginLeft: 20, padding: '7px 22px', borderRadius: 9, background: '#0c0b10', color: MUTED, fontSize: 16}}>web.moongate.one</div>
        </div>
        <div style={{height: 714, overflow: 'hidden'}}>
          <Img src={staticFile(image)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: focus, transform: `scale(${zoom})`, transformOrigin: focus}} />
        </div>
      </div>
      {children}
    </AbsoluteFill>
  );
};

const PayCard: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - 34, fps, config: {damping: 15, stiffness: 170}});
  return (
    <div style={{position: 'absolute', right: 120, top: 106, zIndex: 5, width: 320, padding: '20px 24px', borderRadius: 22, background: 'rgba(15,13,22,.93)', border: '1px solid rgba(255,255,255,.16)', boxShadow: '0 24px 70px #0009', opacity: p, transform: `translateY(${(1 - p) * 24}px)`, fontFamily: FONT}}>
      <div style={{fontSize: 14, color: MUTED, marginBottom: 8}}>PAY WITH</div>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <div style={{fontSize: 26, fontWeight: 800, color: TEXT}}> Pay</div>
        <div style={{fontSize: 15, color: GREEN, fontWeight: 800}}>ONCHAIN ↗</div>
      </div>
    </div>
  );
};

const MarketLayer: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - 42, fps, config: {damping: 16, stiffness: 140}});
  return (
    <div style={{position: 'absolute', right: 95, top: 78, zIndex: 5, width: 430, padding: 24, borderRadius: 24, background: 'linear-gradient(150deg, rgba(30,24,45,.96), rgba(11,10,15,.98))', border: '1px solid rgba(196,181,253,.25)', boxShadow: '0 28px 90px #000b, 0 0 50px rgba(139,92,246,.18)', opacity: p, transform: `translateX(${(1 - p) * 35}px)`, fontFamily: FONT}}>
      <div style={{display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16}}>
        <span style={{fontFamily: MONO, color: GREEN, fontSize: 14, fontWeight: 900, letterSpacing: 2}}>LIVE MARKET</span>
        <span style={{marginLeft: 'auto', color: MUTED, fontSize: 14}}>Crypto</span>
      </div>
      <div style={{fontSize: 23, fontWeight: 800, color: TEXT, lineHeight: 1.25}}>Will BTC close above $100k this year?</div>
      <div style={{display: 'flex', gap: 12, marginTop: 18}}>
        <div style={{flex: 1, padding: 13, borderRadius: 13, background: 'rgba(52,211,153,.15)', color: GREEN, fontWeight: 850, textAlign: 'center'}}>YES · 64¢</div>
        <div style={{flex: 1, padding: 13, borderRadius: 13, background: 'rgba(255,255,255,.06)', color: MUTED, fontWeight: 850, textAlign: 'center'}}>NO · 36¢</div>
      </div>
    </div>
  );
};

const ChainRibbon: React.FC = () => {
  const frame = useCurrentFrame();
  const names = ['ETHEREUM', 'SOLANA', 'BASE', 'ARBITRUM', 'BITCOIN'];
  return (
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 52, display: 'flex', justifyContent: 'center', gap: 18, zIndex: 5}}>
      {names.map((name, i) => {
        const p = interpolate(frame, [26 + i * 5, 38 + i * 5], [0, 1], clamp);
        return <div key={name} style={{padding: '13px 20px', borderRadius: 999, background: 'rgba(12,10,18,.88)', border: '1px solid rgba(196,181,253,.28)', fontFamily: MONO, fontWeight: 800, color: i === 1 ? LILAC : MUTED, fontSize: 15, letterSpacing: 1, opacity: p, transform: `translateY(${(1 - p) * 14}px)`}}>{name}</div>;
      })}
    </div>
  );
};

const Proof: React.FC<{duration: number}> = ({duration}) => {
  const frame = useCurrentFrame();
  const items = [
    ['12,000+', 'assets'],
    ['20+', 'chains'],
    ['1', 'wallet'],
  ];
  return (
    <AbsoluteFill style={{backgroundColor: BG, opacity: fade(frame, duration), alignItems: 'center', justifyContent: 'center', fontFamily: FONT}}>
      <Glow opacity={0.24} />
      <div style={{display: 'flex', gap: 110}}>
        {items.map(([n, label], i) => {
          const p = interpolate(frame, [8 + i * 8, 26 + i * 8], [0, 1], clamp);
          return (
            <div key={label} style={{width: 330, textAlign: 'center', opacity: p, transform: `translateY(${(1 - p) * 25}px)`}}>
              <div style={{fontSize: 100, lineHeight: 1, color: i === 2 ? LILAC : TEXT, fontWeight: 900, letterSpacing: -4}}>{n}</div>
              <div style={{fontFamily: MONO, color: MUTED, fontSize: 19, fontWeight: 800, letterSpacing: 3, marginTop: 18, textTransform: 'uppercase'}}>{label}</div>
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', bottom: 130, fontSize: 29, fontWeight: 650, color: MUTED}}>No bridges. No seed phrases. No market left behind.</div>
    </AbsoluteFill>
  );
};

const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame, fps, config: {damping: 14, stiffness: 100}});
  const sub = interpolate(frame, [22, 38], [0, 1], clamp);
  return (
    <AbsoluteFill style={{backgroundColor: BG, alignItems: 'center', justifyContent: 'center', fontFamily: FONT}}>
      <Glow opacity={0.3} />
      <div style={{transform: `scale(${0.88 + 0.12 * p})`, opacity: p, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <GateMark size={125} />
        <div style={{fontSize: 112, fontWeight: 900, color: TEXT, letterSpacing: -5, textAlign: 'center', lineHeight: 0.98, marginTop: 30}}>Every market.<br /><span style={{color: LILAC}}>One gate.</span></div>
      </div>
      <div style={{marginTop: 38, padding: '17px 42px', borderRadius: 999, background: PURPLE, color: '#fff', fontSize: 30, fontWeight: 850, opacity: sub, transform: `translateY(${(1 - sub) * 16}px)`}}>moongate.one</div>
      <div style={{position: 'absolute', bottom: 34, color: '#5f5a67', fontSize: 15, opacity: sub}}>Trading involves risk. Availability varies by region. Not investment advice.</div>
    </AbsoluteFill>
  );
};

export const MoongateOneGateFilm: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: BG}}>
    <Audio src={staticFile('music-moongate.wav')} volume={0.94} />
    <Sequence from={0} durationInFrames={135}><Fragmentation duration={135} /></Sequence>
    <Sequence from={135} durationInFrames={60}><GateCollapse duration={60} /></Sequence>
    <Sequence from={195} durationInFrames={105}><Thesis duration={105} /></Sequence>
    <Sequence from={300} durationInFrames={145}>
      <ProductScene duration={145} image="mg-01-home.png" eyebrow="ONE WALLET" headline={<>Your whole portfolio.<br /><span style={{color: LILAC}}>One screen.</span></>} sub="Crypto, stocks, and everything between." />
    </Sequence>
    <Sequence from={445} durationInFrames={130}>
      <ProductScene duration={130} image="mg-03-nvidia.png" eyebrow="STOCKS + CRYPTO" headline={<>Wall Street meets<br /><span style={{color: LILAC}}>the chain.</span></>} sub="Buy tokenized stocks with the payment method already in your hand."><PayCard /></ProductScene>
    </Sequence>
    <Sequence from={575} durationInFrames={125}>
      <ProductScene duration={125} image="mg-04-search.png" eyebrow="EVERYTHING TRADABLE" headline={<>Search once.<br /><span style={{color: LILAC}}>Find any market.</span></>} sub="Tokens, stocks, and real-world outcomes together."><MarketLayer /></ProductScene>
    </Sequence>
    <Sequence from={700} durationInFrames={120}>
      <ProductScene duration={120} image="mg-05-baskets.png" eyebrow="BASKETS" headline={<>Trade the thesis.<br /><span style={{color: LILAC}}>Not the ticker.</span></>} sub="A whole narrative in one position." />
    </Sequence>
    <Sequence from={820} durationInFrames={90}>
      <ProductScene duration={90} image="mg-06-txns.png" eyebrow="CROSS-CHAIN" headline={<>Every chain.<br /><span style={{color: LILAC}}>One history.</span></>} sub="We route it under the hood. You just trade."><ChainRibbon /></ProductScene>
    </Sequence>
    <Sequence from={910} durationInFrames={83}><EndCard /></Sequence>
  </AbsoluteFill>
);
