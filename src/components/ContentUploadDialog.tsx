"use client";

import { useState, useRef, useCallback } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMemberContent, type ContentType, type ContentVisibility } from "@/contexts/MemberContentContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  Camera,
  Video,
  Music,
  FileText,
  Upload,
  X,
  Loader2,
  Save,
  Plus,
  Eye,
  Users,
  Lock
} from "lucide-react";

interface ContentUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberId: string;
  initialType?: ContentType;
}

const CONTENT_TYPES = [
  { value: 'photo', label: '照片', icon: Camera, accept: 'image/*', maxSize: 10 },
  { value: 'video', label: '视频', icon: Video, accept: 'video/*', maxSize: 100 },
  { value: 'audio', label: '音频', icon: Music, accept: 'audio/*', maxSize: 50 },
  { value: 'article', label: '文章', icon: FileText, accept: '', maxSize: 0 }
];

const VISIBILITY_OPTIONS = [
  { value: 'family', label: '家族内可见', icon: Users, description: '仅家族成员可以查看' },
  { value: 'public', label: '公开', icon: Eye, description: '所有人都可以查看' },
  { value: 'private', label: '私人', icon: Lock, description: '仅自己可以查看' }
];

export default function ContentUploadDialog({
  open,
  onOpenChange,
  memberId,
  initialType = 'photo'
}: ContentUploadDialogProps) {
  const { addContent, uploadFile } = useMemberContent();
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentStep, setCurrentStep] = useState<'type' | 'upload' | 'details'>('type');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // 表单数据
  const [contentType, setContentType] = useState<ContentType>(initialType);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '', // 用于文章类型
    tags: [] as string[],
    visibility: 'family' as ContentVisibility
  });
  const [currentTag, setCurrentTag] = useState('');

  // 重置表单
  const resetForm = () => {
    setCurrentStep('type');
    setContentType(initialType);
    setSelectedFile(null);
    setFormData({
      title: '',
      description: '',
      content: '',
      tags: [],
      visibility: 'family'
    });
    setCurrentTag('');
    setUploadProgress(0);
  };

  // 处理文件选择
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const typeConfig = CONTENT_TYPES.find(t => t.value === contentType);
    if (!typeConfig) return;

    // 检查文件大小
    if (typeConfig.maxSize > 0 && file.size > typeConfig.maxSize * 1024 * 1024) {
      toast({
        title: "文件过大",
        description: `文件大小不能超过 ${typeConfig.maxSize}MB`,
        variant: "destructive"
      });
      return;
    }

    // 检查文件类型
    if (typeConfig.accept && !file.type.match(typeConfig.accept.replace('*', '.*'))) {
      toast({
        title: "文件格式不支持",
        description: `请选择 ${typeConfig.label} 格式的文件`,
        variant: "destructive"
      });
      return;
    }

    setSelectedFile(file);
    setFormData(prev => ({
      ...prev,
      title: prev.title || file.name.replace(/\.[^/.]+$/, "")
    }));
    setCurrentStep('details');
  }, [contentType, toast]);

  // 处理拖拽上传
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      // 创建模拟的 FileList
      const fileList = {
        0: file,
        length: 1,
        item: (index: number) => index === 0 ? file : null,
        [Symbol.iterator]: function* () { yield file; }
      } as FileList;

      // 模拟文件输入事件
      const mockEvent = {
        target: { files: fileList }
      } as React.ChangeEvent<HTMLInputElement>;
      handleFileSelect(mockEvent);
    }
  }, [handleFileSelect]);

  // 添加标签
  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };

  // 移除标签
  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  // 表单验证
  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      toast({
        title: "请输入标题",
        variant: "destructive"
      });
      return false;
    }

    if (contentType === 'article' && !formData.content.trim()) {
      toast({
        title: "请输入文章内容",
        variant: "destructive"
      });
      return false;
    }

    if (contentType !== 'article' && !selectedFile) {
      toast({
        title: "请选择文件",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  // 提交表单
  const handleSubmit = async () => {
    if (!validateForm() || !user) return;

    setIsLoading(true);

    try {
      let fileUrl: string | undefined;

      // 如果有文件需要上传
      if (selectedFile && contentType !== 'article') {
        // 模拟上传进度
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => {
            const next = prev + Math.random() * 20;
            return next > 90 ? 90 : next;
          });
        }, 200);

        const uploadResult = await uploadFile(selectedFile, contentType);

        clearInterval(progressInterval);
        setUploadProgress(100);

        if (!uploadResult) {
          throw new Error('文件上传失败');
        }

        fileUrl = uploadResult;
      }

      // 添加内容到数据库
      const success = await addContent({
        memberId,
        type: contentType,
        title: formData.title.trim(),
        description: formData.description.trim(),
        content: contentType === 'article' ? formData.content.trim() : undefined,
        fileUrl,
        fileName: selectedFile?.name,
        fileSize: selectedFile?.size,
        fileMimeType: selectedFile?.type,
        tags: formData.tags,
        visibility: formData.visibility,
        createdBy: user.id
      });

      if (success) {
        toast({
          title: "上传成功",
          description: `${CONTENT_TYPES.find(t => t.value === contentType)?.label} 已添加到空间`
        });
        onOpenChange(false);
        resetForm();
      } else {
        throw new Error('保存失败');
      }
    } catch (error) {
      toast({
        title: "上传失败",
        description: error instanceof Error ? error.message : "请稍后重试",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  // 渲染类型选择步骤
  const renderTypeSelection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-medium mb-2">选择内容类型</h3>
        <p className="text-gray-600">请选择您要上传的内容类型</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {CONTENT_TYPES.map(type => {
          const Icon = type.icon;
          return (
            <Button
              key={type.value}
              variant="outline"
              className="h-24 flex flex-col border-2 hover:border-orange-400 hover:bg-orange-50"
              onClick={() => {
                setContentType(type.value as ContentType);
                if (type.value === 'article') {
                  setCurrentStep('details');
                } else {
                  setCurrentStep('upload');
                }
              }}
            >
              <Icon className="w-8 h-8 mb-2" />
              <div>
                <div className="font-medium">{type.label}</div>
                {type.maxSize > 0 && (
                  <div className="text-xs text-gray-500">最大 {type.maxSize}MB</div>
                )}
              </div>
            </Button>
          );
        })}
      </div>
    </div>
  );

  // 渲染文件上传步骤
  const renderFileUpload = () => {
    const typeConfig = CONTENT_TYPES.find(t => t.value === contentType);

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2">上传{typeConfig?.label}</h3>
          <p className="text-gray-600">请选择要上传的{typeConfig?.label}文件</p>
        </div>

        {/* 文件拖拽区域 */}
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-orange-400 transition-colors"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          {selectedFile ? (
            <div className="space-y-4">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                {typeConfig && <typeConfig.icon className="w-8 h-8 text-orange-600" />}
              </div>
              <div>
                <p className="font-medium">{selectedFile.name}</p>
                <p className="text-sm text-gray-500">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => setSelectedFile(null)}
              >
                重新选择
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                <Upload className="w-8 h-8 text-gray-400" />
              </div>
              <div>
                <p className="font-medium">拖拽文件到此处，或点击选择</p>
                <p className="text-sm text-gray-500">
                  支持 {typeConfig?.accept}，最大 {typeConfig?.maxSize}MB
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept={typeConfig?.accept}
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button onClick={() => fileInputRef.current?.click()}>
                选择文件
              </Button>
            </div>
          )}
        </div>

        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => setCurrentStep('type')}
            className="flex-1"
          >
            返回
          </Button>
          <Button
            onClick={() => setCurrentStep('details')}
            disabled={!selectedFile}
            className="flex-1 bg-orange-500 hover:bg-orange-600"
          >
            下一步
          </Button>
        </div>
      </div>
    );
  };

  // 渲染详情填写步骤
  const renderDetailsForm = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-medium mb-2">填写详细信息</h3>
        <p className="text-gray-600">为您的内容添加标题和描述</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">标题 *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="请输入内容标题"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">描述</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="请输入内容描述"
            rows={3}
          />
        </div>

        {contentType === 'article' && (
          <div className="space-y-2">
            <Label htmlFor="content">文章内容 *</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="请输入文章内容"
              rows={8}
            />
          </div>
        )}

        <div className="space-y-2">
          <Label>标签</Label>
          <div className="flex space-x-2">
            <Input
              value={currentTag}
              onChange={(e) => setCurrentTag(e.target.value)}
              placeholder="输入标签按回车添加"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
            />
            <Button type="button" onClick={addTag} size="sm">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="text-sm">
                  {tag}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="ml-1 h-auto p-0"
                    onClick={() => removeTag(tag)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label>可见性</Label>
          <Select
            value={formData.visibility}
            onValueChange={(value: ContentVisibility) =>
              setFormData(prev => ({ ...prev, visibility: value }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {VISIBILITY_OPTIONS.map(option => {
                const Icon = option.icon;
                return (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center">
                      <Icon className="w-4 h-4 mr-2" />
                      <div>
                        <div>{option.label}</div>
                        <div className="text-xs text-gray-500">{option.description}</div>
                      </div>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 上传进度 */}
      {isLoading && uploadProgress > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>上传进度</span>
            <span>{Math.round(uploadProgress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-orange-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex space-x-2">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(contentType === 'article' ? 'type' : 'upload')}
          disabled={isLoading}
          className="flex-1"
        >
          返回
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isLoading}
          className="flex-1 bg-orange-500 hover:bg-orange-600"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              上传中...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              完成
            </>
          )}
        </Button>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open) resetForm();
      onOpenChange(open);
    }}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>添加内容</DialogTitle>
          <DialogDescription>
            {currentStep === 'type' && '选择您要添加的内容类型'}
            {currentStep === 'upload' && '上传您的文件'}
            {currentStep === 'details' && '填写内容详细信息'}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {currentStep === 'type' && renderTypeSelection()}
          {currentStep === 'upload' && renderFileUpload()}
          {currentStep === 'details' && renderDetailsForm()}
        </div>
      </DialogContent>
    </Dialog>
  );
}
