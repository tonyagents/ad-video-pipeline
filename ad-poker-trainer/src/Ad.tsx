import React, {useEffect, useState} from 'react';
import {z} from 'zod';
import {
  AbsoluteFill,
  Audio,
  continueRender,
  delayRender,
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
const SERIF = "'Fraunces', Georgia, 'Times New Roman', serif";
const MONO = "'PlexMono', ui-monospace, 'SF Mono', Menlo, monospace";
const BG = '#08070c';
const PURPLE = '#a78bfa';
const PURPLE_DEEP = '#7D00FF'; // official MoonPay purple
const TEXT = '#f5f3ff';
const SUB = '#9d9aa8';

// Mercury-style dark section tints (cycled per scene). See references/mercury-command.
const TINTS = ['#181623', '#111a1d', '#161917', '#1c1715', '#171721'];
const TINTS_SECONDARY = ['#1f1d2d', '#112228', '#1a211d', '#281c17', '#1e1e2a'];

// Load the editorial fonts (Fraunces serif, IBM Plex Mono) for the 'mercury' style.
const useAdFonts = () => {
  const [handle] = useState(() => delayRender('load-fonts'));
  useEffect(() => {
    const faces = [
      new FontFace('Fraunces', `url(${staticFile('fraunces-600.woff2')})`, {weight: '600'}),
      new FontFace('Fraunces', `url(${staticFile('fraunces-400.woff2')})`, {weight: '400'}),
      new FontFace('PlexMono', `url(${staticFile('plexmono-500.woff2')})`, {weight: '500'}),
    ];
    Promise.all(faces.map((f) => f.load()))
      .then((loaded) => {
        loaded.forEach((f) => (document.fonts as unknown as {add: (f: FontFace) => void}).add(f));
        continueRender(handle);
      })
      .catch(() => continueRender(handle));
  }, [handle]);
};

export const adSchema = z.object({
  hook: z.object({
    image: z.string(),
    title: z.string(),
    sub: z.string(),
    duration: z.number().int().min(30),
  }),
  style: z.enum(['dark', 'mercury']).optional(),
  scenes: z.array(
    z.object({
      img: z.string(),
      kicker: z.string(),
      caption: z.string(),
      sub: z.string().optional(),
      focusY: z.string(),
      duration: z.number().int().min(30),
    })
  ),
  endCard: z.object({
    logo: z.string().optional(),
    title: z.string(),
    brand: z.string(),
    tagline: z.string(),
    url: z.string(),
    disclaimer: z.string(),
    duration: z.number().int().min(30),
  }),
  music: z.string(),
});

export type AdProps = z.infer<typeof adSchema>;
type SplitScene = AdProps['scenes'][number];

export const DEFAULT_PROPS: AdProps = {
  hook: {
    image: '01-prompt.png',
    title: 'It starts with one prompt.',
    sub: '“build a poker trainer that uses USDC as the bankroll”',
    duration: 140,
  },
  scenes: [
    {
      img: '02-response.jpg',
      kicker: 'No code. No app store.',
      caption: 'MoonAgents builds it — live.',
      sub: 'Thought for 10 seconds. Shipped a working app.',
      focusY: '0%',
      duration: 110,
    },
    {
      img: '03-table.jpg',
      kicker: 'Poker Pro Trainer',
      caption: 'A playable trainer.\nIn seconds.',
      focusY: '12%',
      duration: 115,
    },
    {
      img: '04-verdict-fold.jpg',
      kicker: 'Range trainer',
      caption: 'Every decision graded…',
      sub: 'Fold, call or raise — it tells you what the math says.',
      focusY: '78%',
      duration: 110,
    },
    {
      img: '05-verdict-raise.jpg',
      kicker: 'Range trainer',
      caption: '…with the numbers\nto back it up.',
      focusY: '72%',
      duration: 110,
    },
    {
      img: '06-potodds-q.jpg',
      kicker: 'Pot odds drill',
      caption: 'Train the math.',
      focusY: '0%',
      duration: 80,
    },
    {
      img: '07-potodds-a.jpg',
      kicker: 'Pot odds drill',
      caption: 'Equity vs. price —\ninstant feedback.',
      focusY: '30%',
      duration: 110,
    },
    {
      img: '08-cheatsheet.jpg',
      kicker: 'Cheat sheet',
      caption: 'The theory,\nbuilt in.',
      focusY: '25%',
      duration: 85,
    },
    {
      img: '09-bankroll.jpg',
      kicker: 'USDC bankroll',
      caption: 'Tracked against\nyour real USDC.',
      sub: 'Practice-only — funds never move.',
      focusY: '10%',
      duration: 120,
    },
  ],
  endCard: {
    title: 'Build anything.',
    brand: 'MoonAgents',
    tagline: 'The AI agent in your MoonPay wallet',
    url: 'moonpay.com/agents',
    disclaimer: 'Practice trainer for learning. Educational, not gambling advice.',
    duration: 110,
  },
  music: 'music.wav',
};

export const totalDuration = (props: AdProps) =>
  props.hook.duration +
  props.scenes.reduce((a, s) => a + s.duration, 0) +
  props.endCard.duration;

const sceneFade = (frame: number, duration: number) =>
  interpolate(frame, [0, 8, duration - 8, duration], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

// Full-bleed hook: pan from the headline down to the typed prompt
const Hook: React.FC<{hook: AdProps['hook']; mercury: boolean}> = ({hook, mercury}) => {
  const frame = useCurrentFrame();
  const opacity = sceneFade(frame, hook.duration);
  // Mercury hooks often use a WIDE screenshot (short at full width) — clamp the pan so
  // we never reveal a black band, and use a stronger full-frame scrim for legibility.
  const panEnd = mercury ? -200 : -560;
  const top = interpolate(frame, [10, hook.duration - 15], [-40, panEnd], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });
  const captionIn = interpolate(frame, [55, 75], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{backgroundColor: BG, opacity, overflow: 'hidden'}}>
      <Img
        src={staticFile(hook.image)}
        style={{
          position: 'absolute',
          width: 1920,
          top,
          left: 0,
          translate: "0px 0.5px"
        }}
      />
      <AbsoluteFill
        style={{
          background: mercury
            ? 'linear-gradient(180deg, rgba(8,7,12,0.97) 0%, rgba(8,7,12,0.86) 30%, rgba(8,7,12,0.66) 70%, rgba(8,7,12,0.72) 100%)'
            : 'linear-gradient(180deg, rgba(8,7,12,0.92) 0%, rgba(8,7,12,0) 38%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 70,
          left: 90,
          fontFamily: FONT,
          opacity: captionIn,
          transform: `translateY(${(1 - captionIn) * 24}px)`,
        }}
      >
        <div
          style={
            mercury
              ? {fontFamily: SERIF, fontSize: 76, fontWeight: 600, color: TEXT, letterSpacing: -1, lineHeight: 1.0}
              : {fontSize: 64, fontWeight: 800, color: TEXT, letterSpacing: -1.5}
          }
        >
          {hook.title}
        </div>
        <div
          style={{
            fontFamily: mercury ? MONO : FONT,
            fontSize: mercury ? 26 : 30,
            fontWeight: 500,
            color: SUB,
            marginTop: mercury ? 22 : 14,
          }}
        >
          {hook.sub}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Split: React.FC<{scene: SplitScene; mercury: boolean; index: number}> = ({
  scene,
  mercury,
  index,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const opacity = sceneFade(frame, scene.duration);
  const zoom = interpolate(frame, [0, scene.duration], [1.03, 1.12], {
    easing: Easing.out(Easing.quad),
  });
  const slide = spring({frame, fps, config: {damping: 200, stiffness: 60}});

  const tint = mercury ? TINTS[index % TINTS.length] : BG;
  const tint2 = mercury ? TINTS_SECONDARY[index % TINTS_SECONDARY.length] : '#101014';

  return (
    <AbsoluteFill style={{backgroundColor: tint, opacity, fontFamily: FONT}}>
      {/* ambient glow */}
      <div
        style={{
          position: 'absolute',
          width: 1400,
          height: 1400,
          left: -500,
          top: -300,
          background:
            'radial-gradient(circle, rgba(125,0,255,0.16) 0%, rgba(125,0,255,0) 60%)',
        }}
      />
      {/* mercury dot-grid texture */}
      {mercury ? (
        <AbsoluteFill
          style={{
            backgroundImage:
              'radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
            opacity: 0.6,
          }}
        />
      ) : null}
      {/* caption column */}
      <div
        style={{
          position: 'absolute',
          left: 96,
          top: 0,
          bottom: 0,
          width: 640,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          opacity: slide,
          transform: `translateY(${(1 - slide) * 30}px)`,
        }}
      >
        <div
          style={{
            fontFamily: mercury ? MONO : FONT,
            fontSize: mercury ? 21 : 25,
            fontWeight: mercury ? 500 : 700,
            color: PURPLE,
            letterSpacing: mercury ? 3 : 4,
            textTransform: 'uppercase',
            marginBottom: mercury ? 28 : 24,
          }}
        >
          {scene.kicker}
        </div>
        <div
          style={
            mercury
              ? {
                  fontFamily: SERIF,
                  fontSize: 74,
                  fontWeight: 600,
                  color: TEXT,
                  letterSpacing: -1,
                  lineHeight: 1.04,
                  whiteSpace: 'pre-line',
                }
              : {
                  fontSize: 72,
                  fontWeight: 800,
                  color: TEXT,
                  letterSpacing: -2,
                  lineHeight: 1.08,
                  whiteSpace: 'pre-line',
                }
          }
        >
          {scene.caption}
        </div>
        {scene.sub ? (
          <div style={{fontSize: 29, fontWeight: 500, color: SUB, marginTop: 26, lineHeight: 1.4}}>
            {scene.sub}
          </div>
        ) : null}
      </div>
      {/* app window */}
      <div
        style={{
          position: 'absolute',
          left: 800,
          top: 60,
          width: 1040,
          height: 960,
          borderRadius: 22,
          overflow: 'hidden',
          border: mercury
            ? '1px solid rgba(255,255,255,0.12)'
            : '1px solid rgba(255,255,255,0.09)',
          boxShadow: '0 40px 120px rgba(0,0,0,0.6), 0 0 80px rgba(125,0,255,0.14)',
          backgroundColor: tint2,
        }}
      >
        <Img
          src={staticFile(scene.img)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: `50% ${scene.focusY}`,
            transform: `scale(${zoom})`,
            transformOrigin: `50% ${scene.focusY}`,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

export const EndCard: React.FC<{endCard: AdProps['endCard']; mercury?: boolean}> = ({
  endCard,
  mercury = false,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const opacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const pop = spring({frame, fps, config: {damping: 14, stiffness: 120}});
  const subIn = interpolate(frame, [18, 34], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

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
          background:
            'radial-gradient(circle, rgba(124,58,237,0.22) 0%, rgba(124,58,237,0) 60%)',
        }}
      />
      {endCard.logo ? (
        <Img
          src={staticFile(endCard.logo)}
          style={{
            width: 112,
            height: 112,
            borderRadius: 26,
            marginBottom: 40,
            boxShadow: '0 18px 60px rgba(125,0,255,0.45)',
            transform: `scale(${0.9 + pop * 0.1})`,
          }}
        />
      ) : null}
      <div
        style={
          mercury
            ? {
                fontFamily: SERIF,
                fontSize: 116,
                fontWeight: 600,
                color: TEXT,
                letterSpacing: -2,
                transform: `scale(${0.9 + pop * 0.1})`,
              }
            : {
                fontSize: 120,
                fontWeight: 800,
                color: TEXT,
                letterSpacing: -3,
                transform: `scale(${0.9 + pop * 0.1})`,
              }
        }
      >
        {endCard.title}
      </div>
      <div
        style={{
          marginTop: 36,
          fontSize: 44,
          fontWeight: 700,
          color: PURPLE,
          opacity: subIn,
          display: 'flex',
          alignItems: 'center',
          gap: 18,
        }}
      >
        {endCard.brand}
      </div>
      <div style={{marginTop: 18, fontSize: 27, fontWeight: 500, color: SUB, opacity: subIn}}>
        {endCard.tagline}
      </div>
      <div
        style={{
          marginTop: 44,
          padding: '20px 52px',
          borderRadius: 999,
          border: `2px solid ${PURPLE_DEEP}`,
          background: 'rgba(124,58,237,0.14)',
          fontSize: 38,
          fontWeight: 700,
          color: TEXT,
          letterSpacing: 0.5,
          opacity: subIn,
          transform: `translateY(${(1 - subIn) * 16}px)`,
        }}
      >
        {endCard.url}
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: 44,
          fontSize: 18,
          color: '#55525e',
          opacity: subIn,
        }}
      >
        {endCard.disclaimer}
      </div>
    </AbsoluteFill>
  );
};

export const Ad: React.FC<AdProps> = (props) => {
  useAdFonts();
  const mercury = props.style === 'mercury';
  let cursor = props.hook.duration;
  return (
    <AbsoluteFill style={{backgroundColor: BG}}>
      <Audio src={staticFile(props.music)} />
      <Sequence durationInFrames={props.hook.duration}>
        <Hook hook={props.hook} mercury={mercury} />
      </Sequence>
      {props.scenes.map((scene, idx) => {
        const from = cursor;
        cursor += scene.duration;
        return (
          <Sequence key={`${scene.img}-${idx}`} from={from} durationInFrames={scene.duration}>
            <Split scene={scene} mercury={mercury} index={idx} />
          </Sequence>
        );
      })}
      <Sequence from={cursor} durationInFrames={props.endCard.duration}>
        <EndCard endCard={props.endCard} mercury={mercury} />
      </Sequence>
    </AbsoluteFill>
  );
};
