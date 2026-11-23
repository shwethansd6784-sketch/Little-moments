/**
 * Little Moments - Audio Presets & Procedural Web Audio Player
 * Generates beautiful, lightweight, royalty-free background melodies
 * with 0 external network dependencies, while supporting custom audio uploads.
 */

export const PRESET_TRACKS = [
  {
    id: 'sweet_music_box',
    title: 'Sweet Music Box Lullaby',
    artist: 'Little Moments Studio',
    mood: 'Nostalgic & Romantic',
    type: 'procedural',
    theme: 'romantic',
  },
  {
    id: 'acoustic_warmth',
    title: 'Acoustic Sunset Romance',
    artist: 'Little Moments Studio',
    mood: 'Warm & Heartfelt',
    type: 'procedural',
    theme: 'warm',
  },
  {
    id: 'piano_stardust',
    title: 'Stardust Piano Reverie',
    artist: 'Little Moments Studio',
    mood: 'Emotional & Tender',
    type: 'procedural',
    theme: 'peaceful',
  },
  {
    id: 'festive_joy',
    title: 'Festive Sparkler Celebration',
    artist: 'Little Moments Studio',
    mood: 'Joyful & Bright',
    type: 'procedural',
    theme: 'festive',
  },
];

class ProceduralAudioEngine {
  constructor() {
    this.audioCtx = null;
    this.isPlaying = false;
    this.intervalId = null;
    this.gainNode = null;
    this.currentTrackId = 'sweet_music_box';
    this.volume = 0.6;
    this.noteIndex = 0;
  }

  init() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContext();
      this.gainNode = this.audioCtx.createGain();
      this.gainNode.gain.setValueAtTime(this.volume, this.audioCtx.currentTime);
      this.gainNode.connect(this.audioCtx.destination);
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.gainNode && this.audioCtx) {
      this.gainNode.gain.setValueAtTime(this.volume, this.audioCtx.currentTime);
    }
  }

  playNote(frequency, duration = 0.8, type = 'sine', decay = 0.6) {
    if (!this.audioCtx || this.audioCtx.state !== 'running') return;
    try {
      const osc = this.audioCtx.createOscillator();
      const noteGain = this.audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(frequency, this.audioCtx.currentTime);

      const now = this.audioCtx.currentTime;
      noteGain.gain.setValueAtTime(0.001, now);
      noteGain.gain.exponentialRampToValueAtTime(0.3, now + 0.04);
      noteGain.gain.exponentialRampToValueAtTime(0.001, now + duration * decay);

      osc.connect(noteGain);
      noteGain.connect(this.gainNode);

      osc.start(now);
      osc.stop(now + duration);
    } catch {
      // Audio node cleanup
    }
  }

  startTrack(trackId) {
    this.init();
    this.stopTrack();
    this.currentTrackId = trackId;
    this.isPlaying = true;

    // Frequencies (Hz) for sweet pentatonic scale notes: C4, D4, E4, G4, A4, C5, D5, E5, G5
    const melodies = {
      sweet_music_box: [
        { f: 523.25, d: 0.8, t: 'sine' }, // C5
        { f: 659.25, d: 0.8, t: 'sine' }, // E5
        { f: 783.99, d: 0.8, t: 'sine' }, // G5
        { f: 659.25, d: 0.8, t: 'sine' }, // E5
        { f: 880.00, d: 1.2, t: 'sine' }, // A5
        { f: 783.99, d: 1.0, t: 'sine' }, // G5
        { f: 587.33, d: 0.8, t: 'sine' }, // D5
        { f: 523.25, d: 1.4, t: 'sine' }, // C5
      ],
      acoustic_warmth: [
        { f: 261.63, d: 1.0, t: 'triangle' }, // C4
        { f: 329.63, d: 1.0, t: 'triangle' }, // E4
        { f: 392.00, d: 1.0, t: 'triangle' }, // G4
        { f: 440.00, d: 1.0, t: 'triangle' }, // A4
        { f: 523.25, d: 1.4, t: 'triangle' }, // C5
        { f: 392.00, d: 1.0, t: 'triangle' }, // G4
      ],
      piano_stardust: [
        { f: 440.00, d: 1.2, t: 'sine' }, // A4
        { f: 523.25, d: 1.2, t: 'sine' }, // C5
        { f: 659.25, d: 1.5, t: 'sine' }, // E5
        { f: 587.33, d: 1.2, t: 'sine' }, // D5
        { f: 523.25, d: 1.6, t: 'sine' }, // C5
      ],
      festive_joy: [
        { f: 587.33, d: 0.6, t: 'triangle' }, // D5
        { f: 659.25, d: 0.6, t: 'triangle' }, // E5
        { f: 783.99, d: 0.6, t: 'triangle' }, // G5
        { f: 880.00, d: 0.8, t: 'triangle' }, // A5
        { f: 1046.50, d: 1.0, t: 'sine' },   // C6
        { f: 880.00, d: 0.6, t: 'sine' },    // A5
      ]
    };

    const notes = melodies[trackId] || melodies.sweet_music_box;
    this.noteIndex = 0;

    const playStep = () => {
      if (!this.isPlaying) return;
      const note = notes[this.noteIndex % notes.length];
      this.playNote(note.f, note.d, note.t);
      this.noteIndex++;
    };

    playStep();
    this.intervalId = setInterval(playStep, 950);
  }

  stopTrack() {
    this.isPlaying = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  toggle() {
    if (this.isPlaying) {
      this.stopTrack();
    } else {
      this.startTrack(this.currentTrackId);
    }
    return this.isPlaying;
  }
}

export const audioPlayer = new ProceduralAudioEngine();
