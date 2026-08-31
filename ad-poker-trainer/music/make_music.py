"""Synthesize a UKG / deep-house bed (Silva Bumpa / Chris Stussy lane) for the
NovaAgents poker-trainer ad. 126 BPM, A minor, 36.35s, stereo 44.1k WAV.

Timeline is locked to the video: 2 intro bars, kick drops exactly at 4.667s
(first split scene), groove runs through the end card, 1.7s fade at the tail.
"""
import argparse
import numpy as np
from scipy.signal import butter, lfilter
import wave

ap = argparse.ArgumentParser()
ap.add_argument('--duration', type=float, default=36.35, help='total seconds (video frames / fps)')
ap.add_argument('--drop', type=float, default=140 / 30.0, help='seconds where the kick drops (end of hook scene)')
ap.add_argument('--bpm', type=float, default=126.0)
ap.add_argument('--out', default=None, help='output wav path (default: ../public/music.wav)')
args = ap.parse_args()

SR = 44100
BPM = args.bpm
BEAT = 60.0 / BPM            # 0.47619s @ 126
S16 = BEAT / 4.0             # one 16th
BAR = BEAT * 4.0
DUR = args.duration
DROP_T = args.drop           # kick drop at first split scene
T0 = DROP_T - 2 * BAR        # music starts so the drop lands on a bar line
N = int(DUR * SR)
SWING = 0.024                # delay applied to odd 16ths (shuffle)

rng = np.random.default_rng(42)
L = np.zeros(N)
R = np.zeros(N)


def bp(x, lo, hi, order=2):
    b, a = butter(order, [lo / (SR / 2), hi / (SR / 2)], btype='band')
    return lfilter(b, a, x)


def lp(x, fc, order=2):
    b, a = butter(order, fc / (SR / 2), btype='low')
    return lfilter(b, a, x)


def hp(x, fc, order=2):
    b, a = butter(order, fc / (SR / 2), btype='high')
    return lfilter(b, a, x)


def place(sig, t, gain=1.0, pan=0.0):
    """pan: -1 left .. +1 right"""
    i = int(t * SR)
    if i < 0 or i >= N:
        return
    seg = sig[: N - i]
    gl = gain * np.sqrt((1 - pan) / 2 + 0.5 * (pan <= 0) * 0)  # equal-ish power
    gl = gain * np.sqrt(0.5 * (1 - pan))
    gr = gain * np.sqrt(0.5 * (1 + pan))
    L[i:i + len(seg)] += seg * gl
    R[i:i + len(seg)] += seg * gr


# ---------------- drums ----------------
def kick():
    n = int(0.30 * SR)
    t = np.arange(n) / SR
    f = 44 + 76 * np.exp(-t / 0.045)            # 120 -> 44 Hz sweep
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * np.exp(-t / 0.16)
    click = hp(rng.standard_normal(int(0.004 * SR)), 3000) * 0.5
    out = body
    out[: len(click)] += click * np.exp(-np.arange(len(click)) / (0.002 * SR))
    return np.tanh(out * 1.6) * 0.95


def clap():
    n = int(0.30 * SR)
    out = np.zeros(n)
    for k, dt in enumerate([0.0, 0.012, 0.024]):
        i = int(dt * SR)
        m = int(0.012 * SR)
        out[i:i + m] += rng.standard_normal(m) * (0.8 - 0.15 * k)
    tail = rng.standard_normal(n) * np.exp(-np.arange(n) / (0.055 * SR)) * 0.5
    out += tail
    return bp(out, 900, 4500) * 0.9


def chat():
    n = int(0.05 * SR)
    return hp(rng.standard_normal(n), 7500) * np.exp(-np.arange(n) / (0.012 * SR)) * 0.6


def ohat():
    n = int(0.30 * SR)
    return hp(rng.standard_normal(n), 6000) * np.exp(-np.arange(n) / (0.09 * SR)) * 0.5


def shaker(soft=False):
    n = int(0.07 * SR)
    e = np.exp(-np.arange(n) / (0.02 * SR))
    g = 0.18 if soft else 0.3
    return bp(rng.standard_normal(n), 4000, 9000) * e * g


# ---------------- tonal ----------------
def saw(freq, n, detune=0.0):
    t = np.arange(n) / SR
    f = freq * (1 + detune)
    return 2 * ((t * f) % 1.0) - 1.0


def sub_note(freq, dur, slide_from=None):
    n = int(dur * SR)
    t = np.arange(n) / SR
    if slide_from:
        f = slide_from + (freq - slide_from) * np.minimum(t / 0.05, 1)
        ph = 2 * np.pi * np.cumsum(f) / SR
    else:
        ph = 2 * np.pi * freq * t
    env = np.minimum(t / 0.006, 1) * np.exp(-t / (dur * 0.7))
    sig = np.sin(ph) + 0.18 * np.sin(2 * ph)
    return np.tanh(sig * 1.5) * env * 0.8


def stab(freqs, dur=0.42, cutoff=1400):
    n = int(dur * SR)
    t = np.arange(n) / SR
    sig = np.zeros(n)
    for f in freqs:
        sig += saw(f, n, 0.004) + saw(f, n, -0.005)
    sig /= len(freqs) * 2
    sig = lp(sig, cutoff)
    env = np.minimum(t / 0.004, 1) * np.exp(-t / 0.13)
    return sig * env


# chords: Am9 | Am9 | Fmaj9 | G6  (4-bar cycle)
AM9 = [220.0, 261.63, 329.63, 493.88]          # A3 C4 E4 B4
FM9 = [174.61, 220.0, 261.63, 392.0]           # F3 A3 C4 G4
G6 = [196.0, 246.94, 293.66, 329.63]           # G3 B3 D4 E4
CYCLE = [AM9, AM9, FM9, G6]
ROOTS = [55.0, 55.0, 87.31, 98.0]              # A1 A1 F2 G2

TOTAL_BARS = int((DUR - T0) / BAR) + 1
bar_t = lambda b: T0 + b * BAR
s16_t = lambda b, i: bar_t(b) + i * S16 + (SWING if i % 2 == 1 else 0)

kick_times = []

for b in range(TOTAL_BARS):
    tb = bar_t(b)
    if tb >= DUR:
        break
    chord = CYCLE[b % 4]
    root = ROOTS[b % 4]
    intro = b < 2
    outro_bar = tb > DUR - 2.2

    # --- drums ---
    if not intro:
        for beat in range(4):
            t = tb + beat * BEAT
            place(kick(), t, 0.92)
            kick_times.append(t)
        if b % 2 == 1 and not outro_bar:           # garage ghost kick
            place(kick(), s16_t(b, 11), 0.5)
        place(clap(), tb + 1 * BEAT, 0.6)
        place(clap(), tb + 3 * BEAT, 0.6)
    # hats: offbeat 8ths always; swung 16ths in groove
    for i in range(16):
        t = s16_t(b, i)
        if i % 4 == 2:
            place(chat(), t, 0.8 if not intro else 0.5, pan=0.25)
        elif not intro and i % 2 == 1:
            place(chat(), t, 0.28, pan=-0.2)
        if i % 2 == 0:
            place(shaker(soft=True), t, 1.0, pan=0.4)
    if not intro and b % 2 == 1:
        place(ohat(), tb + 2 * BEAT + 2 * S16, 0.55, pan=0.3)

    # --- bass: rolling offbeat 8ths ---
    if not intro and not outro_bar:
        for i in [2, 6, 10, 14]:
            f = root * (2 if i == 14 and b % 2 == 1 else 1)
            slide = root * 0.5 if i == 2 and b % 4 == 2 else None
            place(sub_note(f, S16 * 1.7, slide), tb + i * S16, 0.85)

    # --- chord stabs, syncopated, with echo ---
    cutoff = 700 if intro else 1100 + 700 * min((b - 2) / 12, 1)
    hits = [3, 11] if b % 2 == 0 else [3, 8, 11]
    if intro:
        hits = [0, 8]
    for i in hits:
        t = s16_t(b, i)
        g = 0.5 if intro else 0.42
        s = stab(chord, cutoff=cutoff)
        place(s, t, g, pan=-0.15)
        place(s, t + 0.012, g * 0.8, pan=0.35)      # haas width
        place(s, t + 3 * S16, g * 0.30, pan=0.3)    # echo
        place(s, t + 6 * S16, g * 0.14, pan=-0.3)

# riser into the drop
rn = int(BAR * SR)
rt = np.arange(rn) / SR
riser = hp(rng.standard_normal(rn), 1500) * (rt / BAR) ** 2.5 * 0.16
place(riser, T0 + BAR, 1.0)

# ---------------- mix ----------------
mix_l, mix_r = L, R

# sidechain pump from kick times (applied to whole mix lightly — glues it)
env = np.ones(N)
duck_n = int(0.30 * SR)
duck = 1 - 0.45 * np.exp(-np.arange(duck_n) / (0.07 * SR))
for t in kick_times:
    i = int(t * SR)
    if i >= N:
        continue
    seg = min(duck_n, N - i)
    env[i:i + seg] = np.minimum(env[i:i + seg], duck[:seg])

mix_l = mix_l * env
mix_r = mix_r * env

# master: gentle saturation, fades
for ch in (mix_l, mix_r):
    np.tanh(ch * 1.15, out=ch)
fade_in = int(0.4 * SR)
mix_l[:fade_in] *= np.linspace(0, 1, fade_in)
mix_r[:fade_in] *= np.linspace(0, 1, fade_in)
fade_out = int(1.7 * SR)
mix_l[-fade_out:] *= np.linspace(1, 0, fade_out)
mix_r[-fade_out:] *= np.linspace(1, 0, fade_out)

peak = max(np.abs(mix_l).max(), np.abs(mix_r).max())
mix_l *= 0.89 / peak
mix_r *= 0.89 / peak

data = np.empty(N * 2, dtype=np.int16)
data[0::2] = (mix_l * 32767).astype(np.int16)
data[1::2] = (mix_r * 32767).astype(np.int16)

out_path = args.out or __file__.rsplit('/', 1)[0] + '/../public/music.wav'
with wave.open(out_path, 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(data.tobytes())

print(f"wrote {out_path}: {DUR}s, peak {0.89:.2f}, drop at {DROP_T:.2f}s, {len(kick_times)} kicks")
