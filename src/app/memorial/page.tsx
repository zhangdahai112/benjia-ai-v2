"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Heart,
  Flower,
  Flame,
  MessageSquare,
  Calendar,
  Home,
  Plus,
  Star,
  Clock,
  User,
  Camera,
  BookOpen,
  Gift
} from "lucide-react";
import Link from "next/link";

interface MemorialPerson {
  id: string;
  name: string;
  relation: string;
  birth: string;
  death: string;
  avatar?: string;
  bio: string;
  memorialItems: {
    flowers: number;
    candles: number;
    messages: number;
  };
}

interface MemorialMessage {
  id: string;
  authorName: string;
  content: string;
  timestamp: Date;
  type: 'message' | 'prayer';
}

const memorialPersons: MemorialPerson[] = [
  {
    id: '1',
    name: '李老爷爷',
    relation: '曾祖父',
    birth: '1920年3月15日',
    death: '2010年12月20日',
    bio: '李老爷爷一生勤劳善良，经历了抗日战争和新中国建设，是家族的精神支柱。',
    memorialItems: { flowers: 15, candles: 8, messages: 23 }
  },
  {
    id: '2',
    name: '李老奶奶',
    relation: '曾祖母',
    birth: '1925年7月8日',
    death: '2015年6月12日',
    bio: '李老奶奶心地善良，手艺精湛，培养了一大家子优秀的后代。',
    memorialItems: { flowers: 12, candles: 6, messages: 18 }
  }
];

const recentMessages: MemorialMessage[] = [
  {
    id: '1',
    authorName: '李小明',
    content: '爷爷，今天是您的生日，我们都很想念您。您的教诲一直伴随着我们前行。',
    timestamp: new Date('2024-01-15'),
    type: 'message'
  },
  {
    id: '2',
    authorName: '李小红',
    content: '奶奶，您做的饺子的味道我永远都不会忘记，那是家的味道。',
    timestamp: new Date('2024-01-10'),
    type: 'message'
  }
];

export default function MemorialPage() {
  const [selectedPerson, setSelectedPerson] = useState<MemorialPerson | null>(null);
  const [activeTab, setActiveTab] = useState("shrine");
  const [showOfferingDialog, setShowOfferingDialog] = useState(false);
  const [offeringType, setOfferingType] = useState<'flower' | 'candle' | 'incense' | 'message'>('flower');
  const [newMessage, setNewMessage] = useState('');

  const handleOffering = (person: MemorialPerson, type: 'flower' | 'candle' | 'incense') => {
    // 模拟献花/点烛/上香
    console.log(`为 ${person.name} 献${type === 'flower' ? '花' : type === 'candle' ? '烛' : '香'}`);
    setShowOfferingDialog(false);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedPerson) return;

    const message: MemorialMessage = {
      id: Date.now() + '',
      authorName: '当前用户',
      content: newMessage,
      timestamp: new Date(),
      type: 'message'
    };

    // 这里应该保存到后台
    console.log('发送祭文:', message);
    setNewMessage('');
    setShowOfferingDialog(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-stone-50 to-amber-50">
      {/* 顶部导航 */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-800">AI纪念空间</h1>
                <p className="text-sm text-gray-600">缅怀故人，寄托思念</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-amber-100 text-amber-700">
              李氏家祠
            </Badge>
          </div>
        </div>
      </header>

      {/* 标签切换 */}
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex space-x-4 mb-6">
          <Button
            variant={activeTab === "shrine" ? "default" : "outline"}
            onClick={() => setActiveTab("shrine")}
            className={activeTab === "shrine" ? "bg-amber-600 hover:bg-amber-700" : "border-amber-200"}
          >
            <Home className="w-4 h-4 mr-2" />
            虚拟家祠
          </Button>
          <Button
            variant={activeTab === "activities" ? "default" : "outline"}
            onClick={() => setActiveTab("activities")}
            className={activeTab === "activities" ? "bg-amber-600 hover:bg-amber-700" : "border-amber-200"}
          >
            <Heart className="w-4 h-4 mr-2" />
            纪念活动
          </Button>
        </div>

        {/* 虚拟家祠 */}
        {activeTab === "shrine" && (
          <div className="space-y-6">
            {/* 家祠介绍 */}
            <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50">
              <CardHeader className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Home className="w-10 h-10 text-white" />
                </div>
                <CardTitle className="text-2xl text-gray-800">李氏家祠</CardTitle>
                <CardDescription className="text-lg">
                  世代相传，血脉延续，精神永存
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-700 mb-4">
                  家祠是家族精神的象征，是后人缅怀先祖、传承文化的神圣场所。
                  在这里，我们铭记先人的恩德，传承家族的美德。
                </p>
                <div className="flex justify-center space-x-8 text-sm text-gray-600">
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-1" />
                    <span>纪念 {memorialPersons.length} 位先人</span>
                  </div>
                  <div className="flex items-center">
                    <Heart className="w-4 h-4 mr-1" />
                    <span>承载无限思念</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 故人牌位 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {memorialPersons.map(person => (
                <Card
                  key={person.id}
                  className="border-amber-200 hover:shadow-lg transition-all cursor-pointer bg-gradient-to-br from-white to-amber-25"
                  onClick={() => setSelectedPerson(person)}
                >
                  <CardHeader className="text-center pb-4">
                    <div className="w-16 h-20 bg-gradient-to-b from-amber-200 to-amber-300 rounded-lg mx-auto mb-3 border-2 border-amber-400 shadow-md flex flex-col items-center justify-center">
                      <div className="text-xs text-amber-800 font-semibold mb-1">牌位</div>
                      <div className="text-sm font-bold text-amber-900">{person.name}</div>
                      <div className="text-xs text-amber-700">{person.relation}</div>
                    </div>
                    <CardTitle className="text-lg text-gray-800">{person.name}</CardTitle>
                    <CardDescription>
                      {person.birth} - {person.death}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-gray-700 text-sm mb-4 line-clamp-2">{person.bio}</p>
                    <div className="flex justify-between text-xs text-gray-600 mb-4">
                      <div className="flex items-center">
                        <Flower className="w-3 h-3 mr-1 text-pink-500" />
                        <span>{person.memorialItems.flowers}</span>
                      </div>
                      <div className="flex items-center">
                        <Flame className="w-3 h-3 mr-1 text-orange-500" />
                        <span>{person.memorialItems.candles}</span>
                      </div>
                      <div className="flex items-center">
                        <MessageSquare className="w-3 h-3 mr-1 text-blue-500" />
                        <span>{person.memorialItems.messages}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPerson(person);
                          setOfferingType('flower');
                          setShowOfferingDialog(true);
                        }}
                        className="text-xs border-pink-200 hover:bg-pink-50"
                      >
                        <Flower className="w-3 h-3 mr-1" />
                        献花
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPerson(person);
                          setOfferingType('candle');
                          setShowOfferingDialog(true);
                        }}
                        className="text-xs border-orange-200 hover:bg-orange-50"
                      >
                        <Flame className="w-3 h-3 mr-1" />
                        点烛
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPerson(person);
                          setOfferingType('message');
                          setShowOfferingDialog(true);
                        }}
                        className="text-xs border-blue-200 hover:bg-blue-50"
                      >
                        <MessageSquare className="w-3 h-3 mr-1" />
                        祭文
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* 添加纪念按钮 */}
            <Card className="border-dashed border-2 border-gray-300 hover:border-amber-400 transition-colors cursor-pointer">
              <CardContent className="text-center py-12">
                <Plus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">添加故人纪念</h3>
                <p className="text-gray-500 mb-4">为逝去的亲人创建纪念空间</p>
                <Button className="bg-amber-600 hover:bg-amber-700">
                  <Plus className="w-4 h-4 mr-2" />
                  创建纪念空间
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 纪念活动 */}
        {activeTab === "activities" && (
          <div className="space-y-6">
            {/* 最近祭奠 */}
            <Card className="border-amber-200">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-amber-600" />
                  最近祭奠
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentMessages.map(message => (
                    <div key={message.id} className="border-l-4 border-amber-200 pl-4 py-2">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-800">{message.authorName}</span>
                        <span className="text-sm text-gray-500">
                          {message.timestamp.toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-700">{message.content}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 纪念日提醒 */}
            <Card className="border-amber-200">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-amber-600" />
                  纪念日提醒
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                    <div>
                      <p className="font-medium">李老爷爷生日</p>
                      <p className="text-sm text-gray-600">3月15日（还有15天）</p>
                    </div>
                    <Badge className="bg-amber-100 text-amber-700">即将到来</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">清明节</p>
                      <p className="text-sm text-gray-600">4月4日（还有45天）</p>
                    </div>
                    <Badge variant="outline">传统节日</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 家祠统计 */}
            <Card className="border-amber-200">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="w-5 h-5 mr-2 text-amber-600" />
                  家祠统计
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-amber-600">
                      {memorialPersons.reduce((sum, p) => sum + p.memorialItems.flowers, 0)}
                    </div>
                    <p className="text-sm text-gray-600">总献花数</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {memorialPersons.reduce((sum, p) => sum + p.memorialItems.candles, 0)}
                    </div>
                    <p className="text-sm text-gray-600">总点烛数</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {memorialPersons.reduce((sum, p) => sum + p.memorialItems.messages, 0)}
                    </div>
                    <p className="text-sm text-gray-600">总祭文数</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{memorialPersons.length}</div>
                    <p className="text-sm text-gray-600">纪念人数</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* 故人详情/祭奠弹窗 */}
      {(selectedPerson && !showOfferingDialog) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedPerson(null)}>
          <Card className="w-full max-w-2xl border-amber-200" onClick={e => e.stopPropagation()}>
            <CardHeader className="text-center">
              <div className="w-24 h-30 bg-gradient-to-b from-amber-200 to-amber-300 rounded-lg mx-auto mb-4 border-4 border-amber-400 shadow-lg flex flex-col items-center justify-center">
                <div className="text-sm text-amber-800 font-semibold mb-2">纪念牌位</div>
                <div className="text-lg font-bold text-amber-900">{selectedPerson.name}</div>
                <div className="text-sm text-amber-700">{selectedPerson.relation}</div>
              </div>
              <CardTitle className="text-xl">{selectedPerson.name}</CardTitle>
              <CardDescription className="text-lg">
                {selectedPerson.birth} - {selectedPerson.death}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-medium mb-2">生平简介</h4>
                <p className="text-gray-700">{selectedPerson.bio}</p>
              </div>

              <div>
                <h4 className="font-medium mb-3">纪念统计</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-pink-50 rounded-lg">
                    <Flower className="w-6 h-6 text-pink-500 mx-auto mb-1" />
                    <div className="font-semibold">{selectedPerson.memorialItems.flowers}</div>
                    <div className="text-xs text-gray-600">献花</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <Flame className="w-6 h-6 text-orange-500 mx-auto mb-1" />
                    <div className="font-semibold">{selectedPerson.memorialItems.candles}</div>
                    <div className="text-xs text-gray-600">点烛</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <MessageSquare className="w-6 h-6 text-blue-500 mx-auto mb-1" />
                    <div className="font-semibold">{selectedPerson.memorialItems.messages}</div>
                    <div className="text-xs text-gray-600">祭文</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  onClick={() => setShowOfferingDialog(true)}
                  className="border-amber-200 hover:bg-amber-50"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  祭奠纪念
                </Button>
                <Button
                  onClick={() => setSelectedPerson(null)}
                  className="bg-amber-600 hover:bg-amber-700"
                >
                  关闭
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 祭奠操作弹窗 */}
      {showOfferingDialog && selectedPerson && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setShowOfferingDialog(false)}>
          <Card className="w-full max-w-md border-amber-200" onClick={e => e.stopPropagation()}>
            <CardHeader className="text-center">
              <CardTitle>为 {selectedPerson.name} 祭奠</CardTitle>
              <CardDescription>表达您的思念与敬意</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {offeringType === 'message' ? (
                <div>
                  <label className="block text-sm font-medium mb-2">写下您的祭文</label>
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="在此写下您对故人的思念与感恩..."
                    className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    {offeringType === 'flower' && <Flower className="w-8 h-8 text-white" />}
                    {offeringType === 'candle' && <Flame className="w-8 h-8 text-white" />}
                    {offeringType === 'incense' && <Gift className="w-8 h-8 text-white" />}
                  </div>
                  <p className="text-gray-700">
                    {offeringType === 'flower' && '献上鲜花，表达思念'}
                    {offeringType === 'candle' && '点亮蜡烛，照亮灵魂'}
                    {offeringType === 'incense' && '焚香祈福，寄托哀思'}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowOfferingDialog(false)}
                >
                  取消
                </Button>
                <Button
                  onClick={offeringType === 'message' ? handleSendMessage : () => handleOffering(selectedPerson, offeringType as 'flower' | 'candle' | 'incense')}
                  className="bg-amber-600 hover:bg-amber-700"
                  disabled={offeringType === 'message' && !newMessage.trim()}
                >
                  {offeringType === 'message' ? '发送祭文' : '完成祭奠'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
