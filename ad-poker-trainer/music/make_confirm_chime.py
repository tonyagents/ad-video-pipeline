"""Single clean confirm chime for the Set the Rules approval tap — a calm,
trustworthy two-note ascending tone (distinct from the notification pings in
Signal, Not Noise, which are deliberately grating). No SFX model exists in the
available toolchain, so hand-synthesized like the other audio here.
"""
import numpy as np
import wave

SR = 44100


def note(freq, dur, amp=0.5):
    n = int(dur * SR)
    t = np.arange(n) / SR
    sig = np.sin(2 * np.pi * freq * t) + 0.25 * np.sin(2 * np.pi * freq * 2 * t)
    env = np.minimum(t / 0.01, 1) * np.exp(-t / (dur * 0.55))
    return sig * env * amp


n1 = note(880.0, 0.22)   # A5
n2 = note(1318.5, 0.30)  # E6, a fifth up — resolves, feels approved/confirmed

out = np.zeros(int(0.5 * SR))
out[: len(n1)] += n1
i2 = int(0.09 * SR)
out[i2:i2 + len(n2)] += n2

peak = np.abs(out).max()
out *= 0.85 / peak

data = np.empty(len(out) * 2, dtype=np.int16)
data[0::2] = (out * 32767).astype(np.int16)
data[1::2] = (out * 32767).astype(np.int16)

import os
out_path = '../public/audio/set-the-rules/confirm-chime.wav'
os.makedirs(os.path.dirname(out_path), exist_ok=True)
with wave.open(out_path, 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(data.tobytes())
print(f"wrote {out_path}: {len(out) / SR:.2f}s")
