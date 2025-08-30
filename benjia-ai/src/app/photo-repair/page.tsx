"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Upload,
  Wand2,
  Palette,
  Play,
  Download,
  RotateCcw,
  Eye,
  Loader2,
  CheckCircle,
  Camera,
  Image as ImageIcon
} from "lucide-react";
import Link from "next/link";

interface PhotoItem {
  id: string;
  name: string;
  originalUrl: string;
  repairedUrl?: string;
  status: 'uploaded' | 'processing' | 'completed';
  type: 'repair' | 'colorize' | 'animate';
}

import ProtectedRoute from "@/components/ProtectedRoute";

function PhotoRepairPageContent() {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoItem | null>(null);
  const [activeTab, setActiveTab] = useState("upload");
  const [dragOver, setDragOver] = useState(false);

  // 模拟照片上传
  const handleFileUpload = useCallback((files: FileList | null) => {
    if (!files) return;

    Array.from(files).forEach((file, index) => {
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        const newPhoto: PhotoItem = {
          id: Date.now() + index + '',
          name: file.name,
          originalUrl: url,
          status: 'uploaded',
          type: 'repair'
        };
        setPhotos(prev => [...prev, newPhoto]);
      }
    });
  }, []);

  // 模拟AI修复处理
  const handleRepair = useCallback((photo: PhotoItem, type: 'repair' | 'colorize' | 'animate') => {
    setPhotos(prev => prev.map(p =>
      p.id === photo.id
        ? { ...p, status: 'processing', type }
        : p
    ));

    // 模拟处理时间
    setTimeout(() => {
      setPhotos(prev => prev.map(p =>
        p.id === photo.id
          ? {
              ...p,
              status: 'completed',
              repairedUrl: p.originalUrl // 实际应用中这里是处理后的图片URL
            }
          : p
      ));
    }, 3000);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileUpload(e.dataTransfer.files);
  }, [handleFileUpload]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* 顶部导航 */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-blue-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-800">AI照片修复</h1>
                <p className="text-sm text-gray-600">让珍贵老照片重现光彩</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              已处理 {photos.filter(p => p.status === 'completed').length} 张
            </Badge>
          </div>
        </div>
      </header>

      {/* 标签切换 */}
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex space-x-4 mb-6">
          <Button
            variant={activeTab === "upload" ? "default" : "outline"}
            onClick={() => setActiveTab("upload")}
            className={activeTab === "upload" ? "bg-blue-500 hover:bg-blue-600" : "border-blue-200"}
          >
            <Upload className="w-4 h-4 mr-2" />
            上传照片
          </Button>
          <Button
            variant={activeTab === "gallery" ? "default" : "outline"}
            onClick={() => setActiveTab("gallery")}
            className={activeTab === "gallery" ? "bg-blue-500 hover:bg-blue-600" : "border-blue-200"}
          >
            <ImageIcon className="w-4 h-4 mr-2" />
            照片管理
          </Button>
        </div>

        {/* 上传区域 */}
        {activeTab === "upload" && (
          <div className="space-y-6">
            {/* 拖拽上传区 */}
            <Card className="border-blue-200">
              <CardContent className="p-8">
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragOver
                      ? 'border-blue-400 bg-blue-50'
                      : 'border-blue-200 bg-blue-25'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <Camera className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">上传您的珍贵照片</h3>
                  <p className="text-gray-600 mb-4">拖拽照片到此处，或点击选择文件</p>
                  <div className="space-y-4">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e.target.files)}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload">
                      <Button asChild className="bg-blue-500 hover:bg-blue-600 text-lg px-8 py-6">
                        <span>
                          <Upload className="w-5 h-5 mr-2" />
                          选择照片
                        </span>
                      </Button>
                    </label>
                    <p className="text-sm text-gray-500">支持 JPG、PNG 格式，单张不超过 10MB</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI修复功能介绍 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-blue-200 text-center">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Wand2 className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">一键修复</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">AI智能修复破损、模糊的老照片，提升清晰度</p>
                </CardContent>
              </Card>

              <Card className="border-blue-200 text-center">
                <CardHeader>
                  <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Palette className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">智能上色</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">为黑白照片智能上色，还原历史色彩</p>
                </CardContent>
              </Card>

              <Card className="border-blue-200 text-center">
                <CardHeader>
                  <div className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Play className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">图片动画</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">让照片中的人物动起来，增添生动趣味</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* 照片管理 */}
        {activeTab === "gallery" && (
          <div className="space-y-6">
            {photos.length === 0 ? (
              <Card className="border-blue-200">
                <CardContent className="text-center py-12">
                  <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">暂无照片</h3>
                  <p className="text-gray-500 mb-4">请先上传照片开始AI修复</p>
                  <Button
                    onClick={() => setActiveTab("upload")}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    去上传
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {photos.map(photo => (
                  <Card key={photo.id} className="border-blue-200 overflow-hidden">
                    <div className="aspect-square relative bg-gray-100">
                      <img
                        src={photo.originalUrl}
                        alt={photo.name}
                        className="w-full h-full object-cover"
                      />
                      {photo.status === 'processing' && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <div className="text-center text-white">
                            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                            <p>AI处理中...</p>
                          </div>
                        </div>
                      )}
                      {photo.status === 'completed' && (
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-green-500">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            已完成
                          </Badge>
                        </div>
                      )}
                    </div>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm truncate">{photo.name}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {photo.type === 'repair' && '修复'}
                          {photo.type === 'colorize' && '上色'}
                          {photo.type === 'animate' && '动画'}
                        </Badge>
                        <Badge
                          variant={photo.status === 'completed' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {photo.status === 'uploaded' && '待处理'}
                          {photo.status === 'processing' && '处理中'}
                          {photo.status === 'completed' && '已完成'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {photo.status === 'uploaded' && (
                        <div className="grid grid-cols-3 gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRepair(photo, 'repair')}
                            className="text-xs"
                          >
                            <Wand2 className="w-3 h-3 mr-1" />
                            修复
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRepair(photo, 'colorize')}
                            className="text-xs"
                          >
                            <Palette className="w-3 h-3 mr-1" />
                            上色
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRepair(photo, 'animate')}
                            className="text-xs"
                          >
                            <Play className="w-3 h-3 mr-1" />
                            动画
                          </Button>
                        </div>
                      )}
                      {photo.status === 'completed' && (
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedPhoto(photo)}
                            className="text-xs"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            预览
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs"
                          >
                            <Download className="w-3 h-3 mr-1" />
                            下载
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 照片预览弹窗 */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50" onClick={() => setSelectedPhoto(null)}>
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">{selectedPhoto.name}</h3>
                <Button variant="ghost" onClick={() => setSelectedPhoto(null)}>
                  ×
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">原图</h4>
                  <img
                    src={selectedPhoto.originalUrl}
                    alt="原图"
                    className="w-full rounded-lg border"
                  />
                </div>
                <div>
                  <h4 className="font-medium mb-2">修复后</h4>
                  <img
                    src={selectedPhoto.repairedUrl || selectedPhoto.originalUrl}
                    alt="修复后"
                    className="w-full rounded-lg border"
                  />
                </div>
              </div>
              <div className="flex justify-center gap-4 mt-6">
                <Button className="bg-blue-500 hover:bg-blue-600">
                  <Download className="w-4 h-4 mr-2" />
                  下载修复图
                </Button>
                <Button variant="outline">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  重新处理
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PhotoRepairPage() {
  return (
    <ProtectedRoute>
      <PhotoRepairPageContent />
    </ProtectedRoute>
  );
}
