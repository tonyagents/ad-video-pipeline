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

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// deterministic pseudo-random (Math.random is unavailable / non-reproducible)
const rnd = (i: number, salt = 1) => {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

const sceneFade = (frame: number, duration: number) =>
  interpolate(frame, [0, 10, duration - 10, duration], [0, 1, 1, 0], clamp);

// ---------------------------------------------------------------- phone ----

type Market = {q1: string; q2: string; start: number; end: number};

const Phone: React.FC<{frame: number; tap: number; market: Market}> = ({
  frame,
  tap,
  market,
}) => {
  const placed = frame >= tap;
  const odds = Math.round(
    interpolate(frame, [0, Math.max(tap, 1)], [market.start, market.end], clamp)
  );
  const press = interpolate(frame, [tap - 4, tap, tap + 6], [1, 0.88, 1], clamp);
  const ring = interpolate(frame, [tap, tap + 16], [0, 1], clamp);
  const toast = spring({
    frame: frame - tap - 4,
    fps: 30,
    config: {damping: 14, stiffness: 160},
  });
  const glowPulse = 0.5 + 0.3 * Math.sin(frame / 9);

  return (
    <g>
      {/* screen light spilling out */}
      <ellipse cx={75} cy={140} rx={150} ry={210} fill="url(#screenSpill)" opacity={glowPulse} />
      {/* body */}
      <rect x={0} y={0} width={150} height={290} rx={24} fill="#16131f" stroke="rgba(255,255,255,0.22)" strokeWidth={2.5} />
      <rect x={6} y={6} width={138} height={278} rx={19} fill="#0c0a12" />
      <rect x={55} y={12} width={40} height={6} rx={3} fill="#1f1b2c" />
      {/* header */}
      <circle cx={22} cy={32} r={5} fill="#7D00FF" />
      <text x={33} y={36.5} fontFamily={FONT} fontSize={12} fontWeight={700} fill={PURPLE}>
        MoonAgents
      </text>
      {/* market question */}
      <text x={16} y={62} fontFamily={FONT} fontSize={13.5} fontWeight={700} fill="#f5f3ff">
        {market.q1}
      </text>
      <text x={16} y={80} fontFamily={FONT} fontSize={13.5} fontWeight={700} fill="#f5f3ff">
        {market.q2}
      </text>
      {/* big odds */}
      <text x={16} y={132} fontFamily={FONT} fontSize={46} fontWeight={800} fill={placed ? '#16c784' : '#f5f3ff'}>
        {odds}%
      </text>
      <text x={16} y={150} fontFamily={FONT} fontSize={11} fontWeight={700} fill={SUB} letterSpacing={2}>
        YES · LIVE
      </text>
      {/* sparkline */}
      <polyline
        points="16,180 36,173 56,177 76,162 96,166 116,152 134,143"
        fill="none"
        stroke="#16c784"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={134} cy={143} r={3.5 + 1.5 * Math.sin(frame / 5)} fill="#16c784" />
      {/* YES / NO buttons */}
      <g transform={`translate(43 220) scale(${press}) translate(-43 -220)`}>
        <rect x={14} y={203} width={58} height={34} rx={17} fill="#16c784" />
        <text x={43} y={225} fontFamily={FONT} fontSize={14} fontWeight={800} fill="#06281c" textAnchor="middle">
          YES
        </text>
      </g>
      <rect x={78} y={203} width={58} height={34} rx={17} fill="#3b1620" stroke="#ea3943" strokeWidth={1.5} />
      <text x={107} y={225} fontFamily={FONT} fontSize={14} fontWeight={800} fill="#ea3943" textAnchor="middle">
        NO
      </text>
      {/* tap ring */}
      {ring > 0 && ring < 1 ? (
        <circle cx={43} cy={220} r={8 + ring * 30} fill="none" stroke="#ffffff" strokeWidth={3 * (1 - ring)} opacity={1 - ring} />
      ) : null}
      {/* confirmation toast */}
      {placed ? (
        <g transform={`translate(0 ${(1 - toast) * 26})`} opacity={toast}>
          <rect x={14} y={248} width={122} height={28} rx={14} fill="rgba(22,199,132,0.18)" stroke="#16c784" strokeWidth={1.5} />
          <text x={75} y={266.5} fontFamily={FONT} fontSize={12.5} fontWeight={800} fill="#16c784" textAnchor="middle">
            ✓ Bet placed
          </text>
        </g>
      ) : null}
    </g>
  );
};

// ----------------------------------------------------------- characters ----

type Kind = 'jaguar' | 'eagle' | 'moose';

const PALETTE: Record<
  Kind,
  {body: string; bodyDark: string; face: string; jersey: string; trim: string; shorts: string}
> = {
  jaguar: {body: '#e5a23c', bodyDark: '#b97a22', face: '#f6d9a0', jersey: '#0e8a4c', trim: '#ffffff', shorts: '#f2f0f6'},
  eagle: {body: '#5a3d22', bodyDark: '#412c18', face: '#f4f1ea', jersey: '#1f4fa0', trim: '#e0312f', shorts: '#f2f0f6'},
  moose: {body: '#7a5230', bodyDark: '#5d3d22', face: '#a9774a', jersey: '#d6273b', trim: '#ffffff', shorts: '#f2f0f6'},
};

const Eye: React.FC<{
  cx: number;
  cy: number;
  frame: number;
  happy: boolean;
  lookX: number;
  lookY: number;
  scale?: number;
}> = ({cx, cy, frame, happy, lookX, lookY, scale = 1}) => {
  const t = (frame + cx * 3) % 110;
  const blink = t > 102 ? interpolate(t, [102, 106, 110], [1, 0.08, 1]) : 1;
  if (happy) {
    return (
      <path
        d={`M ${cx - 17 * scale} ${cy} Q ${cx} ${cy - 16 * scale} ${cx + 17 * scale} ${cy}`}
        stroke="#241608"
        strokeWidth={6 * scale}
        strokeLinecap="round"
        fill="none"
      />
    );
  }
  return (
    <g transform={`translate(${cx} ${cy}) scale(1 ${blink}) translate(${-cx} ${-cy})`}>
      <ellipse cx={cx} cy={cy} rx={19 * scale} ry={23 * scale} fill="#ffffff" />
      <circle cx={cx + lookX} cy={cy + lookY} r={10.5 * scale} fill="#5a3a14" />
      <circle cx={cx + lookX} cy={cy + lookY} r={5.5 * scale} fill="#1c1006" />
      <circle cx={cx + lookX + 3} cy={cy + lookY - 3.5} r={2.6 * scale} fill="#ffffff" />
    </g>
  );
};

const Character: React.FC<{
  kind: Kind;
  frame: number;
  tap: number;
  loop?: boolean;
  market: Market;
}> = ({kind, frame, tap, loop, market}) => {
  const P = PALETTE[kind];
  const celebrate = loop || frame >= tap + 6;
  const surprise = !loop && frame >= tap - 26 && frame < tap + 6;

  // idle + celebration motion
  const breathe = 1 + 0.012 * Math.sin(frame / 11);
  const t = frame - (tap + 6);
  const bounce = loop
    ? Math.abs(Math.sin(frame / 9)) * 26
    : t > 0
      ? Math.abs(Math.sin(t / 7.5)) * 44 * Math.exp(-t / 50)
      : 0;
  const tilt =
    (loop ? -8 : interpolate(frame, [tap - 26, tap - 16, tap + 6, tap + 16], [9, 3, 3, -8], clamp)) +
    1.6 * Math.sin(frame / 14);
  const lookX = celebrate ? 0 : surprise ? 0 : 6 * Math.sin(frame / 9);
  const lookY = celebrate ? -2 : 7;
  const browLift = surprise ? -10 : celebrate ? -5 : 0;
  const glow = 0.16 + 0.07 * Math.sin(frame / 8);

  // mouth
  const mouth = surprise ? (
    <ellipse cx={0} cy={36} rx={9} ry={12} fill="#241608" />
  ) : celebrate ? (
    <path d="M -24 28 Q 0 62 24 28 Q 0 40 -24 28 Z" fill="#241608" />
  ) : (
    <path d="M -13 36 Q 0 43 13 36" stroke="#241608" strokeWidth={5} strokeLinecap="round" fill="none" />
  );

  // head decorations per species
  const headExtras =
    kind === 'jaguar' ? (
      <>
        <circle cx={-72} cy={-72} r={30} fill={P.body} />
        <circle cx={72} cy={-72} r={30} fill={P.body} />
        <circle cx={-72} cy={-72} r={15} fill="#d97aa6" />
        <circle cx={72} cy={-72} r={15} fill="#d97aa6" />
        {[-58, 60, -20, 30].map((x, i) => (
          <ellipse key={i} cx={x} cy={i % 2 ? -78 : -60} rx={9} ry={6} fill="#7a4a12" opacity={0.85} />
        ))}
      </>
    ) : kind === 'eagle' ? (
      <>
        {/* feather spikes */}
        <path d="M -88 -40 L -110 -64 L -84 -58 L -100 -86 L -70 -72 L -76 -100 L -50 -80 Z" fill={P.face} />
        <path d="M 88 -40 L 110 -64 L 84 -58 L 100 -86 L 70 -72 L 76 -100 L 50 -80 Z" fill={P.face} />
      </>
    ) : (
      <>
        {/* moose antlers — branched beams with tines */}
        {[1, -1].map((dir) => (
          <g key={dir} transform={`scale(${dir} 1)`} stroke="#c89455" strokeWidth={15} strokeLinecap="round" fill="none">
            <path d="M -46 -60 Q -64 -92 -88 -106" />
            <path d="M -88 -106 Q -116 -116 -140 -108" />
            <path d="M -86 -108 Q -94 -138 -84 -160" />
            <path d="M -116 -112 Q -130 -138 -126 -160" />
            <path d="M -140 -108 Q -156 -126 -156 -146" />
          </g>
        ))}
        <ellipse cx={-88} cy={-30} rx={20} ry={12} fill={P.body} transform="rotate(-35 -88 -30)" />
        <ellipse cx={88} cy={-30} rx={20} ry={12} fill={P.body} transform="rotate(35 88 -30)" />
      </>
    );

  const snout =
    kind === 'jaguar' ? (
      <>
        <ellipse cx={0} cy={28} rx={46} ry={34} fill={P.face} />
        <path d="M -12 12 L 12 12 L 0 26 Z" fill="#241608" />
        {[-30, -38, -24].map((x, i) => (
          <circle key={i} cx={x} cy={26 + i * 7} r={2} fill="#7a4a12" />
        ))}
        {[30, 38, 24].map((x, i) => (
          <circle key={`r${i}`} cx={x} cy={26 + i * 7} r={2} fill="#7a4a12" />
        ))}
      </>
    ) : kind === 'eagle' ? (
      <path d="M -21 2 Q 0 -10 21 2 Q 28 24 10 44 Q 2 52 -5 44 Q -28 26 -21 2 Z" fill="#f2a93b" stroke="#d68a1e" strokeWidth={2.5} />
    ) : (
      <>
        <ellipse cx={0} cy={34} rx={58} ry={42} fill={P.face} />
        <ellipse cx={-20} cy={28} rx={7} ry={9} fill="#3d2918" />
        <ellipse cx={20} cy={28} rx={7} ry={9} fill="#3d2918" />
      </>
    );

  const eyeY = kind === 'moose' ? -22 : -8;
  const headR = kind === 'moose' ? 86 : 95;

  return (
    <g transform={`translate(0 ${-bounce})`}>
      {/* ground shadow stays put visually — drawn by scene, not here */}
      {/* tail (jaguar) */}
      {kind === 'jaguar' ? (
        <path
          d={`M 370 540 Q 440 520 445 ${455 + 18 * Math.sin(frame / 10)} Q 448 ${420 + 22 * Math.sin(frame / 10)} 420 ${430 + 22 * Math.sin(frame / 10)}`}
          stroke={P.body}
          strokeWidth={26}
          strokeLinecap="round"
          fill="none"
        />
      ) : null}
      {/* legs + shoes */}
      <rect x={198} y={540} width={44} height={92} rx={20} fill={P.body} />
      <rect x={278} y={540} width={44} height={92} rx={20} fill={P.body} />
      <ellipse cx={214} cy={644} rx={48} ry={22} fill="#fbfaff" stroke="#d8d4e8" strokeWidth={3} />
      <ellipse cx={306} cy={644} rx={48} ry={22} fill="#fbfaff" stroke="#d8d4e8" strokeWidth={3} />
      {/* torso */}
      <g transform={`translate(260 460) scale(1 ${breathe}) translate(-260 -460)`}>
        <rect x={182} y={492} width={156} height={70} rx={30} fill={P.shorts} />
        <ellipse cx={260} cy={420} rx={118} ry={132} fill={P.jersey} />
        <path d="M 150 372 Q 142 420 152 458 L 190 450 Q 180 412 186 376 Z" fill={P.trim} opacity={0.9} />
        <path d="M 370 372 Q 378 420 368 458 L 330 450 Q 340 412 334 376 Z" fill={P.trim} opacity={0.9} />
      </g>
      {/* arms reaching to phone */}
      <path d="M 158 380 Q 146 462 205 494" stroke={P.body} strokeWidth={30} strokeLinecap="round" fill="none" />
      <path d="M 362 380 Q 374 462 317 486" stroke={P.body} strokeWidth={30} strokeLinecap="round" fill="none" />
      {/* phone */}
      <g transform="translate(201 348) rotate(-4 60 116) scale(0.8)">
        <Phone frame={frame} tap={loop ? -9999 : tap} market={market} />
      </g>
      {/* hands gripping phone */}
      <ellipse cx={206} cy={497} rx={26} ry={23} fill={P.body} stroke={P.bodyDark} strokeWidth={3} />
      <ellipse cx={316} cy={488} rx={26} ry={23} fill={P.body} stroke={P.bodyDark} strokeWidth={3} />
      {/* head */}
      <g transform={`translate(260 202) rotate(${tilt})`}>
        {headExtras}
        <circle cx={0} cy={0} r={headR} fill={kind === 'eagle' ? P.face : P.body} />
        {kind === 'jaguar' ? (
          <g fill="#7a4a12" opacity={0.8}>
            <ellipse cx={-70} cy={-50} rx={8} ry={6} />
            <ellipse cx={70} cy={-50} rx={8} ry={6} />
            <ellipse cx={-38} cy={-84} rx={7} ry={5} />
            <ellipse cx={38} cy={-84} rx={7} ry={5} />
            <ellipse cx={-84} cy={-6} rx={7} ry={6} />
            <ellipse cx={84} cy={-6} rx={7} ry={6} />
            <ellipse cx={0} cy={-92} rx={7} ry={5} />
          </g>
        ) : null}
        {snout}
        <Eye cx={-40} cy={eyeY} frame={frame} happy={celebrate} lookX={lookX} lookY={lookY} />
        <Eye cx={40} cy={eyeY} frame={frame} happy={celebrate} lookX={lookX} lookY={lookY} />
        {/* brows */}
        <path
          d={`M -56 ${eyeY - 34 + browLift} Q -40 ${eyeY - 42 + browLift} -24 ${eyeY - 34 + browLift}`}
          stroke={kind === 'eagle' ? '#412c18' : '#241608'}
          strokeWidth={7}
          strokeLinecap="round"
          fill="none"
        />
        <path
          d={`M 24 ${eyeY - 34 + browLift} Q 40 ${eyeY - 42 + browLift} 56 ${eyeY - 34 + browLift}`}
          stroke={kind === 'eagle' ? '#412c18' : '#241608'}
          strokeWidth={7}
          strokeLinecap="round"
          fill="none"
        />
        <g transform={kind === 'eagle' ? 'translate(0 6)' : ''}>{mouth}</g>
        {/* phone light on the face */}
        <ellipse cx={0} cy={34} rx={78} ry={52} fill="url(#faceGlow)" opacity={glow + (celebrate ? 0.06 : 0)} />
      </g>
    </g>
  );
};

// ------------------------------------------------------------ confetti ----

const Confetti: React.FC<{frame: number; tap: number; ox: number; oy: number}> = ({
  frame,
  tap,
  ox,
  oy,
}) => {
  const colors = ['#a78bfa', '#7D00FF', '#16c784', '#ffd166', '#ff5fa2', '#3ec6ff'];
  const t = frame - tap;
  if (t < 0 || t > 85) return null;
  return (
    <>
      {Array.from({length: 30}, (_, i) => {
        const a = -Math.PI / 2 + (rnd(i, 3) - 0.5) * 2.2;
        const v = 9 + rnd(i, 5) * 13;
        const x = ox + Math.cos(a) * v * t;
        const y = oy + Math.sin(a) * v * t + 0.22 * t * t;
        const rot = t * (rnd(i, 7) - 0.5) * 30;
        const o = interpolate(t, [0, 8, 60, 85], [0, 1, 1, 0], clamp);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: 14 + rnd(i, 9) * 10,
              height: 9 + rnd(i, 11) * 8,
              borderRadius: 3,
              background: colors[i % colors.length],
              transform: `rotate(${rot}deg)`,
              opacity: o,
            }}
          />
        );
      })}
    </>
  );
};

const ConfettiRain: React.FC<{frame: number}> = ({frame}) => {
  const colors = ['#a78bfa', '#7D00FF', '#16c784', '#ffd166', '#ff5fa2', '#3ec6ff'];
  return (
    <>
      {Array.from({length: 36}, (_, i) => {
        const speed = 4 + rnd(i, 2) * 5;
        const x = rnd(i, 4) * 1920 + 40 * Math.sin(frame / 20 + i);
        const y = ((rnd(i, 6) * 1400 + frame * speed) % 1300) - 120;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: 12 + rnd(i, 8) * 10,
              height: 8 + rnd(i, 10) * 8,
              borderRadius: 3,
              background: colors[i % colors.length],
              transform: `rotate(${frame * (4 + rnd(i, 12) * 6) + i * 40}deg)`,
              opacity: 0.85,
            }}
          />
        );
      })}
    </>
  );
};

// ---------------------------------------------------------- city scenes ----

const SharedDefs: React.FC = () => (
  <defs>
    <radialGradient id="faceGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stopColor="#cdb7ff" stopOpacity="0.9" />
      <stop offset="100%" stopColor="#cdb7ff" stopOpacity="0" />
    </radialGradient>
    <radialGradient id="screenSpill" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stopColor="#b9a3ff" stopOpacity="0.35" />
      <stop offset="100%" stopColor="#b9a3ff" stopOpacity="0" />
    </radialGradient>
    <linearGradient id="skyMx" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#241047" />
      <stop offset="55%" stopColor="#6b2a72" />
      <stop offset="100%" stopColor="#e2683f" />
    </linearGradient>
    <linearGradient id="skyLa" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#341a55" />
      <stop offset="55%" stopColor="#b1338a" />
      <stop offset="100%" stopColor="#ff8c42" />
    </linearGradient>
    <linearGradient id="skyTor" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#04050f" />
      <stop offset="70%" stopColor="#0d1c38" />
      <stop offset="100%" stopColor="#1a2f55" />
    </linearGradient>
    <radialGradient id="sun" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stopColor="#ffd9a0" stopOpacity="0.95" />
      <stop offset="100%" stopColor="#ffd9a0" stopOpacity="0" />
    </radialGradient>
    <radialGradient id="spot" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.25" />
      <stop offset="100%" stopColor="#a78bfa" stopOpacity="0" />
    </radialGradient>
  </defs>
);

const Skyline: React.FC<{salt: number; color: string; baseY: number; maxH: number}> = ({
  salt,
  color,
  baseY,
  maxH,
}) => (
  <g fill={color}>
    {Array.from({length: 26}, (_, i) => {
      const w = 60 + rnd(i, salt) * 90;
      const h = 40 + rnd(i, salt + 1) * maxH;
      const x = (i / 26) * 1980 - 30;
      return <rect key={i} x={x} y={baseY - h} width={w} height={h} />;
    })}
  </g>
);

const PapelPicado: React.FC<{frame: number; y: number; flip?: boolean}> = ({frame, y, flip}) => {
  const colors = ['#ff5fa2', '#3ec6ff', '#ffd166', '#7cf29c', '#c79bff', '#ff8e6b'];
  return (
    <g>
      <path d={`M -20 ${y} Q 960 ${y + 70} 1940 ${y}`} stroke="rgba(255,255,255,0.5)" strokeWidth={3} fill="none" />
      {Array.from({length: 16}, (_, i) => {
        const tx = 30 + i * 120;
        const ty = y + Math.sin((tx / 1920) * Math.PI) * 66;
        const sway = Math.sin(frame / 16 + i) * 6 * (flip ? -1 : 1);
        return (
          <g key={i} transform={`translate(${tx} ${ty}) rotate(${sway})`}>
            <path d="M 0 0 L 74 0 L 74 44 L 37 60 L 0 44 Z" fill={colors[i % colors.length]} opacity={0.92} />
            <circle cx={22} cy={20} r={6} fill="rgba(8,7,12,0.35)" />
            <circle cx={52} cy={20} r={6} fill="rgba(8,7,12,0.35)" />
            <circle cx={37} cy={38} r={6} fill="rgba(8,7,12,0.35)" />
          </g>
        );
      })}
    </g>
  );
};

const Palm: React.FC<{x: number; y: number; s: number; frame: number; i: number}> = ({x, y, s, frame, i}) => {
  const sway = Math.sin(frame / 22 + i * 2) * 3;
  return (
    <g transform={`translate(${x} ${y}) scale(${s}) rotate(${sway})`} fill="#160d22">
      <path d="M -10 0 Q -4 -150 8 -210 L 24 -208 Q 16 -150 14 0 Z" />
      {[-150, -100, -50, 10, 60, 115].map((deg, j) => (
        <ellipse key={j} cx={16} cy={-212} rx={86} ry={20} transform={`rotate(${deg + sway * 1.5} 16 -212)`} />
      ))}
      <circle cx={16} cy={-212} r={14} />
    </g>
  );
};

const CnTower: React.FC<{frame: number; x: number}> = ({frame, x}) => (
  <g transform={`translate(${x} 0)`}>
    <path d="M -16 880 L -10 330 L 10 330 L 16 880 Z" fill="#0a1226" />
    <ellipse cx={0} cy={330} rx={52} ry={30} fill="#0a1226" />
    <ellipse cx={0} cy={322} rx={52} ry={12} fill="#16233f" />
    <rect x={-7} y={170} width={14} height={140} fill="#0a1226" />
    <rect x={-3} y={96} width={6} height={80} fill="#0a1226" />
    <circle cx={0} cy={92} r={7} fill="#ff3b30" opacity={0.45 + 0.45 * Math.sin(frame / 7)} />
    {/* pod windows */}
    {[-36, -18, 0, 18, 36].map((wx) => (
      <rect key={wx} x={wx - 5} y={324} width={10} height={9} rx={2} fill="#ffd166" opacity={0.85} />
    ))}
  </g>
);

const Angel: React.FC<{x: number}> = ({x}) => (
  <g transform={`translate(${x} 0)`}>
    <rect x={-58} y={836} width={116} height={44} rx={6} fill="#141022" />
    <rect x={-34} y={812} width={68} height={28} rx={4} fill="#1a1430" />
    <rect x={-20} y={470} width={40} height={344} fill="#1a1430" />
    <rect x={-30} y={446} width={60} height={26} rx={5} fill="#241c40" />
    {/* golden victoria */}
    <g fill="#f3c14b">
      <circle cx={0} cy={386} r={12} />
      <path d="M -12 398 L 12 398 L 20 442 L -20 442 Z" />
      <path d="M 8 400 Q 52 372 58 336 Q 30 360 6 386 Z" />
      <path d="M -10 402 Q -40 386 -46 358 Q -26 376 -6 394 Z" />
    </g>
  </g>
);

const Stars: React.FC<{frame: number}> = ({frame}) => (
  <g fill="#dfe8ff">
    {Array.from({length: 26}, (_, i) => (
      <circle
        key={i}
        cx={rnd(i, 21) * 1920}
        cy={rnd(i, 23) * 420}
        r={1.2 + rnd(i, 25) * 1.8}
        opacity={0.25 + 0.55 * Math.abs(Math.sin(frame / 13 + i * 1.7))}
      />
    ))}
  </g>
);

const Bokeh: React.FC<{frame: number; tint: string}> = ({frame, tint}) => (
  <g fill={tint}>
    {Array.from({length: 12}, (_, i) => {
      const y = (((rnd(i, 31) * 1080 - frame * (0.4 + rnd(i, 33))) % 1080) + 1080) % 1080;
      return (
        <circle key={i} cx={rnd(i, 35) * 1920} cy={y} r={8 + rnd(i, 37) * 26} opacity={0.05 + rnd(i, 39) * 0.07} />
      );
    })}
  </g>
);

type City = 'mx' | 'la' | 'tor';

const CityBackdrop: React.FC<{city: City; frame: number}> = ({city, frame}) => {
  if (city === 'mx') {
    return (
      <>
        <rect width={1920} height={1080} fill="url(#skyMx)" />
        <circle cx={420} cy={760} r={300} fill="url(#sun)" />
        <Skyline salt={11} color="#1d1230" baseY={880} maxH={260} />
        <Angel x={1520} />
        <rect y={880} width={1920} height={200} fill="#120c1d" />
        <PapelPicado frame={frame} y={64} />
        <PapelPicado frame={frame} y={170} flip />
        <Bokeh frame={frame} tint="#ffd166" />
      </>
    );
  }
  if (city === 'la') {
    return (
      <>
        <rect width={1920} height={1080} fill="url(#skyLa)" />
        <circle cx={1280} cy={820} r={130} fill="#ffe2b0" />
        <circle cx={1280} cy={820} r={340} fill="url(#sun)" />
        {/* hills */}
        <path d="M 0 760 Q 360 640 760 740 Q 1100 820 1920 700 L 1920 1080 L 0 1080 Z" fill="#1f1133" />
        <Skyline salt={51} color="#170d28" baseY={900} maxH={200} />
        <Palm x={170} y={1000} s={1.25} frame={frame} i={0} />
        <Palm x={420} y={990} s={0.9} frame={frame} i={1} />
        <Palm x={1560} y={1000} s={1.35} frame={frame} i={2} />
        <Palm x={1790} y={985} s={1.0} frame={frame} i={3} />
        <rect y={930} width={1920} height={150} fill="#120a20" />
        <Bokeh frame={frame} tint="#ff9e6b" />
      </>
    );
  }
  return (
    <>
      <rect width={1920} height={1080} fill="url(#skyTor)" />
      <Stars frame={frame} />
      <circle cx={330} cy={200} r={64} fill="#e9eefc" opacity={0.92} />
      <circle cx={308} cy={186} r={56} fill="#0a1226" opacity={0.25} />
      <Skyline salt={71} color="#0a1226" baseY={880} maxH={300} />
      {/* lit windows */}
      <g fill="#ffd166">
        {Array.from({length: 60}, (_, i) => (
          <rect
            key={i}
            x={rnd(i, 81) * 1880 + 10}
            y={650 + rnd(i, 83) * 210}
            width={7}
            height={9}
            opacity={0.25 + 0.6 * rnd(i, 85)}
          />
        ))}
      </g>
      <CnTower frame={frame} x={1430} />
      <rect y={880} width={1920} height={200} fill="#070b18" />
      <Bokeh frame={frame} tint="#9fc1ff" />
    </>
  );
};

// ------------------------------------------------------- scene wrapper ----

const KIND_FOR: Record<City, Kind> = {mx: 'jaguar', la: 'eagle', tor: 'moose'};

const CHAR_X = 648; // translate so the 520-wide character sits center frame at scale 1.2
const CHAR_Y = 208;
const CHAR_S = 1.2;

const CityScene: React.FC<{
  city: City;
  duration: number;
  tap: number;
  market: Market;
  kicker?: string;
  caption?: string;
  sub?: string;
  panel?: boolean;
}> = ({city, duration, tap, market, kicker, caption, sub, panel}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const opacity = panel ? 1 : sceneFade(frame, duration);
  const push = interpolate(frame, [0, duration], [1, panel ? 1.04 : 1.09], {
    easing: Easing.out(Easing.quad),
  });
  const slide = spring({frame, fps, config: {damping: 200, stiffness: 60}});

  return (
    <AbsoluteFill style={{backgroundColor: BG, opacity, fontFamily: FONT, overflow: 'hidden'}}>
      <div
        style={{
          position: 'absolute',
          width: 1920,
          height: 1080,
          transform: `scale(${push})`,
          transformOrigin: '50% 62%',
        }}
      >
        <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute'}}>
          <SharedDefs />
          <CityBackdrop city={city} frame={frame} />
          {/* spotlight + contact shadow under the character */}
          <ellipse cx={960} cy={1000} rx={560} ry={220} fill="url(#spot)" />
          <ellipse cx={960} cy={1004} rx={250} ry={36} fill="rgba(0,0,0,0.45)" />
          <g transform={`translate(${CHAR_X} ${CHAR_Y}) scale(${CHAR_S})`}>
            <Character kind={KIND_FOR[city]} frame={frame} tap={tap} loop={panel} market={market} />
          </g>
        </svg>
        {!panel ? <Confetti frame={frame} tap={tap + 4} ox={960} oy={760} /> : null}
      </div>
      {!panel && caption ? (
        <>
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              height: 420,
              background: 'linear-gradient(180deg, rgba(8,7,12,0) 0%, rgba(8,7,12,0.88) 78%)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: 96,
              bottom: 72,
              opacity: slide,
              transform: `translateY(${(1 - slide) * 28}px)`,
            }}
          >
            <div style={{fontSize: 24, fontWeight: 700, color: PURPLE, letterSpacing: 4, textTransform: 'uppercase', marginBottom: 16}}>
              {kicker}
            </div>
            <div style={{fontSize: 64, fontWeight: 800, color: TEXT, letterSpacing: -1.5, lineHeight: 1.08, whiteSpace: 'pre-line'}}>
              {caption}
            </div>
            {sub ? (
              <div style={{fontSize: 27, fontWeight: 500, color: SUB, marginTop: 16}}>{sub}</div>
            ) : null}
          </div>
        </>
      ) : null}
    </AbsoluteFill>
  );
};

// ----------------------------------------------------------------- hook ----

const HOOK_MARKETS: Market[] = [
  {q1: 'Mexico wins', q2: 'Group A?', start: 81, end: 84},
  {q1: 'USA reaches the', q2: 'Quarter-finals?', start: 58, end: 60},
  {q1: 'Canada tops', q2: 'Group B?', start: 31, end: 32},
];

const MascotHook: React.FC<{duration: number}> = ({duration}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const opacity = sceneFade(frame, duration);
  const titleIn = interpolate(frame, [14, 34], [0, 1], clamp);

  return (
    <AbsoluteFill style={{backgroundColor: BG, opacity, fontFamily: FONT, overflow: 'hidden'}}>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute'}}>
        <SharedDefs />
        <rect width={1920} height={1080} fill="#08070c" />
        <ellipse cx={960} cy={620} rx={1100} ry={620} fill="url(#spot)" />
        <Bokeh frame={frame} tint="#a78bfa" />
        <rect y={1004} width={1920} height={76} fill="#0d0b14" />
        {(['jaguar', 'eagle', 'moose'] as Kind[]).map((kind, i) => {
          const x = [430, 960, 1490][i];
          const enter = spring({frame: frame - 6 - i * 7, fps, config: {damping: 16, stiffness: 90}});
          return (
            <g key={kind} transform={`translate(${x - 221} ${452 + (1 - enter) * 80}) scale(0.85)`} opacity={enter}>
              <ellipse cx={260} cy={668} rx={240} ry={30} fill="rgba(0,0,0,0.5)" />
              <Character kind={kind} frame={frame + i * 17} tap={9999} market={HOOK_MARKETS[i]} />
            </g>
          );
        })}
      </svg>
      <div
        style={{
          position: 'absolute',
          top: 86,
          left: 0,
          right: 0,
          textAlign: 'center',
          opacity: titleIn,
          transform: `translateY(${(1 - titleIn) * 24}px)`,
        }}
      >
        <div style={{fontSize: 80, fontWeight: 800, color: TEXT, letterSpacing: -2}}>
          World Cup 2026.
        </div>
        <div style={{fontSize: 34, fontWeight: 500, color: SUB, marginTop: 14}}>
          Even the mascots are on the markets.
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------- triptych ----

const Triptych: React.FC<{duration: number}> = ({duration}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const opacity = sceneFade(frame, duration);
  const slide = spring({frame, fps, config: {damping: 200, stiffness: 60}});

  return (
    <AbsoluteFill style={{backgroundColor: BG, opacity, fontFamily: FONT}}>
      {(['mx', 'la', 'tor'] as City[]).map((city, i) => (
        <div
          key={city}
          style={{
            position: 'absolute',
            left: i * 642,
            top: 0,
            width: 636,
            height: 1080,
            overflow: 'hidden',
            borderRight: i < 2 ? '3px solid rgba(255,255,255,0.08)' : undefined,
          }}
        >
          <div style={{position: 'absolute', left: -642, top: 0, width: 1920, height: 1080}}>
            <CityScene
              city={city}
              duration={duration}
              tap={-9999}
              market={HOOK_MARKETS[i]}
              panel
            />
          </div>
        </div>
      ))}
      <ConfettiRain frame={frame} />
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: 380,
          background: 'linear-gradient(180deg, rgba(8,7,12,0) 0%, rgba(8,7,12,0.9) 80%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 86,
          textAlign: 'center',
          opacity: slide,
          transform: `translateY(${(1 - slide) * 28}px)`,
        }}
      >
        <div style={{fontSize: 24, fontWeight: 700, color: PURPLE, letterSpacing: 4, textTransform: 'uppercase', marginBottom: 16}}>
          Mexico City · Los Angeles · Toronto
        </div>
        <div style={{fontSize: 66, fontWeight: 800, color: TEXT, letterSpacing: -1.5}}>
          Three host nations. One agent.
        </div>
        <div style={{fontSize: 27, fontWeight: 500, color: SUB, marginTop: 14}}>
          Live odds on every match — traded straight from your wallet.
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ----------------------------------------------------------------- root ----

const HOOK_D = 150;
const MX_D = 170;
const LA_D = 170;
const TOR_D = 170;
const TRI_D = 140;
const END_D = 110;
export const MASCOT_TOTAL = HOOK_D + MX_D + LA_D + TOR_D + TRI_D + END_D;

const END_CARD = {
  logo: 'moonpay-logo-white-on-purple.png',
  title: 'Trade the World Cup.',
  brand: 'MoonAgents',
  tagline: 'The AI agent in your MoonPay wallet',
  url: 'moonpay.com/agents',
  disclaimer:
    'Prediction markets involve risk. Informational, not financial advice. Fan-made characters — not affiliated with FIFA.',
  duration: END_D,
};

export const MascotAd: React.FC = () => {
  let cursor = 0;
  const seq = (d: number) => {
    const from = cursor;
    cursor += d;
    return from;
  };
  return (
    <AbsoluteFill style={{backgroundColor: BG}}>
      <Audio src={staticFile('music-mascots.wav')} />
      <Sequence from={seq(HOOK_D)} durationInFrames={HOOK_D}>
        <MascotHook duration={HOOK_D} />
      </Sequence>
      <Sequence from={seq(MX_D)} durationInFrames={MX_D}>
        <CityScene
          city="mx"
          duration={MX_D}
          tap={96}
          market={{q1: 'Mexico wins', q2: 'Group A?', start: 81, end: 87}}
          kicker="Mexico City"
          caption={'Home crowd energy.\n87% and climbing.'}
          sub="Live Polymarket odds, right in the wallet."
        />
      </Sequence>
      <Sequence from={seq(LA_D)} durationInFrames={LA_D}>
        <CityScene
          city="la"
          duration={LA_D}
          tap={96}
          market={{q1: 'USA reaches the', q2: 'Quarter-finals?', start: 58, end: 64}}
          kicker="Los Angeles"
          caption={'Eagle’s got a read.\nQuarters or bust.'}
          sub="One tap. Position opened."
        />
      </Sequence>
      <Sequence from={seq(TOR_D)} durationInFrames={TOR_D}>
        <CityScene
          city="tor"
          duration={TOR_D}
          tap={96}
          market={{q1: 'Canada tops', q2: 'Group B?', start: 31, end: 35}}
          kicker="Toronto"
          caption={'Long odds.\nBig moose energy.'}
          sub="Underdog money hits different."
        />
      </Sequence>
      <Sequence from={seq(TRI_D)} durationInFrames={TRI_D}>
        <Triptych duration={TRI_D} />
      </Sequence>
      <Sequence from={seq(END_D)} durationInFrames={END_D}>
        <EndCard endCard={END_CARD} />
      </Sequence>
    </AbsoluteFill>
  );
};
