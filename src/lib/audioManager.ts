// 音效管理器
class AudioManager {
  private audioContext: AudioContext | null = null;
  private sounds: Map<string, AudioBuffer> = new Map();
  private bgMusic: HTMLAudioElement | null = null;
  private volume: number = 0.7;
  private muted: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initAudioContext();
    }
  }

  private initAudioContext() {
    try {
      // Fixed: Replaced 'any' with more specific type
      this.audioContext = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    } catch (e) {
      console.warn('Web Audio API not supported');
    }
  }

  // 使用Web Audio API创建音效
  private createSound(frequency: number, duration: number, type: OscillatorType = 'sine'): void {
    if (!this.audioContext || this.muted) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    oscillator.type = type;

    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(this.volume * 0.3, this.audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  // 创建复合音效
  private createComplexSound(notes: { freq: number; duration: number; delay: number }[]): void {
    if (!this.audioContext || this.muted) return;

    notes.forEach(note => {
      setTimeout(() => {
        this.createSound(note.freq, note.duration);
      }, note.delay);
    });
  }

  // 拍打音效 - "啪啪"声
  playHitSound(): void {
    if (this.muted) return;

    // 使用噪音创建拍打声
    if (this.audioContext) {
      const bufferSize = this.audioContext.sampleRate * 0.1; // 0.1秒
      const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
      const output = buffer.getChannelData(0);

      // 生成白噪音并添加低通滤波器效果
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
      }

      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();
      const filter = this.audioContext.createBiquadFilter();

      source.buffer = buffer;
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, this.audioContext.currentTime);

      source.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      gainNode.gain.setValueAtTime(this.volume * 0.5, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);

      source.start();
    }
  }

  // 福包收集音效 - "叮咚"声
  playCollectSound(): void {
    if (this.muted) return;

    // 创建清脆的叮咚声
    this.createComplexSound([
      { freq: 800, duration: 0.1, delay: 0 },
      { freq: 1000, duration: 0.15, delay: 50 },
      { freq: 1200, duration: 0.2, delay: 100 }
    ]);
  }

  // 成功完成音效
  playSuccessSound(): void {
    if (this.muted) return;

    // 胜利音效
    this.createComplexSound([
      { freq: 523, duration: 0.2, delay: 0 },   // C
      { freq: 659, duration: 0.2, delay: 200 }, // E
      { freq: 784, duration: 0.2, delay: 400 }, // G
      { freq: 1047, duration: 0.4, delay: 600 } // C
    ]);
  }

  // 燃烧音效
  playBurnSound(): void {
    if (this.muted) return;

    // 创建燃烧的嘶嘶声
    if (this.audioContext) {
      const duration = 3; // 3秒燃烧声
      for (let i = 0; i < 30; i++) {
        setTimeout(() => {
          this.createSound(
            200 + Math.random() * 300,
            0.1 + Math.random() * 0.2,
            'sawtooth'
          );
        }, i * 100);
      }
    }
  }

  // 播放背景音乐
  playBackgroundMusic(type: 'xiaoren' | 'shanbao'): void {
    if (this.muted) return;

    // 停止当前背景音乐
    this.stopBackgroundMusic();

    // 创建简单的背景旋律
    if (type === 'xiaoren') {
      this.playXiaorenBgMusic();
    } else {
      this.playShanbaoBgMusic();
    }
  }

  private playXiaorenBgMusic(): void {
    // 打小人背景音乐 - 神秘、庄重
    const playLoop = () => {
      if (this.muted) return;

      this.createComplexSound([
        { freq: 220, duration: 0.5, delay: 0 },    // A
        { freq: 196, duration: 0.5, delay: 500 },  // G
        { freq: 175, duration: 0.5, delay: 1000 }, // F
        { freq: 196, duration: 0.5, delay: 1500 }, // G
      ]);

      setTimeout(playLoop, 2500);
    };
    playLoop();
  }

  private playShanbaoBgMusic(): void {
    // 抢山包背景音乐 - 欢快、活跃
    const playLoop = () => {
      if (this.muted) return;

      this.createComplexSound([
        { freq: 523, duration: 0.3, delay: 0 },   // C
        { freq: 587, duration: 0.3, delay: 300 }, // D
        { freq: 659, duration: 0.3, delay: 600 }, // E
        { freq: 523, duration: 0.3, delay: 900 }, // C
      ]);

      setTimeout(playLoop, 1500);
    };
    playLoop();
  }

  // 停止背景音乐
  stopBackgroundMusic(): void {
    if (this.bgMusic) {
      this.bgMusic.pause();
      this.bgMusic.currentTime = 0;
    }
  }

  // 设置音量
  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  // 静音切换
  toggleMute(): boolean {
    this.muted = !this.muted;
    if (this.muted) {
      this.stopBackgroundMusic();
    }
    return this.muted;
  }

  // 获取静音状态
  isMuted(): boolean {
    return this.muted;
  }

  // 预加载音效（为移动端做准备）
  async initMobileAudio(): Promise<void> {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    // 播放一个无声音频来激活音频上下文
    this.createSound(0, 0.001);
  }
}

// 导出单例
export const audioManager = new AudioManager();