"""Synthesize the 'overwhelming noise' soundscape for Signal, Not Noise Act 1,
plus the single sub-bass hit for the cut-to-silence beat. No music/SFX model
exists in the available toolchain for this — hand-synthesized like make_music.py.

Act 1 (0-4.5s): notification pings, keyboard/tab clicks, a bell fragment,
scrolling ticks, phone vibration, layered alert tones, all increasing in
density toward the cut, riding a rising noise-pulse bed.
Cut (~0.4s): one low sub-bass hit, then true silence.
"""
import argparse
import numpy as np
from scipy.signal import butter, lfilter
import wave

ap = argparse.ArgumentParser()
ap.add_argument('--duration', type=float, default=4.5)
ap.add_argument('--out-noise', default='../public/audio/signal-not-noise/noise-overwhelm.wav')
ap.add_argument('--out-hit', default='../public/audio/signal-not-noise/sub-hit.wav')
args = ap.parse_args()

SR = 44100
rng = np.random.default_rng(7)


def bp(x, lo, hi, order=2):
    b, a = butter(order, [lo / (SR / 2), hi / (SR / 2)], btype='band')
    return lfilter(b, a, x)


def hp(x, fc, order=2):
    b, a = butter(order, fc / (SR / 2), btype='high')
    return lfilter(b, a, x)


def lp(x, fc, order=2):
    b, a = butter(order, fc / (SR / 2), btype='low')
    return lfilter(b, a, x)


def place(buf, sig, t, gain=1.0, pan=0.0):
    i = int(t * SR)
    if i < 0 or i >= len(buf[0]):
        return
    seg = sig[: len(buf[0]) - i]
    gl = gain * np.sqrt(0.5 * (1 - pan))
    gr = gain * np.sqrt(0.5 * (1 + pan))
    buf[0][i:i + len(seg)] += seg * gl
    buf[1][i:i + len(seg)] += seg * gr


# ---------------- sound elements ----------------
def ping(freq=1800.0):
    n = int(0.18 * SR)
    t = np.arange(n) / SR
    sig = np.sin(2 * np.pi * freq * t) * np.exp(-t / 0.05)
    return sig * 0.5


def click():
    n = int(0.02 * SR)
    return hp(rng.standard_normal(n), 5000) * np.exp(-np.arange(n) / (0.006 * SR)) * 0.6


def tick():
    n = int(0.012 * SR)
    return hp(rng.standard_normal(n), 7000) * np.exp(-np.arange(n) / (0.003 * SR)) * 0.5


def bell_fragment():
    n = int(0.4 * SR)
    t = np.arange(n) / SR
    partials = [(880, 1.0), (1318, 0.5), (1760, 0.3)]
    sig = sum(np.sin(2 * np.pi * f * t) * a for f, a in partials)
    return sig * np.exp(-t / 0.22) * 0.35


def vibration():
    n = int(0.35 * SR)
    t = np.arange(n) / SR
    buzz = np.sin(2 * np.pi * 150 * t) * (0.5 + 0.5 * np.sin(2 * np.pi * 28 * t))
    return buzz * np.exp(-t / 0.3) * 0.4


def alert_tone():
    n = int(0.22 * SR)
    t = np.arange(n) / SR
    sig = np.sin(2 * np.pi * 1100 * t) + 0.8 * np.sin(2 * np.pi * 1400 * t)
    return sig * np.exp(-t / 0.09) * 0.3


def sub_hit():
    n = int(0.5 * SR)
    t = np.arange(n) / SR
    f = 42 + 90 * np.exp(-t / 0.05)
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * np.exp(-t / 0.32)
    return np.tanh(body * 1.4) * 0.9


# ---------------- Act 1: increasing-density overwhelm ----------------
DUR = args.duration
N = int(DUR * SR)
L = np.zeros(N)
R = np.zeros(N)
buf = (L, R)

elements = [ping, click, tick, bell_fragment, vibration, alert_tone]

# density ramps from sparse to packed; last 1s is nearly continuous
t = 0.0
while t < DUR:
    progress = t / DUR
    # gap shrinks from ~0.5s to ~0.05s as we approach the cut
    gap = max(0.05, 0.5 * (1 - progress) ** 1.6)
    fn = elements[rng.integers(0, len(elements))]
    pan = rng.uniform(-0.6, 0.6)
    gain = 0.55 + 0.45 * progress
    place(buf, fn(), t, gain=gain, pan=pan)
    # occasional simultaneous layer once things get dense
    if progress > 0.45 and rng.random() < 0.5:
        fn2 = elements[rng.integers(0, len(elements))]
        place(buf, fn2(), t + rng.uniform(0, 0.03), gain=gain * 0.7, pan=-pan * 0.8)
    t += gap

# rising noise-pulse bed under the last 60% of the montage
bed_start = DUR * 0.35
bn = int((DUR - bed_start) * SR)
bt = np.arange(bn) / SR
bed = hp(rng.standard_normal(bn), 1200) * (bt / (DUR - bed_start)) ** 2.2 * 0.22
place(buf, bed, bed_start, gain=1.0)

for ch in buf:
    np.tanh(ch * 1.2, out=ch)
peak = max(np.abs(L).max(), np.abs(R).max(), 1e-6)
L *= 0.92 / peak
R *= 0.92 / peak

data = np.empty(N * 2, dtype=np.int16)
data[0::2] = (L * 32767).astype(np.int16)
data[1::2] = (R * 32767).astype(np.int16)

import os
os.makedirs(os.path.dirname(args.out_noise), exist_ok=True)
with wave.open(args.out_noise, 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(data.tobytes())
print(f"wrote {args.out_noise}: {DUR}s")

# ---------------- cut: single sub-bass hit ----------------
hit = sub_hit()
hn = len(hit)
hd = np.empty(hn * 2, dtype=np.int16)
hd[0::2] = (hit * 32767).astype(np.int16)
hd[1::2] = (hit * 32767).astype(np.int16)
with wave.open(args.out_hit, 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(hd.tobytes())
print(f"wrote {args.out_hit}: {hn / SR:.2f}s")
