declare global {
  interface Window {
    webkitAudioContext: {
      new (contextOptions?: AudioContextOptions): AudioContext;
      prototype: AudioContext;
    };
  }
}

export default class AudioPlayer {
  private __audioCtx: AudioContext;
  private __audioBufferSourceNode?: AudioBufferSourceNode;
  private __gainNode: GainNode;
  private __pannerNode: PannerNode;
  private __audioBuffer?: AudioBuffer;
  private __isPlaying = false;
  private __currentVolume = 0.5;

  constructor() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.__audioCtx = new AudioContext();

    this.__gainNode = this.__audioCtx.createGain();
    this.__gainNode.connect(this.__audioCtx.destination);

    this.__pannerNode = this.__audioCtx.createPanner();
    this.__pannerNode.connect(this.__gainNode);
    this.__pannerNode.panningModel = 'HRTF';
  }

  loadPromise(url: string) {
    return fetch(url)
      .then(response => response.arrayBuffer())
      .then(arraybuffer => this.__audioCtx.decodeAudioData(arraybuffer))
      .then(audioBuffer => {
        this.audioBuffer = audioBuffer;
        return this.__audioBuffer;
      });
  }

  startAt(audioStartOffset: number) {
    if (this.__audioBuffer === undefined) {
      console.error('the audio buffer is not loaded');
      return;
    }

    if (this.__isPlaying === true && this.__audioBufferSourceNode) {
      this.__audioBufferSourceNode.stop();
    }

    this.__audioBufferSourceNode = this.__audioCtx.createBufferSource();
    this.__audioBufferSourceNode.buffer = this.__audioBuffer;
    this.__audioBufferSourceNode.connect(this.__pannerNode);
    this.__audioBufferSourceNode.start(0, audioStartOffset);
    this.__isPlaying = true;
  }

  stop() {
    if (this.__isPlaying === true && this.__audioBufferSourceNode) {
      this.__audioBufferSourceNode.stop();
      this.__audioBufferSourceNode.disconnect(this.__pannerNode);
      this.__audioBufferSourceNode = undefined;
      this.__isPlaying = false;
    }
  }

  mute() {
    this.__gainNode.gain.value = 0;
  }

  unmute() {
    this.__gainNode.gain.value = this.__currentVolume;
  }

  set audioBuffer(audioBuffer: AudioBuffer | undefined) {
    this.__audioBuffer = audioBuffer;
  }

  get audioBuffer(): AudioBuffer | undefined {
    return this.__audioBuffer;
  }

  set volume(value: number) {
    this.__currentVolume = value;

    this.__gainNode.gain.setTargetAtTime(
      value,
      this.__audioCtx.currentTime,
      0.01
    );
  }
  get volume() {
    return this.__gainNode.gain.value;
  }

  get audioContext() {
    return this.__audioCtx;
  }

  get isLoaded() {
    return this.__audioBuffer !== undefined;
  }

  get currentTime() {
    return this.__audioCtx.currentTime;
  }

  get duration() {
    if (this.__audioBuffer === undefined) {
      console.error('audioBuffer is not loaded.');
      return 0;
    }
    return this.__audioBuffer.duration;
  }
}
