'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Clock, Trophy, Star, Volume2, VolumeX, Share2 } from 'lucide-react';
import { audioManager } from '@/lib/audioManager';
// import SocialShare from './SocialShare';

interface ShanbaoGameProps {
  onScoreChange: (points: number) => void;
  currentTotalScore?: number;
}

interface Player {
  id: string;
  name: string;
  x: number;
  y: number;
  score: number;
  emoji: string;
}

interface FuBao {
  id: string;
  x: number;
  y: number;
  type: string;
  value: number;
  emoji: string;
  collected: boolean;
}

export default function ShanbaoGame({ onScoreChange, currentTotalScore = 0 }: ShanbaoGameProps) {
  const [gamePhase, setGamePhase] = useState<'select' | 'playing' | 'finished'>('select');
  const [selectedGender, setSelectedGender] = useState<'male' | 'female' | null>(null);
  const [timeLeft, setTimeLeft] = useState(60);
  const [player, setPlayer] = useState<Player>({ id: 'user', name: '玩家', x: 50, y: 80, score: 0, emoji: '🧑' });
  const [opponent, setOpponent] = useState<Player>({ id: 'ai', name: 'AI选手', x: 30, y: 80, score: 0, emoji: '🤖' });
  const [fuBaos, setFuBaos] = useState<FuBao[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [gameResult, setGameResult] = useState<'win' | 'lose' | null>(null);
  const [gameEndReason, setGameEndReason] = useState<'time' | 'allCollected' | null>(null);
  const [celebration, setCelebration] = useState(false);

  const gameAreaRef = useRef<HTMLDivElement>(null);

  // 福包类型定义
  const fuBaoTypes = [
    { type: '财运滚滚', value: 15, emoji: '💰', color: 'text-yellow-600' },
    { type: '平安如意', value: 10, emoji: '🛡️', color: 'text-blue-600' },
    { type: '身体健康', value: 8, emoji: '❤️', color: 'text-red-600' },
    { type: '飞黄腾达', value: 12, emoji: '🚀', color: 'text-purple-600' },
    { type: '状元及第', value: 20, emoji: '🎓', color: 'text-green-600' },
  ];

  // 初始化福包
  const initializeFuBaos = () => {
    const newFuBaos: FuBao[] = [];
    for (let i = 0; i < 15; i++) {
      const type = fuBaoTypes[Math.floor(Math.random() * fuBaoTypes.length)];
      newFuBaos.push({
        id: `fubao-${i}`,
        x: Math.random() * 80 + 10, // 10% to 90%
        y: Math.random() * 60 + 10, // 10% to 70%
        type: type.type,
        value: type.value,
        emoji: type.emoji,
        collected: false,
      });
    }
    setFuBaos(newFuBaos);
  };

  // 开始游戏
  const startGame = () => {
    if (!selectedGender) return;

    setPlayer(prev => ({
      ...prev,
      emoji: selectedGender === 'male' ? '🧑' : '👩',
      x: 50,
      y: 80,
      score: 0
    }));

    setOpponent(prev => ({
      ...prev,
      x: 30,
      y: 80,
      score: 0
    }));

    initializeFuBaos();
    setTimeLeft(60);
    setGamePhase('playing');
    setGameResult(null);
    setCelebration(false);

    // 初始化移动端音频并播放背景音乐
    audioManager.initMobileAudio();
    audioManager.playBackgroundMusic('shanbao');
  };

  // 游戏计时器
  useEffect(() => {
    if (gamePhase === 'playing' && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && gamePhase === 'playing') {
      endGame('time');
    }
  }, [gamePhase, timeLeft]);

  // AI移动逻辑
  useEffect(() => {
    if (gamePhase === 'playing') {
      const aiMoveInterval = setInterval(() => {
        moveAI();
      }, 200);
      return () => clearInterval(aiMoveInterval);
    }
  }, [gamePhase, fuBaos]);

  const moveAI = () => {
    setOpponent(prev => {
      // AI寻找最近的未收集福包
      const availableFuBaos = fuBaos.filter(fb => !fb.collected);
      if (availableFuBaos.length === 0) return prev;

      const nearest = availableFuBaos.reduce((closest, current) => {
        const currentDist = Math.sqrt(Math.pow(current.x - prev.x, 2) + Math.pow(current.y - prev.y, 2));
        const closestDist = Math.sqrt(Math.pow(closest.x - prev.x, 2) + Math.pow(closest.y - prev.y, 2));
        return currentDist < closestDist ? current : closest;
      });

      // 向目标移动
      const dx = nearest.x - prev.x;
      const dy = nearest.y - prev.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 5) {
        // 收集福包
        collectFuBao(nearest.id, 'ai');
        return prev;
      }

      const speed = 2;
      const newX = Math.max(0, Math.min(100, prev.x + (dx / distance) * speed));
      const newY = Math.max(0, Math.min(100, prev.y + (dy / distance) * speed));

      return { ...prev, x: newX, y: newY };
    });
  };

  // 收集福包
  const collectFuBao = (fuBaoId: string, playerId: string) => {
    setFuBaos(prev => {
      const fuBao = prev.find(fb => fb.id === fuBaoId && !fb.collected);
      if (!fuBao) return prev;

      // 标记为已收集
      const updated = prev.map(fb =>
        fb.id === fuBaoId ? { ...fb, collected: true } : fb
      );

      // 更新得分
      if (playerId === 'user') {
        setPlayer(p => ({ ...p, score: p.score + fuBao.value }));
        onScoreChange(fuBao.value);
        // 播放收集音效
        audioManager.playCollectSound();
      } else {
        setOpponent(p => ({ ...p, score: p.score + fuBao.value }));
      }

      // 检查是否所有福包都已收集
      const allCollected = updated.every(fb => fb.collected);
      if (allCollected) {
        // 延迟一点时间让玩家看到最后一个福包被收集
        setTimeout(() => {
          endGame('allCollected');
        }, 500);
      }

      return updated;
    });
  };

  // 处理触摸/鼠标移动
  const handleMove = (clientX: number, clientY: number) => {
    if (!gameAreaRef.current || gamePhase !== 'playing') return;

    const rect = gameAreaRef.current.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;

    setPlayer(prev => ({
      ...prev,
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y))
    }));

    // 检查碰撞
    fuBaos.forEach(fuBao => {
      if (!fuBao.collected) {
        const distance = Math.sqrt(
          Math.pow(fuBao.x - x, 2) + Math.pow(fuBao.y - y, 2)
        );
        if (distance < 5) {
          collectFuBao(fuBao.id, 'user');
        }
      }
    });
  };

  // 鼠标事件处理
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      handleMove(e.clientX, e.clientY);
    }
  };

  // 触摸事件处理
  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleMove(touch.clientX, touch.clientY);
  };

  // 结束游戏
  const endGame = (reason: 'time' | 'allCollected' = 'time') => {
    setGamePhase('finished');
    setGameEndReason(reason);
    const playerWin = player.score > opponent.score;
    setGameResult(playerWin ? 'win' : 'lose');

    // 停止背景音乐
    audioManager.stopBackgroundMusic();

    if (playerWin) {
      // 播放胜利音效
      audioManager.playSuccessSound();
      setCelebration(true);
      setTimeout(() => setCelebration(false), 3000);
    }
  };

  // 重置游戏
  const resetGame = () => {
    setGamePhase('select');
    setSelectedGender(null);
    setGameResult(null);
    setGameEndReason(null);
    setCelebration(false);

    // 停止背景音乐
    audioManager.stopBackgroundMusic();
  };

  if (gamePhase === 'select') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            长洲岛抢山包 (传统民俗)
          </CardTitle>
          <CardDescription>
            选择您的参赛选手，与AI对手在长洲岛的山上抢夺福包！
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <h3 className="text-lg font-bold mb-6">选择参赛选手</h3>
            <div className="flex gap-4 justify-center mb-8">
              <Button
                variant={selectedGender === 'male' ? 'default' : 'outline'}
                onClick={() => setSelectedGender('male')}
                className="flex flex-col items-center gap-2 h-20 w-20"
              >
                <span className="text-3xl">🧑</span>
                <span className="text-xs">男选手</span>
              </Button>
              <Button
                variant={selectedGender === 'female' ? 'default' : 'outline'}
                onClick={() => setSelectedGender('female')}
                className="flex flex-col items-center gap-2 h-20 w-20"
              >
                <span className="text-3xl">👩</span>
                <span className="text-xs">女选手</span>
              </Button>
            </div>
            <div className="text-sm text-gray-600 mb-6">
              <p>游戏规则：</p>
              <p>• 滑动屏幕控制选手移动</p>
              <p>• 1分钟内抢夺山上的福包</p>
              <p>• 不同福包有不同分值</p>
              <p>• 得分最高者获胜</p>
            </div>
            <Button
              onClick={startGame}
              disabled={!selectedGender}
              className="bg-red-600 hover:bg-red-700"
            >
              开始抢包！
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (gamePhase === 'finished') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            游戏结束
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            {gameResult === 'win' && (
              <div className="mb-6">
                <div className="text-6xl mb-4">🎉</div>
                <h3 className="text-2xl font-bold text-green-600 mb-2">恭喜获胜！</h3>
                <p className="text-gray-600">
                  {gameEndReason === 'allCollected'
                    ? '您抢光了所有福包，提前获胜！福气满满！'
                    : '您成功登上山顶，福气满满！'
                  }
                </p>
                {gameEndReason === 'allCollected' && (
                  <p className="text-green-600 text-sm mt-2 font-bold">🎯 完美收集奖励！</p>
                )}
                {celebration && (
                  <div className="mt-4 animate-bounce">
                    <div className="text-4xl">💰🌸💰🌸💰</div>
                    <p className="text-yellow-600 font-bold">金币鲜花洒下！</p>
                  </div>
                )}

                {/* 分享成就按钮 */}
                <div className="mt-4">
                  <Button variant="outline" className="w-full mb-3">
                    <Share2 className="h-4 w-4 mr-2" />
                    分享成就
                  </Button>
                </div>
              </div>
            )}
            {gameResult === 'lose' && (
              <div className="mb-6">
                <div className="text-6xl mb-4">😔</div>
                <h3 className="text-2xl font-bold text-red-600 mb-2">再接再厉！</h3>
                <p className="text-gray-600">
                  {gameEndReason === 'allCollected'
                    ? 'AI抢完了所有福包，动作真快！下次要更迅速！'
                    : '时间到了！下次一定能抢到更多福包！'
                  }
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="font-bold">您的得分</p>
                <p className="text-2xl text-blue-600">{player.score}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="font-bold">AI得分</p>
                <p className="text-2xl text-gray-600">{opponent.score}</p>
              </div>
            </div>

            <Button onClick={resetGame} className="w-full">
              再来一局
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            长洲岛抢山包
          </span>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {timeLeft}秒
            </Badge>
          </div>
        </CardTitle>
        <CardDescription>
          滑动屏幕控制选手移动，抢夺山上的福包！
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex justify-between">
          <div className="flex items-center gap-2">
            <span>{player.emoji}</span>
            <span className="font-bold">您: {player.score}</span>
          </div>
          <div className="flex items-center gap-2">
            <span>{opponent.emoji}</span>
            <span className="font-bold">AI: {opponent.score}</span>
          </div>
        </div>

        {/* 游戏区域 */}
        <div
          ref={gameAreaRef}
          className="relative w-full h-80 bg-gradient-to-t from-green-200 to-blue-200 rounded-lg border-2 border-gray-300 overflow-hidden cursor-move"
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onMouseLeave={() => setIsDragging(false)}
          onMouseMove={handleMouseMove}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={() => setIsDragging(false)}
          onTouchMove={handleTouchMove}
        >
          {/* 山峰背景 */}
          <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-green-400 to-green-300 clip-path-mountain"></div>

          {/* 福包 */}
          {fuBaos.map(fuBao => (
            !fuBao.collected && (
              <div
                key={fuBao.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 text-2xl animate-pulse"
                style={{
                  left: `${fuBao.x}%`,
                  top: `${fuBao.y}%`,
                }}
                title={`${fuBao.type} (+${fuBao.value})`}
              >
                {fuBao.emoji}
              </div>
            )
          ))}

          {/* 玩家 */}
          <div
            className="absolute transform -translate-x-1/2 -translate-y-1/2 text-3xl z-10"
            style={{
              left: `${player.x}%`,
              top: `${player.y}%`,
            }}
          >
            {player.emoji}
          </div>

          {/* AI对手 */}
          <div
            className="absolute transform -translate-x-1/2 -translate-y-1/2 text-3xl z-10"
            style={{
              left: `${opponent.x}%`,
              top: `${opponent.y}%`,
            }}
          >
            {opponent.emoji}
          </div>

          {/* 山顶标识 */}
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 text-4xl">
            ⛰️
          </div>
        </div>

        {/* 福包说明 */}
        <div className="mt-4 grid grid-cols-5 gap-2 text-xs">
          {fuBaoTypes.map(type => (
            <div key={type.type} className="text-center">
              <div className="text-lg">{type.emoji}</div>
              <div className={`font-bold ${type.color}`}>+{type.value}</div>
              <div className="text-gray-600">{type.type}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
