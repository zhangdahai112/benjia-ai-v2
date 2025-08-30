"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAIServices } from "@/contexts/AIServicesContext";
import { useFamilyMembers } from "@/contexts/FamilyMembersContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import VirtualShrine from "@/components/VirtualShrine";
import MemorialCreator from "@/components/MemorialCreator";
import {
  Heart,
  Flower,
  Candle,
  Star,
  Crown,
  MessageSquare,
  Gift,
  Music,
  Users,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";

// 纪念空间主题配置
const MEMORIAL_THEMES = [
  {
    id: 'garden',
    name: '花园式',
    description: '温馨花园主题，充满生机与希望',
    bgGradient: 'from-green-100 via-emerald-50 to-teal-100',
    accentColor: 'text-emerald-600',
    iconColor: 'text-emerald-500'
  },
  {
    id: 'candle',
    name: '烛光式',
    description: '温暖烛光主题，寄托无尽思念',
    bgGradient: 'from-amber-100 via-orange-50 to-yellow-100',
    accentColor: 'text-amber-600',
    iconColor: 'text-amber-500'
  },
  {
    id: 'modern',
    name: '现代简约',
    description: '简约现代主题，宁静优雅',
    bgGradient: 'from-blue-100 via-indigo-50 to-purple-100',
    accentColor: 'text-blue-600',
    iconColor: 'text-blue-500'
  },
  {
    id: 'traditional',
    name: '传统中式',
    description: '古典中式主题，庄重典雅',
    bgGradient: 'from-red-100 via-rose-50 to-pink-100',
    accentColor: 'text-red-600',
    iconColor: 'text-red-500'
  }
];

// 虚拟献花类型
const FLOWER_TYPES = [
  { id: 'rose', name: '玫瑰', emoji: '🌹', price: 1, meaning: '深深的爱' },
  { id: 'lily', name: '百合', emoji: '🤍', price: 2, meaning: '纯洁的心' },
  { id: 'chrysanthemum', name: '菊花', emoji: '🌼', price: 1, meaning: '思念如丝' },
  { id: 'carnation', name: '康乃馨', emoji: '🌺', price: 2, meaning: '永恒的爱' },
  { id: 'sunflower', name: '向日葵', emoji: '🌻', price: 3, meaning: '阳光希望' },
  { id: 'tulip', name: '郁金香', emoji: '🌷', price: 2, meaning: '美好祝愿' }
];

export default function AIMemorialPage() {
  const { user } = useAuth();
  const { members } = useFamilyMembers();
  const { memorialJobs, getMemorialJob } = useAIServices();
  const { toast } = useToast();

  const [activeMemorialId, setActiveMemorialId] = useState<string | null>(null);
  const [selectedTheme, setSelectedTheme] = useState(MEMORIAL_THEMES[0]);
  const [aiChatMessage, setAiChatMessage] = useState("");
  const [shrineMessages, setShrineMessages] = useState<Array<{
    id: string;
    content: string;
    timestamp: Date;
    author: string;
    type: 'user' | 'ai';
  }>>([]);
  const [userScore, setUserScore] = useState(100);
  const [selectedFlower, setSelectedFlower] = useState(FLOWER_TYPES[0]);
  const [shrineDecorations, setShrineDecorations] = useState<Array<{
    id: string;
    type: 'flower' | 'item';
    item: any;
    position: { x: number; y: number };
    timestamp: Date;
    author: string;
  }>>([]);
  const [isPlaying, setIsPlaying] = useState(false);

  // 获取活跃的纪念空间
  const activeMemorial = activeMemorialId ? getMemorialJob(activeMemorialId) : null;

  // 获取已故成员列表
  const deceasedMembers = members.filter(member => !member.alive);

  // 处理主题切换
  const handleThemeChange = (themeId: string) => {
    const theme = MEMORIAL_THEMES.find(t => t.id === themeId);
    if (theme) {
      setSelectedTheme(theme);
    }
  };

  // 处理AI对话
  const handleAIChat = async () => {
    if (!aiChatMessage.trim()) return;

    const newMessage = {
      id: `msg_${Date.now()}`,
      content: aiChatMessage,
      timestamp: new Date(),
      author: user?.name || '用户',
      type: 'user' as const
    };

    setShrineMessages(prev => [...prev, newMessage]);

    // 模拟AI回复
    setTimeout(() => {
      const aiResponse = {
        id: `ai_${Date.now()}`,
        content: generateAIResponse(aiChatMessage),
        timestamp: new Date(),
        author: 'AI助手',
        type: 'ai' as const
      };
      setShrineMessages(prev => [...prev, aiResponse]);
    }, 1500);

    setAiChatMessage("");
  };

  // 生成AI回复
  const generateAIResponse = (userMessage: string) => {
    const message = userMessage.toLowerCase();

    if (message.includes('设计') || message.includes('装饰')) {
      return `我建议在家祠中央放置一束白色百合花，象征纯洁的思念。可以在两侧添加传统的青铜香炉，营造庄重的氛围。背景可以选择温暖的金色调，让整个空间充满温馨感。`;
    } else if (message.includes('花') || message.includes('献花')) {
      return `献花是表达思念的美好方式。玫瑰代表深深的爱，菊花寄托思念，百合象征纯洁的心。您可以选择逝者生前最喜欢的花朵，这样更有纪念意义。`;
    } else if (message.includes('音乐') || message.includes('背景')) {
      return `建议播放一些宁静祥和的音乐，如古典音乐或逝者生前喜爱的歌曲。轻柔的音乐能够营造温馨的氛围，让人感受到内心的平静和慰藉。`;
    } else {
      return `感谢您的分享。创建纪念空间是一件充满爱意的事情。我建议您可以添加一些个人化的元素，比如逝者的照片、喜爱的物品，或者写下一些想说的话。这样的纪念空间会更加温馨和有意义。`;
    }
  };

  // 处理献花
  const handleOfferFlower = () => {
    if (userScore < selectedFlower.price) {
      toast({
        title: "积分不足",
        description: "您的积分不足以献上这束花",
        variant: "destructive"
      });
      return;
    }

    const newDecoration = {
      id: `decoration_${Date.now()}`,
      type: 'flower' as const,
      item: selectedFlower,
      position: {
        x: Math.random() * 300 + 50,
        y: Math.random() * 200 + 100
      },
      timestamp: new Date(),
      author: user?.name || '用户'
    };

    setShrineDecorations(prev => [...prev, newDecoration]);
    setUserScore(prev => prev - selectedFlower.price);

    toast({
      title: "献花成功",
      description: `您献上了${selectedFlower.emoji} ${selectedFlower.name}，${selectedFlower.meaning}`,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">本家AI</h1>
                <p className="text-xs text-gray-600">AI纪念空间</p>
              </div>
            </Link>

            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost">返回首页</Button>
              </Link>
              <Link href="/family-home">
                <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                  进入家族
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* 主界面 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!activeMemorialId ? (
          // 纪念空间列表页面
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="text-center">
              <div className="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium mb-6">
                <Heart className="w-4 h-4 mr-2" />
                AI智能纪念空间
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                为逝去的亲人创建
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                  温馨纪念空间
                </span>
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                运用AI技术为逝去的家族成员创建虚拟家祠和纪念空间，让思念有处安放，让爱永远传承。通过AI对话优化设计，游戏化献花互动，让纪念更加温馨有意义。
              </p>
            </div>

            {/* 主题选择 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="w-5 h-5 mr-2 text-purple-600" />
                  选择纪念主题
                </CardTitle>
                <CardDescription>
                  选择一个合适的主题风格，为您的纪念空间营造温馨氛围
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {MEMORIAL_THEMES.map(theme => (
                    <Card
                      key={theme.id}
                      className={`cursor-pointer transition-all duration-300 ${
                        selectedTheme.id === theme.id
                          ? 'ring-2 ring-purple-500 shadow-lg transform scale-105'
                          : 'hover:shadow-md'
                      }`}
                      onClick={() => handleThemeChange(theme.id)}
                    >
                      <CardContent className={`p-6 bg-gradient-to-br ${theme.bgGradient} text-center`}>
                        <div className={`w-12 h-12 ${theme.accentColor} mx-auto mb-3 flex items-center justify-center`}>
                          {theme.id === 'garden' && <Flower className="w-8 h-8" />}
                          {theme.id === 'candle' && <Candle className="w-8 h-8" />}
                          {theme.id === 'modern' && <Star className="w-8 h-8" />}
                          {theme.id === 'traditional' && <Crown className="w-8 h-8" />}
                        </div>
                        <h3 className={`font-semibold ${theme.accentColor} mb-2`}>{theme.name}</h3>
                        <p className="text-sm text-gray-600">{theme.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 已故成员列表 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2 text-purple-600" />
                  为家族成员创建纪念空间
                </CardTitle>
                <CardDescription>
                  为已故的家族成员创建专属的纪念空间
                </CardDescription>
              </CardHeader>
              <CardContent>
                {deceasedMembers.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {deceasedMembers.map(member => {
                      const existingMemorial = memorialJobs.find(job =>
                        job.deceasedName === member.name
                      );

                      return (
                        <Card key={member.id} className="hover:shadow-lg transition-shadow">
                          <CardContent className="p-6 text-center">
                            <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                              <Heart className="w-8 h-8 text-gray-400" />
                            </div>

                            <h3 className="font-semibold text-gray-900 mb-2">{member.name}</h3>
                            <p className="text-sm text-gray-600 mb-2">{member.relation}</p>
                            <p className="text-xs text-gray-500 mb-4">
                              {member.birth} - {member.death}
                            </p>

                            {existingMemorial ? (
                              <div className="space-y-2">
                                <Badge className="bg-green-100 text-green-700">
                                  已创建纪念空间
                                </Badge>
                                <Button
                                  className="w-full"
                                  onClick={() => setActiveMemorialId(existingMemorial.id)}
                                >
                                  <Heart className="w-4 h-4 mr-2" />
                                  进入纪念空间
                                </Button>
                              </div>
                            ) : (
                              <MemorialCreator
                                deceasedMember={member}
                                selectedTheme={selectedTheme}
                                onMemorialCreated={(memorialId) => {
                                  setActiveMemorialId(memorialId);
                                  toast({
                                    title: "纪念空间创建成功",
                                    description: `为${member.name}创建的纪念空间已完成`
                                  });
                                }}
                              />
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Heart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium mb-2">暂无已故家族成员</p>
                    <p className="text-sm">纪念空间将为逝去的亲人提供温馨的缅怀场所</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          // 纪念空间详情页面
          <div className="space-y-6">
            {/* 返回按钮 */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setActiveMemorialId(null)}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回列表
              </Button>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span className="font-medium text-gray-700">{userScore} 积分</span>
                </div>
              </div>
            </div>

            {/* 虚拟家祠主界面 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 虚拟家祠 */}
              <div className="lg:col-span-2">
                <VirtualShrine
                  memorial={activeMemorial}
                  theme={selectedTheme}
                  decorations={shrineDecorations}
                  isPlaying={isPlaying}
                  volume={50}
                />
              </div>

              {/* 互动面板 */}
              <div className="space-y-6">
                {/* AI设计助手 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <MessageSquare className="w-5 h-5 mr-2 text-purple-600" />
                      AI设计助手
                    </CardTitle>
                    <CardDescription>
                      与AI对话，优化家祠设计
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="max-h-40 overflow-y-auto space-y-2">
                        {shrineMessages.length === 0 ? (
                          <div className="text-center py-4 text-gray-500">
                            <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                            <p className="text-sm">向AI描述您的设计想法</p>
                          </div>
                        ) : (
                          shrineMessages.map(message => (
                            <div
                              key={message.id}
                              className={`p-3 rounded-lg text-sm ${
                                message.type === 'user'
                                  ? 'bg-blue-100 text-blue-900 ml-4'
                                  : 'bg-purple-100 text-purple-900 mr-4'
                              }`}
                            >
                              <p className="font-medium mb-1">{message.author}</p>
                              <p>{message.content}</p>
                            </div>
                          ))
                        )}
                      </div>

                      <div className="flex space-x-2">
                        <Textarea
                          value={aiChatMessage}
                          onChange={(e) => setAiChatMessage(e.target.value)}
                          placeholder="询问AI如何优化家祠设计..."
                          className="flex-1"
                          rows={2}
                        />
                        <Button
                          onClick={handleAIChat}
                          disabled={!aiChatMessage.trim()}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 献花功能 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Flower className="w-5 h-5 mr-2 text-pink-600" />
                      虚拟献花
                    </CardTitle>
                    <CardDescription>
                      献上鲜花，表达思念之情
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Select
                        value={selectedFlower.id}
                        onValueChange={(value) => {
                          const flower = FLOWER_TYPES.find(f => f.id === value);
                          if (flower) setSelectedFlower(flower);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {FLOWER_TYPES.map(flower => (
                            <SelectItem key={flower.id} value={flower.id}>
                              <div className="flex items-center space-x-2">
                                <span>{flower.emoji}</span>
                                <span>{flower.name}</span>
                                <Badge variant="outline">{flower.price}积分</Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <div className="text-center p-3 bg-pink-50 rounded-lg">
                        <p className="text-sm text-pink-700">
                          {selectedFlower.emoji} {selectedFlower.meaning}
                        </p>
                      </div>

                      <Button
                        onClick={handleOfferFlower}
                        disabled={userScore < selectedFlower.price}
                        className="w-full bg-pink-600 hover:bg-pink-700"
                      >
                        <Flower className="w-4 h-4 mr-2" />
                        献花 ({selectedFlower.price}积分)
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
