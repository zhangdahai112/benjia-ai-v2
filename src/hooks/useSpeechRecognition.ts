import { useState, useEffect, useRef, useCallback } from 'react';

// Extend Window interface for Speech Recognition
declare global {
  interface Window {
    SpeechRecognition: {
      new (): SpeechRecognition;
    };
    webkitSpeechRecognition: {
      new (): SpeechRecognition;
    };
  }

  interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    maxAlternatives: number;
    start(): void;
    stop(): void;
    abort(): void;
    onstart: ((this: SpeechRecognition, ev: Event) => unknown) | null;
    onend: ((this: SpeechRecognition, ev: Event) => unknown) | null;
    onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => unknown) | null;
    onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => unknown) | null;
    onspeechend: ((this: SpeechRecognition, ev: Event) => unknown) | null;
  }
}

// Speech Recognition Event interface
interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: 'no-speech' | 'aborted' | 'audio-capture' | 'network' | 'not-allowed' | 'service-not-allowed' | 'bad-grammar' | 'language-not-supported';
  readonly message?: string;
}

// 语音识别状态类型
export type SpeechRecognitionStatus = 'idle' | 'listening' | 'processing' | 'error';

// 语音识别结果类型
export interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

// 语音识别配置
export interface SpeechRecognitionConfig {
  continuous?: boolean;
  interimResults?: boolean;
  language?: string;
  maxAlternatives?: number;
}

// 语音识别Hook返回类型
export interface UseSpeechRecognitionReturn {
  isSupported: boolean;
  isListening: boolean;
  status: SpeechRecognitionStatus;
  transcript: string;
  confidence: number;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  browserSupportMessage: string;
}

// 检查浏览器支持
const checkBrowserSupport = () => {
  if (typeof window === 'undefined') return false;

  // 检查 SpeechRecognition API 支持
  const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

  return !!SpeechRecognition;
};

// 获取浏览器支持信息
const getBrowserSupportMessage = () => {
  if (typeof window === 'undefined') return '服务端渲染环境';

  const userAgent = navigator.userAgent.toLowerCase();

  if (!checkBrowserSupport()) {
    if (userAgent.includes('firefox')) {
      return 'Firefox浏览器暂不支持语音识别，请使用Chrome、Edge或Safari';
    } else if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
      return 'Safari浏览器需要iOS 14.5+或macOS Big Sur+版本才支持语音识别';
    } else {
      return '您的浏览器不支持语音识别功能，请使用最新版Chrome、Edge或Safari';
    }
  }

  return '语音识别已就绪';
};

// 语音识别Hook
export function useSpeechRecognition(config: SpeechRecognitionConfig = {}): UseSpeechRecognitionReturn {
  const {
    continuous = false,
    interimResults = true,
    language = 'zh-CN',
    maxAlternatives = 1
  } = config;

  const [isListening, setIsListening] = useState(false);
  const [status, setStatus] = useState<SpeechRecognitionStatus>('idle');
  const [transcript, setTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isSupported = checkBrowserSupport();
  const browserSupportMessage = getBrowserSupportMessage();

  // 初始化语音识别
  useEffect(() => {
    if (!isSupported) return;

    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    const recognition = new SpeechRecognition();
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    recognition.lang = language;
    recognition.maxAlternatives = maxAlternatives;

    // 开始识别事件
    recognition.onstart = () => {
      setIsListening(true);
      setStatus('listening');
      setError(null);
    };

    // 识别结果事件
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      setStatus('processing');

      let finalTranscript = '';
      let interimTranscript = '';
      let maxConfidence = 0;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const resultTranscript = result[0].transcript;

        if (result.isFinal) {
          finalTranscript += resultTranscript;
          maxConfidence = Math.max(maxConfidence, result[0].confidence || 0);
        } else {
          interimTranscript += resultTranscript;
        }
      }

      // 更新状态
      const currentTranscript = finalTranscript || interimTranscript;
      setTranscript(currentTranscript);
      setConfidence(maxConfidence);

      // 如果有最终结果，更新状态
      if (finalTranscript) {
        setStatus('idle');
      }
    };

    // 识别结束事件
    recognition.onend = () => {
      setIsListening(false);
      setStatus('idle');
    };

    // 错误处理事件
    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      setIsListening(false);
      setStatus('error');

      let errorMessage = '语音识别出错';

      switch (event.error) {
        case 'no-speech':
          errorMessage = '没有检测到语音，请重试';
          break;
        case 'audio-capture':
          errorMessage = '无法访问麦克风，请检查权限设置';
          break;
        case 'not-allowed':
          errorMessage = '麦克风权限被拒绝，请在浏览器设置中允许麦克风访问';
          break;
        case 'network':
          errorMessage = '网络错误，请检查网络连接';
          break;
        case 'service-not-allowed':
          errorMessage = '语音识别服务不可用';
          break;
        case 'bad-grammar':
          errorMessage = '语音识别配置错误';
          break;
        case 'language-not-supported':
          errorMessage = '不支持当前语言设置';
          break;
        default:
          errorMessage = `语音识别错误: ${event.error}`;
      }

      setError(errorMessage);
    };

    // 无语音检测超时
    recognition.onspeechend = () => {
      recognition.stop();
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [isSupported, continuous, interimResults, language, maxAlternatives]);

  // 开始语音识别
  const startListening = useCallback(() => {
    if (!isSupported || !recognitionRef.current) {
      setError('语音识别不可用');
      return;
    }

    if (isListening) {
      return;
    }

    try {
      setError(null);
      setTranscript('');
      setConfidence(0);
      recognitionRef.current.start();
    } catch (err) {
      setError('启动语音识别失败');
      setStatus('error');
    }
  }, [isSupported, isListening]);

  // 停止语音识别
  const stopListening = useCallback(() => {
    if (!recognitionRef.current || !isListening) {
      return;
    }

    try {
      recognitionRef.current.stop();
    } catch (err) {
      console.error('停止语音识别失败:', err);
    }
  }, [isListening]);

  // 重置转录文本
  const resetTranscript = useCallback(() => {
    setTranscript('');
    setConfidence(0);
    setError(null);
    setStatus('idle');
  }, []);

  return {
    isSupported,
    isListening,
    status,
    transcript,
    confidence,
    error,
    startListening,
    stopListening,
    resetTranscript,
    browserSupportMessage
  };
}

// 语音合成Hook（TTS - Text to Speech）
export interface UseSpeechSynthesisReturn {
  isSupported: boolean;
  isSpeaking: boolean;
  voices: SpeechSynthesisVoice[];
  speak: (text: string, options?: SpeechSynthesisUtterance) => void;
  stop: () => void;
  pause: () => void;
  resume: () => void;
}

export function useSpeechSynthesis(): UseSpeechSynthesisReturn {
  const [isSupported] = useState(() => {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  });

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  // 获取可用语音
  useEffect(() => {
    if (!isSupported) return;

    const updateVoices = () => {
      const availableVoices = speechSynthesis.getVoices();
      setVoices(availableVoices);
    };

    updateVoices();
    speechSynthesis.onvoiceschanged = updateVoices;

    return () => {
      speechSynthesis.onvoiceschanged = null;
    };
  }, [isSupported]);

  // 监听语音合成状态
  useEffect(() => {
    if (!isSupported) return;

    const checkSpeaking = () => {
      setIsSpeaking(speechSynthesis.speaking);
    };

    const interval = setInterval(checkSpeaking, 100);
    return () => clearInterval(interval);
  }, [isSupported]);

  // 语音播放
  const speak = useCallback((text: string, options?: Partial<SpeechSynthesisUtterance>) => {
    if (!isSupported || !text.trim()) return;

    // 停止当前播放
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    // 默认配置
    utterance.lang = 'zh-CN';
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    // 应用自定义选项
    if (options) {
      Object.assign(utterance, options);
    }

    // 选择中文语音
    const chineseVoice = voices.find(voice =>
      voice.lang.includes('zh') || voice.lang.includes('cmn')
    );
    if (chineseVoice) {
      utterance.voice = chineseVoice;
    }

    // 事件监听
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    speechSynthesis.speak(utterance);
  }, [isSupported, voices]);

  // 停止播放
  const stop = useCallback(() => {
    if (!isSupported) return;
    speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [isSupported]);

  // 暂停播放
  const pause = useCallback(() => {
    if (!isSupported) return;
    speechSynthesis.pause();
  }, [isSupported]);

  // 恢复播放
  const resume = useCallback(() => {
    if (!isSupported) return;
    speechSynthesis.resume();
  }, [isSupported]);

  return {
    isSupported,
    isSpeaking,
    voices,
    speak,
    stop,
    pause,
    resume
  };
}
