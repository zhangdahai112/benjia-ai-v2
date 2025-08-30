"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from './AuthContext';

export type ContentType = 'photo' | 'video' | 'audio' | 'article';
export type ContentVisibility = 'public' | 'family' | 'private';

export interface ContentItem {
  id: string;
  memberId: string; // 所属家族成员ID
  type: ContentType;
  title: string;
  description?: string;
  fileUrl?: string; // 文件URL（照片、视频、音频）
  content?: string; // 文章内容
  tags: string[];
  visibility: ContentVisibility;
  createdBy: string; // 创建者ID
  createdAt: Date;
  updatedAt: Date;

  // 文件信息（仅文件类型内容）
  fileName?: string;
  fileSize?: number; // 字节
  fileMimeType?: string;

  // 统计信息
  viewCount: number;
  likeCount: number;
  commentCount: number;
}

export interface Comment {
  id: string;
  contentId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: Date;
}

interface MemberContentContextType {
  // 内容管理
  contents: ContentItem[];
  getMemberContents: (memberId: string, type?: ContentType) => ContentItem[];
  getContentById: (id: string) => ContentItem | undefined;
  addContent: (contentData: Omit<ContentItem, 'id' | 'createdAt' | 'updatedAt' | 'viewCount' | 'likeCount' | 'commentCount'>) => Promise<boolean>;
  updateContent: (id: string, contentData: Partial<ContentItem>) => Promise<boolean>;
  deleteContent: (id: string) => Promise<boolean>;

  // 权限控制
  canEditContent: (contentId: string) => boolean;
  canViewContent: (contentId: string) => boolean;

  // 文件上传
  uploadFile: (file: File, type: ContentType) => Promise<string | null>;

  // 互动功能
  likeContent: (contentId: string) => Promise<boolean>;
  addComment: (contentId: string, content: string) => Promise<boolean>;
  getContentComments: (contentId: string) => Comment[];

  // 统计
  getContentStats: (memberId: string) => {
    totalContents: number;
    photoCount: number;
    videoCount: number;
    audioCount: number;
    articleCount: number;
  };

  isLoading: boolean;
  refreshContents: () => Promise<void>;
}

const MemberContentContext = createContext<MemberContentContextType | undefined>(undefined);

// 本地存储键
const STORAGE_KEYS = {
  CONTENTS: 'benjia_member_contents',
  COMMENTS: 'benjia_content_comments'
};

export function MemberContentProvider({ children }: { children: ReactNode }) {
  const { user, family } = useAuth();
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 从本地存储加载内容数据
  const loadContents = useCallback(async () => {
    if (!family) return;

    try {
      const savedContents = localStorage.getItem(`${STORAGE_KEYS.CONTENTS}_${family.id}`);
      const savedComments = localStorage.getItem(`${STORAGE_KEYS.COMMENTS}_${family.id}`);

      if (savedContents) {
        const parsedContents = JSON.parse(savedContents) as ContentItem[];
        // 转换日期字符串回 Date 对象
        const contentsWithDates = parsedContents.map(content => ({
          ...content,
          createdAt: new Date(content.createdAt),
          updatedAt: new Date(content.updatedAt)
        }));
        setContents(contentsWithDates);
      } else {
        // 创建一些演示内容
        const demoContents = createDemoContents(family.id);
        setContents(demoContents);
        saveContents(demoContents);
      }

      if (savedComments) {
        const parsedComments = JSON.parse(savedComments) as Comment[];
        // 转换日期字符串回 Date 对象
        const commentsWithDates = parsedComments.map(comment => ({
          ...comment,
          createdAt: new Date(comment.createdAt)
        }));
        setComments(commentsWithDates);
      }
    } catch (error) {
      console.error('Failed to load member contents:', error);
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [family]); // saveContents和createDemoContents是稳定的函数

  // 保存内容数据到本地存储
  const saveContents = (contentsData: ContentItem[]) => {
    if (!family) return;
    localStorage.setItem(`${STORAGE_KEYS.CONTENTS}_${family.id}`, JSON.stringify(contentsData));
  };

  // 保存评论数据到本地存储
  const saveComments = (commentsData: Comment[]) => {
    if (!family) return;
    localStorage.setItem(`${STORAGE_KEYS.COMMENTS}_${family.id}`, JSON.stringify(commentsData));
  };

  // 创建演示内容
  const createDemoContents = (familyId: string): ContentItem[] => {
    const now = new Date();
    const currentUserId = user?.id || 'current_user';

    return [
      {
        id: 'content_1',
        memberId: 'member_7', // 本人
        type: 'photo',
        title: '家族聚餐合影',
        description: '2024年春节全家福，四代同堂的珍贵时刻',
        fileUrl: 'https://source.unsplash.com/800x600/?family,dinner',
        tags: ['春节', '聚餐', '全家福'],
        visibility: 'family',
        createdBy: currentUserId,
        createdAt: new Date('2024-02-10'),
        updatedAt: new Date('2024-02-10'),
        fileName: 'family_dinner_2024.jpg',
        fileSize: 2048000,
        fileMimeType: 'image/jpeg',
        viewCount: 15,
        likeCount: 8,
        commentCount: 3
      },
      {
        id: 'content_2',
        memberId: 'member_3', // 爷爷
        type: 'article',
        title: '爷爷的抗战回忆录',
        description: '记录爷爷在抗日战争期间的珍贵经历',
        content: '1937年，日军全面侵华，我那时还是个年轻小伙子...',
        tags: ['回忆录', '抗战', '历史'],
        visibility: 'family',
        createdBy: currentUserId,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
        viewCount: 25,
        likeCount: 12,
        commentCount: 5
      },
      {
        id: 'content_3',
        memberId: 'member_4', // 奶奶
        type: 'photo',
        title: '奶奶的传统手艺',
        description: '奶奶亲手制作的刺绣作品',
        fileUrl: 'https://source.unsplash.com/600x800/?embroidery,traditional',
        tags: ['手艺', '刺绣', '传统'],
        visibility: 'family',
        createdBy: currentUserId,
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date('2024-01-20'),
        fileName: 'grandma_embroidery.jpg',
        fileSize: 1536000,
        fileMimeType: 'image/jpeg',
        viewCount: 18,
        likeCount: 10,
        commentCount: 2
      }
    ];
  };

  // 加载内容数据
  useEffect(() => {
    if (family) {
      loadContents();
    }
  }, [family, loadContents]);

  // 获取指定成员的内容
  const getMemberContents = (memberId: string, type?: ContentType): ContentItem[] => {
    let memberContents = contents.filter(content => content.memberId === memberId);

    if (type) {
      memberContents = memberContents.filter(content => content.type === type);
    }

    // 根据可见性和权限过滤
    return memberContents.filter(content => canViewContent(content.id));
  };

  // 根据ID获取内容
  const getContentById = (id: string): ContentItem | undefined => {
    return contents.find(content => content.id === id);
  };

  // 检查是否可以编辑内容
  const canEditContent = (contentId: string): boolean => {
    if (!user) return false;

    const content = getContentById(contentId);
    if (!content) return false;

    // 管理员可以编辑所有内容
    if (user.role === 'admin') return true;

    // 创建者可以编辑自己的内容
    if (content.createdBy === user.id) return true;

    // 成员可以编辑自己空间的内容
    return content.memberId === user.id;
  };

  // 检查是否可以查看内容
  const canViewContent = (contentId: string): boolean => {
    if (!user) return false;

    const content = getContentById(contentId);
    if (!content) return false;

    // 根据可见性设置判断
    switch (content.visibility) {
      case 'public':
        return true;
      case 'family':
        return user.familyId === family?.id;
      case 'private':
        return content.createdBy === user.id || content.memberId === user.id || user.role === 'admin';
      default:
        return false;
    }
  };

  // 添加内容
  const addContent = async (contentData: Omit<ContentItem, 'id' | 'createdAt' | 'updatedAt' | 'viewCount' | 'likeCount' | 'commentCount'>): Promise<boolean> => {
    if (!user || !family) return false;

    try {
      const newContent: ContentItem = {
        ...contentData,
        id: `content_${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        viewCount: 0,
        likeCount: 0,
        commentCount: 0
      };

      const updatedContents = [...contents, newContent];
      setContents(updatedContents);
      saveContents(updatedContents);

      return true;
    } catch (error) {
      console.error('Failed to add content:', error);
      return false;
    }
  };

  // 更新内容
  const updateContent = async (id: string, contentData: Partial<ContentItem>): Promise<boolean> => {
    if (!user || !canEditContent(id)) return false;

    try {
      const updatedContents = contents.map(content =>
        content.id === id
          ? { ...content, ...contentData, updatedAt: new Date() }
          : content
      );

      setContents(updatedContents);
      saveContents(updatedContents);

      return true;
    } catch (error) {
      console.error('Failed to update content:', error);
      return false;
    }
  };

  // 删除内容
  const deleteContent = async (id: string): Promise<boolean> => {
    if (!user || !canEditContent(id)) return false;

    try {
      const updatedContents = contents.filter(content => content.id !== id);
      setContents(updatedContents);
      saveContents(updatedContents);

      // 同时删除相关评论
      const updatedComments = comments.filter(comment => comment.contentId !== id);
      setComments(updatedComments);
      saveComments(updatedComments);

      return true;
    } catch (error) {
      console.error('Failed to delete content:', error);
      return false;
    }
  };

  // 模拟文件上传
  const uploadFile = async (file: File, type: ContentType): Promise<string | null> => {
    try {
      // 在真实应用中，这里应该上传到云存储
      // 这里我们模拟上传并返回一个URL
      const fileUrl = URL.createObjectURL(file);

      // 模拟上传延迟
      await new Promise(resolve => setTimeout(resolve, 1000));

      return fileUrl;
    } catch (error) {
      console.error('Failed to upload file:', error);
      return null;
    }
  };

  // 点赞内容
  const likeContent = async (contentId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const updatedContents = contents.map(content =>
        content.id === contentId
          ? { ...content, likeCount: content.likeCount + 1 }
          : content
      );

      setContents(updatedContents);
      saveContents(updatedContents);

      return true;
    } catch (error) {
      console.error('Failed to like content:', error);
      return false;
    }
  };

  // 添加评论
  const addComment = async (contentId: string, content: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const newComment: Comment = {
        id: `comment_${Date.now()}`,
        contentId,
        authorId: user.id,
        authorName: user.name,
        content: content.trim(),
        createdAt: new Date()
      };

      const updatedComments = [...comments, newComment];
      setComments(updatedComments);
      saveComments(updatedComments);

      // 更新内容的评论数量
      const updatedContents = contents.map(item =>
        item.id === contentId
          ? { ...item, commentCount: item.commentCount + 1 }
          : item
      );
      setContents(updatedContents);
      saveContents(updatedContents);

      return true;
    } catch (error) {
      console.error('Failed to add comment:', error);
      return false;
    }
  };

  // 获取内容评论
  const getContentComments = (contentId: string): Comment[] => {
    return comments.filter(comment => comment.contentId === contentId);
  };

  // 获取内容统计
  const getContentStats = (memberId: string) => {
    const memberContents = getMemberContents(memberId);

    return {
      totalContents: memberContents.length,
      photoCount: memberContents.filter(c => c.type === 'photo').length,
      videoCount: memberContents.filter(c => c.type === 'video').length,
      audioCount: memberContents.filter(c => c.type === 'audio').length,
      articleCount: memberContents.filter(c => c.type === 'article').length
    };
  };

  // 刷新内容数据
  const refreshContents = async (): Promise<void> => {
    await loadContents();
  };

  const value: MemberContentContextType = {
    contents,
    getMemberContents,
    getContentById,
    addContent,
    updateContent,
    deleteContent,
    canEditContent,
    canViewContent,
    uploadFile,
    likeContent,
    addComment,
    getContentComments,
    getContentStats,
    isLoading,
    refreshContents
  };

  return (
    <MemberContentContext.Provider value={value}>
      {children}
    </MemberContentContext.Provider>
  );
}

export function useMemberContent() {
  const context = useContext(MemberContentContext);
  if (context === undefined) {
    throw new Error('useMemberContent must be used within a MemberContentProvider');
  }
  return context;
}
