'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Moon, Star, Sparkles, Target, Heart, Settings, Loader2, Bot } from 'lucide-react';
import ShanbaoGame from '@/components/ShanbaoGame';
import XiaorenGame from '@/components/XiaorenGame';
import { dreamAI, type DreamAnalysis } from '@/lib/dreamAI';

export default function Home() {
  const [dream, setDream] = useState('');
  const [dreamResult, setDreamResult] = useState<DreamAnalysis | null>(null);
  const [userScore, setUserScore] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showApiDialog, setShowApiDialog] = useState(false);
  const [aiMode, setAiMode] = useState(dreamAI.hasApiKey());





  const analyzeDream = async () => {
    if (!dream.trim()) return;

    setIsAnalyzing(true);

    try {
      let analysis: DreamAnalysis;

      if (aiMode && dreamAI.hasApiKey()) {
        // 使用AI分析
        analysis = await dreamAI.analyzeDream(dream);
      } else {
        // 使用备用本地分析
        analysis = dreamAI.getFallbackAnalysis(dream);
      }

      setDreamResult(analysis);
      setUserScore(prev => prev + analysis.score);

    } catch (error) {
      console.error('解梦分析失败:', error);

      // 如果AI分析失败，使用备用分析
      const fallbackAnalysis = dreamAI.getFallbackAnalysis(dream);
      setDreamResult({
        ...fallbackAnalysis,
        meanings: [
          ...(error instanceof Error ? [`AI分析暂时不可用: ${error.message}`] : ['AI分析暂时不可用']),
          ...fallbackAnalysis.meanings
        ]
      });
      setUserScore(prev => prev + fallbackAnalysis.score);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 设置API密钥
  const handleApiKeySubmit = () => {
    if (apiKey.trim()) {
      dreamAI.setApiKey(apiKey.trim());
      setAiMode(true);
      setShowApiDialog(false);
      alert('DeepSeek API密钥设置成功！现在可以使用AI解梦了。');
    }
  };

  // 打小人游戏逻辑



  // 积分更新函数
  const handleScoreChange = (points: number) => {
    setUserScore(prev => prev + points);
  };

  const getScoreColor = (score: number) => {
    if (score >= 5) return 'text-green-600';
    if (score >= 0) return 'text-blue-600';
    if (score >= -5) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 5) return 'bg-green-100 text-green-800';
    if (score >= 0) return 'bg-blue-100 text-blue-800';
    if (score >= -5) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* 标题栏 */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Moon className="h-8 w-8 text-purple-600" />
            <h1 className="text-4xl font-bold text-gray-800">香港解梦</h1>
            <Star className="h-8 w-8 text-purple-600" />
          </div>
          <p className="text-gray-600 text-lg">探索梦境奥秘，体验港式民俗文化</p>
        </div>

        {/* 用户积分显示 */}
        <div className="flex justify-center mb-6">
          <Badge className={`text-lg px-4 py-2 ${getScoreBadgeColor(userScore)}`}>
            <Sparkles className="h-4 w-4 mr-2" />
            总积分: {userScore}
          </Badge>
        </div>

        <Tabs defaultValue="dream" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dream">解梦</TabsTrigger>
            <TabsTrigger value="xiaoren">打小人</TabsTrigger>
            <TabsTrigger value="shanbao">抢山包</TabsTrigger>
          </TabsList>

          {/* 解梦功能 */}
          <TabsContent value="dream">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Moon className="h-5 w-5" />
                    周公解梦
                    {aiMode && <Bot className="h-4 w-4 text-blue-600" />}
                  </div>
                  <Dialog open={showApiDialog} onOpenChange={setShowApiDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-1" />
                        AI设置
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>DeepSeek AI解梦设置</DialogTitle>
                        <DialogDescription>
                          输入您的DeepSeek API密钥以启用AI智能解梦功能
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">API密钥</label>
                          <Input
                            type="password"
                            placeholder="sk-..."
                            value={apiKey}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setApiKey(e.target.value)}
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            获取API密钥：访问 <a href="https://platform.deepseek.com" target="_blank" className="text-blue-600">DeepSeek官网</a>
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={handleApiKeySubmit} className="flex-1">
                            设置密钥
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setAiMode(!aiMode)}
                            className="flex-1"
                          >
                            {aiMode ? '切换到本地模式' : '切换到AI模式'}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardTitle>
                <CardDescription>
                  {aiMode ? (
                    <span className="flex items-center gap-1">
                      <Bot className="h-4 w-4" />
                      AI智能解梦模式 - 更深入的梦境分析
                    </span>
                  ) : (
                    "传统周公解梦 - 请详细描述您的梦境"
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="请输入您的梦境..."
                  value={dream}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDream(e.target.value)}
                  className="min-h-[120px]"
                />
                <Button onClick={analyzeDream} className="w-full" disabled={isAnalyzing}>
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {aiMode ? 'AI分析中...' : '分析中...'}
                    </>
                  ) : (
                    <>
                      {aiMode ? '🤖 AI解梦' : '📜 传统解梦'}
                    </>
                  )}
                </Button>

                {dreamResult && (
                  <Card className="mt-4">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>解梦结果</span>
                        <Badge className={getScoreBadgeColor(dreamResult.score)}>
                          {dreamResult.score > 0 ? '+' : ''}{dreamResult.score} 分
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {dreamResult.keywords.length > 0 && (
                          <div>
                            <p className="font-medium text-sm text-gray-600 mb-2">识别关键词:</p>
                            <div className="flex flex-wrap gap-2">
                              {dreamResult.keywords.map((keyword: string, index: number) => (
                                <Badge key={index} variant="outline">{keyword}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-sm text-gray-600 mb-2">梦境解读:</p>
                          {dreamResult.meanings.map((meaning: string, index: number) => (
                            <p key={index} className="text-gray-700 mb-1">• {meaning}</p>
                          ))}
                        </div>

                        {/* AI模式额外内容 */}
                        {aiMode && dreamResult.advice && (
                          <div>
                            <p className="font-medium text-sm text-gray-600 mb-2">💡 专业建议:</p>
                            <p className="text-blue-700 bg-blue-50 p-3 rounded-lg text-sm">
                              {dreamResult.advice}
                            </p>
                          </div>
                        )}

                        {aiMode && dreamResult.cultural_context && (
                          <div>
                            <p className="font-medium text-sm text-gray-600 mb-2">🏮 香港文化解读:</p>
                            <p className="text-purple-700 bg-purple-50 p-3 rounded-lg text-sm">
                              {dreamResult.cultural_context}
                            </p>
                          </div>
                        )}
                        {dreamResult.score < 0 && (
                          <div className="mt-4 p-3 bg-red-50 rounded-lg">
                            <p className="text-red-700 text-sm">
                              您的梦境得分为负，建议尝试"打小人"游戏来祛除厄运！
                            </p>
                          </div>
                        )}
                        {dreamResult.score > 0 && (
                          <div className="mt-4 p-3 bg-green-50 rounded-lg">
                            <p className="text-green-700 text-sm">
                              您的梦境寓意良好，可以玩"抢山包"游戏来增加福分！
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 打小人游戏 */}
          <TabsContent value="xiaoren">
            <XiaorenGame onScoreChange={handleScoreChange} />
          </TabsContent>

          {/* 抢山包游戏 */}
          <TabsContent value="shanbao">
            <ShanbaoGame onScoreChange={handleScoreChange} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
