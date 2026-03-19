import {
  __resetAudioAlertsForTests,
  initializeAudioAlerts,
  playBreakEndTone,
  playBreakStartTone,
  playLevelChangeTone,
  playWarningTone,
} from "@/audio/tones";

type MockAudioContext = {
  createGain: jest.Mock;
  createOscillator: jest.Mock;
  currentTime: number;
  destination: object;
  resume: jest.Mock;
  state: "running" | "suspended";
};

function createAudioContextMock(): MockAudioContext {
  return {
    currentTime: 12,
    destination: {},
    state: "suspended",
    resume: jest.fn().mockResolvedValue(undefined),
    createOscillator: jest.fn(() => ({
      connect: jest.fn(),
      frequency: {
        setValueAtTime: jest.fn(),
      },
      start: jest.fn(),
      stop: jest.fn(),
      type: "sine",
    })),
    createGain: jest.fn(() => ({
      connect: jest.fn(),
      gain: {
        linearRampToValueAtTime: jest.fn(),
        setValueAtTime: jest.fn(),
      },
    })),
  };
}

describe("tones", () => {
  let audioContextMock: MockAudioContext;
  let audioContextConstructor: jest.Mock;

  beforeEach(() => {
    __resetAudioAlertsForTests();
    audioContextMock = createAudioContextMock();
    audioContextConstructor = jest.fn(() => audioContextMock);
    Object.defineProperty(window, "AudioContext", {
      configurable: true,
      writable: true,
      value: audioContextConstructor,
    });
  });

  afterEach(() => {
    __resetAudioAlertsForTests();
    delete (window as Partial<Window>).AudioContext;
  });

  test("warning_tone_plays", () => {
    playWarningTone();

    expect(audioContextConstructor).toHaveBeenCalledTimes(1);
    expect(audioContextMock.createOscillator).toHaveBeenCalledTimes(2);

    const firstOscillator = audioContextMock.createOscillator.mock.results[0]?.value;
    const secondOscillator = audioContextMock.createOscillator.mock.results[1]?.value;
    const secondWarningStart =
      secondOscillator.frequency.setValueAtTime.mock.calls[0]?.[1];

    expect(firstOscillator.frequency.setValueAtTime).toHaveBeenCalledWith(800, 12);
    expect(secondWarningStart).toBeCloseTo(12.3, 5);
  });

  test("level_change_tone_plays", () => {
    playLevelChangeTone();

    const firstOscillator = audioContextMock.createOscillator.mock.results[0]?.value;
    const secondOscillator = audioContextMock.createOscillator.mock.results[1]?.value;

    expect(firstOscillator.frequency.setValueAtTime).toHaveBeenCalledWith(600, 12);
    expect(secondOscillator.frequency.setValueAtTime).toHaveBeenCalledWith(900, 12.25);
  });

  test("break_start_tone_plays", () => {
    playBreakStartTone();

    expect(audioContextMock.createOscillator).toHaveBeenCalledTimes(1);

    const oscillator = audioContextMock.createOscillator.mock.results[0]?.value;
    expect(oscillator.frequency.setValueAtTime).toHaveBeenCalledWith(500, 12);
  });

  test("break_end_tone_plays", () => {
    playBreakEndTone();

    const firstOscillator = audioContextMock.createOscillator.mock.results[0]?.value;
    const secondOscillator = audioContextMock.createOscillator.mock.results[1]?.value;

    expect(firstOscillator.frequency.setValueAtTime).toHaveBeenCalledWith(700, 12);
    expect(secondOscillator.frequency.setValueAtTime).toHaveBeenCalledWith(1000, 12.2);
  });

  test("initializes_audio_context_on_first_gesture", () => {
    initializeAudioAlerts();

    expect(audioContextConstructor).not.toHaveBeenCalled();

    window.dispatchEvent(new MouseEvent("click"));

    expect(audioContextConstructor).toHaveBeenCalledTimes(1);
    expect(audioContextMock.resume).toHaveBeenCalledTimes(1);

    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));

    expect(audioContextConstructor).toHaveBeenCalledTimes(1);
  });
});
