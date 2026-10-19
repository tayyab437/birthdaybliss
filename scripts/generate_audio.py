import os
import math
import struct
import wave
import subprocess

OUT_DIR = os.path.join(os.getcwd(), "client/public/audio")
ROOT_PUBLIC = os.path.join(os.getcwd(), "client/public")
os.makedirs(OUT_DIR, exist_ok=True)
SAMPLE_RATE = 44100

def note_freq(name_or_midi):
    if isinstance(name_or_midi, (int, float)):
        return 440.0 * (2.0 ** ((name_or_midi - 69) / 12.0))
    notes = {'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3, 'E': 4,
             'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8, 'Ab': 8, 'A': 9,
             'A#': 10, 'Bb': 10, 'B': 11}
    letter = name_or_midi[:-1]
    octave = int(name_or_midi[-1])
    semitone = notes[letter]
    midi = 12 + octave * 12 + semitone
    return 440.0 * (2.0 ** ((midi - 69) / 12.0))

def synth_note(freq, duration_sec, instrument="piano", volume=0.5):
    n_samples = int(SAMPLE_RATE * duration_sec)
    samples = [0.0] * n_samples
    if freq <= 0:
        return samples

    for i in range(n_samples):
        t = i / SAMPLE_RATE
        # Envelope: Attack, Decay, Sustain, Release
        if instrument in ("piano", "musicbox", "bell"):
            decay_rate = 3.5 if instrument == "piano" else (2.0 if instrument == "musicbox" else 1.5)
            env = math.exp(-decay_rate * t)
            # Attack smooth ramp
            attack = min(1.0, t / 0.008)
            env *= attack
            # Harmonics
            val = math.sin(2 * math.pi * freq * t)
            val += 0.5 * math.sin(2 * math.pi * 2 * freq * t) * math.exp(-4.5 * t)
            val += 0.25 * math.sin(2 * math.pi * 3 * freq * t) * math.exp(-6.0 * t)
            val += 0.12 * math.sin(2 * math.pi * 4 * freq * t) * math.exp(-7.5 * t)
            if instrument == "bell":
                val += 0.3 * math.sin(2 * math.pi * 4.2 * freq * t) * math.exp(-2.0 * t)
        elif instrument == "synth":
            attack = min(1.0, t / 0.02)
            release = max(0.0, 1.0 - (t / duration_sec))
            env = attack * (0.7 + 0.3 * release)
            # Warm saw/triangle hybrid
            val = 0.6 * math.sin(2 * math.pi * freq * t) + 0.3 * math.sin(2 * math.pi * 2 * freq * t) + 0.15 * math.sin(2 * math.pi * 3 * freq * t)
        elif instrument == "bass":
            attack = min(1.0, t / 0.015)
            env = attack * math.exp(-2.2 * t)
            val = math.sin(2 * math.pi * freq * t) + 0.4 * math.sin(2 * math.pi * 2 * freq * t)
        else: # default flute/organ
            attack = min(1.0, t / 0.04)
            release = min(1.0, (duration_sec - t) / 0.04)
            env = attack * max(0.0, release)
            val = math.sin(2 * math.pi * freq * t) + 0.2 * math.sin(2 * math.pi * 2 * freq * t)

        samples[i] = val * env * volume
    return samples

def render_score(tracks, total_sec):
    total_samples = int(SAMPLE_RATE * total_sec)
    mix_left = [0.0] * total_samples
    mix_right = [0.0] * total_samples

    for track in tracks:
        instrument = track.get("instrument", "piano")
        pan = track.get("pan", 0.0) # -1.0 to +1.0
        left_gain = math.sqrt(0.5 * (1.0 - pan))
        right_gain = math.sqrt(0.5 * (1.0 + pan))
        events = track.get("events", [])

        for start_t, freq, dur, vol in events:
            start_idx = int(start_t * SAMPLE_RATE)
            note_buf = synth_note(freq, dur, instrument=instrument, volume=vol)
            for j, s in enumerate(note_buf):
                pos = start_idx + j
                if pos < total_samples:
                    mix_left[pos] += s * left_gain
                    mix_right[pos] += s * right_gain

    # Normalize cleanly with soft limiter
    max_val = max(max((abs(x) for x in mix_left), default=1e-5),
                  max((abs(x) for x in mix_right), default=1e-5))
    scale = 0.92 / max(1.0, max_val)

    packed_data = bytearray()
    for l, r in zip(mix_left, mix_right):
        sl = int(max(-32767, min(32767, l * scale * 32767)))
        sr = int(max(-32767, min(32767, r * scale * 32767)))
        packed_data.extend(struct.pack('<hh', sl, sr))

    return packed_data

def save_wav_and_mp3(packed_data, filename_base):
    wav_path = os.path.join(OUT_DIR, f"{filename_base}.wav")
    mp3_path = os.path.join(OUT_DIR, f"{filename_base}.mp3")
    
    with wave.open(wav_path, 'wb') as wf:
        wf.setnchannels(2)
        wf.setsampwidth(2)
        wf.setframerate(SAMPLE_RATE)
        wf.writeframes(packed_data)
        
    cmd = ["ffmpeg", "-y", "-i", wav_path, "-b:a", "192k", mp3_path]
    subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
    return mp3_path

# ----------------- Song 1: Happy Birthday -----------------
def generate_happy_birthday():
    # 3/4 time, BPM 108 -> quarter note ~ 0.555 sec
    bpm = 108
    q = 60.0 / bpm
    e = q / 2.0
    dh = q * 3.0 # dotted half

    melody_notes = [
        # Phrase 1: Happy birthday to you
        ('G4', e), ('G4', e), ('A4', q), ('G4', q), ('C5', q), ('B4', q*2),
        # Phrase 2: Happy birthday to you
        ('G4', e), ('G4', e), ('A4', q), ('G4', q), ('D5', q), ('C5', q*2),
        # Phrase 3: Happy birthday dear Aqsa
        ('G4', e), ('G4', e), ('G5', q), ('E5', q), ('C5', q), ('B4', q), ('A4', q),
        # Phrase 4: Happy birthday to you!
        ('F5', e), ('F5', e), ('E5', q), ('C5', q), ('D5', q), ('C5', dh)
    ]

    chords = [
        # Bar 1-2 (C, G)
        ('C4', ['E4', 'G4'], q*3), ('G3', ['D4', 'G4'], q*3),
        # Bar 3-4 (G, C)
        ('G3', ['D4', 'G4'], q*3), ('C4', ['E4', 'G4'], q*3),
        # Bar 5-6 (C, F)
        ('C4', ['E4', 'G4'], q*3), ('F3', ['C4', 'A4'], q*3),
        # Bar 7-8 (C/G, C)
        ('G3', ['D4', 'F4'], q*3), ('C3', ['E4', 'G4', 'C5'], dh)
    ]

    mel_events = []
    curr_t = 0.5
    for note, dur in melody_notes:
        freq = note_freq(note)
        mel_events.append((curr_t, freq, dur * 0.95, 0.65))
        curr_t += dur

    total_time = curr_t + 1.5

    # Chords track
    chord_events = []
    bass_events = []
    c_time = 0.5
    for bass, triad, dur in chords:
        bass_events.append((c_time, note_freq(bass), dur * 0.9, 0.45))
        # arpeggio / strum
        for off, n in enumerate(triad):
            chord_events.append((c_time + off * 0.03, note_freq(n), dur * 0.8, 0.35))
        c_time += dur

    tracks = [
        {"instrument": "piano", "pan": 0.1, "events": mel_events},
        {"instrument": "bell", "pan": 0.25, "events": mel_events},
        {"instrument": "piano", "pan": -0.2, "events": chord_events},
        {"instrument": "bass", "pan": -0.05, "events": bass_events}
    ]
    return render_score(tracks, total_time)

# ----------------- Song 2: Celebration Dance -----------------
def generate_celebration():
    bpm = 124
    beat = 60.0 / bpm
    total_beats = 64
    total_time = total_beats * beat + 1.0

    mel_events = []
    bass_events = []
    synth_events = []

    # 4-chord progression: C - G - Am - F
    prog = [('C3', ['C4', 'E4', 'G4']), ('G2', ['B3', 'D4', 'G4']),
            ('A2', ['A3', 'C4', 'E4']), ('F2', ['A3', 'C4', 'F4'])]

    for loop in range(4):
        for chord_idx, (b_note, triad) in enumerate(prog):
            bar_start = (loop * 16 + chord_idx * 4) * beat
            # funky bass
            for b in [0, 1.5, 2.0, 3.0, 3.5]:
                bass_events.append((bar_start + b * beat, note_freq(b_note), beat * 0.45, 0.5))
            # stab synth
            for st in [1.0, 2.5]:
                for tn in triad:
                    synth_events.append((bar_start + st * beat, note_freq(tn), beat * 0.4, 0.35))

    # Catchy lead melody
    lead = [
        ('E5', 0.5), ('G5', 0.5), ('A5', 1.0), ('G5', 0.5), ('E5', 0.5), ('D5', 1.0),
        ('C5', 0.5), ('D5', 0.5), ('E5', 1.0), ('D5', 1.0), ('C5', 1.0),
        ('E5', 0.5), ('G5', 0.5), ('A5', 1.0), ('C6', 1.0), ('B5', 1.0),
        ('A5', 0.5), ('G5', 0.5), ('A5', 1.5), ('G5', 0.5), ('E5', 2.0)
    ]
    for loop in range(2):
        t_off = loop * 32 * beat + 0.5
        curr = t_off
        for note, b_dur in lead:
            mel_events.append((curr, note_freq(note), b_dur * beat * 0.9, 0.6))
            curr += b_dur * beat

    tracks = [
        {"instrument": "synth", "pan": 0.15, "events": mel_events},
        {"instrument": "piano", "pan": -0.15, "events": synth_events},
        {"instrument": "bass", "pan": 0.0, "events": bass_events}
    ]
    return render_score(tracks, total_time)

# ----------------- Song 3: Good Time -----------------
def generate_good_time():
    bpm = 116
    beat = 60.0 / bpm
    total_time = 48 * beat + 1.0

    mel_events = []
    chord_events = []
    bass_events = []

    # Progression: F - C - G - Am
    prog = [('F3', ['F4', 'A4', 'C5']), ('C3', ['E4', 'G4', 'C5']),
            ('G3', ['D4', 'G4', 'B4']), ('A3', ['C4', 'E4', 'A4'])]

    for bar in range(12):
        b_note, triad = prog[bar % 4]
        bar_start = bar * 4 * beat
        bass_events.append((bar_start, note_freq(b_note), beat * 1.5, 0.5))
        bass_events.append((bar_start + 2.0 * beat, note_freq(b_note), beat * 1.5, 0.45))
        # acoustic strum
        for beat_i in range(4):
            for i, note in enumerate(triad):
                chord_events.append((bar_start + beat_i * beat + i * 0.02, note_freq(note), beat * 0.8, 0.3))

    melody = [
        ('A4', 1.0), ('C5', 1.0), ('D5', 0.5), ('C5', 0.5), ('A4', 1.0),
        ('G4', 1.0), ('A4', 1.0), ('C5', 2.0),
        ('D5', 0.5), ('E5', 0.5), ('D5', 1.0), ('C5', 1.0), ('A4', 1.0),
        ('G4', 0.5), ('A4', 0.5), ('G4', 1.0), ('F4', 2.0)
    ]
    for rep in range(2):
        t = rep * 16 * beat + 0.5
        for note, dur in melody:
            mel_events.append((t, note_freq(note), dur * beat * 0.85, 0.65))
            t += dur * beat

    tracks = [
        {"instrument": "piano", "pan": 0.2, "events": mel_events},
        {"instrument": "musicbox", "pan": -0.2, "events": chord_events},
        {"instrument": "bass", "pan": 0.0, "events": bass_events}
    ]
    return render_score(tracks, total_time)

# ----------------- Song 4: Best Day of My Life -----------------
def generate_best_day():
    bpm = 120
    beat = 60.0 / bpm
    total_time = 48 * beat + 1.0

    mel_events = []
    chord_events = []
    bass_events = []

    # D major feel: D - G - Bm - A
    prog = [('D3', ['D4', 'F#4', 'A4']), ('G2', ['D4', 'G4', 'B4']),
            ('B2', ['D4', 'F#4', 'B4']), ('A2', ['C#4', 'E4', 'A4'])]

    for bar in range(12):
        b_note, triad = prog[bar % 4]
        bar_start = bar * 4 * beat
        # Driving 8th note rhythm
        for eighth in range(8):
            bass_events.append((bar_start + eighth * 0.5 * beat, note_freq(b_note), beat * 0.4, 0.4))
            for i, n in enumerate(triad):
                chord_events.append((bar_start + eighth * 0.5 * beat + i * 0.01, note_freq(n), beat * 0.35, 0.25))

    melody = [
        ('F#4', 0.5), ('F#4', 0.5), ('A4', 1.0), ('A4', 1.0), ('B4', 1.0),
        ('A4', 0.5), ('F#4', 0.5), ('E4', 1.0), ('D4', 2.0),
        ('F#4', 0.5), ('A4', 0.5), ('B4', 1.0), ('D5', 1.0), ('C#5', 1.0),
        ('B4', 0.5), ('A4', 0.5), ('F#4', 1.0), ('D4', 2.0)
    ]
    for rep in range(2):
        t = rep * 16 * beat + 0.5
        for note, dur in melody:
            mel_events.append((t, note_freq(note), dur * beat * 0.9, 0.7))
            t += dur * beat

    tracks = [
        {"instrument": "piano", "pan": 0.1, "events": mel_events},
        {"instrument": "synth", "pan": -0.2, "events": chord_events},
        {"instrument": "bass", "pan": 0.0, "events": bass_events}
    ]
    return render_score(tracks, total_time)

# ----------------- Song 5: Magical Wishes (Music Box) -----------------
def generate_magical_wishes():
    bpm = 92
    beat = 60.0 / bpm
    total_time = 36 * beat + 2.0

    box_events = []
    # Sparkling bell arpeggios
    notes = ['C5', 'E5', 'G5', 'B5', 'C6', 'G5', 'E5', 'C5',
             'A4', 'C5', 'E5', 'A5', 'G5', 'E5', 'C5', 'G4',
             'F4', 'A4', 'C5', 'F5', 'E5', 'C5', 'A4', 'F4',
             'G4', 'B4', 'D5', 'G5', 'F5', 'D5', 'B4', 'G4']

    t = 0.5
    for loop in range(2):
        for n in notes:
            box_events.append((t, note_freq(n), beat * 0.8, 0.55))
            t += beat * 0.5

    tracks = [
        {"instrument": "musicbox", "pan": -0.15, "events": box_events},
        {"instrument": "bell", "pan": 0.2, "events": box_events}
    ]
    return render_score(tracks, total_time)

# ----------------- SFX: Click & Confetti -----------------
def generate_sfx():
    # Click: snappy acoustic pop
    n_samples = int(SAMPLE_RATE * 0.08)
    click_left = [0.0] * n_samples
    for i in range(n_samples):
        t = i / SAMPLE_RATE
        freq = 1400.0 * math.exp(-60.0 * t) + 300.0
        val = math.sin(2 * math.pi * freq * t) * math.exp(-75.0 * t)
        click_left[i] = val * 0.7

    packed_click = bytearray()
    for s in click_left:
        val = int(max(-32767, min(32767, s * 32767)))
        packed_click.extend(struct.pack('<hh', val, val))

    save_wav_and_mp3(packed_click, "click")
    # also copy click to root public
    os.system(f"cp {OUT_DIR}/click.mp3 {ROOT_PUBLIC}/click.mp3")

    # Confetti: upward magical sparkle harp chime
    total_sec = 1.6
    n_confetti = int(SAMPLE_RATE * total_sec)
    conf_left = [0.0] * n_confetti
    conf_right = [0.0] * n_confetti

    pentatonic = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5, 1174.66, 1318.5, 1567.98, 1760.0, 2093.0]
    for idx, f in enumerate(pentatonic):
        start_t = idx * 0.07
        start_idx = int(start_t * SAMPLE_RATE)
        pan = (idx / len(pentatonic)) * 1.6 - 0.8
        l_gain = math.sqrt(0.5 * (1.0 - pan))
        r_gain = math.sqrt(0.5 * (1.0 + pan))
        note = synth_note(f, 0.9, instrument="bell", volume=0.45)
        for j, val in enumerate(note):
            pos = start_idx + j
            if pos < n_confetti:
                conf_left[pos] += val * l_gain
                conf_right[pos] += val * r_gain

    max_c = max(max(abs(x) for x in conf_left), max(abs(x) for x in conf_right), 1e-5)
    packed_confetti = bytearray()
    for l, r in zip(conf_left, conf_right):
        sl = int(max(-32767, min(32767, (l / max_c) * 0.9 * 32767)))
        sr = int(max(-32767, min(32767, (r / max_c) * 0.9 * 32767)))
        packed_confetti.extend(struct.pack('<hh', sl, sr))

    save_wav_and_mp3(packed_confetti, "confetti")
    os.system(f"cp {OUT_DIR}/confetti.mp3 {ROOT_PUBLIC}/confetti.mp3")

if __name__ == "__main__":
    print("Generating Happy Birthday...")
    save_wav_and_mp3(generate_happy_birthday(), "happy-birthday")
    print("Generating Celebration Dance...")
    save_wav_and_mp3(generate_celebration(), "celebration")
    print("Generating Good Time...")
    save_wav_and_mp3(generate_good_time(), "good-time")
    print("Generating Best Day...")
    save_wav_and_mp3(generate_best_day(), "best-day")
    print("Generating Magical Wishes...")
    save_wav_and_mp3(generate_magical_wishes(), "magical-wishes")
    print("Generating Sound Effects...")
    generate_sfx()
    print("All audio files generated successfully!")
