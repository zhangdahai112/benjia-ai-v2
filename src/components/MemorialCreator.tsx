"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useAIServices } from "@/contexts/AIServicesContext";
import { type FamilyMember } from "@/contexts/FamilyMembersContext";
import { useToast } from "@/hooks/use-toast";
import {
  Upload,
  Camera,
  Heart,
  Sparkles,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Image as ImageIcon,
  FileText,
  Music,
  Flower,
  Candle,
  Star,
  Crown,
  X
} from "lucide-react";

interface ShrineTheme {
  id: string;
  name: string;
  description: string;
  bgGradient: string;
  accentColor: string;
  iconColor: string;
}

interface MemorialCreatorProps {
  deceasedMember: FamilyMember;
  selectedTheme: ShrineTheme;
  onMemorialCreated: (memorialId: string) => void;
}

export default function MemorialCreator({
  deceasedMember,
  selectedTheme,
  onMemorialCreated
}: MemorialCreatorProps) {
  const { submitMemorialCreation } = useAIServices();
  const { toast } = useToast();

  const [showCreator, setShowCreator] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [memorialMessage, setMemorialMessage] = useState("");
  const [personalMemories, setPersonalMemories] = useState("");
  const [favoriteThing, setFavoriteThing] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [creationProgress, setCreationProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 处理文件上传
  const handleFileUpload = (files: FileList) => {
    const file = files[0];
    if (!file.type.startsWith('image/')) {
      toast({
        title: "文件格式错误",
        description: "请上传图片文件",
        variant: "destructive"
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "文件过大",
        description: "图片文件大小不能超过10MB",
        variant: "destructive"
      });
      return;
    }

    const photoUrl = URL.createObjectURL(file);
    setUploadedPhotos(prev => [...prev, photoUrl]);

    toast({
      title: "照片上传成功",
      description: "已添加到纪念相册中",
    });
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

  // 移除照片
  const removePhoto = (index: number) => {
    setUploadedPhotos(prev => prev.filter((_, i) => i !== index));
  };

  // 创建纪念空间
  const handleCreateMemorial = async () => {
    if (uploadedPhotos.length === 0) {
      toast({
        title: "请上传照片",
        description: "至少需要上传一张纪念照片",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);
    setCreationProgress(0);

    try {
      // 模拟创建过程
      const progressInterval = setInterval(() => {
        setCreationProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 15;
        });
      }, 500);

      // 提交创建任务
      const memorialId = await submitMemorialCreation(
        deceasedMember.name,
        uploadedPhotos,
        selectedTheme.id as any
      );

      clearInterval(progressInterval);
      setCreationProgress(100);

      setTimeout(() => {
        setIsCreating(false);
        setShowCreator(false);
        onMemorialCreated(memorialId);
      }, 1000);

    } catch (error) {
      setIsCreating(false);
      toast({
        title: "创建失败",
        description: "纪念空间创建失败，请稍后重试",
        variant: "destructive"
      });
    }
  };

  // 获取主题图标
  const getThemeIcon = (themeId: string) => {
    switch (themeId) {
      case 'garden': return Flower;
      case 'candle': return Candle;
      case 'modern': return Star;
      case 'traditional': return Crown;
      default: return Heart;
    }
  };

  const ThemeIcon = getThemeIcon(selectedTheme.id);

  if (!showCreator) {
    return (
      <Button
        onClick={() => setShowCreator(true)}
        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
      >
        <Heart className="w-4 h-4 mr-2" />
        创建纪念空间
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Heart className="w-5 h-5 mr-2 text-purple-600" />
                为 {deceasedMember.name} 创建纪念空间
              </CardTitle>
              <CardDescription>
                创建温馨的虚拟纪念空间，让思念有处安放
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCreator(false)}
              disabled={isCreating}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* 选中的主题显示 */}
          <Card className={`border-2 border-purple-200 bg-gradient-to-br ${selectedTheme.bgGradient}`}>
            <CardContent className="p-4 text-center">
              <div className={`w-12 h-12 ${selectedTheme.accentColor} mx-auto mb-3 flex items-center justify-center`}>
                <ThemeIcon className="w-8 h-8" />
              </div>
              <h3 className={`font-semibold ${selectedTheme.accentColor} mb-2`}>
                {selectedTheme.name}主题
              </h3>
              <p className="text-sm text-gray-600">{selectedTheme.description}</p>
            </CardContent>
          </Card>

          {/* 照片上传区域 */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3 flex items-center">
              <Camera className="w-5 h-5 mr-2" />
              上传纪念照片 ({uploadedPhotos.length}/10)
            </h3>

            <div
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`
                border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all
                ${isDragging
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'
                }
              `}
            >
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-700 mb-2">
                拖拽或点击上传纪念照片
              </p>
              <p className="text-sm text-gray-500">
                支持 JPG、PNG 格式，建议上传清晰的生活照片
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
              className="hidden"
              multiple
            />

            {/* 已上传的照片 */}
            {uploadedPhotos.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium text-gray-900 mb-3">已上传的照片</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {uploadedPhotos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={photo}
                        alt={`纪念照片 ${index + 1}`}
                        className="w-full aspect-square object-cover rounded-lg"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          removePhoto(index);
                        }}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 纪念信息表单 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                纪念留言
              </label>
              <Textarea
                value={memorialMessage}
                onChange={(e) => setMemorialMessage(e.target.value)}
                placeholder="写下您想对逝者说的话..."
                rows={4}
                className="resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                珍贵回忆
              </label>
              <Textarea
                value={personalMemories}
                onChange={(e) => setPersonalMemories(e.target.value)}
                placeholder="分享与逝者的美好回忆..."
                rows={4}
                className="resize-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              生前喜好
            </label>
            <Input
              value={favoriteThing}
              onChange={(e) => setFavoriteThing(e.target.value)}
              placeholder="逝者生前最喜欢的事物（如花朵、音乐、食物等）"
            />
          </div>

          {/* 创建进度 */}
          {isCreating && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
                  <span className="font-medium text-blue-900">AI正在创建纪念空间...</span>
                </div>
                <Progress value={creationProgress} className="mb-2" />
                <div className="flex justify-between text-sm text-blue-700">
                  <span>
                    {creationProgress < 30 ? '分析纪念信息...' :
                     creationProgress < 60 ? '生成纪念内容...' :
                     creationProgress < 90 ? '设计虚拟家祠...' : '完成创建...'}
                  </span>
                  <span>{Math.round(creationProgress)}%</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 创建按钮 */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setShowCreator(false)}
              disabled={isCreating}
            >
              取消
            </Button>
            <Button
              onClick={handleCreateMemorial}
              disabled={uploadedPhotos.length === 0 || isCreating}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              {isCreating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  创建中...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  创建纪念空间
                </>
              )}
            </Button>
          </div>

          {/* 创建说明 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2 flex items-center">
              <Sparkles className="w-4 h-4 mr-2" />
              AI将为您创建：
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                <span>虚拟3D家祠场景</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                <span>个性化纪念内容</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                <span>温馨背景音乐</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                <span>互动献花功能</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
