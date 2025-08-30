"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { useAIServices, type FamilyStoryJob } from "@/contexts/AIServicesContext";
import { type StoryConfig } from "@/lib/ai-apis/llm-services";
import { useToast } from "@/hooks/use-toast";
import VoiceInput from "@/components/VoiceInput";
import {
  Upload,
  MessageSquare,
  Send,
  BookOpen,
  Download,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Image as ImageIcon,
  Sparkles,
  Wand2,
  Eye,
  Settings,
  Plus,
  Bot,
  User,
  Mic,
  MicOff,
  Volume2,
  Keyboard
} from "lucide-react";

interface AIStoryGeneratorProps {
  onJobComplete?: (job: FamilyStoryJob) => void;
}

export default function AIStoryGenerator({ onJobComplete }: AIStoryGeneratorProps) {
  const {
    storyJobs,
    createStoryProject,
    uploadStoryPhoto,
    chatWithAI,
    generateStoryOutlineForJob,
    generateFullStory,
    getStoryJob
  } = useAIServices();
  const { toast } = useToast();

  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [currentMessage, setCurrentMessage] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [inputMode, setInputMode] = useState<'text' | 'voice'>('text');
  const [voiceTranscript, setVoiceTranscript] = useState("");

  // 故事配置
  const [storyConfig, setStoryConfig] = useState<StoryConfig>({
    style: 'traditional',
    tone: 'warm',
    length: 'medium',
    language: 'zh'
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // 滚动到消息底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeJobId]);

  // 获取当前活跃的故事项目
  const activeJob = activeJobId ? getStoryJob(activeJobId) : null;

  // 创建新的故事项目
  const handleCreateProject = async () => {
    if (!showSettings) {
      setShowSettings(true);
      return;
    }

    try {
      const title = `我的家族故事 - ${new Date().getMonth() + 1}月${new Date().getDate()}日`;
      const jobId = await createStoryProject(title, storyConfig);
      setActiveJobId(jobId);
      setShowSettings(false);

      toast({
        title: "故事项目已创建",
        description: "现在您可以上传照片或开始与AI对话了",
      });
    } catch (error) {
      toast({
        title: "创建失败",
        description: "无法创建故事项目，请稍后重试",
        variant: "destructive"
      });
    }
  };

  // 处理文件上传
  const handleFileUpload = async (files: FileList) => {
    if (!activeJobId) {
      toast({
        title: "请先创建项目",
        description: "需要先创建故事项目才能上传照片",
        variant: "destructive"
      });
      return;
    }

    const file = files[0];
    if (!file.type.startsWith('image/')) {
      toast({
        title: "文件格式错误",
        description: "请上传图片文件",
        variant: "destructive"
      });
      return;
    }

    try {
      await uploadStoryPhoto(activeJobId, file);
      toast({
        title: "照片上传成功",
        description: "AI正在分析照片内容...",
      });
    } catch (error) {
      toast({
        title: "上传失败",
        description: "照片上传失败，请重试",
        variant: "destructive"
      });
    }
  };

  // 处理拖拽上传
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  // 发送消息给AI
  const handleSendMessage = async (messageText?: string) => {
    const message = messageText || currentMessage.trim();
    if (!message || !activeJobId) return;

    try {
      setCurrentMessage("");
      setVoiceTranscript("");

      await chatWithAI(activeJobId, message);
    } catch (error) {
      toast({
        title: "发送失败",
        description: "消息发送失败，请重试",
        variant: "destructive"
      });
    }
  };

  // 处理语音输入
  const handleVoiceTranscriptChange = (transcript: string) => {
    setVoiceTranscript(transcript);
  };

  // 处理语音输入完成
  const handleVoiceComplete = (finalText: string) => {
    if (finalText.trim()) {
      // 自动发送语音转录的文本
      handleSendMessage(finalText);
    }
  };

  // 切换输入模式
  const toggleInputMode = () => {
    setInputMode(prev => prev === 'text' ? 'voice' : 'text');
    setCurrentMessage("");
    setVoiceTranscript("");
  };

  // 生成故事大纲
  const handleGenerateOutline = async () => {
    if (!activeJobId) return;

    try {
      await generateStoryOutlineForJob(activeJobId);
      toast({
        title: "大纲生成中",
        description: "AI正在为您生成故事大纲...",
      });
    } catch (error) {
      toast({
        title: "生成失败",
        description: "大纲生成失败，请重试",
        variant: "destructive"
      });
    }
  };

  // 生成完整故事
  const handleGenerateStory = async () => {
    if (!activeJobId) return;

    try {
      await generateFullStory(activeJobId);
      toast({
        title: "故事生成中",
        description: "AI正在为您生成完整的家族故事...",
      });
    } catch (error) {
      toast({
        title: "生成失败",
        description: "故事生成失败，请重试",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* 项目列表和创建 */}
      {!activeJobId && (
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="w-5 h-5 mr-2 text-green-600" />
              AI家族故事生成器
            </CardTitle>
            <CardDescription>
              与AI对话，上传照片，创作专属的家族传奇故事
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* 故事配置 */}
            {showSettings && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-green-50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium mb-2">故事风格</label>
                  <Select value={storyConfig.style} onValueChange={(value: any) =>
                    setStoryConfig(prev => ({ ...prev, style: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="traditional">传统家族史</SelectItem>
                      <SelectItem value="modern">现代家庭故事</SelectItem>
                      <SelectItem value="novel">小说体裁</SelectItem>
                      <SelectItem value="biography">人物传记</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">写作风格</label>
                  <Select value={storyConfig.tone} onValueChange={(value: any) =>
                    setStoryConfig(prev => ({ ...prev, tone: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="formal">正式严谨</SelectItem>
                      <SelectItem value="warm">温馨感人</SelectItem>
                      <SelectItem value="humorous">轻松幽默</SelectItem>
                      <SelectItem value="inspiring">激励人心</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">故事长度</label>
                  <Select value={storyConfig.length} onValueChange={(value: any) =>
                    setStoryConfig(prev => ({ ...prev, length: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="short">简短精炼</SelectItem>
                      <SelectItem value="medium">中等篇幅</SelectItem>
                      <SelectItem value="long">详细完整</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">语言</label>
                  <Select value={storyConfig.language} onValueChange={(value: any) =>
                    setStoryConfig(prev => ({ ...prev, language: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="zh">中文</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* 已有项目列表 */}
            {storyJobs.length > 0 && (
              <div className="mb-6">
                <h3 className="font-medium mb-3">已有项目</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {storyJobs.slice(0, 4).map((job) => (
                    <Card
                      key={job.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setActiveJobId(job.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium truncate">{job.title}</h4>
                          <Badge variant={
                            job.status === 'completed' ? 'default' :
                            job.status === 'failed' ? 'destructive' : 'secondary'
                          }>
                            {job.status === 'completed' ? '已完成' :
                             job.status === 'generating' ? '生成中' :
                             job.status === 'chatting' ? '对话中' :
                             job.status === 'failed' ? '失败' : '创建中'}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          {job.chatHistory.length} 条对话 • {job.uploadedPhotos.length} 张照片
                        </div>
                        <Progress value={job.progress} className="h-2" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <Button
                onClick={handleCreateProject}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                {showSettings ? '确认创建' : '创建新故事'}
              </Button>

              {showSettings && (
                <Button
                  variant="outline"
                  onClick={() => setShowSettings(false)}
                >
                  取消
                </Button>
              )}

              {!showSettings && (
                <Button
                  variant="outline"
                  onClick={() => setShowSettings(true)}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  自定义设置
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 故事创作界面 */}
      {activeJobId && activeJob && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：聊天界面 */}
          <div className="lg:col-span-2">
            <Card className="h-[600px] flex flex-col">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <MessageSquare className="w-5 h-5 mr-2 text-green-600" />
                    {activeJob.title}
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge variant={
                      activeJob.status === 'completed' ? 'default' :
                      activeJob.status === 'failed' ? 'destructive' : 'secondary'
                    }>
                      {activeJob.status === 'completed' ? '已完成' :
                       activeJob.status === 'generating' ? '生成中' :
                       activeJob.status === 'chatting' ? '对话中' :
                       activeJob.status === 'failed' ? '失败' : '创建中'}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveJobId(null)}
                    >
                      返回
                    </Button>
                  </div>
                </div>
                <Progress value={activeJob.progress} className="h-2" />
              </CardHeader>

              {/* 聊天记录 */}
              <CardContent className="flex-1 overflow-hidden p-0">
                <div
                  ref={chatContainerRef}
                  className="h-full overflow-y-auto p-4 space-y-4"
                >
                  {activeJob.chatHistory.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      <Bot className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium mb-2">欢迎使用AI家族故事生成器！</p>
                      <p className="text-sm">上传照片或发送消息开始创作您的家族故事</p>
                    </div>
                  ) : (
                    activeJob.chatHistory.map((message, index) => (
                      <div
                        key={index}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`flex max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                          <Avatar className="w-8 h-8 mx-2">
                            {message.role === 'user' ? (
                              <AvatarFallback className="bg-blue-100 text-blue-600">
                                <User className="w-4 h-4" />
                              </AvatarFallback>
                            ) : (
                              <AvatarFallback className="bg-green-100 text-green-600">
                                <Bot className="w-4 h-4" />
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div className={`rounded-lg p-3 ${
                            message.role === 'user'
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}>
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </CardContent>

              {/* 消息输入 */}
              <div className="p-4 border-t space-y-4">
                {/* 输入模式切换 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge variant={inputMode === 'text' ? 'default' : 'secondary'} className="text-xs">
                      {inputMode === 'text' ? '文字输入' : '语音输入'}
                    </Badge>
                    {voiceTranscript && (
                      <Badge variant="outline" className="text-xs text-blue-600">
                        语音转录中...
                      </Badge>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleInputMode}
                    className="text-xs"
                  >
                    {inputMode === 'text' ? (
                      <>
                        <Mic className="w-3 h-3 mr-1" />
                        语音输入
                      </>
                    ) : (
                      <>
                        <Keyboard className="w-3 h-3 mr-1" />
                        文字输入
                      </>
                    )}
                  </Button>
                </div>

                {/* 文字输入模式 */}
                {inputMode === 'text' && (
                  <div className="flex space-x-2">
                    <Textarea
                      value={currentMessage}
                      onChange={(e) => setCurrentMessage(e.target.value)}
                      placeholder="请描述您想要包含在故事中的内容，或询问AI任何问题..."
                      className="flex-1 min-h-[60px] resize-none"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                    <Button
                      onClick={() => handleSendMessage()}
                      disabled={!currentMessage.trim() || activeJob.status === 'generating'}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                )}

                {/* 语音输入模式 */}
                {inputMode === 'voice' && (
                  <div className="space-y-2">
                    <VoiceInput
                      onTranscriptChange={handleVoiceTranscriptChange}
                      onVoiceComplete={handleVoiceComplete}
                      disabled={activeJob.status === 'generating'}
                      placeholder="点击麦克风开始语音输入，说完话后会自动发送给AI..."
                      showTTS={false}
                      autoSend={true}
                    />

                    {/* 语音输入提示 */}
                    <div className="text-xs text-gray-500 flex items-center space-x-4">
                      <span>💡 语音输入完成后会自动发送</span>
                      <span>🎯 请在安静环境中清晰说话</span>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* 右侧：工具面板 */}
          <div className="space-y-6">
            {/* 照片上传 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <ImageIcon className="w-4 h-4 mr-2" />
                  照片上传
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`
                    border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all
                    ${isDragging
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-300 hover:border-green-400'
                    }
                  `}
                >
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    拖拽或点击上传家族照片
                  </p>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                  className="hidden"
                />

                {/* 已上传的照片 */}
                {activeJob.uploadedPhotos.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h4 className="text-sm font-medium">已上传照片 ({activeJob.uploadedPhotos.length})</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {activeJob.uploadedPhotos.map((photo, index) => (
                        <div key={index} className="relative">
                          <img
                            src={photo.url}
                            alt={`照片 ${index + 1}`}
                            className="w-full aspect-square object-cover rounded-lg"
                          />
                          {photo.analysis && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center p-2">
                              <p className="text-white text-xs text-center">{photo.analysis.slice(0, 50)}...</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 生成控制 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Wand2 className="w-4 h-4 mr-2" />
                  故事生成
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={handleGenerateOutline}
                  disabled={activeJob.status === 'generating'}
                  className="w-full"
                  variant="outline"
                >
                  {activeJob.status === 'generating' ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <BookOpen className="w-4 h-4 mr-2" />
                  )}
                  生成故事大纲
                </Button>

                <Button
                  onClick={handleGenerateStory}
                  disabled={activeJob.status === 'generating'}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {activeJob.status === 'generating' ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4 mr-2" />
                  )}
                  生成完整故事
                </Button>

                {activeJob.status === 'completed' && (
                  <Button
                    onClick={() => {
                      // 下载故事内容
                      const content = activeJob.content || '';
                      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = `${activeJob.title}.txt`;
                      link.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="w-full"
                    variant="outline"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    下载故事
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* 语音助手 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Volume2 className="w-4 h-4 mr-2" />
                  语音助手
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm text-gray-600 mb-3">
                    让AI朗读最新的回复内容
                  </div>

                  {activeJob.chatHistory.length > 0 && (
                    <VoiceInput
                      onTranscriptChange={() => {}}
                      onVoiceComplete={() => {}}
                      disabled={false}
                      showTTS={true}
                      autoSend={false}
                      className="mb-0"
                    />
                  )}

                  {activeJob.chatHistory.length === 0 && (
                    <div className="text-center py-4 text-gray-400">
                      <Volume2 className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">开始对话后可使用语音功能</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 进度状态 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">创作进度</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span>对话交流</span>
                    <CheckCircle className={`w-4 h-4 ${activeJob.chatHistory.length > 0 ? 'text-green-500' : 'text-gray-300'}`} />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>照片上传</span>
                    <CheckCircle className={`w-4 h-4 ${activeJob.uploadedPhotos.length > 0 ? 'text-green-500' : 'text-gray-300'}`} />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>语音交互</span>
                    <CheckCircle className={`w-4 h-4 ${inputMode === 'voice' || voiceTranscript ? 'text-green-500' : 'text-gray-300'}`} />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>故事大纲</span>
                    <CheckCircle className={`w-4 h-4 ${activeJob.outline ? 'text-green-500' : 'text-gray-300'}`} />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>完整故事</span>
                    <CheckCircle className={`w-4 h-4 ${activeJob.status === 'completed' ? 'text-green-500' : 'text-gray-300'}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* 故事预览 */}
      {activeJob?.content && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Eye className="w-5 h-5 mr-2 text-green-600" />
              故事预览
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                {activeJob.content}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
