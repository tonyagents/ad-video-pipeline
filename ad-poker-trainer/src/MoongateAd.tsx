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

const FONT =
  "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif";
const BG = '#08070c';
const PURPLE = '#a78bfa';
const PURPLE_DEEP = '#8B5CF6'; // moongate accent sampled from app
const TEXT = '#f5f3ff';
const SUB = '#9d9aa8';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const sceneFade = (frame: number, duration: number) =>
  interpolate(frame, [0, 10, duration - 10, duration], [0, 1, 1, 0], clamp);

const Wordmark: React.FC<{size?: number}> = ({size = 54}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: size * 0.26, fontFamily: FONT}}>
    {/* official moongate mark: two pillars + a downward moon-sag (from brand SVG) */}
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

// ----------------------------------------------------------------- hook ----

const PILLARS = ['STOCKS', 'CRYPTO', 'PREDICTIONS', 'BASKETS'];
const WORD_D = 22;

const Hook: React.FC<{duration: number}> = ({duration}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const opacity = sceneFade(frame, duration);
  const wordsEnd = PILLARS.length * WORD_D;
  const idx = Math.min(Math.floor(frame / WORD_D), PILLARS.length - 1);
  const wf = frame - idx * WORD_D;
  const slam = spring({frame: wf, fps, config: {damping: 16, stiffness: 260}});
  const finalIn = spring({frame: frame - wordsEnd - 4, fps, config: {damping: 15, stiffness: 90}});
  const subIn = interpolate(frame, [wordsEnd + 22, wordsEnd + 40], [0, 1], clamp);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BG,
        opacity,
        fontFamily: FONT,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          width: 1700,
          height: 1700,
          background: 'radial-gradient(circle, rgba(139,92,246,0.20) 0%, rgba(139,92,246,0) 60%)',
        }}
      />
      {frame < wordsEnd ? (
        <>
          <div
            style={{
              position: 'absolute',
              top: 170,
              fontSize: 26,
              fontWeight: 700,
              color: SUB,
              letterSpacing: 8,
            }}
          >
            YOU SHOULDN’T NEED FOUR APPS TO TRADE
          </div>
          <div
            style={{
              fontSize: PILLARS[idx].length > 7 ? 148 : 190,
              fontWeight: 800,
              letterSpacing: -5,
              color: idx % 2 ? PURPLE : TEXT,
              transform: `scale(${1.7 - slam * 0.7})`,
              opacity: slam,
            }}
          >
            {PILLARS[idx]}
          </div>
          {/* counter dots */}
          <div style={{position: 'absolute', bottom: 200, display: 'flex', gap: 18}}>
            {PILLARS.map((_, i) => (
              <div
                key={i}
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: 7,
                  background: i <= idx ? PURPLE_DEEP : '#2a2440',
                }}
              />
            ))}
          </div>
        </>
      ) : (
        <>
          <div
            style={{
              fontSize: 130,
              fontWeight: 800,
              letterSpacing: -4,
              color: TEXT,
              textAlign: 'center',
              lineHeight: 1.05,
              transform: `scale(${0.92 + finalIn * 0.08})`,
              opacity: finalIn,
            }}
          >
            One gate to all of it.
          </div>
          <div style={{marginTop: 56, opacity: subIn, transform: `translateY(${(1 - subIn) * 18}px)`}}>
            <Wordmark size={56} />
          </div>
          <div style={{marginTop: 24, fontSize: 30, fontWeight: 500, color: SUB, opacity: subIn}}>
            The all-in-one trading app — launching now
          </div>
        </>
      )}
    </AbsoluteFill>
  );
};

// --------------------------------------------------------------- scenes ----

type Scene = {
  img: string;
  kicker: string;
  caption: string;
  sub?: string;
  focusY?: string;
  duration: number;
};

const SCENES: Scene[] = [
  {
    img: 'mg-01-home.png',
    kicker: 'Meet Moongate',
    caption: 'Your whole portfolio. One screen.',
    sub: 'Crypto, tokenized stocks and baskets — live, side by side.',
    duration: 120,
  },
  {
    img: 'mg-02-xstocks.png',
    kicker: 'xStocks',
    caption: 'NVIDIA to the Nasdaq, tokenized.',
    sub: 'Buy with Apple Pay. Settle on-chain.',
    duration: 125,
  },
  {
    img: 'mg-03-nvidia.png',
    kicker: 'xStocks',
    caption: 'Real charts. Real-time prices.',
    duration: 105,
  },
  {
    img: 'mg-04-search.png',
    kicker: 'Everything tradable',
    caption: 'Tokens, stocks, markets — one search.',
    sub: 'Prediction markets live where your portfolio lives.',
    duration: 120,
  },
  {
    img: 'mg-05-baskets.png',
    kicker: 'Baskets',
    caption: 'Trade the narrative, one tap.',
    sub: 'AI Boom · Mag Five · Physical AI · Stablecoin Rails',
    duration: 125,
  },
  {
    img: 'mg-06-txns.png',
    kicker: 'Fully on-chain',
    caption: 'Send, receive, swap — tracked.',
    sub: 'Every move on your terms, in one history.',
    duration: 105,
  },
];

const BrowserScene: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const opacity = sceneFade(frame, scene.duration);
  const slide = spring({frame, fps, config: {damping: 200, stiffness: 60}});
  const zoom = interpolate(frame, [0, scene.duration], [1.0, 1.05], {
    easing: Easing.out(Easing.quad),
  });

  return (
    <AbsoluteFill style={{backgroundColor: BG, opacity, fontFamily: FONT}}>
      <div
        style={{
          position: 'absolute',
          width: 1500,
          height: 1500,
          left: -460,
          top: -420,
          background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, rgba(139,92,246,0) 60%)',
        }}
      />
      {/* caption row */}
      <div
        style={{
          position: 'absolute',
          left: 110,
          top: 64,
          opacity: slide,
          transform: `translateY(${(1 - slide) * 26}px)`,
        }}
      >
        <div style={{fontSize: 24, fontWeight: 700, color: PURPLE, letterSpacing: 4, textTransform: 'uppercase', marginBottom: 12}}>
          {scene.kicker}
        </div>
        <div style={{fontSize: 60, fontWeight: 800, color: TEXT, letterSpacing: -1.5}}>
          {scene.caption}
        </div>
        {scene.sub ? (
          <div style={{fontSize: 27, fontWeight: 500, color: SUB, marginTop: 12}}>{scene.sub}</div>
        ) : null}
      </div>
      {/* browser window */}
      <div
        style={{
          position: 'absolute',
          left: 230,
          top: 252,
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
        <div
          style={{
            height: 48,
            background: '#15121f',
            display: 'flex',
            alignItems: 'center',
            padding: '0 22px',
            gap: 9,
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div style={{width: 13, height: 13, borderRadius: 7, background: '#ff5f57'}} />
          <div style={{width: 13, height: 13, borderRadius: 7, background: '#febc2e'}} />
          <div style={{width: 13, height: 13, borderRadius: 7, background: '#28c840'}} />
          <div
            style={{
              marginLeft: 26,
              padding: '7px 22px',
              borderRadius: 9,
              background: '#0d0b14',
              fontSize: 17,
              fontWeight: 600,
              color: SUB,
            }}
          >
            moongate.one
          </div>
        </div>
        <div style={{height: 758, overflow: 'hidden'}}>
          <Img
            src={staticFile(scene.img)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: `50% ${scene.focusY ?? '0%'}`,
              transform: `scale(${zoom})`,
              transformOrigin: `50% ${scene.focusY ?? '0%'}`,
            }}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------- end card ----

const GateEndCard: React.FC<{duration: number}> = ({duration}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const opacity = interpolate(frame, [0, 10], [0, 1], clamp);
  const pop = spring({frame, fps, config: {damping: 14, stiffness: 120}});
  const subIn = interpolate(frame, [18, 34], [0, 1], clamp);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BG,
        opacity,
        fontFamily: FONT,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          position: 'absolute',
          width: 1600,
          height: 1600,
          background: 'radial-gradient(circle, rgba(139,92,246,0.22) 0%, rgba(139,92,246,0) 60%)',
        }}
      />
      <div
        style={{
          fontSize: 116,
          fontWeight: 800,
          color: TEXT,
          letterSpacing: -3,
          textAlign: 'center',
          lineHeight: 1.06,
          transform: `scale(${0.9 + pop * 0.1})`,
        }}
      >
        Every market.
        <br />
        One gate.
      </div>
      <div style={{marginTop: 44, opacity: subIn}}>
        <Wordmark size={44} />
      </div>
      <div style={{marginTop: 20, fontSize: 27, fontWeight: 600, color: SUB, opacity: subIn, letterSpacing: 1}}>
        xStocks · Tokens · Predictions · Baskets
      </div>
      <div
        style={{
          marginTop: 44,
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

// ----------------------------------------------------------------- root ----

const HOOK_D = 178;
const END_D = 115;
export const MOONGATE_TOTAL = HOOK_D + SCENES.reduce((a, s) => a + s.duration, 0) + END_D;

export const MoongateAd: React.FC = () => {
  let cursor = HOOK_D;
  return (
    <AbsoluteFill style={{backgroundColor: BG}}>
      <Audio src={staticFile('music-moongate.wav')} />
      <Sequence durationInFrames={HOOK_D}>
        <Hook duration={HOOK_D} />
      </Sequence>
      {SCENES.map((scene, i) => {
        const from = cursor;
        cursor += scene.duration;
        return (
          <Sequence key={i} from={from} durationInFrames={scene.duration}>
            <BrowserScene scene={scene} />
          </Sequence>
        );
      })}
      <Sequence from={cursor} durationInFrames={END_D}>
        <GateEndCard duration={END_D} />
      </Sequence>
    </AbsoluteFill>
  );
};
