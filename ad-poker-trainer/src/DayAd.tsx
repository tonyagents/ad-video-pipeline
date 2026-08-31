import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Easing,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {EndCard} from './Ad';

const FONT =
  "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif";
const BG = '#08070c';
const PURPLE = '#a78bfa';
const TEXT = '#f5f3ff';
const SUB = '#9d9aa8';
const GREEN = '#16c784';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const rnd = (i: number, salt = 1) => {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

const sceneFade = (frame: number, duration: number) =>
  interpolate(frame, [0, 10, duration - 10, duration], [0, 1, 1, 0], clamp);

// ------------------------------------------------------------ skin/person ----

const SKIN = '#e8a87c';
const HAIR = '#2e2233';
const HOODIE = '#6d28d9';
const HOODIE_DARK = '#581fae';

// Head seen from the side, lying on a pillow
const SleepingHead: React.FC<{x: number; y: number; frame: number}> = ({x, y, frame}) => (
  <g transform={`translate(${x} ${y})`}>
    <circle cx={0} cy={0} r={52} fill={SKIN} />
    <path d="M -52 -6 Q -46 -52 0 -52 Q 40 -52 50 -22 Q 18 -34 -8 -26 Q -36 -18 -52 -6 Z" fill={HAIR} />
    {/* closed eye + brow (side view: one visible) */}
    <path d="M 6 -2 Q 16 6 26 -2" stroke="#241608" strokeWidth={5} strokeLinecap="round" fill="none" />
    <path d="M 4 -20 Q 16 -26 28 -20" stroke={HAIR} strokeWidth={5} strokeLinecap="round" fill="none" />
    {/* snoring mouth */}
    <ellipse cx={30} cy={24} rx={6 + 1.5 * Math.sin(frame / 14)} ry={7 + 2 * Math.sin(frame / 14)} fill="#9c5d3f" />
    <ellipse cx={16} cy={14} rx={7} ry={5} fill="#d98a64" opacity={0.5} />
  </g>
);

const Zzz: React.FC<{x: number; y: number; frame: number}> = ({x, y, frame}) => (
  <g fontFamily={FONT} fontWeight={800} fill="#cdb7ff">
    {[0, 1, 2].map((i) => {
      const cycle = ((frame / 30 + i * 0.6) % 2.2) / 2.2;
      return (
        <text
          key={i}
          x={x + i * 38 + cycle * 12}
          y={y - i * 46 - cycle * 40}
          fontSize={26 + i * 10}
          opacity={interpolate(cycle, [0, 0.2, 0.8, 1], [0, 0.9, 0.9, 0])}
        >
          z
        </text>
      );
    })}
  </g>
);

// Standing/walking person holding coffee + phone
const WalkingPerson: React.FC<{x: number; y: number; frame: number}> = ({x, y, frame}) => {
  const bob = Math.sin(frame / 5.5) * 5;
  const stride = Math.sin(frame / 5.5) * 14;
  return (
    <g transform={`translate(${x} ${y + bob})`}>
      {/* legs */}
      <path d={`M -16 130 Q ${-22 + stride} 200 ${-26 + stride} 252`} stroke="#241c3a" strokeWidth={30} strokeLinecap="round" fill="none" />
      <path d={`M 18 130 Q ${24 - stride} 200 ${28 - stride} 252`} stroke="#2c2347" strokeWidth={30} strokeLinecap="round" fill="none" />
      <ellipse cx={-28 + stride} cy={262} rx={34} ry={14} fill="#fbfaff" />
      <ellipse cx={30 - stride} cy={262} rx={34} ry={14} fill="#fbfaff" />
      {/* torso hoodie */}
      <path d="M -58 -10 Q 0 -38 58 -10 L 66 120 Q 0 146 -66 120 Z" fill={HOODIE} />
      <path d="M -30 -18 Q 0 -34 30 -18 L 26 8 Q 0 18 -26 8 Z" fill={HOODIE_DARK} />
      {/* hood bunched behind neck */}
      <path d="M -34 -28 Q 0 -52 34 -28 Q 36 -10 0 -16 Q -36 -10 -34 -28 Z" fill={HOODIE_DARK} />
      {/* coffee arm (right, bent up) */}
      <path d="M 52 24 Q 86 50 84 6" stroke={HOODIE} strokeWidth={26} strokeLinecap="round" fill="none" />
      <circle cx={86} cy={0} r={15} fill={SKIN} />
      {/* cup */}
      <g transform="translate(78 -44)">
        <path d="M 0 0 L 32 0 L 27 44 L 5 44 Z" fill="#fbfaff" />
        <rect x={-3} y={0} width={38} height={9} rx={4} fill="#c9c2dd" />
        {[0, 1].map((i) => (
          <path
            key={i}
            d={`M ${10 + i * 12} -8 Q ${6 + i * 12 + 6 * Math.sin(frame / 9 + i * 2)} -22 ${10 + i * 12} -34`}
            stroke="#cdc6e0"
            strokeWidth={4}
            strokeLinecap="round"
            fill="none"
            opacity={0.35 + 0.25 * Math.sin(frame / 8 + i * 1.4)}
          />
        ))}
      </g>
      {/* phone arm (left, by side) */}
      <path d="M -52 24 Q -72 64 -64 100" stroke={HOODIE} strokeWidth={26} strokeLinecap="round" fill="none" />
      <circle cx={-63} cy={108} r={14} fill={SKIN} />
      {/* phone in hand, buzzing */}
      <g transform={`translate(-84 92) rotate(${Math.sin(frame / 1.6) * (frame % 120 < 24 ? 4 : 0)})`}>
        <rect x={0} y={0} width={34} height={62} rx={8} fill="#16131f" stroke="#3a3354" strokeWidth={2} />
        <rect x={4} y={5} width={26} height={52} rx={5} fill="#1c1336" />
        <circle cx={17} cy={31} r={7} fill={PURPLE} opacity={0.9} />
      </g>
      {/* head */}
      <g transform={`translate(0 -64) rotate(${3 * Math.sin(frame / 11)})`}>
        <circle cx={0} cy={0} r={46} fill={SKIN} />
        <path d="M -46 -4 Q -42 -46 0 -46 Q 42 -46 46 -4 Q 24 -28 0 -26 Q -24 -28 -46 -4 Z" fill={HAIR} />
        <circle cx={-15} cy={-2} r={5} fill="#241608" />
        <circle cx={15} cy={-2} r={5} fill="#241608" />
        <path d="M -10 20 Q 0 28 10 20" stroke="#9c5d3f" strokeWidth={5} strokeLinecap="round" fill="none" />
      </g>
    </g>
  );
};

// Person from behind, at a desk on a video call
const DeskPerson: React.FC<{x: number; y: number; frame: number}> = ({x, y, frame}) => {
  const typeBob = Math.sin(frame / 4) * 2.5;
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M -96 150 Q -104 30 -58 -2 Q 0 -34 58 -2 Q 104 30 96 150 Z" fill={HOODIE} />
      <path d="M -40 -10 Q 0 -40 40 -10 Q 42 16 0 10 Q -42 16 -40 -10 Z" fill={HOODIE_DARK} />
      <g transform={`translate(0 ${typeBob})`}>
        <circle cx={0} cy={-58} r={48} fill={HAIR} />
        <path d="M -48 -54 Q -50 -34 -40 -26 Q -46 -48 -44 -62 Z" fill={SKIN} />
        <path d="M 48 -54 Q 50 -34 40 -26 Q 46 -48 44 -62 Z" fill={SKIN} />
        {/* headphones */}
        <path d="M -50 -64 Q 0 -122 50 -64" stroke="#1c1727" strokeWidth={11} strokeLinecap="round" fill="none" />
        <rect x={-62} y={-74} width={18} height={34} rx={9} fill="#1c1727" />
        <rect x={44} y={-74} width={18} height={34} rx={9} fill="#1c1727" />
      </g>
    </g>
  );
};

// Person slouched on a couch, holding a phone
const CouchPerson: React.FC<{x: number; y: number; frame: number; tap: number}> = ({x, y, frame, tap}) => {
  const lookDown = interpolate(frame, [tap - 40, tap - 30], [0, 1], clamp);
  const cheer = spring({frame: frame - tap - 4, fps: 30, config: {damping: 11, stiffness: 130}});
  const happy = frame >= tap + 4;
  return (
    <g transform={`translate(${x} ${y - cheer * 14})`}>
      {/* legs stretched to ottoman */}
      <path d="M -30 80 Q -130 110 -212 142" stroke="#3a2f5c" strokeWidth={32} strokeLinecap="round" fill="none" />
      <path d="M -26 104 Q -116 140 -188 168" stroke="#463a6e" strokeWidth={32} strokeLinecap="round" fill="none" />
      <ellipse cx={-238} cy={138} rx={15} ry={24} fill="#fbfaff" transform="rotate(-24 -238 138)" />
      <ellipse cx={-212} cy={170} rx={15} ry={24} fill="#fbfaff" transform="rotate(-24 -212 170)" />
      {/* reclined torso */}
      <path d="M -44 110 Q -58 16 -8 -22 Q 50 -52 84 -8 Q 102 40 92 116 Z" fill={HOODIE} />
      {/* arms holding phone at lap */}
      <path d="M -28 38 Q -52 78 -16 96" stroke={HOODIE} strokeWidth={24} strokeLinecap="round" fill="none" />
      <path d="M 74 40 Q 64 84 22 96" stroke={HOODIE} strokeWidth={24} strokeLinecap="round" fill="none" />
      {/* phone */}
      <g transform="translate(-22 70) rotate(-18)">
        <rect x={0} y={0} width={42} height={76} rx={10} fill="#16131f" stroke="#3a3354" strokeWidth={2} />
        <rect x={5} y={6} width={32} height={64} rx={6} fill="#1c1336" />
        <circle cx={21} cy={38} r={9} fill={PURPLE} opacity={0.6 + 0.3 * Math.sin(frame / 7)} />
      </g>
      <circle cx={-12} cy={102} r={13} fill={SKIN} />
      <circle cx={26} cy={98} r={13} fill={SKIN} />
      {/* head */}
      <g transform={`translate(34 -42) rotate(${lookDown * 16})`}>
        <circle cx={0} cy={0} r={44} fill={SKIN} />
        <path d="M -44 -4 Q -40 -44 0 -44 Q 40 -44 44 -4 Q 22 -26 0 -24 Q -22 -26 -44 -4 Z" fill={HAIR} />
        {happy ? (
          <>
            <path d="M -24 -2 Q -14 -12 -4 -2" stroke="#241608" strokeWidth={5} strokeLinecap="round" fill="none" />
            <path d="M 6 -2 Q 16 -12 26 -2" stroke="#241608" strokeWidth={5} strokeLinecap="round" fill="none" />
            <path d="M -12 16 Q 0 30 14 16" stroke="#9c5d3f" strokeWidth={6} strokeLinecap="round" fill="none" />
          </>
        ) : (
          <>
            <circle cx={-13} cy={-2} r={5} fill="#241608" />
            <circle cx={14} cy={-2} r={5} fill="#241608" />
            <path d="M -8 20 Q 1 24 10 20" stroke="#9c5d3f" strokeWidth={5} strokeLinecap="round" fill="none" />
          </>
        )}
      </g>
    </g>
  );
};

// --------------------------------------------------------- notification ----

const NotifCard: React.FC<{
  x: number;
  y: number;
  w?: number;
  frame: number;
  appear: number;
  time: string;
  rows: {text: string; color?: string; size?: number; weight?: number}[];
  float?: boolean;
}> = ({x, y, w = 470, frame, appear, time, rows, float = true}) => {
  const inSpring = spring({frame: frame - appear, fps: 30, config: {damping: 15, stiffness: 110}});
  if (frame < appear) return null;
  const drift = float ? Math.sin((frame - appear) / 26) * 5 : 0;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y + (1 - inSpring) * 36 + drift,
        width: w,
        opacity: Math.min(1, inSpring * 1.2),
        background: 'rgba(18,14,30,0.96)',
        border: '1.5px solid rgba(167,139,250,0.35)',
        borderRadius: 22,
        padding: '22px 28px',
        boxShadow: '0 30px 80px rgba(0,0,0,0.55), 0 0 60px rgba(125,0,255,0.18)',
        fontFamily: FONT,
        transform: `scale(${0.94 + inSpring * 0.06})`,
        transformOrigin: '50% 100%',
      }}
    >
      <div style={{display: 'flex', alignItems: 'center', marginBottom: 12}}>
        <div style={{width: 12, height: 12, borderRadius: 6, background: '#7D00FF', marginRight: 10}} />
        <div style={{fontSize: 21, fontWeight: 700, color: PURPLE}}>NovaAgents</div>
        <div style={{marginLeft: 'auto', fontSize: 18, fontWeight: 600, color: SUB}}>{time}</div>
      </div>
      {rows.map((r, i) => (
        <div
          key={i}
          style={{
            fontSize: r.size ?? 24,
            fontWeight: r.weight ?? 600,
            color: r.color ?? TEXT,
            lineHeight: 1.45,
          }}
        >
          {r.text}
        </div>
      ))}
    </div>
  );
};

// 8 PM market card with a live YES tap
const MarketCard: React.FC<{x: number; y: number; frame: number; appear: number; tap: number}> = ({
  x,
  y,
  frame,
  appear,
  tap,
}) => {
  const inSpring = spring({frame: frame - appear, fps: 30, config: {damping: 15, stiffness: 110}});
  if (frame < appear) return null;
  const placed = frame >= tap;
  const press = interpolate(frame, [tap - 4, tap, tap + 6], [1, 0.9, 1], clamp);
  const ring = interpolate(frame, [tap, tap + 16], [0, 1], clamp);
  const toast = spring({frame: frame - tap - 4, fps: 30, config: {damping: 14, stiffness: 160}});
  const odds = Math.round(interpolate(frame, [appear, tap], [56, 58], clamp));
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y + (1 - inSpring) * 36,
        width: 500,
        opacity: Math.min(1, inSpring * 1.2),
        background: 'rgba(18,14,30,0.96)',
        border: '1.5px solid rgba(167,139,250,0.35)',
        borderRadius: 22,
        padding: '24px 30px',
        boxShadow: '0 30px 80px rgba(0,0,0,0.55), 0 0 60px rgba(125,0,255,0.18)',
        fontFamily: FONT,
      }}
    >
      <div style={{display: 'flex', alignItems: 'center', marginBottom: 12}}>
        <div style={{width: 12, height: 12, borderRadius: 6, background: '#7D00FF', marginRight: 10}} />
        <div style={{fontSize: 21, fontWeight: 700, color: PURPLE}}>NovaAgents · edge found</div>
        <div style={{marginLeft: 'auto', fontSize: 18, fontWeight: 600, color: SUB}}>8:04 PM</div>
      </div>
      <div style={{fontSize: 27, fontWeight: 800, color: TEXT}}>Home side to win?</div>
      <div style={{fontSize: 20, fontWeight: 600, color: SUB, marginTop: 6}}>
        Polymarket {odds}¢ vs. Kalshi 62¢ — 4pt edge on YES
      </div>
      <div style={{display: 'flex', gap: 16, marginTop: 20, position: 'relative'}}>
        <div
          style={{
            width: 150,
            height: 54,
            borderRadius: 27,
            background: GREEN,
            color: '#06281c',
            fontSize: 23,
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: `scale(${press})`,
          }}
        >
          YES {odds}¢
        </div>
        <div
          style={{
            width: 150,
            height: 54,
            borderRadius: 27,
            border: `2px solid #ea3943`,
            color: '#ea3943',
            fontSize: 23,
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          NO {100 - odds}¢
        </div>
        {ring > 0 && ring < 1 ? (
          <div
            style={{
              position: 'absolute',
              left: 75 - (12 + ring * 46),
              top: 27 - (12 + ring * 46),
              width: (12 + ring * 46) * 2,
              height: (12 + ring * 46) * 2,
              borderRadius: '50%',
              border: `${4 * (1 - ring)}px solid #ffffff`,
              opacity: 1 - ring,
            }}
          />
        ) : null}
      </div>
      {placed ? (
        <div
          style={{
            marginTop: 18,
            padding: '12px 0',
            borderRadius: 16,
            textAlign: 'center',
            background: 'rgba(22,199,132,0.15)',
            border: `1.5px solid ${GREEN}`,
            color: GREEN,
            fontSize: 21,
            fontWeight: 800,
            opacity: toast,
            transform: `translateY(${(1 - toast) * 14}px)`,
          }}
        >
          ✓ Position opened — $25 on YES
        </div>
      ) : null}
    </div>
  );
};

// ------------------------------------------------------------- captions ----

const Caption: React.FC<{kicker: string; caption: string; sub?: string}> = ({kicker, caption, sub}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const slide = spring({frame, fps, config: {damping: 200, stiffness: 60}});
  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: 400,
          background: 'linear-gradient(180deg, rgba(8,7,12,0) 0%, rgba(8,7,12,0.88) 80%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 96,
          bottom: 72,
          fontFamily: FONT,
          opacity: slide,
          transform: `translateY(${(1 - slide) * 28}px)`,
        }}
      >
        <div style={{fontSize: 24, fontWeight: 700, color: PURPLE, letterSpacing: 4, textTransform: 'uppercase', marginBottom: 16}}>
          {kicker}
        </div>
        <div style={{fontSize: 62, fontWeight: 800, color: TEXT, letterSpacing: -1.5, lineHeight: 1.08, whiteSpace: 'pre-line'}}>
          {caption}
        </div>
        {sub ? <div style={{fontSize: 27, fontWeight: 500, color: SUB, marginTop: 16}}>{sub}</div> : null}
      </div>
    </>
  );
};

// ---------------------------------------------------------------- defs ----

const DayDefs: React.FC = () => (
  <defs>
    <linearGradient id="dawnSky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#2b1a55" />
      <stop offset="60%" stopColor="#8b3a6b" />
      <stop offset="100%" stopColor="#f2a05e" />
    </linearGradient>
    <linearGradient id="morningSky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#27457e" />
      <stop offset="70%" stopColor="#5a7fc0" />
      <stop offset="100%" stopColor="#f3c98b" />
    </linearGradient>
    <linearGradient id="noonSky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#3f6db5" />
      <stop offset="100%" stopColor="#9cc3ea" />
    </linearGradient>
    <linearGradient id="nightSky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#04050f" />
      <stop offset="100%" stopColor="#141d3d" />
    </linearGradient>
    <radialGradient id="warmGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stopColor="#ffd9a0" stopOpacity="0.9" />
      <stop offset="100%" stopColor="#ffd9a0" stopOpacity="0" />
    </radialGradient>
    <radialGradient id="phoneGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stopColor="#b9a3ff" stopOpacity="0.5" />
      <stop offset="100%" stopColor="#b9a3ff" stopOpacity="0" />
    </radialGradient>
    <radialGradient id="tvGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stopColor="#9fc1ff" stopOpacity="0.32" />
      <stop offset="100%" stopColor="#9fc1ff" stopOpacity="0" />
    </radialGradient>
  </defs>
);

// ------------------------------------------------------------- bedrooms ----

const Bedroom: React.FC<{frame: number; night: boolean}> = ({frame, night}) => (
  <>
    {/* walls + floor */}
    <rect width={1920} height={1080} fill={night ? '#0d0a18' : '#161028'} />
    <rect y={830} width={1920} height={250} fill={night ? '#080612' : '#100b1d'} />
    {/* window */}
    <g clipPath="url(#windowClip)">
      <clipPath id="windowClip">
        <rect x={1190} y={110} width={520} height={470} rx={14} />
      </clipPath>
      <rect x={1190} y={110} width={520} height={470} rx={14} fill={night ? 'url(#nightSky)' : 'url(#dawnSky)'} />
      {night ? (
        <>
          {Array.from({length: 14}, (_, i) => (
            <circle
              key={i}
              cx={1210 + rnd(i, 41) * 480}
              cy={130 + rnd(i, 43) * 300}
              r={1.5 + rnd(i, 45) * 2}
              fill="#dfe8ff"
              opacity={0.3 + 0.5 * Math.abs(Math.sin(frame / 14 + i * 2))}
            />
          ))}
          <circle cx={1565} cy={230} r={48} fill="#e9eefc" opacity={0.95} />
          <circle cx={1548} cy={219} r={42} fill="#141d3d" opacity={0.3} />
        </>
      ) : (
        <>
          <circle cx={1450} cy={520} r={70} fill="#ffe2b0" />
          <circle cx={1450} cy={520} r={190} fill="url(#warmGlow)" />
          {/* city silhouette inside window */}
          {Array.from({length: 8}, (_, i) => (
            <rect key={i} x={1200 + i * 64} y={500 - rnd(i, 47) * 90} width={50} height={200} fill="#3a1e4a" />
          ))}
        </>
      )}
      <rect x={1190} y={110} width={520} height={470} rx={14} fill="none" stroke="#2c2440" strokeWidth={16} />
      <rect x={1442} y={110} width={14} height={470} fill="#2c2440" />
      <rect x={1190} y={336} width={520} height={14} fill="#2c2440" />
    </g>
    {/* bed */}
    <rect x={110} y={470} width={52} height={360} rx={10} fill="#241c3c" />
    <rect x={150} y={640} width={760} height={110} rx={22} fill="#2c2347" />
    <rect x={150} y={745} width={760} height={80} fill="#1d1730" />
    {/* blanket + sleeper */}
    <path d="M 330 700 Q 360 600 470 612 L 910 640 Q 920 700 910 742 L 330 742 Z" fill="#4c3a8a" />
    <path d="M 330 700 Q 360 600 470 612 L 520 616 Q 470 660 460 742 L 330 742 Z" fill="#5b46a3" />
    <ellipse cx={250} cy={648} rx={92} ry={38} fill="#efeaf7" />
    <SleepingHead x={262} y={602} frame={frame} />
    <Zzz x={360} y={540} frame={frame} />
    {/* nightstand + phone */}
    <rect x={960} y={660} width={170} height={170} rx={14} fill="#1d1730" />
    <rect x={978} y={700} width={134} height={20} rx={6} fill="#2c2347" />
    <g>
      <ellipse cx={1045} cy={640} rx={130} ry={56} fill="url(#phoneGlow)" opacity={0.7 + 0.3 * Math.sin(frame / 9)} />
      <rect x={1006} y={636} width={78} height={20} rx={8} fill="#16131f" stroke="#3a3354" strokeWidth={2} />
      <rect x={1014} y={640} width={62} height={12} rx={5} fill="#3d2d6e" />
    </g>
  </>
);

// ----------------------------------------------------------------- hook ----

const HookScene: React.FC<{duration: number}> = ({duration}) => {
  const frame = useCurrentFrame();
  const opacity = sceneFade(frame, duration);
  const titleIn = interpolate(frame, [16, 36], [0, 1], clamp);
  return (
    <AbsoluteFill style={{backgroundColor: BG, opacity, fontFamily: FONT, overflow: 'hidden'}}>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute'}}>
        <DayDefs />
        <Bedroom frame={frame} night={false} />
      </svg>
      <NotifCard
        x={780}
        y={300}
        frame={frame}
        appear={46}
        time="7:02 AM"
        rows={[
          {text: 'Good morning. BTC dipped 2.4% overnight —', size: 23},
          {text: 'I’m watching it. Go back to sleep.', size: 23},
        ]}
      />
      <div
        style={{
          position: 'absolute',
          top: 64,
          left: 96,
          opacity: titleIn,
          transform: `translateY(${(1 - titleIn) * 24}px)`,
        }}
      >
        <div style={{fontSize: 70, fontWeight: 800, color: TEXT, letterSpacing: -2}}>
          Your wallet, but it works for you.
        </div>
        <div style={{fontSize: 30, fontWeight: 500, color: SUB, marginTop: 12}}>
          One day with NovaAgents running in the background.
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------ 9:30 walk ----

const WalkScene: React.FC<{duration: number}> = ({duration}) => {
  const frame = useCurrentFrame();
  const opacity = sceneFade(frame, duration);
  return (
    <AbsoluteFill style={{backgroundColor: BG, opacity, fontFamily: FONT, overflow: 'hidden'}}>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute'}}>
        <DayDefs />
        <rect width={1920} height={1080} fill="url(#morningSky)" />
        <circle cx={1560} cy={300} r={86} fill="#ffe9c4" />
        <circle cx={1560} cy={300} r={240} fill="url(#warmGlow)" />
        {/* clouds */}
        {[0, 1, 2].map((i) => (
          <g key={i} fill="#ffffff" opacity={0.5} transform={`translate(${((i * 620 + frame * 0.5) % 2200) - 140} ${130 + i * 90})`}>
            <ellipse cx={0} cy={0} rx={95} ry={30} />
            <ellipse cx={62} cy={-16} rx={62} ry={26} />
            <ellipse cx={-66} cy={-10} rx={56} ry={22} />
          </g>
        ))}
        {/* buildings */}
        {Array.from({length: 16}, (_, i) => (
          <rect
            key={i}
            x={(i / 16) * 1980 - 30}
            y={560 - rnd(i, 61) * 220}
            width={80 + rnd(i, 63) * 70}
            height={500}
            fill="#23305c"
          />
        ))}
        {/* café front */}
        <rect x={40} y={420} width={560} height={480} fill="#2c2150" />
        <rect x={70} y={620} width={210} height={220} rx={8} fill="#46356e" />
        <rect x={320} y={620} width={240} height={160} rx={8} fill="#f6e3b0" opacity={0.85} />
        {/* awning */}
        {Array.from({length: 7}, (_, i) => (
          <path
            key={i}
            d={`M ${40 + i * 80} 540 L ${120 + i * 80} 540 L ${112 + i * 80} 610 Q ${80 + i * 80} 628 ${48 + i * 80} 610 Z`}
            fill={i % 2 ? '#e0556b' : '#f6f1e6'}
          />
        ))}
        <text x={150} y={500} fontFamily={FONT} fontSize={42} fontWeight={800} fill="#f6e3b0" letterSpacing={6}>
          CAFÉ
        </text>
        {/* sidewalk */}
        <rect y={860} width={1920} height={220} fill="#191430" />
        <rect y={860} width={1920} height={16} fill="#241c3e" />
        <WalkingPerson x={880} y={620} frame={frame} />
      </svg>
      <NotifCard
        x={1140}
        y={250}
        frame={frame}
        appear={34}
        time="9:31 AM"
        rows={[
          {text: 'Price alert armed ✓', size: 26, weight: 800},
          {text: 'ETH below $2,400 — I’ll ping you the second it hits.', size: 22, color: SUB},
        ]}
      />
      <Caption kicker="9:31 AM · Coffee run" caption={'It set the alert\nbefore you ordered.'} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------ noon desk ----

const DeskScene: React.FC<{duration: number}> = ({duration}) => {
  const frame = useCurrentFrame();
  const opacity = sceneFade(frame, duration);
  const speaking = Math.floor(frame / 40) % 4;
  return (
    <AbsoluteFill style={{backgroundColor: BG, opacity, fontFamily: FONT, overflow: 'hidden'}}>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute'}}>
        <DayDefs />
        <rect width={1920} height={1080} fill="#181327" />
        {/* noon window strip */}
        <rect x={120} y={90} width={420} height={300} rx={12} fill="url(#noonSky)" />
        <rect x={120} y={90} width={420} height={300} rx={12} fill="none" stroke="#2c2440" strokeWidth={14} />
        <circle cx={330} cy={170} r={44} fill="#fff6dd" />
        <rect x={1400} y={90} width={420} height={300} rx={12} fill="url(#noonSky)" />
        <rect x={1400} y={90} width={420} height={300} rx={12} fill="none" stroke="#2c2440" strokeWidth={14} />
        {/* desk */}
        <rect x={220} y={700} width={1480} height={44} rx={10} fill="#2e2450" />
        <rect x={260} y={744} width={1400} height={336} fill="#241c3a" />
        {/* monitor with video call */}
        <rect x={660} y={300} width={600} height={400} rx={18} fill="#0f0c1a" stroke="#3a3354" strokeWidth={4} />
        <rect x={930} y={700} width={60} height={36} fill="#3a3354" />
        <rect x={860} y={736} width={200} height={14} rx={7} fill="#3a3354" />
        {[0, 1, 2, 3].map((i) => {
          const gx = 678 + (i % 2) * 286;
          const gy = 318 + Math.floor(i / 2) * 186;
          const colors = ['#46356e', '#2c4a6e', '#5a3a52', '#3a5a46'];
          return (
            <g key={i}>
              <rect
                x={gx}
                y={gy}
                width={278}
                height={178}
                rx={10}
                fill={colors[i]}
                stroke={i === speaking ? GREEN : 'transparent'}
                strokeWidth={4}
              />
              <circle cx={gx + 139} cy={gy + 72} r={36} fill="#e8a87c" opacity={0.9} />
              <path d={`M ${gx + 103} ${gy + 64} Q ${gx + 139} ${gy + 30} ${gx + 175} ${gy + 64}`} fill="#2e2233" />
              <rect x={gx + 95} y={gy + 122} width={88} height={34} rx={17} fill="rgba(0,0,0,0.4)" />
              {i === speaking ? (
                <g fill={GREEN}>
                  {[0, 1, 2].map((b) => (
                    <rect
                      key={b}
                      x={gx + 240 + b * 9}
                      y={gy + 24 - Math.abs(Math.sin(frame / 4 + b)) * 12}
                      width={5}
                      height={10 + Math.abs(Math.sin(frame / 4 + b)) * 14}
                      rx={2.5}
                    />
                  ))}
                </g>
              ) : null}
            </g>
          );
        })}
        {/* mug */}
        <rect x={520} y={640} width={64} height={64} rx={10} fill="#e0556b" />
        <path d="M 584 656 Q 616 660 612 686 Q 608 702 584 698" fill="none" stroke="#e0556b" strokeWidth={10} />
        {/* phone face-up next to keyboard */}
        <ellipse cx={1400} cy={690} rx={140} ry={50} fill="url(#phoneGlow)" opacity={0.7 + 0.3 * Math.sin(frame / 8)} />
        <rect x={1350} y={672} width={100} height={26} rx={9} fill="#16131f" stroke="#3a3354" strokeWidth={2} />
        <rect x={1360} y={677} width={80} height={16} rx={6} fill="#3d2d6e" />
        <DeskPerson x={960} y={840} frame={frame} />
      </svg>
      <NotifCard
        x={1190}
        y={300}
        frame={frame}
        appear={34}
        time="12:00 PM"
        rows={[
          {text: 'Auto-DCA executed ✓', size: 26, weight: 800, color: GREEN},
          {text: '$50 USDC → BTC · Week 14 of 52', size: 22},
          {text: 'Avg. cost basis down 3.1% this month.', size: 22, color: SUB},
        ]}
      />
      <Caption kicker="12:00 PM · Back-to-back meetings" caption={'Week 14 of DCA.\nYou didn’t lift a finger.'} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------- 8pm couch ----

const CouchScene: React.FC<{duration: number; tap: number}> = ({duration, tap}) => {
  const frame = useCurrentFrame();
  const opacity = sceneFade(frame, duration);
  const flicker = 0.7 + 0.3 * Math.abs(Math.sin(frame / 5) * Math.sin(frame / 13));
  return (
    <AbsoluteFill style={{backgroundColor: BG, opacity, fontFamily: FONT, overflow: 'hidden'}}>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute'}}>
        <DayDefs />
        <rect width={1920} height={1080} fill="#0e0b18" />
        <rect y={840} width={1920} height={240} fill="#0a0814" />
        {/* TV */}
        <ellipse cx={500} cy={520} rx={700} ry={460} fill="url(#tvGlow)" opacity={flicker} />
        <rect x={150} y={250} width={680} height={420} rx={16} fill="#05040a" stroke="#2c2440" strokeWidth={8} />
        <rect x={170} y={270} width={640} height={380} rx={8} fill="#1a2f24" />
        {/* court */}
        <rect x={170} y={520} width={640} height={130} fill="#c68a4e" />
        <line x1={490} y1={520} x2={490} y2={650} stroke="#f6f1e6" strokeWidth={4} />
        <circle cx={490} cy={585} r={42} fill="none" stroke="#f6f1e6" strokeWidth={4} />
        {/* players (simple dots) */}
        {[0, 1, 2, 3, 4].map((i) => (
          <circle
            key={i}
            cx={250 + i * 120 + Math.sin(frame / 9 + i * 2) * 26}
            cy={560 + Math.cos(frame / 11 + i) * 16}
            r={14}
            fill={i % 2 ? '#e0b13e' : '#5a8f5c'}
          />
        ))}
        {/* score bug */}
        <rect x={210} y={300} width={300} height={52} rx={10} fill="rgba(0,0,0,0.65)" />
        <text x={232} y={335} fontFamily={FONT} fontSize={27} fontWeight={800} fill="#f5f3ff">
          HOME 96 — 92 · Q4
        </text>
        {/* console */}
        <rect x={210} y={690} width={560} height={70} rx={12} fill="#1d1730" />
        {/* couch */}
        <rect x={1010} y={560} width={760} height={250} rx={40} fill="#2c2347" />
        <rect x={1010} y={500} width={760} height={120} rx={40} fill="#352a55" />
        <rect x={960} y={540} width={110} height={270} rx={30} fill="#352a55" />
        <rect x={1720} y={540} width={110} height={270} rx={30} fill="#352a55" />
        {/* ottoman */}
        <rect x={1040} y={780} width={300} height={90} rx={20} fill="#241c3c" />
        <CouchPerson x={1390} y={620} frame={frame} tap={tap} />
        {/* lamp */}
        <rect x={1860} y={300} width={10} height={260} fill="#1d1730" />
        <path d="M 1810 300 L 1920 300 L 1900 220 L 1830 220 Z" fill="#46356e" />
      </svg>
      <MarketCard x={1100} y={150} frame={frame} appear={30} tap={tap} />
      <Caption kicker="8:04 PM · Game on" caption={'It found the edge.\nYou just said yes.'} sub="Cross-platform odds, checked for you all night." />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------ night recap ----

const NightScene: React.FC<{duration: number}> = ({duration}) => {
  const frame = useCurrentFrame();
  const opacity = sceneFade(frame, duration);
  return (
    <AbsoluteFill style={{backgroundColor: BG, opacity, fontFamily: FONT, overflow: 'hidden'}}>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute'}}>
        <DayDefs />
        <Bedroom frame={frame} night />
      </svg>
      <NotifCard
        x={780}
        y={210}
        frame={frame}
        appear={26}
        time="11:30 PM"
        w={520}
        rows={[
          {text: 'Today, while you lived your life:', size: 22, color: SUB},
          {text: '✓ Alert armed · 9:31 AM', size: 23},
          {text: '✓ DCA executed · 12:00 PM', size: 23},
          {text: '✓ Market entered · 8:04 PM', size: 23},
          {text: 'P&L today: +$132', size: 27, weight: 800, color: GREEN},
        ]}
      />
      <Caption kicker="11:30 PM" caption={'Day’s work, done.\nGoodnight.'} sub="A recap in your pocket, every night." />
    </AbsoluteFill>
  );
};

// ----------------------------------------------------------------- root ----

const HOOK_D = 160;
const WALK_D = 150;
const DESK_D = 150;
const COUCH_D = 180;
const NIGHT_D = 150;
const END_D = 110;
export const DAY_TOTAL = HOOK_D + WALK_D + DESK_D + COUCH_D + NIGHT_D + END_D;

const END_CARD = {
  logo: 'nova-logo-white-on-purple.png',
  title: 'Put your wallet to work.',
  brand: 'NovaAgents',
  tagline: 'The AI agent in your Nova wallet',
  url: 'example.com/agents',
  disclaimer:
    'Illustrative. Automated features run on your settings. Trading involves risk — not financial advice.',
  duration: END_D,
};

export const DayAd: React.FC = () => {
  let cursor = 0;
  const seq = (d: number) => {
    const from = cursor;
    cursor += d;
    return from;
  };
  return (
    <AbsoluteFill style={{backgroundColor: BG}}>
      <Audio src={staticFile('music-day.wav')} />
      <Sequence from={seq(HOOK_D)} durationInFrames={HOOK_D}>
        <HookScene duration={HOOK_D} />
      </Sequence>
      <Sequence from={seq(WALK_D)} durationInFrames={WALK_D}>
        <WalkScene duration={WALK_D} />
      </Sequence>
      <Sequence from={seq(DESK_D)} durationInFrames={DESK_D}>
        <DeskScene duration={DESK_D} />
      </Sequence>
      <Sequence from={seq(COUCH_D)} durationInFrames={COUCH_D}>
        <CouchScene duration={COUCH_D} tap={104} />
      </Sequence>
      <Sequence from={seq(NIGHT_D)} durationInFrames={NIGHT_D}>
        <NightScene duration={NIGHT_D} />
      </Sequence>
      <Sequence from={seq(END_D)} durationInFrames={END_D}>
        <EndCard endCard={END_CARD} />
      </Sequence>
    </AbsoluteFill>
  );
};
