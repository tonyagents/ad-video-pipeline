import React, {useEffect, useState} from 'react';
import {
  AbsoluteFill,
  Audio,
  Easing,
  Img,
  OffthreadVideo,
  Sequence,
  continueRender,
  delayRender,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

// MoonPay Agents — MCP connection ad, in the Public.com editorial style:
// purple-tinted blueprint grid, high-contrast SERIF headlines that build line-by-line,
// a glowing integration pill with a light-sweep, real screenshots full-screen, sans CTA.
// See references/public-ad/ for the reference.

const SANS =
  "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif";
const SERIF = "'Fraunces', Georgia, 'Times New Roman', serif";
const MONO = "'PlexMono', ui-monospace, 'SF Mono', Menlo, monospace";
const BG = '#07050d';
const TEXT = '#f5f3ff';
const PURPLE = '#8B5CF6';
const PURPLE_LT = '#b8a8fc';
const SUB = '#8b8698';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const useFonts = () => {
  const [h] = useState(() => delayRender('fonts'));
  useEffect(() => {
    Promise.all([
      new FontFace('Fraunces', `url(${staticFile('fraunces-600.woff2')})`, {weight: '600'}).load(),
      new FontFace('Fraunces', `url(${staticFile('fraunces-400.woff2')})`, {weight: '400'}).load(),
      new FontFace('PlexMono', `url(${staticFile('plexmono-500.woff2')})`, {weight: '500'}).load(),
    ])
      .then((fs) => {
        fs.forEach((f) => (document.fonts as unknown as {add: (x: FontFace) => void}).add(f));
        continueRender(h);
      })
      .catch(() => continueRender(h));
  }, [h]);
};

// blueprint grid + drifting colour blobs (so glass refracts colour) + glow + vignette
const GridBg: React.FC = () => {
  const frame = useCurrentFrame();
  const drift = (frame * 0.12) % 90;
  const b1x = 30 + Math.sin(frame * 0.012) * 8;
  const b2x = 70 + Math.cos(frame * 0.01) * 8;
  const b1y = 40 + Math.cos(frame * 0.009) * 6;
  const b2y = 58 + Math.sin(frame * 0.011) * 6;
  return (
    <AbsoluteFill style={{backgroundColor: BG}}>
      {/* drifting colour blobs */}
      <div style={{position: 'absolute', left: `${b1x}%`, top: `${b1y}%`, width: 760, height: 760, transform: 'translate(-50%,-50%)', background: 'radial-gradient(circle, rgba(124,58,237,0.45) 0%, rgba(124,58,237,0) 65%)', filter: 'blur(40px)'}} />
      <div style={{position: 'absolute', left: `${b2x}%`, top: `${b2y}%`, width: 680, height: 680, transform: 'translate(-50%,-50%)', background: 'radial-gradient(circle, rgba(56,89,224,0.40) 0%, rgba(56,89,224,0) 65%)', filter: 'blur(40px)'}} />
      <AbsoluteFill
        style={{
          backgroundImage:
            'linear-gradient(rgba(139,92,246,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.06) 1px, transparent 1px)',
          backgroundSize: '90px 90px',
          backgroundPosition: `0px ${drift}px`,
        }}
      />
      <AbsoluteFill
        style={{boxShadow: 'inset 0 0 420px 130px rgba(7,5,13,0.92)'}}
      />
    </AbsoluteFill>
  );
};

// ---- title that builds line by line (bold sans, our house headline font) ----
const Title: React.FC<{lines: string[]; duration: number}> = ({lines, duration}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 12, duration - 14, duration], [0, 1, 1, 0], clamp);
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity}}>
      <GridBg />
      <div style={{position: 'relative', textAlign: 'center', fontFamily: SANS}}>
        {lines.map((ln, i) => {
          const inAt = 8 + i * 24;
          const o = interpolate(frame, [inAt, inAt + 18], [0, 1], clamp);
          const y = interpolate(frame, [inAt, inAt + 18], [24, 0], {...clamp, easing: Easing.out(Easing.cubic)});
          return (
            <div
              key={i}
              style={{
                fontSize: 84,
                fontWeight: 800,
                color: i === lines.length - 1 ? PURPLE_LT : TEXT,
                letterSpacing: -2,
                lineHeight: 1.08,
                opacity: o,
                transform: `translateY(${y}px)`,
              }}
            >
              {ln}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ---- the real Perplexity + MoonPay MCP recording, full-bleed ----
const Demo: React.FC<{duration: number; recording: string; clientName: string}> = ({duration, recording, clientName}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 12, duration - 12, duration], [0, 1, 1, 0], clamp);
  const eyebrowIn = interpolate(frame, [10, 26], [0, 1], clamp);
  return (
    <AbsoluteFill style={{backgroundColor: BG, opacity}}>
      <OffthreadVideo
        src={staticFile(recording)}
        muted
        style={{width: '100%', height: '100%', objectFit: 'cover'}}
      />
      <AbsoluteFill style={{boxShadow: 'inset 0 0 300px 80px rgba(7,5,13,0.55)'}} />
      <div
        style={{
          position: 'absolute',
          top: 54,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontFamily: MONO,
          fontSize: 22,
          letterSpacing: 6,
          color: '#fff',
          textTransform: 'uppercase',
          opacity: eyebrowIn * 0.92,
          textShadow: '0 2px 18px rgba(0,0,0,0.7)',
        }}
      >
        Live in {clientName}
      </div>
    </AbsoluteFill>
  );
};

// ---- MCP integration pill: MoonPay <-> Perplexity, with light sweep ----
const McpPill: React.FC<{duration: number; clientName: string; clientIcon: string; clientGlow: string}> = ({
  duration,
  clientName,
  clientIcon,
  clientGlow,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const opacity = interpolate(frame, [0, 14, duration - 14, duration], [0, 1, 1, 0], clamp);
  const pop = spring({frame: frame - 6, fps, config: {damping: 18, stiffness: 90}});
  // light sweep travels across the top edge once, then loops slowly
  const sweep = interpolate(frame % 80, [0, 80], [-20, 120]);
  const eyebrowIn = interpolate(frame, [4, 20], [0, 1], clamp);
  // flowing dots along the connection
  const flow = (frame * 0.04) % 1;

  const tile = (child: React.ReactNode, glow: string) => (
    <div
      style={{
        width: 150,
        height: 150,
        borderRadius: 32,
        background: 'rgba(255,255,255,0.10)',
        backdropFilter: 'blur(14px) saturate(150%)',
        WebkitBackdropFilter: 'blur(14px) saturate(150%)',
        border: '1px solid rgba(255,255,255,0.30)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: `inset 0 1.5px 0 rgba(255,255,255,0.6), inset 0 -16px 30px rgba(255,255,255,0.05), 0 16px 40px rgba(0,0,0,0.4), 0 0 60px ${glow}`,
      }}
    >
      {child}
    </div>
  );

  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity}}>
      <GridBg />
      <div
        style={{
          position: 'absolute',
          top: 300,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontFamily: MONO,
          fontSize: 22,
          letterSpacing: 6,
          color: SUB,
          textTransform: 'uppercase',
          opacity: eyebrowIn,
        }}
      >
        One MCP. Every agent.
      </div>
      <div
        style={{
          position: 'relative',
          padding: '64px 90px',
          borderRadius: 44,
          border: '1px solid rgba(255,255,255,0.22)',
          background: 'rgba(255,255,255,0.06)',
          backdropFilter: 'blur(30px) saturate(165%)',
          WebkitBackdropFilter: 'blur(30px) saturate(165%)',
          boxShadow:
            'inset 0 2px 0 rgba(255,255,255,0.55), inset 0 -40px 80px rgba(139,92,246,0.10), 0 50px 120px rgba(0,0,0,0.5), 0 0 130px rgba(124,58,237,0.28)',
          overflow: 'hidden',
          transform: `scale(${0.92 + pop * 0.08})`,
          display: 'flex',
          alignItems: 'center',
          gap: 70,
        }}
      >
        {/* specular highlight (top-left sheen) */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(120% 80% at 25% -10%, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0) 45%)',
            pointerEvents: 'none',
          }}
        />
        {/* light sweep across the top edge */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: `${sweep}%`,
            width: '40%',
            height: 3,
            background: 'linear-gradient(90deg, transparent, #fff, transparent)',
            filter: 'blur(1px)',
          }}
        />
        {/* MoonPay tile */}
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18}}>
          {tile(
            <Img src={staticFile('moonpay-logo-white-on-purple.png')} style={{width: 150, height: 150, borderRadius: 30}} />,
            'rgba(139,92,246,0.45)'
          )}
          <div style={{fontFamily: SANS, fontSize: 26, fontWeight: 700, color: TEXT}}>MoonPay</div>
        </div>
        {/* connection */}
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, width: 150}}>
          <div style={{position: 'relative', width: '100%', height: 3, background: 'rgba(255,255,255,0.12)', borderRadius: 2}}>
            {[0, 0.33, 0.66].map((off, i) => {
              const x = ((flow + off) % 1) * 100;
              return (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    left: `${x}%`,
                    top: -2.5,
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    background: PURPLE_LT,
                    boxShadow: `0 0 10px ${PURPLE_LT}`,
                  }}
                />
              );
            })}
          </div>
          <div style={{fontFamily: MONO, fontSize: 17, letterSpacing: 3, color: PURPLE_LT}}>MCP</div>
        </div>
        {/* AI client tile */}
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18}}>
          {tile(<Img src={staticFile(clientIcon)} style={{width: 150, height: 150, borderRadius: 30}} />, clientGlow)}
          <div style={{fontFamily: SANS, fontSize: 26, fontWeight: 700, color: TEXT}}>{clientName}</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---- CTA (sans) + disclaimer ----
const Cta: React.FC<{duration: number}> = ({duration}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 14, duration - 10, duration], [0, 1, 1, 1], clamp);
  const inUp = interpolate(frame, [6, 26], [0, 1], clamp);
  const subIn = interpolate(frame, [22, 40], [0, 1], clamp);
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity}}>
      <GridBg />
      <div
        style={{
          fontFamily: SANS,
          fontSize: 72,
          fontWeight: 700,
          color: TEXT,
          letterSpacing: -1,
          opacity: inUp,
          transform: `translateY(${(1 - inUp) * 18}px)`,
        }}
      >
        Anywhere your agents are.
      </div>
      <div
        style={{
          marginTop: 40,
          padding: '18px 44px',
          borderRadius: 999,
          fontFamily: MONO,
          fontSize: 28,
          fontWeight: 500,
          color: TEXT,
          letterSpacing: 1,
          opacity: subIn,
          transform: `translateY(${(1 - subIn) * 14}px)`,
          background: 'rgba(255,255,255,0.07)',
          backdropFilter: 'blur(20px) saturate(160%)',
          WebkitBackdropFilter: 'blur(20px) saturate(160%)',
          border: '1px solid rgba(255,255,255,0.24)',
          boxShadow:
            'inset 0 1.5px 0 rgba(255,255,255,0.5), 0 18px 50px rgba(0,0,0,0.4), 0 0 60px rgba(124,58,237,0.22)',
        }}
      >
        moonpay.com/agents
      </div>
    </AbsoluteFill>
  );
};

// ---- root ----
const T1 = 95;
const PILL = 100;
const DEMO = 228;
const T2 = 80;
const CTA_D = 95;
export const MCP_TOTAL = T1 + PILL + DEMO + T2 + CTA_D;

export type McpAdProps = {
  clientName: string;
  clientIcon: string;
  clientGlow: string;
  recording: string;
  music: string;
};

const PERPLEXITY: McpAdProps = {
  clientName: 'Perplexity',
  clientIcon: 'perplexity-icon.png',
  clientGlow: 'rgba(255,255,255,0.18)',
  recording: 'perplexity-buy.mp4',
  music: 'music-mcp.wav',
};

export const McpAd: React.FC<Partial<McpAdProps>> = (props) => {
  const p = {...PERPLEXITY, ...props};
  useFonts();
  let c = 0;
  const seq = (dur: number, node: React.ReactNode) => {
    const from = c;
    c += dur;
    return (
      <Sequence from={from} durationInFrames={dur}>
        {node}
      </Sequence>
    );
  };
  return (
    <AbsoluteFill style={{backgroundColor: BG}}>
      <Audio src={staticFile(p.music)} />
      {seq(T1, <Title lines={['Your wallet.', `Now in ${p.clientName}.`]} duration={T1} />)}
      {seq(PILL, <McpPill duration={PILL} clientName={p.clientName} clientIcon={p.clientIcon} clientGlow={p.clientGlow} />)}
      {seq(DEMO, <Demo duration={DEMO} recording={p.recording} clientName={p.clientName} />)}
      {seq(T2, <Title lines={['Ask. Buy.', 'Done.']} duration={T2} />)}
      {seq(CTA_D, <Cta duration={CTA_D} />)}
    </AbsoluteFill>
  );
};
