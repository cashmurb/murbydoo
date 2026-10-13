let audioContext;
let musicTimer;
let musicGain;
let musicOscillators = [];
let musicPlaying = false;

async function getAudioContext() {
  if (!audioContext) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return null;
    audioContext = new AudioContext();
  }
  if (audioContext.state === "suspended") await audioContext.resume();
  return audioContext;
}

async function playTone({ frequency, duration, volume, type }) {
  const context = await getAudioContext();
  if (!context) return;

  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const now = context.currentTime;

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, now);
  gain.gain.setValueAtTime(volume, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(now);
  oscillator.stop(now + duration);
}

export function playClickSound() {
  playTone({ frequency: 520, duration: 0.045, volume: 0.035, type: "square" });
}

export function playTypingSound() {
  playTone({ frequency: 680, duration: 0.025, volume: 0.018, type: "sine" });
}

export function startGameMusic() {
  if (musicPlaying) return;
  musicPlaying = true;

  getAudioContext().then(context => {
    if (!context || !musicPlaying) return;

    musicGain = context.createGain();
    musicGain.gain.setValueAtTime(0.018, context.currentTime);
    musicGain.connect(context.destination);

    const notes = [196, 247, 294, 247, 220, 262, 330, 262];
    let index = 0;
    const playNote = () => {
      if (!musicPlaying) return;
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const now = context.currentTime;
      oscillator.type = "triangle";
      oscillator.frequency.setValueAtTime(notes[index], now);
      gain.gain.setValueAtTime(0.7, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      oscillator.connect(gain);
      gain.connect(musicGain);
      oscillator.start(now);
      oscillator.stop(now + 0.23);
      musicOscillators.push(oscillator);
      index = (index + 1) % notes.length;
    };

    playNote();
    musicTimer = window.setInterval(playNote, 240);
  });
}

export function stopGameMusic() {
  musicPlaying = false;
  if (musicTimer) {
    window.clearInterval(musicTimer);
    musicTimer = undefined;
  }
  musicOscillators.forEach(oscillator => {
    try { oscillator.stop(); } catch { void 0; }
  });
  musicOscillators = [];
  if (musicGain) {
    musicGain.disconnect();
    musicGain = undefined;
  }
}

export function playDieSound() {
  playTone({ frequency: 180, duration: 0.22, volume: 0.08, type: "sawtooth" });
  window.setTimeout(() => {
    playTone({ frequency: 75, duration: 0.32, volume: 0.055, type: "square" });
  }, 90);
}
