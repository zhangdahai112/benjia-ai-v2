"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAIServices, type PhotoRestoreJob } from "@/contexts/AIServicesContext";
import { useToast } from "@/hooks/use-toast";
import {
  Upload,
  Camera,
  Download,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Image as ImageIcon,
  Sparkles,
  Wand2,
  Palette
} from "lucide-react";

interface PhotoRestoreUploadProps {
  onJobComplete?: (job: PhotoRestoreJob) => void;
}

export default function PhotoRestoreUpload({ onJobComplete }: PhotoRestoreUploadProps) {
  const { submitPhotoRestore, getPhotoJob } = useAIServices();
  const { toast } = useToast();

  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [restoreType, setRestoreType] = useState<PhotoRestoreJob['type']>('restore');
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // 处理文件选择
  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "文件格式错误",
        description: "请选择图片文件（JPG、PNG等）",
        variant: "destructive"
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast({
        title: "文件过大",
        description: "图片文件大小不能超过10MB",
        variant: "destructive"
      });
      return;
    }

    setSelectedFile(file);

    // 创建预览
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, [toast]);

  // 处理拖拽上传
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  // 点击上传
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // 开始修复
  const handleStartRestore = async () => {
    if (!selectedFile) {
      toast({
        title: "请选择图片",
        description: "请先选择要修复的图片文件",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      const jobId = await submitPhotoRestore(selectedFile, restoreType);
      setCurrentJobId(jobId);

      toast({
        title: "修复任务已提交",
        description: "AI正在处理您的照片，请稍候...",
      });

      // 轮询检查任务状态
      const checkJobStatus = () => {
        const job = getPhotoJob(jobId);
        if (job?.status === 'completed') {
          setIsProcessing(false);
          onJobComplete?.(job);
          toast({
            title: "修复完成",
            description: "您的照片已成功修复！",
          });
        } else if (job?.status === 'failed') {
          setIsProcessing(false);
          toast({
            title: "修复失败",
            description: job.error || "处理过程中出现错误",
            variant: "destructive"
          });
        } else {
          setTimeout(checkJobStatus, 1000);
        }
      };

      setTimeout(checkJobStatus, 1000);
    } catch (error) {
      setIsProcessing(false);
      toast({
        title: "提交失败",
        description: "无法提交修复任务，请稍后重试",
        variant: "destructive"
      });
    }
  };

  // 重置状态
  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setCurrentJobId(null);
    setIsProcessing(false);
  };

  // 获取当前任务
  const currentJob = currentJobId ? getPhotoJob(currentJobId) : null;

  const restoreTypeOptions = [
    { value: 'restore', label: '智能修复', desc: '修复划痕、污渍等损伤', icon: Wand2 },
    { value: 'colorize', label: '照片上色', desc: '为黑白照片智能上色', icon: Palette },
    { value: 'enhance', label: '清晰增强', desc: '提升分辨率和清晰度', icon: Sparkles },
    { value: 'denoise', label: '降噪处理', desc: '去除噪点和颗粒感', icon: RefreshCw }
  ];

  const selectedOption = restoreTypeOptions.find(opt => opt.value === restoreType);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 上传区域 */}
      <Card className="border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Upload className="w-5 h-5 mr-2 text-blue-600" />
            上传照片
          </CardTitle>
          <CardDescription>
            支持 JPG、PNG 等格式，文件大小不超过 10MB
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            ref={dropZoneRef}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={handleUploadClick}
            className={`
              relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all
              ${isDragging
                ? 'border-blue-500 bg-blue-50'
                : selectedFile
                  ? 'border-green-300 bg-green-50'
                  : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
              }
            `}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              className="hidden"
            />

            {selectedFile ? (
              <div className="space-y-4">
                {previewUrl && (
                  <div className="relative inline-block">
                    <img
                      src={previewUrl}
                      alt="预览"
                      className="max-w-xs max-h-48 object-contain rounded-lg shadow-md"
                    />
                  </div>
                )}
                <div>
                  <p className="font-medium text-green-700">{selectedFile.name}</p>
                  <p className="text-sm text-gray-600">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReset();
                  }}
                >
                  重新选择
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <Camera className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-700">
                    拖拽图片到此处，或点击选择文件
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    支持 JPG、PNG 等常见图片格式
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 修复类型选择 */}
      {selectedFile && (
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-green-600" />
              选择修复类型
            </CardTitle>
            <CardDescription>
              不同的修复类型适用于不同的照片问题
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {restoreTypeOptions.map((option) => (
                <div
                  key={option.value}
                  onClick={() => setRestoreType(option.value as PhotoRestoreJob['type'])}
                  className={`
                    p-4 rounded-lg border-2 cursor-pointer transition-all
                    ${restoreType === option.value
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-green-300'
                    }
                  `}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`
                      w-10 h-10 rounded-lg flex items-center justify-center
                      ${restoreType === option.value ? 'bg-green-500' : 'bg-gray-100'}
                    `}>
                      <option.icon className={`w-5 h-5 ${
                        restoreType === option.value ? 'text-white' : 'text-gray-600'
                      }`} />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{option.label}</h4>
                      <p className="text-sm text-gray-600">{option.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {selectedOption && (
                  <>
                    <selectedOption.icon className="w-5 h-5 text-green-600" />
                    <span className="font-medium">已选择：{selectedOption.label}</span>
                  </>
                )}
              </div>

              <Button
                onClick={handleStartRestore}
                disabled={isProcessing}
                className="bg-green-600 hover:bg-green-700"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    处理中...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    开始修复
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 处理进度 */}
      {currentJob && (
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center">
              {currentJob.status === 'completed' ? (
                <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
              ) : currentJob.status === 'failed' ? (
                <AlertCircle className="w-5 h-5 mr-2 text-red-500" />
              ) : (
                <RefreshCw className="w-5 h-5 mr-2 text-blue-500 animate-spin" />
              )}
              处理进度
            </CardTitle>
            <CardDescription>
              AI正在智能分析和修复您的照片
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {currentJob.status === 'uploading' ? '上传中...' :
                   currentJob.status === 'processing' ? '处理中...' :
                   currentJob.status === 'completed' ? '处理完成' :
                   currentJob.status === 'failed' ? '处理失败' : '准备中...'}
                </span>
                <Badge variant={
                  currentJob.status === 'completed' ? 'default' :
                  currentJob.status === 'failed' ? 'destructive' : 'secondary'
                }>
                  {currentJob.progress}%
                </Badge>
              </div>

              <Progress value={currentJob.progress} className="w-full" />

              {currentJob.status === 'completed' && currentJob.restoredImage && (
                <div className="mt-6">
                  <h4 className="font-medium mb-4">修复结果对比</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-600 mb-2">修复前</p>
                      <img
                        src={previewUrl || ''}
                        alt="修复前"
                        className="w-full rounded-lg shadow-md"
                      />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-2">修复后</p>
                      <img
                        src={currentJob.restoredImage}
                        alt="修复后"
                        className="w-full rounded-lg shadow-md"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 mt-6">
                    <Button
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = currentJob.restoredImage || '';
                        link.download = `restored_${selectedFile?.name || 'photo'}.jpg`;
                        link.click();
                      }}
                      className="flex-1"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      下载修复后照片
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleReset}
                      className="flex-1"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      修复新照片
                    </Button>
                  </div>
                </div>
              )}

              {currentJob.status === 'failed' && (
                <div className="mt-4 p-4 bg-red-50 rounded-lg">
                  <p className="text-red-700">
                    {currentJob.error || '处理失败，请重试或联系客服'}
                  </p>
                  <Button
                    variant="outline"
                    onClick={handleReset}
                    className="mt-2"
                  >
                    重新开始
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
