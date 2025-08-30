"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { processPhoto, checkAPIConfiguration } from '@/lib/ai-apis/baidu-ai';
import {
  chatWithStoryAI,
  analyzePhoto,
  generateStoryOutline,
  generateStoryChapter,
  checkLLMConfiguration,
  type ChatMessage,
  type FamilyInfo,
  type StoryConfig,
  type LLMProvider,
  type LLMResponse
} from '@/lib/ai-apis/llm-services';

export interface PhotoRestoreJob {
  id: string;
  originalImage: string;
  restoredImage?: string;
  status: 'uploading' | 'processing' | 'completed' | 'failed';
  progress: number;
  type: 'restore' | 'colorize' | 'enhance' | 'denoise';
  createdAt: Date;
  completedAt?: Date;
  error?: string;
}

export interface FamilyStoryJob {
  id: string;
  title: string;
  content?: string;
  status: 'creating' | 'chatting' | 'generating' | 'completed' | 'failed';
  progress: number;
  familyInfo: Partial<FamilyInfo>;
  storyConfig: StoryConfig;
  chatHistory: ChatMessage[];
  outline?: string;
  chapters?: Array<{
    title: string;
    content: string;
    status: 'pending' | 'generating' | 'completed';
  }>;
  uploadedPhotos: Array<{
    url: string;
    analysis?: string;
    uploadedBy?: string; // 协作功能：记录上传者
  }>;
  // 协作相关字段
  isCollaborative: boolean;
  createdBy: string;
  lastModifiedBy?: string;
  collaborationEnabled: boolean;
  createdAt: Date;
  completedAt?: Date;
  error?: string;
}

export interface MemorialSpaceJob {
  id: string;
  deceasedName: string;
  photos: string[];
  memorialContent?: string;
  status: 'creating' | 'completed' | 'failed';
  progress: number;
  theme: 'garden' | 'candle' | 'modern';
  createdAt: Date;
  completedAt?: Date;
  error?: string;
}

interface AIServicesContextType {
  // 照片修复
  photoJobs: PhotoRestoreJob[];
  submitPhotoRestore: (imageFile: File, type: PhotoRestoreJob['type']) => Promise<string>;
  getPhotoJob: (id: string) => PhotoRestoreJob | undefined;
  getPhotoJobsByStatus: (status: PhotoRestoreJob['status']) => PhotoRestoreJob[];

  // 家族故事
  storyJobs: FamilyStoryJob[];
  createStoryProject: (title: string, config: StoryConfig, enableCollaboration?: boolean) => Promise<string>;
  uploadStoryPhoto: (jobId: string, photoFile: File) => Promise<void>;
  chatWithAI: (jobId: string, message: string) => Promise<void>;
  generateStoryOutlineForJob: (jobId: string) => Promise<void>;
  generateFullStory: (jobId: string) => Promise<void>;
  getStoryJob: (id: string) => FamilyStoryJob | undefined;

  // 协作功能
  enableCollaboration: (jobId: string) => Promise<boolean>;
  disableCollaboration: (jobId: string) => Promise<boolean>;
  getCollaborativeStoryJobs: () => FamilyStoryJob[];

  // 纪念空间
  memorialJobs: MemorialSpaceJob[];
  submitMemorialCreation: (deceasedName: string, photos: string[], theme: MemorialSpaceJob['theme']) => Promise<string>;
  getMemorialJob: (id: string) => MemorialSpaceJob | undefined;

  // 通用
  isLoading: boolean;
  refreshJobs: () => Promise<void>;
}

const AIServicesContext = createContext<AIServicesContextType | undefined>(undefined);

const STORAGE_KEY = 'benjia_ai_services';

// 照片修复API调用
async function callPhotoRestoreAPI(imageFile: File, type: PhotoRestoreJob['type']): Promise<string> {
  try {
    // 检查API配置
    const configCheck = checkAPIConfiguration();
    if (!configCheck.isValid) {
      console.warn('API配置问题:', configCheck.message);
    }

    // 调用百度AI API
    const restoredImageUrl = await processPhoto(imageFile, type);
    return restoredImageUrl;
  } catch (error) {
    console.error('照片修复API调用失败:', error);
    throw new Error(`照片修复失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

// 模拟纪念空间创建
async function createMemorialSpace(deceasedName: string, photos: string[], theme: string): Promise<string> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const memorialContent = `
# ${deceasedName} 纪念空间

这里是为${deceasedName}创建的永恒纪念空间，承载着我们对Ta的无尽思念与深深的爱。

## 生平回顾

${deceasedName}的一生充满了爱与奉献，Ta的笑容永远温暖着我们的心。在这个特殊的空间里，我们收集了珍贵的回忆，让思念有所寄托。

## 珍贵回忆

这里保存着${photos.length}张珍贵的照片，每一张都记录着${deceasedName}人生中的美好时光。这些影像将永远保存在我们心中，成为最珍贵的回忆。

## 永恒的爱

虽然${deceasedName}已经离开了我们，但Ta的爱将永远陪伴着家人。在这个纪念空间里，我们可以随时感受到Ta的温暖，让爱跨越时空的界限。

*这个纪念空间由AI根据您提供的信息精心创建，采用${theme === 'garden' ? '花园' : theme === 'candle' ? '蜡烛' : '现代简约'}主题设计。*
      `;
      resolve(memorialContent);
    }, 4000);
  });
}

export function AIServicesProvider({ children }: { children: ReactNode }) {
  const [photoJobs, setPhotoJobs] = useState<PhotoRestoreJob[]>([]);
  const [storyJobs, setStoryJobs] = useState<FamilyStoryJob[]>([]);
  const [memorialJobs, setMemorialSpaceJobs] = useState<MemorialSpaceJob[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 从本地存储加载数据
  const loadData = useCallback(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.photoJobs) {
          const jobsWithDates = data.photoJobs.map((job: any) => ({
            ...job,
            createdAt: new Date(job.createdAt),
            completedAt: job.completedAt ? new Date(job.completedAt) : undefined
          }));
          setPhotoJobs(jobsWithDates);
        }
        if (data.storyJobs) {
          const jobsWithDates = data.storyJobs.map((job: any) => ({
            ...job,
            // 兼容旧数据：添加协作相关字段的默认值
            isCollaborative: job.isCollaborative ?? false,
            createdBy: job.createdBy ?? 'current_user',
            collaborationEnabled: job.collaborationEnabled ?? false,
            uploadedPhotos: (job.uploadedPhotos || []).map((photo: any) => ({
              ...photo,
              uploadedBy: photo.uploadedBy ?? 'current_user'
            })),
            createdAt: new Date(job.createdAt),
            completedAt: job.completedAt ? new Date(job.completedAt) : undefined
          }));
          setStoryJobs(jobsWithDates);
        }
        if (data.memorialJobs) {
          const jobsWithDates = data.memorialJobs.map((job: any) => ({
            ...job,
            createdAt: new Date(job.createdAt),
            completedAt: job.completedAt ? new Date(job.completedAt) : undefined
          }));
          setMemorialSpaceJobs(jobsWithDates);
        }
      }
    } catch (error) {
      console.error('Failed to load AI services data:', error);
    }
  }, []);

  // 保存数据到本地存储
  const saveData = useCallback(() => {
    try {
      const data = {
        photoJobs,
        storyJobs,
        memorialJobs
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save AI services data:', error);
    }
  }, [photoJobs, storyJobs, memorialJobs]);

  // 初始化加载数据
  React.useEffect(() => {
    loadData();
  }, [loadData]);

  // 保存数据变化
  React.useEffect(() => {
    saveData();
  }, [saveData]);

  // 获取当前用户ID（简化版，实际应该从认证上下文获取）
  const getCurrentUserId = () => {
    return typeof window !== 'undefined' ? localStorage.getItem('current_user_id') || 'current_user' : 'current_user';
  };

  // 提交照片修复任务
  const submitPhotoRestore = async (imageFile: File, type: PhotoRestoreJob['type']): Promise<string> => {
    const jobId = `photo_${Date.now()}`;

    // 创建初始任务
    const newJob: PhotoRestoreJob = {
      id: jobId,
      originalImage: URL.createObjectURL(imageFile),
      status: 'uploading',
      progress: 0,
      type,
      createdAt: new Date()
    };

    setPhotoJobs(prev => [...prev, newJob]);

    // 处理过程
    try {
      // 上传阶段
      setPhotoJobs(prev => prev.map(job =>
        job.id === jobId ? { ...job, status: 'uploading', progress: 20 } : job
      ));

      // 处理阶段
      setPhotoJobs(prev => prev.map(job =>
        job.id === jobId ? { ...job, status: 'processing', progress: 40 } : job
      ));

      // 调用真实的百度AI API
      const restoredImage = await callPhotoRestoreAPI(imageFile, type);

      // 完成
      setPhotoJobs(prev => prev.map(job =>
        job.id === jobId
          ? {
              ...job,
              status: 'completed',
              progress: 100,
              restoredImage,
              completedAt: new Date()
            }
          : job
      ));

      return jobId;
    } catch (error) {
      setPhotoJobs(prev => prev.map(job =>
        job.id === jobId
          ? {
              ...job,
              status: 'failed',
              error: error instanceof Error ? error.message : '处理失败'
            }
          : job
      ));
      throw error;
    }
  };

  // 创建故事项目（支持协作）
  const createStoryProject = async (
    title: string,
    config: StoryConfig,
    enableCollaboration: boolean = true
  ): Promise<string> => {
    const jobId = `story_${Date.now()}`;
    const currentUserId = getCurrentUserId();

    const newJob: FamilyStoryJob = {
      id: jobId,
      title,
      status: 'creating',
      progress: 0,
      familyInfo: {},
      storyConfig: config,
      chatHistory: [],
      uploadedPhotos: [],
      // 协作相关字段
      isCollaborative: enableCollaboration,
      createdBy: currentUserId,
      collaborationEnabled: enableCollaboration,
      createdAt: new Date()
    };

    setStoryJobs(prev => [...prev, newJob]);

    // 如果启用协作，自动添加创建者为所有者
    if (enableCollaboration && typeof window !== 'undefined') {
      // 这里可以触发协作上下文的初始化
      setTimeout(() => {
        // 发送自定义事件通知协作系统
        window.dispatchEvent(new CustomEvent('story-project-created', {
          detail: { projectId: jobId, creatorId: currentUserId }
        }));
      }, 100);
    }

    return jobId;
  };

  // 上传故事照片（支持协作记录）
  const uploadStoryPhoto = async (jobId: string, photoFile: File): Promise<void> => {
    const currentUserId = getCurrentUserId();

    try {
      const photoUrl = URL.createObjectURL(photoFile);

      // 更新照片列表，记录上传者
      setStoryJobs(prev => prev.map(job =>
        job.id === jobId
          ? {
              ...job,
              uploadedPhotos: [...job.uploadedPhotos, {
                url: photoUrl,
                uploadedBy: currentUserId
              }],
              progress: Math.min(job.progress + 10, 90),
              lastModifiedBy: currentUserId
            }
          : job
      ));

      // 分析照片内容
      const analysis = await analyzePhoto(photoUrl);

      // 更新照片分析结果
      setStoryJobs(prev => prev.map(job =>
        job.id === jobId
          ? {
              ...job,
              uploadedPhotos: job.uploadedPhotos.map(photo =>
                photo.url === photoUrl ? { ...photo, analysis } : photo
              )
            }
          : job
      ));
    } catch (error) {
      console.error('照片上传分析失败:', error);
      throw error;
    }
  };

  // 与AI对话（支持协作记录）
  const chatWithAI = async (jobId: string, message: string): Promise<void> => {
    const currentUserId = getCurrentUserId();

    try {
      const job = storyJobs.find(j => j.id === jobId);
      if (!job) throw new Error('找不到故事项目');

      // 添加用户消息
      const userMessage: ChatMessage = { role: 'user', content: message };
      const updatedHistory = [...job.chatHistory, userMessage];

      setStoryJobs(prev => prev.map(j =>
        j.id === jobId
          ? {
              ...j,
              chatHistory: updatedHistory,
              status: 'chatting',
              lastModifiedBy: currentUserId
            }
          : j
      ));

      // 调用AI生成回复
      const response = await chatWithStoryAI(message, job.chatHistory, job.familyInfo);

      // 添加AI回复
      const aiMessage: ChatMessage = { role: 'assistant', content: response.content };

      setStoryJobs(prev => prev.map(j =>
        j.id === jobId
          ? {
              ...j,
              chatHistory: [...updatedHistory, aiMessage],
              progress: Math.min(j.progress + 5, 90)
            }
          : j
      ));
    } catch (error) {
      console.error('AI对话失败:', error);
      setStoryJobs(prev => prev.map(j =>
        j.id === jobId
          ? {
              ...j,
              status: 'failed',
              error: error instanceof Error ? error.message : '对话失败'
            }
          : j
      ));
      throw error;
    }
  };

  // 生成故事大纲（支持协作记录）
  const generateStoryOutlineForJob = async (jobId: string): Promise<void> => {
    const currentUserId = getCurrentUserId();

    try {
      const job = storyJobs.find(j => j.id === jobId);
      if (!job) throw new Error('找不到故事项目');

      setStoryJobs(prev => prev.map(j =>
        j.id === jobId ? {
          ...j,
          status: 'generating',
          progress: 50,
          lastModifiedBy: currentUserId
        } : j
      ));

      const outline = await generateStoryOutline(job.familyInfo as FamilyInfo, job.storyConfig);

      setStoryJobs(prev => prev.map(j =>
        j.id === jobId
          ? {
              ...j,
              outline,
              progress: 70
            }
          : j
      ));
    } catch (error) {
      console.error('大纲生成失败:', error);
      setStoryJobs(prev => prev.map(j =>
        j.id === jobId
          ? {
              ...j,
              status: 'failed',
              error: error instanceof Error ? error.message : '大纲生成失败'
            }
          : j
      ));
      throw error;
    }
  };

  // 生成完整故事（支持协作记录）
  const generateFullStory = async (jobId: string): Promise<void> => {
    const currentUserId = getCurrentUserId();

    try {
      const job = storyJobs.find(j => j.id === jobId);
      if (!job) throw new Error('找不到故事项目');

      setStoryJobs(prev => prev.map(j =>
        j.id === jobId ? {
          ...j,
          status: 'generating',
          progress: 80,
          lastModifiedBy: currentUserId
        } : j
      ));

      // 模拟生成过程 - 在真实环境中会调用实际的章节生成
      await new Promise(resolve => setTimeout(resolve, 3000));

      const finalStory = `# ${job.title}

${job.outline || ''}

## 第一章：家族起源

在历史的长河中，每个家族都有着属于自己的独特起源故事。我们的家族也不例外，承载着深厚的文化底蕴和感人的传承故事。

通过您分享的珍贵照片和温馨回忆，我看到了一个充满爱与温暖的家庭。那些定格的瞬间，记录着家族成员之间的深情厚谊，见证着一代又一代人的成长与传承。

## 第二章：温馨时光

从您提供的信息中，我能感受到家族聚会时的欢声笑语，节日庆典时的其乐融融。每一张照片都在诉说着家族的故事，每一个细节都体现着家庭的温暖。

这些珍贵的回忆，不仅是对过去美好时光的记录，更是对家族精神的传承和延续。它们将激励着后代继续书写属于这个家族的新篇章。

## 第三章：传承与未来

家族的价值不仅在于血缘的联系，更在于精神的传承。通过这些故事和回忆，我们可以看到家族精神在一代又一代人中的延续和发展。

${job.isCollaborative ? `
## 协作创作感言

这个故事是由家族成员共同创作完成的，凝聚了每个人的心血和情感。通过协作，我们不仅创作了一个故事，更加深了彼此的理解和联系。

感谢所有参与创作的家族成员，正是大家的共同努力，才让这个家族故事如此精彩动人。
` : ''}

愿这个故事能够成为家族记忆的珍贵载体，让每一位家族成员都能从中感受到家的温暖，汲取前进的力量，并将这份美好继续传承下去。

*这个故事基于您提供的真实信息创作，记录着属于您家族的独特记忆。愿这些文字能够永远保存这份珍贵的家族情感。*`;

      setStoryJobs(prev => prev.map(j =>
        j.id === jobId
          ? {
              ...j,
              content: finalStory,
              status: 'completed',
              progress: 100,
              completedAt: new Date()
            }
          : j
      ));
    } catch (error) {
      console.error('故事生成失败:', error);
      setStoryJobs(prev => prev.map(j =>
        j.id === jobId
          ? {
              ...j,
              status: 'failed',
              error: error instanceof Error ? error.message : '故事生成失败'
            }
          : j
      ));
      throw error;
    }
  };

  // 启用协作功能
  const enableCollaboration = async (jobId: string): Promise<boolean> => {
    try {
      setStoryJobs(prev => prev.map(job =>
        job.id === jobId
          ? { ...job, collaborationEnabled: true, isCollaborative: true }
          : job
      ));
      return true;
    } catch (error) {
      console.error('启用协作失败:', error);
      return false;
    }
  };

  // 禁用协作功能
  const disableCollaboration = async (jobId: string): Promise<boolean> => {
    try {
      setStoryJobs(prev => prev.map(job =>
        job.id === jobId
          ? { ...job, collaborationEnabled: false }
          : job
      ));
      return true;
    } catch (error) {
      console.error('禁用协作失败:', error);
      return false;
    }
  };

  // 获取协作项目列表
  const getCollaborativeStoryJobs = useCallback((): FamilyStoryJob[] => {
    return storyJobs.filter(job => job.isCollaborative && job.collaborationEnabled);
  }, [storyJobs]);

  // 提交纪念空间创建任务
  const submitMemorialCreation = async (
    deceasedName: string,
    photos: string[],
    theme: MemorialSpaceJob['theme']
  ): Promise<string> => {
    const jobId = `memorial_${Date.now()}`;

    const newJob: MemorialSpaceJob = {
      id: jobId,
      deceasedName,
      photos,
      status: 'creating',
      progress: 0,
      theme,
      createdAt: new Date()
    };

    setMemorialSpaceJobs(prev => [...prev, newJob]);

    try {
      // 模拟创建过程
      setMemorialSpaceJobs(prev => prev.map(job =>
        job.id === jobId ? { ...job, progress: 40 } : job
      ));

      const memorialContent = await createMemorialSpace(deceasedName, photos, theme);

      setMemorialSpaceJobs(prev => prev.map(job =>
        job.id === jobId
          ? {
              ...job,
              status: 'completed',
              progress: 100,
              memorialContent,
              completedAt: new Date()
            }
          : job
      ));

      return jobId;
    } catch (error) {
      setMemorialSpaceJobs(prev => prev.map(job =>
        job.id === jobId
          ? {
              ...job,
              status: 'failed',
              error: error instanceof Error ? error.message : '创建失败'
            }
          : job
      ));
      throw error;
    }
  };

  // 获取任务
  const getPhotoJob = (id: string) => photoJobs.find(job => job.id === id);
  const getStoryJob = (id: string) => storyJobs.find(job => job.id === id);
  const getMemorialJob = (id: string) => memorialJobs.find(job => job.id === id);

  // 按状态获取照片任务
  const getPhotoJobsByStatus = (status: PhotoRestoreJob['status']) =>
    photoJobs.filter(job => job.status === status);

  // 刷新数据
  const refreshJobs = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    loadData();
    setIsLoading(false);
  };

  // 监听协作项目创建事件
  React.useEffect(() => {
    const handleProjectCreated = (event: CustomEvent) => {
      const { projectId, creatorId } = event.detail;
      // 这里可以与协作上下文交互，自动添加创建者为所有者
      console.log('故事项目创建:', { projectId, creatorId });
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('story-project-created', handleProjectCreated as EventListener);
      return () => {
        window.removeEventListener('story-project-created', handleProjectCreated as EventListener);
      };
    }
  }, []);

  const value: AIServicesContextType = {
    photoJobs,
    submitPhotoRestore,
    getPhotoJob,
    getPhotoJobsByStatus,
    storyJobs,
    createStoryProject,
    uploadStoryPhoto,
    chatWithAI,
    generateStoryOutlineForJob,
    generateFullStory,
    getStoryJob,
    enableCollaboration,
    disableCollaboration,
    getCollaborativeStoryJobs,
    memorialJobs,
    submitMemorialCreation,
    getMemorialJob,
    isLoading,
    refreshJobs
  };

  return (
    <AIServicesContext.Provider value={value}>
      {children}
    </AIServicesContext.Provider>
  );
}

export function useAIServices() {
  const context = useContext(AIServicesContext);
  if (context === undefined) {
    throw new Error('useAIServices must be used within a AIServicesProvider');
  }
  return context;
}
