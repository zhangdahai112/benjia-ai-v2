"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSpeechRecognition, useSpeechSynthesis } from "@/hooks/useSpeechRecognition";
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  AlertCircle,
  CheckCircle,
  Loader2,
  Play,
  Pause,
  Square,
  Waves,
  Settings
} from "lucide-react";

interface VoiceInputProps {
  onTranscriptChange: (transcript: string) => void;
  onVoiceComplete: (finalText: string) => void;
  disabled?: boolean;
  placeholder?: string;
  showTTS?: boolean;
  autoSend?: boolean;
  className?: string;
}

export default function VoiceInput({
  onTranscriptChange,
  onVoiceComplete,
  disabled = false,
  placeholder = "点击麦克风开始语音输入...",
  showTTS = true,
  autoSend = false,
  className = ""
}: VoiceInputProps) {
  const [lastFinalTranscript, setLastFinalTranscript] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [ttsText, setTtsText] = useState("");

  // 语音识别Hook
  const {
    isSupported: isSTTSupported,
    isListening,
    status,
    transcript,
    confidence,
    error,
    startListening,
    stopListening,
    resetTranscript,
    browserSupportMessage
  } = useSpeechRecognition({
    continuous: false,
    interimResults: true,
    language: 'zh-CN'
  });

  // 语音合成Hook
  const {
    isSupported: isTTSSupported,
    isSpeaking,
    speak,
    stop: stopSpeaking,
    pause: pauseSpeaking,
    resume: resumeSpeaking
  } = useSpeechSynthesis();

  // 监听转录文本变化
  useEffect(() => {
    onTranscriptChange(transcript);
  }, [transcript, onTranscriptChange]);

  // 处理最终转录结果
  useEffect(() => {
    if (transcript && transcript !== lastFinalTranscript && status === 'idle' && !isListening) {
      setLastFinalTranscript(transcript);
      onVoiceComplete(transcript);

      if (autoSend) {
        // 自动发送模式下，延迟一下确保用户看到结果
        setTimeout(() => {
          resetTranscript();
        }, 1000);
      }
    }
  }, [transcript, lastFinalTranscript, status, isListening, onVoiceComplete, autoSend, resetTranscript]);

  // 开始/停止录音
  const handleMicClick = () => {
    if (disabled) return;

    if (isListening) {
      stopListening();
    } else {
      if (isSpeaking) {
        stopSpeaking();
      }
      startListening();
    }
  };

  // 清除转录文本
  const handleClear = () => {
    resetTranscript();
    setLastFinalTranscript("");
  };

  // 语音播放
  const handleSpeak = () => {
    if (!ttsText.trim()) return;

    if (isSpeaking) {
      stopSpeaking();
    } else {
      speak(ttsText);
    }
  };

  // 获取状态图标和样式
  const getStatusIcon = () => {
    if (error) {
      return <AlertCircle className="w-5 h-5 text-red-500" />;
    }

    switch (status) {
      case 'listening':
        return <Waves className="w-5 h-5 text-blue-500 animate-pulse" />;
      case 'processing':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return isListening ? (
          <Mic className="w-5 h-5 text-red-500" />
        ) : (
          <MicOff className="w-5 h-5 text-gray-400" />
        );
    }
  };

  const getStatusText = () => {
    if (error) return error;

    switch (status) {
      case 'listening':
        return '正在聆听...';
      case 'processing':
        return '正在处理...';
      case 'idle':
        return isListening ? '录音中...' : '点击开始语音输入';
      default:
        return '准备就绪';
    }
  };

  const getMicButtonClass = () => {
    const baseClass = "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200";

    if (disabled) {
      return `${baseClass} bg-gray-100 cursor-not-allowed`;
    }

    if (error) {
      return `${baseClass} bg-red-100 hover:bg-red-200 border-2 border-red-300`;
    }

    if (isListening) {
      return `${baseClass} bg-red-100 hover:bg-red-200 border-2 border-red-400 animate-pulse`;
    }

    return `${baseClass} bg-blue-100 hover:bg-blue-200 border-2 border-blue-300`;
  };

  if (!isSTTSupported) {
    return (
      <Card className={`border-amber-200 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            <div>
              <p className="text-sm font-medium text-amber-700">语音功能不可用</p>
              <p className="text-xs text-amber-600">{browserSupportMessage}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 主要语音输入界面 */}
      <Card className="border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            {/* 麦克风按钮 */}
            <Button
              onClick={handleMicClick}
              disabled={disabled}
              className={getMicButtonClass()}
              variant="ghost"
            >
              {isListening ? (
                <Mic className="w-6 h-6 text-red-600" />
              ) : (
                <MicOff className="w-6 h-6 text-gray-600" />
              )}
            </Button>

            {/* 状态显示 */}
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                {getStatusIcon()}
                <span className="text-sm font-medium text-gray-700">
                  {getStatusText()}
                </span>
                {confidence > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    置信度: {Math.round(confidence * 100)}%
                  </Badge>
                )}
              </div>

              {/* 转录文本 */}
              <div className="text-sm text-gray-900 min-h-[20px]">
                {transcript || (
                  <span className="text-gray-400 italic">{placeholder}</span>
                )}
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex space-x-2">
              {transcript && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClear}
                  className="text-gray-600"
                >
                  清除
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
                className="text-gray-600"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* 录音时的波形动画 */}
          {isListening && (
            <div className="mt-3 flex items-center justify-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-blue-500 rounded-full animate-pulse"
                  style={{
                    height: `${8 + Math.random() * 16}px`,
                    animationDelay: `${i * 100}ms`,
                    animationDuration: '1s'
                  }}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 语音播放功能 */}
      {showTTS && isTTSSupported && (
        <Card className="border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                {isSpeaking ? (
                  <Volume2 className="w-5 h-5 text-green-600" />
                ) : (
                  <VolumeX className="w-5 h-5 text-gray-400" />
                )}
                <span className="text-sm font-medium text-gray-700">
                  语音播放
                </span>
              </div>

              <input
                type="text"
                value={ttsText}
                onChange={(e) => setTtsText(e.target.value)}
                placeholder="输入要朗读的文字..."
                className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
              />

              <Button
                variant="outline"
                size="sm"
                onClick={handleSpeak}
                disabled={!ttsText.trim()}
                className="text-green-600"
              >
                {isSpeaking ? (
                  <Square className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 设置面板 */}
      {showSettings && (
        <Card className="border-gray-200">
          <CardContent className="p-4">
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700">语音设置</h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-600">
                <div>
                  <span className="font-medium">语音识别:</span>
                  <span className="ml-2">{isSTTSupported ? '✅ 支持' : '❌ 不支持'}</span>
                </div>
                <div>
                  <span className="font-medium">语音合成:</span>
                  <span className="ml-2">{isTTSSupported ? '✅ 支持' : '❌ 不支持'}</span>
                </div>
                <div>
                  <span className="font-medium">语言设置:</span>
                  <span className="ml-2">中文 (zh-CN)</span>
                </div>
                <div>
                  <span className="font-medium">自动发送:</span>
                  <span className="ml-2">{autoSend ? '✅ 开启' : '❌ 关闭'}</span>
                </div>
              </div>

              <div className="pt-2 border-t">
                <p className="text-xs text-gray-500">
                  💡 提示：使用语音输入时，请在安静的环境中清晰地说话。首次使用时浏览器可能会请求麦克风权限。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 错误提示 */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-sm font-medium text-red-700">语音识别错误</p>
                <p className="text-xs text-red-600">{error}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  resetTranscript();
                  startListening();
                }}
                className="text-red-600 border-red-300"
              >
                重试
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
