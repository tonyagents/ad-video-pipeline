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
const MONO = "'SF Mono', ui-monospace, Menlo, monospace";
const BG = '#08070c';
const PURPLE = '#a78bfa';
const PURPLE_DEEP = '#7D00FF';
const TEXT = '#f5f3ff';
const SUB = '#9d9aa8';
const GREEN = '#16c784';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const sceneFade = (frame: number, duration: number) =>
  interpolate(frame, [0, 10, duration - 10, duration], [0, 1, 1, 0], clamp);

// ------------------------------------------------------------- robot head ----

const RobotHead: React.FC<{size: number; speaking: boolean; frame: number}> = ({
  size,
  speaking,
  frame,
}) => {
  const blink = (frame % 96) > 90 ? 0.15 : 1;
  const mouthW = speaking ? 10 + 9 * Math.abs(Math.sin(frame / 2.2)) : 14;
  const s = size / 100;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <defs>
        <radialGradient id="rg" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#2a2140" />
          <stop offset="100%" stopColor="#161122" />
        </radialGradient>
      </defs>
      <path d="M50 6 V16" stroke={PURPLE} strokeWidth={5} strokeLinecap="round" />
      <circle cx={50} cy={6} r={5} fill={PURPLE} />
      <rect x={18} y={20} width={64} height={54} rx={16} fill="url(#rg)" stroke={PURPLE} strokeWidth={4} />
      {/* eyes */}
      <g fill={speaking ? GREEN : PURPLE}>
        <rect x={32} y={38 - (1 - blink) * 5 * s} width={12} height={12 * blink} rx={6} />
        <rect x={56} y={38 - (1 - blink) * 5 * s} width={12} height={12 * blink} rx={6} />
      </g>
      {/* mouth */}
      <rect x={50 - mouthW / 2} y={58} width={mouthW} height={6} rx={3} fill={speaking ? GREEN : SUB} />
      {/* ears */}
      <rect x={10} y={40} width={8} height={16} rx={4} fill={PURPLE} />
      <rect x={82} y={40} width={8} height={16} rx={4} fill={PURPLE} />
    </svg>
  );
};

const Equalizer: React.FC<{frame: number; active: boolean; color?: string}> = ({
  frame,
  active,
  color = GREEN,
}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 4, height: 22}}>
    {[0, 1, 2, 3, 4].map((i) => (
      <div
        key={i}
        style={{
          width: 4,
          borderRadius: 2,
          background: color,
          height: active ? 5 + Math.abs(Math.sin(frame / 3 + i * 1.3)) * 17 : 4,
          opacity: active ? 1 : 0.3,
        }}
      />
    ))}
  </div>
);

// ----------------------------------------------------------------- hook ----

const Hook: React.FC<{duration: number}> = ({duration}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const opacity = sceneFade(frame, duration);
  const titleIn = interpolate(frame, [12, 32], [0, 1], clamp);
  // gentle push-in on the site screenshot, drifting toward the QR (right side)
  const zoom = interpolate(frame, [0, duration], [1.0, 1.12], {easing: Easing.out(Easing.quad)});
  const panX = interpolate(frame, [0, duration], [0, -90], {easing: Easing.inOut(Easing.cubic)});
  const siteIn = spring({frame: frame - 6, fps, config: {damping: 18, stiffness: 80}});

  return (
    <AbsoluteFill style={{backgroundColor: BG, opacity, fontFamily: FONT, overflow: 'hidden'}}>
      <div
        style={{
          position: 'absolute',
          width: 1500,
          height: 1500,
          left: -300,
          top: -380,
          background: 'radial-gradient(circle, rgba(139,92,246,0.18) 0%, rgba(139,92,246,0) 60%)',
        }}
      />
      {/* browser-framed real landing page */}
      <div
        style={{
          position: 'absolute',
          right: 96,
          top: 150,
          width: 1040,
          borderRadius: 18,
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.10)',
          boxShadow: '0 40px 120px rgba(0,0,0,0.65), 0 0 90px rgba(139,92,246,0.16)',
          background: '#101014',
          opacity: siteIn,
          transform: `translateY(${(1 - siteIn) * 40}px)`,
        }}
      >
        <div style={{height: 44, background: '#15121f', display: 'flex', alignItems: 'center', padding: '0 20px', gap: 8}}>
          <div style={{width: 12, height: 12, borderRadius: 6, background: '#ff5f57'}} />
          <div style={{width: 12, height: 12, borderRadius: 6, background: '#febc2e'}} />
          <div style={{width: 12, height: 12, borderRadius: 6, background: '#28c840'}} />
          <div style={{marginLeft: 22, padding: '6px 20px', borderRadius: 8, background: '#0d0b14', fontSize: 16, fontWeight: 600, color: SUB}}>
            callyourclanker.com
          </div>
        </div>
        <div style={{height: 620, overflow: 'hidden'}}>
          <Img
            src={staticFile('clanker-site.png')}
            style={{width: '100%', transform: `scale(${zoom}) translateX(${panX}px)`, transformOrigin: '70% 50%'}}
          />
        </div>
      </div>
      <div style={{position: 'absolute', left: 96, top: 360, width: 720, opacity: titleIn, transform: `translateY(${(1 - titleIn) * 22}px)`}}>
        <div style={{fontSize: 24, fontWeight: 700, color: PURPLE, letterSpacing: 4, textTransform: 'uppercase', marginBottom: 18}}>
          Call your Clanker
        </div>
        <div style={{fontSize: 82, fontWeight: 800, color: TEXT, letterSpacing: -2.5, lineHeight: 1.02}}>
          The robot banker<br />you can <span style={{color: PURPLE}}>phone</span>.
        </div>
        <div style={{fontSize: 28, fontWeight: 500, color: SUB, marginTop: 22, lineHeight: 1.4}}>
          Scan the code. Dial the number.<br />Talk to your money.
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ----------------------------------------------------------- phone call ----

type Turn = {who: 'caller' | 'clanker'; text: string; at: number; kicker?: string; caption?: string};

const SCRIPT: Turn[] = [
  {who: 'caller', text: 'Hey Clanker — what’s bitcoin at?', at: 14},
  {
    who: 'clanker',
    text: 'Bitcoin’s around sixty-four three seventy, down about two percent today.',
    at: 64,
    kicker: 'Live prices',
    caption: 'Ask it anything\nabout the markets.',
  },
  {who: 'caller', text: 'What’s hot right now?', at: 165},
  {
    who: 'clanker',
    text: 'Solana and a couple of AI tokens are running. Prediction markets like the Fed cut too.',
    at: 212,
    kicker: 'Trending + markets',
    caption: 'What’s moving —\ntokens, stocks, odds.',
  },
  {who: 'caller', text: 'If you were me, would you buy Tesla here?', at: 330},
  {
    who: 'clanker',
    text: 'It’s near the top of its range. I’d wait for a dip — but that’s your call, not mine.',
    at: 380,
    kicker: 'Banker-style advice',
    caption: 'Recommendations,\nlike a real banker.',
  },
  {who: 'caller', text: 'Fine — just buy me twenty bucks of it.', at: 500},
  {
    who: 'clanker',
    text: 'Can’t. I’m read-only. I’ll advise all day, but I never touch your wallet.',
    at: 552,
    kicker: 'Read-only',
    caption: 'It advises.\nIt never moves your money.',
  },
];

const CPL = 30; // approx chars per bubble line
const bubbleH = (t: string) => {
  const lines = t.split('\n').reduce((a, l) => a + Math.max(1, Math.ceil(l.length / CPL)), 0);
  return 30 + lines * 30 + 28; // padding + lines + gap
};

const PHONE_W = 470;
const PHONE_H = 940;
const SCREEN_TOP = 150; // transcript area starts below the call header
const VISIBLE_H = PHONE_H - SCREEN_TOP - 36;

const PhoneCall: React.FC<{duration: number}> = ({duration}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const opacity = sceneFade(frame, duration);

  // cumulative layout of bubbles
  const offsets: {top: number; h: number}[] = [];
  let y = 0;
  for (const t of SCRIPT) {
    const h = bubbleH(t.text);
    offsets.push({top: y, h});
    y += h + 16;
  }
  const contentH = y;

  // last appeared bubble + smooth auto-scroll
  let lastIdx = -1;
  for (let i = 0; i < SCRIPT.length; i++) if (frame >= SCRIPT[i].at) lastIdx = i;
  const targetFor = (idx: number) => {
    if (idx < 0) return 0;
    const bottom = offsets[idx].top + offsets[idx].h;
    return Math.max(0, Math.min(bottom - VISIBLE_H + 20, contentH - VISIBLE_H));
  };
  const cur = targetFor(lastIdx);
  const prev = targetFor(lastIdx - 1);
  const ai = lastIdx >= 0 ? SCRIPT[lastIdx].at : 0;
  const p = interpolate(frame, [ai, ai + 22], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const scroll = prev + (cur - prev) * p;

  // active clanker turn → robot "speaking" for ~70 frames after it lands
  const active = SCRIPT.find((t) => t.who === 'clanker' && frame >= t.at && frame < t.at + 78);
  const speaking = Boolean(active);

  // current caption (from latest clanker turn that has one)
  let cap: Turn | undefined;
  for (let i = 0; i <= lastIdx; i++) if (SCRIPT[i].caption) cap = SCRIPT[i];
  const capKey = cap ? SCRIPT.indexOf(cap) : -1;
  const capIn = cap ? interpolate(frame, [cap.at, cap.at + 18], [0, 1], clamp) : 0;

  const connect = interpolate(frame, [0, 12], [0, 1], clamp);
  const timer = Math.max(0, Math.floor((frame - 0) / 30));
  const mmss = `${String(Math.floor(timer / 60)).padStart(2, '0')}:${String(timer % 60).padStart(2, '0')}`;

  return (
    <AbsoluteFill style={{backgroundColor: BG, opacity, fontFamily: FONT}}>
      <div
        style={{
          position: 'absolute',
          width: 1300,
          height: 1300,
          left: 760,
          top: -260,
          background: 'radial-gradient(circle, rgba(139,92,246,0.16) 0%, rgba(139,92,246,0) 60%)',
        }}
      />
      {/* left captions */}
      <div style={{position: 'absolute', left: 110, top: 0, bottom: 0, width: 640, display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
        <div key={`k${capKey}`} style={{opacity: capIn, transform: `translateY(${(1 - capIn) * 22}px)`}}>
          <div style={{fontSize: 25, fontWeight: 700, color: PURPLE, letterSpacing: 4, textTransform: 'uppercase', marginBottom: 22}}>
            {cap?.kicker}
          </div>
          <div style={{fontSize: 78, fontWeight: 800, color: TEXT, letterSpacing: -2, lineHeight: 1.06, whiteSpace: 'pre-line'}}>
            {cap?.caption}
          </div>
        </div>
      </div>

      {/* phone */}
      <div
        style={{
          position: 'absolute',
          left: 1180,
          top: 70,
          width: PHONE_W,
          height: PHONE_H,
          borderRadius: 54,
          background: '#0c0a12',
          border: '10px solid #1c1828',
          boxShadow: '0 50px 130px rgba(0,0,0,0.7), 0 0 80px rgba(139,92,246,0.14)',
          overflow: 'hidden',
        }}
      >
        {/* notch */}
        <div style={{position: 'absolute', top: 14, left: '50%', transform: 'translateX(-50%)', width: 150, height: 28, borderRadius: 16, background: '#1c1828', zIndex: 5}} />
        {/* call header */}
        <div style={{position: 'absolute', top: 0, left: 0, right: 0, height: SCREEN_TOP, background: 'linear-gradient(180deg,#15121f,#0c0a12)', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', padding: '46px 26px 0', gap: 16}}>
          <div style={{opacity: connect}}>
            <RobotHead size={64} speaking={speaking} frame={frame} />
          </div>
          <div style={{flex: 1}}>
            <div style={{fontSize: 26, fontWeight: 800, color: TEXT}}>Clanker</div>
            <div style={{fontSize: 17, fontWeight: 600, color: speaking ? GREEN : SUB, fontFamily: MONO, marginTop: 2}}>
              {frame < 12 ? 'connecting…' : `${mmss} · live`}
            </div>
          </div>
          <div style={{padding: '6px 12px', borderRadius: 999, border: `1.5px solid ${GREEN}`, background: 'rgba(22,199,132,0.12)', fontSize: 13, fontWeight: 800, color: GREEN, letterSpacing: 0.5}}>
            READ-ONLY
          </div>
        </div>

        {/* transcript */}
        <div style={{position: 'absolute', top: SCREEN_TOP, left: 0, right: 0, height: VISIBLE_H, overflow: 'hidden'}}>
          <div style={{position: 'absolute', top: 0, left: 0, right: 0, transform: `translateY(${-scroll}px)`, padding: '10px 20px'}}>
            {SCRIPT.map((t, i) => {
              const bin = interpolate(frame, [t.at, t.at + 14], [0, 1], clamp);
              if (bin <= 0) return null;
              const mine = t.who === 'caller';
              const isActive = t === active;
              return (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    top: offsets[i].top,
                    left: 20,
                    right: 20,
                    display: 'flex',
                    justifyContent: mine ? 'flex-end' : 'flex-start',
                    opacity: bin,
                    transform: `translateY(${(1 - bin) * 16}px)`,
                  }}
                >
                  <div
                    style={{
                      maxWidth: '82%',
                      padding: '13px 17px',
                      borderRadius: 20,
                      borderBottomRightRadius: mine ? 5 : 20,
                      borderBottomLeftRadius: mine ? 20 : 5,
                      background: mine ? PURPLE_DEEP : '#171422',
                      border: mine ? 'none' : '1px solid rgba(167,139,250,0.22)',
                      color: mine ? '#fff' : TEXT,
                      fontSize: 22,
                      fontWeight: 500,
                      lineHeight: 1.34,
                    }}
                  >
                    {t.text}
                    {!mine && isActive ? (
                      <div style={{marginTop: 8}}>
                        <Equalizer frame={frame} active />
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* call controls */}
        <div style={{position: 'absolute', bottom: 0, left: 0, right: 0, height: 36, background: 'linear-gradient(0deg,#0c0a12,rgba(12,10,18,0))'}} />
      </div>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------- end card ----

const EndCard: React.FC<{duration: number}> = ({duration}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const opacity = interpolate(frame, [0, 10], [0, 1], clamp);
  const pop = spring({frame, fps, config: {damping: 14, stiffness: 120}});
  const subIn = interpolate(frame, [16, 32], [0, 1], clamp);

  return (
    <AbsoluteFill style={{backgroundColor: BG, opacity, fontFamily: FONT, alignItems: 'center', justifyContent: 'center'}}>
      <div style={{position: 'absolute', width: 1600, height: 1600, background: 'radial-gradient(circle, rgba(139,92,246,0.22) 0%, rgba(139,92,246,0) 60%)'}} />
      <div style={{transform: `scale(${0.9 + pop * 0.1})`, marginBottom: 28}}>
        <RobotHead size={130} speaking frame={frame} />
      </div>
      <div style={{fontSize: 92, fontWeight: 800, color: TEXT, letterSpacing: -2.5, textAlign: 'center', lineHeight: 1.04}}>
        Call your Clanker.
      </div>
      <div style={{marginTop: 22, fontSize: 30, fontWeight: 500, color: SUB, opacity: subIn}}>
        The read-only robot banker you can phone.
      </div>
      <div
        style={{
          marginTop: 40,
          padding: '18px 50px',
          borderRadius: 999,
          border: `2px solid ${PURPLE_DEEP}`,
          background: 'rgba(139,92,246,0.14)',
          fontSize: 36,
          fontWeight: 700,
          color: TEXT,
          fontFamily: MONO,
          opacity: subIn,
          transform: `translateY(${(1 - subIn) * 16}px)`,
        }}
      >
        scan · dial · ask
      </div>
      <div style={{position: 'absolute', bottom: 44, fontSize: 18, color: '#55525e', opacity: subIn}}>
        Powered by MoonPay agent tools, Claude, Twilio &amp; ElevenLabs. Read-only — informational, not financial advice.
      </div>
    </AbsoluteFill>
  );
};

// ----------------------------------------------------------------- root ----

const HOOK_D = 150;
const CALL_D = 660;
const END_D = 120;
export const CLANKER_TOTAL = HOOK_D + CALL_D + END_D;

export const ClankerAd: React.FC = () => {
  return (
    <AbsoluteFill style={{backgroundColor: BG}}>
      <Audio src={staticFile('music-clanker.wav')} />
      <Sequence durationInFrames={HOOK_D}>
        <Hook duration={HOOK_D} />
      </Sequence>
      <Sequence from={HOOK_D} durationInFrames={CALL_D}>
        <PhoneCall duration={CALL_D} />
      </Sequence>
      <Sequence from={HOOK_D + CALL_D} durationInFrames={END_D}>
        <EndCard duration={END_D} />
      </Sequence>
    </AbsoluteFill>
  );
};
