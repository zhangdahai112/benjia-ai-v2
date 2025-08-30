"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { type MemorialSpaceJob } from "@/contexts/AIServicesContext";
import {
  Heart,
  Flower,
  Candle,
  Star,
  Crown,
  Volume2,
  Camera,
  Download,
  Share2,
  Maximize2
} from "lucide-react";

interface ShrineDecoration {
  id: string;
  type: 'flower' | 'item';
  item: {
    id: string;
    name: string;
    emoji: string;
    meaning: string;
  };
  position: { x: number; y: number };
  timestamp: Date;
  author: string;
}

interface ShrineTheme {
  id: string;
  name: string;
  description: string;
  bgGradient: string;
  accentColor: string;
  iconColor: string;
}

interface VirtualShrineProps {
  memorial: MemorialSpaceJob | null;
  theme: ShrineTheme;
  decorations: ShrineDecoration[];
  isPlaying: boolean;
  volume: number;
}

export default function VirtualShrine({
  memorial,
  theme,
  decorations,
  isPlaying,
  volume
}: VirtualShrineProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // 获取主题对应的背景图片和装饰
  const getShrineBackground = () => {
    switch (theme.id) {
      case 'garden':
        return 'https://images.unsplash.com/photo-1558618644-fcd25c85cd64?w=800&h=600&fit=crop';
      case 'candle':
        return 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop';
      case 'modern':
        return 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop';
      case 'traditional':
        return 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop';
      default:
        return 'https://images.unsplash.com/photo-1558618644-fcd25c85cd64?w=800&h=600&fit=crop';
    }
  };

  // 获取主题装饰元素
  const getThemeDecorations = () => {
    switch (theme.id) {
      case 'garden':
        return (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-4 left-4 text-green-500 opacity-70">🌸</div>
            <div className="absolute top-8 right-8 text-green-400 opacity-60">🍃</div>
            <div className="absolute bottom-12 left-8 text-green-600 opacity-80">🌿</div>
            <div className="absolute bottom-4 right-12 text-green-500 opacity-70">🦋</div>
          </div>
        );
      case 'candle':
        return (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-6 left-6 text-amber-400 opacity-80">🕯️</div>
            <div className="absolute top-6 right-6 text-amber-400 opacity-80">🕯️</div>
            <div className="absolute bottom-20 left-1/4 text-amber-500 opacity-70">✨</div>
            <div className="absolute bottom-20 right-1/4 text-amber-500 opacity-70">✨</div>
          </div>
        );
      case 'modern':
        return (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-8 left-1/4 text-blue-400 opacity-60">💫</div>
            <div className="absolute top-8 right-1/4 text-blue-400 opacity-60">💫</div>
            <div className="absolute bottom-16 left-8 text-blue-500 opacity-70">⭐</div>
            <div className="absolute bottom-16 right-8 text-blue-500 opacity-70">⭐</div>
          </div>
        );
      case 'traditional':
        return (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-red-600 opacity-80">🏮</div>
            <div className="absolute top-12 left-12 text-red-500 opacity-70">🎋</div>
            <div className="absolute top-12 right-12 text-red-500 opacity-70">🎋</div>
            <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 text-amber-600 opacity-80">🔥</div>
          </div>
        );
      default:
        return null;
    }
  };

  if (!memorial) {
    return (
      <Card className="h-[500px] flex items-center justify-center">
        <div className="text-center text-gray-500">
          <Heart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium">请选择要查看的纪念空间</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`relative overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50' : 'h-[500px]'}`}>
      <CardHeader className="relative z-10 bg-white/90 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Heart className="w-5 h-5 mr-2 text-red-600" />
            {memorial.deceasedName} 纪念家祠
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge className={`${theme.accentColor} bg-white/80`}>
              {theme.name}主题
            </Badge>
            {isPlaying && (
              <Badge variant="outline" className="bg-white/80">
                <Volume2 className="w-3 h-3 mr-1" />
                音乐播放中
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="bg-white/80"
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 relative h-full">
        {/* 背景图片 */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${getShrineBackground()})`
          }}
        >
          <div className={`absolute inset-0 bg-gradient-to-b ${theme.bgGradient} opacity-60`} />
        </div>

        {/* 主题装饰 */}
        {getThemeDecorations()}

        {/* 中央纪念区域 */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            {/* 纪念照片 */}
            <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-white/90 flex items-center justify-center mb-4">
              {memorial.photos.length > 0 ? (
                <img
                  src={memorial.photos[0]}
                  alt={memorial.deceasedName}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <div className="text-center">
                  <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-xs text-gray-600">纪念照片</p>
                </div>
              )}
            </div>

            {/* 纪念牌 */}
            <div className="bg-white/95 backdrop-blur-sm rounded-lg p-4 text-center shadow-lg min-w-[200px]">
              <h3 className="font-bold text-gray-900 text-lg mb-1">{memorial.deceasedName}</h3>
              <p className="text-sm text-gray-600">永远缅怀</p>
              <div className="mt-2 flex items-center justify-center space-x-2">
                <Heart className="w-4 h-4 text-red-500" />
                <span className="text-xs text-gray-500">思念如海深</span>
                <Heart className="w-4 h-4 text-red-500" />
              </div>
            </div>
          </div>
        </div>

        {/* 用户装饰物 */}
        {decorations.map(decoration => (
          <div
            key={decoration.id}
            className="absolute pointer-events-none animate-pulse"
            style={{
              left: `${decoration.position.x}px`,
              top: `${decoration.position.y}px`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div className="relative group">
              <span className="text-2xl filter drop-shadow-lg">
                {decoration.item.emoji}
              </span>
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {decoration.author}: {decoration.item.name}
              </div>
            </div>
          </div>
        ))}

        {/* 音乐播放效果 */}
        {isPlaying && (
          <div className="absolute top-4 right-4 flex space-x-1">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="w-1 bg-white/70 rounded-full animate-pulse"
                style={{
                  height: `${12 + Math.sin(Date.now() / 200 + i) * 8}px`,
                  animationDelay: `${i * 100}ms`,
                  animationDuration: '1s'
                }}
              />
            ))}
          </div>
        )}

        {/* 底部操作栏 */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="bg-white/80 text-gray-700">
              {decorations.length} 个纪念装饰
            </Badge>
            <Badge variant="outline" className="bg-white/80 text-gray-700">
              {memorial.photos.length} 张照片
            </Badge>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
              className="bg-white/80"
            >
              详情
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-white/80"
            >
              <Download className="w-4 h-4 mr-1" />
              保存
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-white/80"
            >
              <Share2 className="w-4 h-4 mr-1" />
              分享
            </Button>
          </div>
        </div>

        {/* 详情面板 */}
        {showDetails && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4">
            <Card className="max-w-md w-full">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="w-5 h-5 mr-2 text-red-600" />
                  纪念空间详情
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">基本信息</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>逝者姓名：{memorial.deceasedName}</p>
                    <p>创建时间：{memorial.createdAt.toLocaleDateString()}</p>
                    <p>主题风格：{theme.name}</p>
                    <p>状态：{memorial.status === 'completed' ? '已完成' : '创建中'}</p>
                  </div>
                </div>

                {memorial.memorialContent && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">纪念内容</h4>
                    <div className="max-h-32 overflow-y-auto text-sm text-gray-600 bg-gray-50 p-3 rounded">
                      {memorial.memorialContent.slice(0, 200)}...
                    </div>
                  </div>
                )}

                <div className="flex space-x-2">
                  <Button
                    onClick={() => setShowDetails(false)}
                    className="flex-1"
                  >
                    关闭
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 全屏模式关闭按钮 */}
        {isFullscreen && (
          <Button
            variant="outline"
            className="absolute top-4 left-4 bg-white/80"
            onClick={() => setIsFullscreen(false)}
          >
            退出全屏
          </Button>
        )}

        {/* 装饰动画效果 */}
        <div className="absolute inset-0 pointer-events-none">
          {/* 飘落的花瓣效果（仅在flower主题时显示） */}
          {theme.id === 'garden' && (
            <div className="absolute inset-0">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="absolute animate-pulse"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 3}s`,
                    animationDuration: '4s'
                  }}
                >
                  <span className="text-pink-300 opacity-70">🌸</span>
                </div>
              ))}
            </div>
          )}

          {/* 闪烁的星星效果（仅在modern主题时显示） */}
          {theme.id === 'modern' && (
            <div className="absolute inset-0">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute animate-ping"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`,
                    animationDuration: '3s'
                  }}
                >
                  <span className="text-blue-300 opacity-60">✨</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
