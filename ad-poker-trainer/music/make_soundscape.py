"""Build a musicless sonic identity for the 33.1s NovaGate character film.

The arc is physical rather than musical: fragmented alerts -> gate impact ->
four real-world ambience zones -> tactile product ticks -> NovaGate signature.
"""

import os
import wave
import numpy as np

SR = 44100
DUR = 33.10
N = int(SR * DUR)
rng = np.random.default_rng(19)
L = np.zeros(N)
R = np.zeros(N)


def filt(x, kind, freq, hi=None, order=2):
    """Smooth FFT-domain filter; keeps the sound generator dependency-light."""
    bins = np.fft.rfftfreq(len(x), 1 / SR)
    spectrum = np.fft.rfft(x)
    low = 1.0 / (1.0 + (bins / max(freq, 1.0)) ** (order * 2))
    if kind == 'low':
        mask = low
    elif kind == 'high':
        mask = 1.0 - low
    else:
        high_pass = 1.0 - low
        low_pass = 1.0 / (1.0 + (bins / max(hi, 1.0)) ** (order * 2))
        mask = high_pass * low_pass
    return np.fft.irfft(spectrum * mask, n=len(x))


def place(sig, at, gain=1.0, pan=0.0):
    i = int(at * SR)
    if i < 0 or i >= N:
        return
    if sig.ndim == 2:
        left, right = sig
        seg = min(len(left), N - i)
        L[i:i + seg] += left[:seg] * gain
        R[i:i + seg] += right[:seg] * gain
        return
    seg = min(len(sig), N - i)
    gl = np.sqrt(0.5 * (1 - pan)) * gain
    gr = np.sqrt(0.5 * (1 + pan)) * gain
    L[i:i + seg] += sig[:seg] * gl
    R[i:i + seg] += sig[:seg] * gr


def read_stereo(path):
    with wave.open(path, 'rb') as w:
        channels = w.getnchannels()
        frames = w.readframes(w.getnframes())
    data = np.frombuffer(frames, dtype=np.int16).astype(np.float64) / 32768.0
    if channels == 1:
        return np.vstack([data, data])
    return data.reshape(-1, channels).T[:2]


def sub_impact(dur=0.85, start=94.0, end=38.0):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = end + (start - end) * np.exp(-t / 0.055)
    phase = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(phase) * np.exp(-t / 0.34)
    air = filt(rng.standard_normal(n), 'high', 3200) * np.exp(-t / 0.09) * 0.09
    return np.tanh(body * 1.45) * 0.75 + air


def breath_whoosh(dur=1.0, reverse=False):
    n = int(dur * SR)
    t = np.arange(n) / SR
    noise = filt(rng.standard_normal(n), 'band', 550, 6200)
    env = np.sin(np.pi * np.minimum(t / dur, 1)) ** 1.5
    if reverse:
        env = np.linspace(0, 1, n) ** 2.4
    return noise * env * 0.11


def tactile_tick(pitch=1.0):
    n = int(0.055 * SR)
    t = np.arange(n) / SR
    click = filt(rng.standard_normal(n), 'high', 4200) * np.exp(-t / 0.009) * 0.2
    tone = np.sin(2 * np.pi * (920 * pitch) * t) * np.exp(-t / 0.025) * 0.12
    return click + tone


def glass_note(freq, dur=1.6, amp=0.25):
    n = int(dur * SR)
    t = np.arange(n) / SR
    partials = [(1.0, 1.0), (2.02, 0.22), (3.97, 0.10)]
    sig = sum(a * np.sin(2 * np.pi * freq * mult * t) for mult, a in partials)
    env = np.minimum(t / 0.035, 1) * np.exp(-t / 0.65)
    return sig * env * amp


def ambience(start, end, flavor):
    n = int((end - start) * SR)
    t = np.arange(n) / SR
    noise = rng.standard_normal(n)
    if flavor == 'elevator':
        bed = filt(noise, 'low', 220) * 0.025
        bed += (np.sin(2 * np.pi * 58 * t) + 0.35 * np.sin(2 * np.pi * 116 * t)) * 0.017
    elif flavor == 'street':
        bed = filt(noise, 'band', 90, 1200) * 0.025
        bed *= 0.75 + 0.25 * np.sin(2 * np.pi * 0.13 * t)
    elif flavor == 'cafe':
        bed = filt(noise, 'band', 180, 1800) * 0.019
        for at in [0.7, 2.45, 3.2]:
            j = int(at * SR)
            clink = glass_note(1650 + at * 90, 0.18, 0.025)
            bed[j:j + min(len(clink), n - j)] += clink[:n - j]
    else:  # train
        bed = filt(noise, 'low', 380) * 0.03
        bed += np.sin(2 * np.pi * (43 + 2 * np.sin(2 * np.pi * 0.18 * t)) * t) * 0.014
    fade = int(0.24 * SR)
    bed[:fade] *= np.linspace(0, 1, fade)
    bed[-fade:] *= np.linspace(1, 0, fade)
    place(bed, start, pan=-0.18)
    place(np.roll(bed, int(0.013 * SR)), start, gain=0.9, pan=0.22)


# 0-4.3: deliberately anxious fragmentation from the prior sound-design set.
noise_path = os.path.join(os.path.dirname(__file__), '..', 'public', 'audio', 'signal-not-noise', 'noise-overwhelm.wav')
place(read_stereo(noise_path), 0, gain=0.72)

# 4.3: all fragments collapse into the gate, followed by a rare pocket of silence.
place(sub_impact(), 4.30, gain=1.0)
place(breath_whoosh(1.15, reverse=True), 5.05, gain=0.72, pan=-0.12)
place(breath_whoosh(1.15, reverse=True)[::-1], 5.05, gain=0.72, pan=0.12)

# The thesis arrives with one soft architectural resonance, not a song.
place(glass_note(196.0, 2.1, 0.20), 6.55, pan=-0.12)
place(glass_note(293.66, 2.0, 0.13), 6.78, pan=0.16)

# Real-world spaces. Their quietness is the point.
ambience(9.50, 13.50, 'elevator')
ambience(13.50, 17.50, 'street')
ambience(17.50, 21.50, 'cafe')
ambience(21.50, 25.50, 'train')

# Each new surface opens with breath + touch, never a drum hit.
for i, at in enumerate([9.50, 13.50, 17.50, 21.50]):
    place(breath_whoosh(0.48), at, gain=0.28, pan=(-0.25 if i % 2 == 0 else 0.25))
    place(tactile_tick(0.9 + i * 0.07), at + 0.16, gain=0.46, pan=(-0.18 + i * 0.12))

# Product proof: three tactile state changes, with a soft body underneath.
for i, at in enumerate([25.50, 26.97, 28.43]):
    place(sub_impact(0.48, 70, 42), at, gain=0.28)
    place(tactile_tick(1.0 + i * 0.12), at + 0.08, gain=0.58, pan=(-0.3 + i * 0.3))

# NovaGate signature: the low pillars appear, then the upper arch resolves.
place(breath_whoosh(0.72, reverse=True), 29.48, gain=0.42)
place(glass_note(146.83, 2.7, 0.23), 29.83, pan=-0.12)  # D3
place(glass_note(220.00, 2.5, 0.18), 30.10, pan=0.13)   # A3: open fifth
place(glass_note(440.00, 1.7, 0.07), 30.34, pan=0.22)   # light in the arch

# Gentle spatial air so the quiet sections feel intentional, not empty.
air = filt(rng.standard_normal(N), 'band', 180, 4200) * 0.0042
air *= 0.75 + 0.25 * np.sin(2 * np.pi * 0.055 * np.arange(N) / SR)
L += air
R += np.roll(air, int(0.021 * SR)) * 0.94

# Master safety and natural fade.
for ch in (L, R):
    np.tanh(ch * 1.08, out=ch)
fade = int(0.65 * SR)
L[-fade:] *= np.linspace(1, 0, fade)
R[-fade:] *= np.linspace(1, 0, fade)
peak = max(np.max(np.abs(L)), np.max(np.abs(R)), 1e-9)
L *= 0.82 / peak
R *= 0.82 / peak

data = np.empty(N * 2, dtype=np.int16)
data[0::2] = np.clip(L * 32767, -32768, 32767).astype(np.int16)
data[1::2] = np.clip(R * 32767, -32768, 32767).astype(np.int16)

out_path = os.path.join(os.path.dirname(__file__), '..', 'public', 'novagate-soundscape.wav')
with wave.open(out_path, 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(data.tobytes())

print(f'wrote {out_path}: {DUR:.2f}s')
