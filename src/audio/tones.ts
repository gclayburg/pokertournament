const WARNING_FREQUENCIES = [800, 800];
const LEVEL_CHANGE_FREQUENCIES = [600, 900];
const BREAK_START_FREQUENCIES = [500];
const BREAK_END_FREQUENCIES = [700, 1000];

const WARNING_DURATIONS = [0.2, 0.2];
const LEVEL_CHANGE_DURATIONS = [0.25, 0.25];
const BREAK_START_DURATIONS = [0.3];
const BREAK_END_DURATIONS = [0.2, 0.2];

const WARNING_GAP_SECONDS = 0.1;
const LEVEL_CHANGE_GAP_SECONDS = 0;
const BREAK_START_GAP_SECONDS = 0;
const BREAK_END_GAP_SECONDS = 0;

const DEFAULT_GAIN = 0.08;

type AudioContextConstructor = typeof AudioContext;

let sharedAudioContext: AudioContext | null = null;
let bootstrapAttached = false;

function getAudioContextConstructor(): AudioContextConstructor | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.AudioContext ?? null;
}

function ensureAudioContext(): AudioContext | null {
  if (sharedAudioContext) {
    return sharedAudioContext;
  }

  const AudioContextClass = getAudioContextConstructor();

  if (!AudioContextClass) {
    return null;
  }

  sharedAudioContext = new AudioContextClass();

  return sharedAudioContext;
}

function resumeAudioContext() {
  const audioContext = ensureAudioContext();

  if (!audioContext || audioContext.state === "running") {
    return;
  }

  void audioContext.resume();
}

function attachBootstrapListeners() {
  if (bootstrapAttached || typeof window === "undefined") {
    return;
  }

  bootstrapAttached = true;

  const events: Array<keyof WindowEventMap> = ["click", "keydown"];
  const handleFirstGesture = () => {
    resumeAudioContext();

    events.forEach((eventName) => {
      window.removeEventListener(eventName, handleFirstGesture);
    });

    bootstrapAttached = false;
  };

  events.forEach((eventName) => {
    window.addEventListener(eventName, handleFirstGesture, { once: true });
  });
}

function playSequence(
  frequencies: number[],
  durations: number[],
  gapSeconds: number,
): AudioContext | null {
  const audioContext = ensureAudioContext();

  if (!audioContext) {
    return null;
  }

  void audioContext.resume();

  let startAt = audioContext.currentTime;

  frequencies.forEach((frequency, index) => {
    const duration = durations[index] ?? durations[durations.length - 1] ?? 0.2;
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const stopAt = startAt + duration;

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency, startAt);
    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.linearRampToValueAtTime(DEFAULT_GAIN, startAt + 0.01);
    gain.gain.linearRampToValueAtTime(0.0001, stopAt);

    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(startAt);
    oscillator.stop(stopAt);

    startAt = stopAt + gapSeconds;
  });

  return audioContext;
}

export function initializeAudioAlerts() {
  attachBootstrapListeners();
}

export function playWarningTone() {
  return playSequence(
    WARNING_FREQUENCIES,
    WARNING_DURATIONS,
    WARNING_GAP_SECONDS,
  );
}

export function playLevelChangeTone() {
  return playSequence(
    LEVEL_CHANGE_FREQUENCIES,
    LEVEL_CHANGE_DURATIONS,
    LEVEL_CHANGE_GAP_SECONDS,
  );
}

export function playBreakStartTone() {
  return playSequence(
    BREAK_START_FREQUENCIES,
    BREAK_START_DURATIONS,
    BREAK_START_GAP_SECONDS,
  );
}

export function playBreakEndTone() {
  return playSequence(
    BREAK_END_FREQUENCIES,
    BREAK_END_DURATIONS,
    BREAK_END_GAP_SECONDS,
  );
}

export function __resetAudioAlertsForTests() {
  sharedAudioContext = null;
  bootstrapAttached = false;
}
