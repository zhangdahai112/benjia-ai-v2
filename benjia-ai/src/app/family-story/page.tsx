"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Mic,
  MicOff,
  Send,
  Bot,
  User,
  Play,
  Pause,
  FileText,
  Video,
  Heart,
  Share,
  BookOpen,
  Clock,
  Tag
} from "lucide-react";
import Link from "next/link";

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  audioUrl?: string;
}

interface Story {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: Date;
  audioUrl?: string;
  videoUrl?: string;
  status: 'draft' | 'completed';
}

export default function FamilyStoryPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: '您好！我是本家AI助手，很高兴为您记录珍贵的家族故事。请告诉我，您想分享哪个家族成员的故事呢？',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [stories, setStories] = useState<Story[]>([
    {
      id: '1',
      title: '爷爷的抗战故事',
      content: '我的爷爷李明山生于1925年，在抗日战争期间...',
      tags: ['爷爷', '抗战', '历史'],
      createdAt: new Date('2024-01-15'),
      status: 'completed'
    },
    {
      id: '2',
      title: '奶奶的传统手艺',
      content: '奶奶是远近闻名的巧手，她的刺绣手艺...',
      tags: ['奶奶', '手艺', '传统'],
      createdAt: new Date('2024-01-20'),
      status: 'draft'
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // AI 回复模拟
  const getAIResponse = (userMessage: string): string => {
    const responses = [
      '这听起来是一个很有意义的故事。能具体描述一下当时的情况吗？',
      '很好！这些细节对于记录家族历史非常重要。还有其他相关的事件吗？',
      '这段经历一定很难忘。您能分享一些关于那个时代的生活细节吗？',
      '感谢您的分享。这个故事体现了您家族的哪些传统价值观？',
      '这些回忆对家族文化传承很有价值。您希望这个故事传达什么精神？'
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now() + '',
      type: 'user',
      content: inputText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    // 模拟AI回复
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1) + '',
        type: 'ai',
        content: getAIResponse(inputText),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
    }, 1000);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);

        // 模拟语音转文字
        const transcription = "这是模拟的语音转文字内容...";

        const userMessage: Message = {
          id: Date.now() + '',
          type: 'user',
          content: transcription,
          timestamp: new Date(),
          audioUrl
        };

        setMessages(prev => [...prev, userMessage]);

        // AI回复
        setTimeout(() => {
          const aiMessage: Message = {
            id: (Date.now() + 1) + '',
            type: 'ai',
            content: getAIResponse(transcription),
            timestamp: new Date()
          };
          setMessages(prev => [...prev, aiMessage]);
        }, 1000);

        // 清理资源
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('录音失败:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const generateStory = () => {
    const storyContent = messages
      .filter(msg => msg.type === 'user')
      .map(msg => msg.content)
      .join(' ');

    const newStory: Story = {
      id: Date.now() + '',
      title: '新的家族故事',
      content: `基于您的讲述，我为您整理了以下故事：\n\n${storyContent}`,
      tags: ['AI生成', '家族故事'],
      createdAt: new Date(),
      status: 'draft'
    };

    setStories(prev => [newStory, ...prev]);
    setActiveTab('stories');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-blue-50">
      {/* 顶部导航 */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-green-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-800">AI家族故事</h1>
                <p className="text-sm text-gray-600">记录家族历史，传承文化记忆</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              已记录 {stories.length} 个故事
            </Badge>
          </div>
        </div>
      </header>

      {/* 标签切换 */}
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex space-x-4 mb-6">
          <Button
            variant={activeTab === "chat" ? "default" : "outline"}
            onClick={() => setActiveTab("chat")}
            className={activeTab === "chat" ? "bg-green-500 hover:bg-green-600" : "border-green-200"}
          >
            <Bot className="w-4 h-4 mr-2" />
            AI对话
          </Button>
          <Button
            variant={activeTab === "stories" ? "default" : "outline"}
            onClick={() => setActiveTab("stories")}
            className={activeTab === "stories" ? "bg-green-500 hover:bg-green-600" : "border-green-200"}
          >
            <BookOpen className="w-4 h-4 mr-2" />
            故事管理
          </Button>
        </div>

        {/* AI对话界面 */}
        {activeTab === "chat" && (
          <div className="space-y-6">
            {/* 聊天区域 */}
            <Card className="border-green-200 h-96 flex flex-col">
              <CardHeader className="flex-shrink-0">
                <CardTitle className="text-lg flex items-center">
                  <Bot className="w-5 h-5 mr-2 text-green-600" />
                  与AI助手对话
                </CardTitle>
                <CardDescription>
                  请用自然的语言讲述您的家族故事，AI会帮您整理记录
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] p-3 rounded-lg ${
                        message.type === 'user'
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        <div className="flex items-start space-x-2">
                          {message.type === 'ai' && <Bot className="w-4 h-4 mt-0.5" />}
                          {message.type === 'user' && <User className="w-4 h-4 mt-0.5" />}
                          <div className="flex-1">
                            <p className="text-sm">{message.content}</p>
                            {message.audioUrl && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="mt-1 p-1 h-auto text-xs"
                              >
                                <Play className="w-3 h-3 mr-1" />
                                播放录音
                              </Button>
                            )}
                            <p className="text-xs opacity-70 mt-1">
                              {message.timestamp.toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* 输入区域 */}
                <div className="flex-shrink-0 space-y-3">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="请输入您想分享的故事..."
                      className="flex-1 px-3 py-2 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!inputText.trim()}
                      className="bg-green-500 hover:bg-green-600"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex justify-center space-x-4">
                    <Button
                      variant={isRecording ? "destructive" : "outline"}
                      onClick={isRecording ? stopRecording : startRecording}
                      className="flex-1 max-w-xs"
                    >
                      {isRecording ? (
                        <>
                          <MicOff className="w-4 h-4 mr-2" />
                          停止录音
                        </>
                      ) : (
                        <>
                          <Mic className="w-4 h-4 mr-2" />
                          语音录制
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={generateStory}
                      disabled={messages.filter(m => m.type === 'user').length < 2}
                      className="bg-green-500 hover:bg-green-600"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      生成故事
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 功能介绍 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-green-200 text-center">
                <CardContent className="pt-6">
                  <Mic className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <h3 className="font-medium mb-1">语音记录</h3>
                  <p className="text-sm text-gray-600">支持语音输入，AI自动转换为文字</p>
                </CardContent>
              </Card>
              <Card className="border-green-200 text-center">
                <CardContent className="pt-6">
                  <Bot className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <h3 className="font-medium mb-1">智能对话</h3>
                  <p className="text-sm text-gray-600">AI引导您完整记录故事细节</p>
                </CardContent>
              </Card>
              <Card className="border-green-200 text-center">
                <CardContent className="pt-6">
                  <FileText className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <h3 className="font-medium mb-1">自动整理</h3>
                  <p className="text-sm text-gray-600">AI整理成完整的故事文章</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* 故事管理 */}
        {activeTab === "stories" && (
          <div className="space-y-6">
            {stories.length === 0 ? (
              <Card className="border-green-200">
                <CardContent className="text-center py-12">
                  <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">暂无故事</h3>
                  <p className="text-gray-500 mb-4">开始与AI对话，记录您的第一个家族故事</p>
                  <Button
                    onClick={() => setActiveTab("chat")}
                    className="bg-green-500 hover:bg-green-600"
                  >
                    <Bot className="w-4 h-4 mr-2" />
                    开始对话
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {stories.map(story => (
                  <Card key={story.id} className="border-green-200">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-2">{story.title}</CardTitle>
                          <div className="flex items-center space-x-2 mb-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {story.createdAt.toLocaleDateString()}
                            </span>
                            <Badge
                              variant={story.status === 'completed' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {story.status === 'completed' ? '已完成' : '草稿'}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {story.tags.map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                <Tag className="w-3 h-3 mr-1" />
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 mb-4 line-clamp-3">{story.content}</p>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <FileText className="w-4 h-4 mr-1" />
                          编辑
                        </Button>
                        <Button size="sm" variant="outline">
                          <Video className="w-4 h-4 mr-1" />
                          生成视频
                        </Button>
                        <Button size="sm" variant="outline">
                          <Share className="w-4 h-4 mr-1" />
                          分享
                        </Button>
                        <Button size="sm" variant="outline">
                          <Heart className="w-4 h-4 mr-1" />
                          收藏
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
