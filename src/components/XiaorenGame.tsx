'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Target, Clock, Zap, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { audioManager } from '@/lib/audioManager';

interface XiaorenGameProps {
  onScoreChange: (points: number) => void;
}

interface Granny {
  id: string;
  name: string;
  emoji: string;
  description: string;
  specialty: string;
}

export default function XiaorenGame({ onScoreChange }: XiaorenGameProps) {
  const [gamePhase, setGamePhase] = useState<'select' | 'prepare' | 'playing' | 'burning' | 'finished'>('select');
  const [selectedGranny, setSelectedGranny] = useState<Granny | null>(null);
  const [timeLeft, setTimeLeft] = useState(60);
  const [hitCount, setHitCount] = useState(0);
  const [shakeDetected, setShakeDetected] = useState(false);
  const [xiaorenHealth, setXiaorenHealth] = useState(100);
  const [isShaking, setIsShaking] = useState(false);
  const [celebration, setCelebration] = useState(false);
  const [gameResult, setGameResult] = useState<'success' | 'failure' | null>(null);

  const accelerationRef = useRef({ x: 0, y: 0, z: 0 });
  const lastShakeTime = useRef(0);

  // 打小人婆婆选择
  const grannies: Granny[] = [
    {
      id: 'granny1',
      name: '陈婆婆',
      emoji: '👵',
      description: '鹅颈桥下资深打小人师傅',
      specialty: '专治小人作祟'
    },
    {
      id: 'granny2',
      name: '李婆婆',
      emoji: '👴',
      description: '40年打小人经验',
      specialty: '专除霉运晦气'
    },
    {
      id: 'granny3',
      name: '王婆婆',
      emoji: '🧓',
      description: '祖传打小人手艺',
      specialty: '专破煞气厄运'
    }
  ];

  // 处理摇晃事件
  const handleShake = useCallback(() => {
    if (gamePhase !== 'playing' || hitCount >= 100) return;

    // 播放拍打音效
    audioManager.playHitSound();

    setIsShaking(true);
    setShakeDetected(true);
    setHitCount(prev => prev + 1);
    setXiaorenHealth(prev => Math.max(0, prev - 1));

    setTimeout(() => {
      setIsShaking(false);
      setShakeDetected(false);
    }, 200);
  }, [gamePhase, hitCount]);

  // 摇晃检测
  useEffect(() => {
    if (gamePhase !== 'playing') return;

    const handleDeviceMotion = (event: DeviceMotionEvent) => {
      const current = Date.now();
      const deltaTime = current - lastShakeTime.current;

      if (deltaTime > 100) { // 防抖动
        const acceleration = event.accelerationIncludingGravity;
        if (acceleration) {
          const deltaX = Math.abs(acceleration.x || 0 - accelerationRef.current.x);
          const deltaY = Math.abs(acceleration.y || 0 - accelerationRef.current.y);
          const deltaZ = Math.abs(acceleration.z || 0 - accelerationRef.current.z);

          accelerationRef.current = {
            x: acceleration.x || 0,
            y: acceleration.y || 0,
            z: acceleration.z || 0
          };

          // 检测摇晃强度
          if (deltaX + deltaY + deltaZ > 15) {
            handleShake();
            lastShakeTime.current = current;
          }
        }
      }
    };

    // 请求权限并添加事件监听
    if (typeof DeviceMotionEvent !== 'undefined' && 'requestPermission' in DeviceMotionEvent) {
      // Fixed: Replaced 'any' with more specific type
      (DeviceMotionEvent as unknown as { requestPermission: () => Promise<PermissionState> }).requestPermission().then((response: PermissionState) => {
        if (response === 'granted') {
          window.addEventListener('devicemotion', handleDeviceMotion);
        }
      });
    } else {
      window.addEventListener('devicemotion', handleDeviceMotion);
    }

    return () => {
      window.removeEventListener('devicemotion', handleDeviceMotion);
    };
  }, [gamePhase, handleShake]);

  // 手动点击（备用方案）
  const handleClick = () => {
    if (gamePhase !== 'playing' || hitCount >= 100) return;
    handleShake();
  };

  // 结束游戏
  const endGame = useCallback(() => {
    if (hitCount >= 100) {
      startBurning();
    } else {
      setGameResult('failure');
      setGamePhase('finished');

      // 停止背景音乐
      audioManager.stopBackgroundMusic();
    }
  }, [hitCount]);

  // 游戏计时器
  useEffect(() => {
    if (gamePhase === 'playing' && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && gamePhase === 'playing') {
      endGame();
    }
  }, [gamePhase, timeLeft, endGame]);

  // 开始燃烧阶段
  const startBurning = useCallback(() => {
    setGamePhase('burning');

    // 停止背景音乐并播放燃烧音效
    audioManager.stopBackgroundMusic();
    audioManager.playBurnSound();

    // 燃烧动画持续3秒
    setTimeout(() => {
      setGameResult('success');
      setCelebration(true);
      setGamePhase('finished');
      onScoreChange(10); // 成功完成给10积分

      // 播放成功音效
      audioManager.playSuccessSound();

      // 庆祝动画持续5秒
      setTimeout(() => {
        setCelebration(false);
      }, 5000);
    }, 3000);
  }, [onScoreChange]);

  // 检查是否完成100次拍打
  useEffect(() => {
    if (hitCount >= 100 && gamePhase === 'playing') {
      startBurning();
    }
  }, [hitCount, gamePhase, startBurning]);

  // 开始游戏
  const startGame = () => {
    if (!selectedGranny) return;

    // 初始化移动端音频
    audioManager.initMobileAudio();

    setGamePhase('prepare');

    // 制作纸人阶段
    setTimeout(() => {
      setGamePhase('playing');
      setTimeLeft(60);
      setHitCount(0);
      setXiaorenHealth(100);
      setGameResult(null);
      setCelebration(false);

      // 播放背景音乐
      audioManager.playBackgroundMusic('xiaoren');
    }, 3000);
  };

  // 重置游戏
  const resetGame = () => {
    setGamePhase('select');
    setSelectedGranny(null);
    setHitCount(0);
    setXiaorenHealth(100);
    setTimeLeft(60);

    // 停止背景音乐
    audioManager.stopBackgroundMusic();
  };

  if (gamePhase === 'select') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            鹅颈桥打小人 (传统民俗)
          </CardTitle>
          <CardDescription>
            选择打小人婆婆，祛除梦中厄运，化解霉气晦气
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <h3 className="text-lg font-bold mb-6">选择打小人婆婆</h3>
            <div className="grid grid-cols-1 gap-4 mb-8">
              {grannies.map(granny => (
                <Button
                  key={granny.id}
                  variant={selectedGranny?.id === granny.id ? 'default' : 'outline'}
                  onClick={() => setSelectedGranny(granny)}
                  className="flex items-center gap-4 h-16 justify-start"
                >
                  <span className="text-3xl">{granny.emoji}</span>
                  <div className="text-left">
                    <div className="font-bold">{granny.name}</div>
                    <div className="text-xs text-gray-600">{granny.description}</div>
                    <div className="text-xs text-blue-600">{granny.specialty}</div>
                  </div>
                </Button>
              ))}
            </div>
            <div className="text-sm text-gray-600 mb-6">
              <p>游戏规则：</p>
              <p>• 摇晃手机控制婆婆拍打小人</p>
              <p>• 1分钟内拍打100次</p>
              <p>• 小人化为灰烬即可祛除厄运</p>
              <p>• 成功完成获得10积分</p>
            </div>
            <Button
              onClick={startGame}
              disabled={!selectedGranny}
              className="bg-red-600 hover:bg-red-700"
            >
              开始打小人！
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (gamePhase === 'prepare') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            制作纸人中...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="text-6xl mb-4 animate-bounce">{selectedGranny?.emoji}</div>
            <h3 className="text-xl font-bold mb-4">{selectedGranny?.name}</h3>
            <p className="text-gray-600 mb-4">
              正在将您梦中的厄运倒霉之事制成纸糊小人...
            </p>
            <div className="animate-spin text-4xl mb-4">🗞️</div>
            <p className="text-sm text-gray-500">请稍候，马上开始打小人仪式</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (gamePhase === 'playing') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              鹅颈桥打小人仪式
            </span>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {timeLeft}秒
              </Badge>
              <Badge variant="outline">
                {hitCount}/100次
              </Badge>
            </div>
          </CardTitle>
          <CardDescription>
            摇晃手机控制{selectedGranny?.name}用鞋底拍打小人！
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            {/* 婆婆和小人 */}
            <div className="relative mb-6">
              <div className={`text-6xl mb-4 transition-transform ${isShaking ? 'animate-bounce scale-110' : ''}`}>
                {selectedGranny?.emoji}
              </div>
              <div className="text-2xl mb-2">👠</div>
              <div
                className={`text-4xl transition-all duration-200 ${
                  isShaking ? 'animate-pulse scale-75 opacity-50' : ''
                } ${xiaorenHealth < 50 ? 'opacity-75' : ''} ${xiaorenHealth < 20 ? 'opacity-50' : ''}`}
                onClick={handleClick}
              >
                🧍‍♂️
              </div>
              {shakeDetected && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4 text-2xl animate-ping">
                  💥
                </div>
              )}
            </div>

            {/* 进度条 */}
            <div className="mb-4">
              <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                <div
                  className="bg-red-600 h-4 rounded-full transition-all duration-300"
                  style={{ width: `${hitCount}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600">
                拍打进度: {hitCount}/100次 ({Math.floor((hitCount/100)*100)}%)
              </p>
            </div>

            <div className="text-xs text-gray-500 mb-4">
              {hitCount < 25 && "继续拍打，小人还很顽固！"}
              {hitCount >= 25 && hitCount < 50 && "很好！小人开始害怕了！"}
              {hitCount >= 50 && hitCount < 75 && "继续！小人快要屈服了！"}
              {hitCount >= 75 && hitCount < 100 && "最后冲刺！马上就能祛除厄运了！"}
            </div>

            <p className="text-xs text-gray-400">
              💡 摇晃手机或点击小人进行拍打
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (gamePhase === 'burning') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            小人化灰中...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="text-6xl mb-4 animate-pulse">{selectedGranny?.emoji}</div>
            <div className="text-6xl mb-4 animate-bounce">🔥</div>
            <div className="text-4xl mb-4 opacity-50 animate-pulse">💨</div>
            <h3 className="text-xl font-bold mb-4 text-orange-600">
              小人正在化为灰烬...
            </h3>
            <p className="text-gray-600 mb-4">
              厄运和霉气正在消散中
            </p>
            <div className="animate-spin text-2xl">🌪️</div>
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
            <Sparkles className="h-5 w-5" />
            打小人完成
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            {gameResult === 'success' ? (
              <div className="mb-6">
                <div className="text-6xl mb-4">🎉</div>
                <h3 className="text-2xl font-bold text-green-600 mb-2">厄运已除！</h3>
                <p className="text-gray-600 mb-4">小人化为灰烬，霉气消散！</p>
                {celebration && (
                  <div className="mt-4 animate-bounce">
                    <div className="text-4xl mb-2">💰🌸💰🌸💰</div>
                    <p className="text-yellow-600 font-bold">天降福气！金币鲜花洒下！</p>
                    <div className="text-2xl mt-2 animate-pulse">✨🎊✨</div>
                  </div>
                )}
                <div className="mt-4 p-4 bg-green-50 rounded-lg">
                  <p className="text-green-700 font-bold">恭喜获得 10 积分！</p>
                  <p className="text-green-600 text-sm">
                    感谢{selectedGranny?.name}的帮助！
                  </p>
                </div>
              </div>
            ) : (
              <div className="mb-6">
                <div className="text-6xl mb-4">😔</div>
                <h3 className="text-2xl font-bold text-red-600 mb-2">时间不够！</h3>
                <p className="text-gray-600 mb-4">
                  只拍打了{hitCount}次，需要100次才能祛除厄运
                </p>
                <p className="text-sm text-gray-500">再试一次吧！</p>
              </div>
            )}

            <Button onClick={resetGame} className="w-full">
              重新开始
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}