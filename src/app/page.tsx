'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Moon, Star, Brain } from 'lucide-react';

export default function Home() {
  const [dream, setDream] = useState('');
  const [dreamResult, setDreamResult] = useState<any>(null);
  const [totalScore, setTotalScore] = useState(0);

  // 简化的解梦功能
  const handleDreamAnalysis = () => {
    if (!dream.trim()) {
      alert('请输入您的梦境描述');
      return;
    }

    // 模拟解梦结果
    const score = Math.floor(Math.random() * 21) - 10; // -10 到 10
    const keywords = ['水', '龙', '飞行', '钱财'];
    const result = {
      score,
      keywords: keywords.slice(0, 2),
      meanings: [
        '这个梦境反映了您内心的期望',
        '象征着生活中的变化',
        '建议保持积极心态'
      ],
      advice: score >= 0 ? '运势不错，继续保持' : '注意小心谨慎'
    };

    setDreamResult(result);
    setTotalScore(prev => prev + score);
  };

  const resetDream = () => {
    setDream('');
    setDreamResult(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* 标题栏 */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Moon className="h-8 w-8 text-purple-600" />
            <h1 className="text-4xl font-bold text-gray-800">香港解梦</h1>
            <Star className="h-8 w-8 text-yellow-500" />
          </div>
          <p className="text-gray-600 text-lg">探索梦境奥秘，体验港式民俗文化</p>
        </div>

        {/* 积分显示 */}
        <div className="flex justify-center mb-6">
          <div className="px-4 py-2 rounded-full bg-blue-50 text-blue-800">
            <span className="flex items-center gap-2">
              ✨ 总积分: {totalScore}
            </span>
          </div>
        </div>

        {/* 解梦功能 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-600" />
              周公解梦
            </CardTitle>
            <CardDescription>
              请详细描述您的梦境，我们将为您解读其中的寓意
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="请详细描述您的梦境..."
              value={dream}
              onChange={(e) => setDream(e.target.value)}
              className="min-h-[120px]"
            />
            <div className="flex gap-2">
              <Button
                onClick={handleDreamAnalysis}
                disabled={!dream.trim()}
                className="flex-1"
              >
                解梦
              </Button>
              <Button variant="outline" onClick={resetDream}>
                重置
              </Button>
            </div>

            {/* 解梦结果 */}
            {dreamResult && (
              <div className="mt-6 space-y-4">
                <h3 className="text-lg font-bold">✨ 解梦结果</h3>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="font-bold">梦境评分</span>
                  <Badge
                    variant={dreamResult.score >= 0 ? 'default' : 'destructive'}
                    className="text-lg px-3 py-1"
                  >
                    {dreamResult.score > 0 ? '+' : ''}{dreamResult.score}
                  </Badge>
                </div>

                {dreamResult.keywords.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-bold text-sm">关键词</h4>
                    <div className="flex flex-wrap gap-2">
                      {dreamResult.keywords.map((keyword: string, index: number) => (
                        <Badge key={index} variant="outline">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <h4 className="font-bold text-sm">梦境解读</h4>
                  <ul className="space-y-2">
                    {dreamResult.meanings.map((meaning: string, index: number) => (
                      <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        {meaning}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-bold text-sm text-blue-800 mb-2">💡 建议</h4>
                  <p className="text-sm text-blue-700">{dreamResult.advice}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 底部说明 */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>🏮 体验香港传统民俗文化 • 📜 传统周公解梦</p>
          <p className="mt-1">解梦积分反映运势状况</p>
        </div>
      </div>
    </div>
  );
}
