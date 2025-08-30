"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from './AuthContext';

export type PostType = 'text' | 'image' | 'video' | 'audio';
export type PostVisibility = 'public' | 'family' | 'private';

export interface PostMedia {
  id: string;
  type: 'image' | 'video' | 'audio';
  url: string;
  thumbnail?: string;
  description?: string;
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  media: PostMedia[];
  tags: string[];
  visibility: PostVisibility;
  location?: string;
  familyId: string;
  createdAt: Date;
  updatedAt: Date;

  // 统计信息
  likeCount: number;
  commentCount: number;
  shareCount: number;
  viewCount: number;

  // 用户交互状态
  isLiked?: boolean;
  isBookmarked?: boolean;
}

export interface PostComment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  replyToId?: string; // 回复的评论ID
  createdAt: Date;
  likeCount: number;
  isLiked?: boolean;
}

export interface PostLike {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  createdAt: Date;
}

interface FamilyCommunityContextType {
  // 动态管理
  posts: Post[];
  getAllPosts: () => Post[];
  getPostsByAuthor: (authorId: string) => Post[];
  getPostById: (id: string) => Post | undefined;
  addPost: (postData: Omit<Post, 'id' | 'createdAt' | 'updatedAt' | 'likeCount' | 'commentCount' | 'shareCount' | 'viewCount'>) => Promise<boolean>;
  updatePost: (id: string, postData: Partial<Post>) => Promise<boolean>;
  deletePost: (id: string) => Promise<boolean>;

  // 互动功能
  likePost: (postId: string) => Promise<boolean>;
  unlikePost: (postId: string) => Promise<boolean>;
  sharePost: (postId: string) => Promise<boolean>;

  // 评论管理
  comments: PostComment[];
  getPostComments: (postId: string) => PostComment[];
  addComment: (postId: string, content: string, replyToId?: string) => Promise<boolean>;
  deleteComment: (commentId: string) => Promise<boolean>;
  likeComment: (commentId: string) => Promise<boolean>;

  // 照片墙功能
  getAllPhotos: () => PostMedia[];
  getPhotosByAuthor: (authorId: string) => PostMedia[];
  getPhotosByTimeRange: (startDate: Date, endDate: Date) => PostMedia[];

  // 统计信息
  getCommunityStats: () => {
    totalPosts: number;
    totalPhotos: number;
    totalVideos: number;
    activeMembers: number;
    todayPosts: number;
  };

  isLoading: boolean;
  refreshPosts: () => Promise<void>;
}

const FamilyCommunityContext = createContext<FamilyCommunityContextType | undefined>(undefined);

// 本地存储键
const STORAGE_KEYS = {
  POSTS: 'benjia_community_posts',
  COMMENTS: 'benjia_community_comments',
  LIKES: 'benjia_community_likes'
};

export function FamilyCommunityProvider({ children }: { children: ReactNode }) {
  const { user, family } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<PostComment[]>([]);
  const [likes, setLikes] = useState<PostLike[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 从本地存储加载数据
  const loadData = useCallback(async () => {
    if (!family) return;

    try {
      const savedPosts = localStorage.getItem(`${STORAGE_KEYS.POSTS}_${family.id}`);
      const savedComments = localStorage.getItem(`${STORAGE_KEYS.COMMENTS}_${family.id}`);
      const savedLikes = localStorage.getItem(`${STORAGE_KEYS.LIKES}_${family.id}`);

      if (savedPosts) {
        const parsedPosts = JSON.parse(savedPosts) as Post[];
        // 转换日期字符串回 Date 对象
        const postsWithDates = parsedPosts.map(post => ({
          ...post,
          createdAt: new Date(post.createdAt),
          updatedAt: new Date(post.updatedAt)
        }));
        setPosts(postsWithDates);
      } else {
        // 创建演示数据
        const demoPosts = createDemoPosts(family.id);
        setPosts(demoPosts);
        savePosts(demoPosts);
      }

      if (savedComments) {
        const parsedComments = JSON.parse(savedComments) as PostComment[];
        const commentsWithDates = parsedComments.map(comment => ({
          ...comment,
          createdAt: new Date(comment.createdAt)
        }));
        setComments(commentsWithDates);
      }

      if (savedLikes) {
        const parsedLikes = JSON.parse(savedLikes) as PostLike[];
        const likesWithDates = parsedLikes.map(like => ({
          ...like,
          createdAt: new Date(like.createdAt)
        }));
        setLikes(likesWithDates);
      }
    } catch (error) {
      console.error('Failed to load community data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [family]);

  // 保存数据到本地存储
  const savePosts = (postsData: Post[]) => {
    if (!family) return;
    localStorage.setItem(`${STORAGE_KEYS.POSTS}_${family.id}`, JSON.stringify(postsData));
  };

  const saveComments = (commentsData: PostComment[]) => {
    if (!family) return;
    localStorage.setItem(`${STORAGE_KEYS.COMMENTS}_${family.id}`, JSON.stringify(commentsData));
  };

  const saveLikes = (likesData: PostLike[]) => {
    if (!family) return;
    localStorage.setItem(`${STORAGE_KEYS.LIKES}_${family.id}`, JSON.stringify(likesData));
  };

  // 创建演示数据
  const createDemoPosts = (familyId: string): Post[] => {
    const now = new Date();
    const currentUserId = user?.id || 'current_user';

    return [
      {
        id: 'post_1',
        authorId: 'member_7',
        authorName: '李小明',
        content: '今天和家人一起包饺子，奶奶教我们传统的包法，满满的幸福感！家的味道就是这样一代一代传承下来的。',
        media: [
          {
            id: 'media_1',
            type: 'image',
            url: 'https://source.unsplash.com/800x600/?family,dumplings',
            description: '一家人包饺子'
          }
        ],
        tags: ['家庭聚餐', '传统', '饺子'],
        visibility: 'family',
        location: '家中厨房',
        familyId,
        createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2小时前
        updatedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
        likeCount: 8,
        commentCount: 3,
        shareCount: 1,
        viewCount: 15
      },
      {
        id: 'post_2',
        authorId: 'member_3',
        authorName: '李爷爷',
        content: '翻出了一些老照片，这是1978年的春节全家福，那时候孩子们都还小呢。时间过得真快啊！',
        media: [
          {
            id: 'media_2',
            type: 'image',
            url: 'https://source.unsplash.com/600x800/?vintage,family,photo',
            description: '1978年春节全家福'
          }
        ],
        tags: ['老照片', '回忆', '春节'],
        visibility: 'family',
        familyId,
        createdAt: new Date(now.getTime() - 5 * 60 * 60 * 1000), // 5小时前
        updatedAt: new Date(now.getTime() - 5 * 60 * 60 * 1000),
        likeCount: 12,
        commentCount: 6,
        shareCount: 2,
        viewCount: 28
      },
      {
        id: 'post_3',
        authorId: 'member_8',
        authorName: '李小红',
        content: '今天带小宝去公园玩，他第一次看到这么多小鸭子，兴奋得不得了！童年的快乐就是这么简单。',
        media: [
          {
            id: 'media_3',
            type: 'image',
            url: 'https://source.unsplash.com/800x600/?child,ducks,park',
            description: '小宝看小鸭子'
          },
          {
            id: 'media_4',
            type: 'video',
            url: 'https://source.unsplash.com/800x600/?video,child,playing',
            thumbnail: 'https://source.unsplash.com/400x300/?child,playing',
            description: '小宝喂鸭子视频'
          }
        ],
        tags: ['亲子时光', '公园', '童年'],
        visibility: 'family',
        location: '中山公园',
        familyId,
        createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000), // 1天前
        updatedAt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
        likeCount: 15,
        commentCount: 8,
        shareCount: 3,
        viewCount: 35
      }
    ];
  };

  // 加载数据
  useEffect(() => {
    if (family) {
      loadData();
    }
  }, [family, loadData]);

  // 获取所有动态
  const getAllPosts = (): Post[] => {
    return posts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  };

  // 根据作者获取动态
  const getPostsByAuthor = (authorId: string): Post[] => {
    return posts.filter(post => post.authorId === authorId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  };

  // 根据ID获取动态
  const getPostById = (id: string): Post | undefined => {
    return posts.find(post => post.id === id);
  };

  // 添加动态
  const addPost = async (postData: Omit<Post, 'id' | 'createdAt' | 'updatedAt' | 'likeCount' | 'commentCount' | 'shareCount' | 'viewCount'>): Promise<boolean> => {
    if (!user || !family) return false;

    try {
      const newPost: Post = {
        ...postData,
        id: `post_${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        likeCount: 0,
        commentCount: 0,
        shareCount: 0,
        viewCount: 0
      };

      const updatedPosts = [...posts, newPost];
      setPosts(updatedPosts);
      savePosts(updatedPosts);

      return true;
    } catch (error) {
      console.error('Failed to add post:', error);
      return false;
    }
  };

  // 更新动态
  const updatePost = async (id: string, postData: Partial<Post>): Promise<boolean> => {
    try {
      const updatedPosts = posts.map(post =>
        post.id === id
          ? { ...post, ...postData, updatedAt: new Date() }
          : post
      );

      setPosts(updatedPosts);
      savePosts(updatedPosts);

      return true;
    } catch (error) {
      console.error('Failed to update post:', error);
      return false;
    }
  };

  // 删除动态
  const deletePost = async (id: string): Promise<boolean> => {
    try {
      const updatedPosts = posts.filter(post => post.id !== id);
      setPosts(updatedPosts);
      savePosts(updatedPosts);

      // 同时删除相关评论
      const updatedComments = comments.filter(comment => comment.postId !== id);
      setComments(updatedComments);
      saveComments(updatedComments);

      return true;
    } catch (error) {
      console.error('Failed to delete post:', error);
      return false;
    }
  };

  // 点赞动态
  const likePost = async (postId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const updatedPosts = posts.map(post =>
        post.id === postId
          ? { ...post, likeCount: post.likeCount + 1, isLiked: true }
          : post
      );

      setPosts(updatedPosts);
      savePosts(updatedPosts);

      // 添加点赞记录
      const newLike: PostLike = {
        id: `like_${Date.now()}`,
        postId,
        userId: user.id,
        userName: user.name,
        createdAt: new Date()
      };

      const updatedLikes = [...likes, newLike];
      setLikes(updatedLikes);
      saveLikes(updatedLikes);

      return true;
    } catch (error) {
      console.error('Failed to like post:', error);
      return false;
    }
  };

  // 取消点赞
  const unlikePost = async (postId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const updatedPosts = posts.map(post =>
        post.id === postId
          ? { ...post, likeCount: Math.max(0, post.likeCount - 1), isLiked: false }
          : post
      );

      setPosts(updatedPosts);
      savePosts(updatedPosts);

      // 移除点赞记录
      const updatedLikes = likes.filter(like =>
        !(like.postId === postId && like.userId === user.id)
      );
      setLikes(updatedLikes);
      saveLikes(updatedLikes);

      return true;
    } catch (error) {
      console.error('Failed to unlike post:', error);
      return false;
    }
  };

  // 分享动态
  const sharePost = async (postId: string): Promise<boolean> => {
    try {
      const updatedPosts = posts.map(post =>
        post.id === postId
          ? { ...post, shareCount: post.shareCount + 1 }
          : post
      );

      setPosts(updatedPosts);
      savePosts(updatedPosts);

      return true;
    } catch (error) {
      console.error('Failed to share post:', error);
      return false;
    }
  };

  // 获取动态评论
  const getPostComments = (postId: string): PostComment[] => {
    return comments.filter(comment => comment.postId === postId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  };

  // 添加评论
  const addComment = async (postId: string, content: string, replyToId?: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const newComment: PostComment = {
        id: `comment_${Date.now()}`,
        postId,
        authorId: user.id,
        authorName: user.name,
        authorAvatar: user.avatar,
        content: content.trim(),
        replyToId,
        createdAt: new Date(),
        likeCount: 0
      };

      const updatedComments = [...comments, newComment];
      setComments(updatedComments);
      saveComments(updatedComments);

      // 更新动态的评论数量
      const updatedPosts = posts.map(post =>
        post.id === postId
          ? { ...post, commentCount: post.commentCount + 1 }
          : post
      );
      setPosts(updatedPosts);
      savePosts(updatedPosts);

      return true;
    } catch (error) {
      console.error('Failed to add comment:', error);
      return false;
    }
  };

  // 删除评论
  const deleteComment = async (commentId: string): Promise<boolean> => {
    try {
      const comment = comments.find(c => c.id === commentId);
      if (!comment) return false;

      const updatedComments = comments.filter(c => c.id !== commentId);
      setComments(updatedComments);
      saveComments(updatedComments);

      // 更新动态的评论数量
      const updatedPosts = posts.map(post =>
        post.id === comment.postId
          ? { ...post, commentCount: Math.max(0, post.commentCount - 1) }
          : post
      );
      setPosts(updatedPosts);
      savePosts(updatedPosts);

      return true;
    } catch (error) {
      console.error('Failed to delete comment:', error);
      return false;
    }
  };

  // 点赞评论
  const likeComment = async (commentId: string): Promise<boolean> => {
    try {
      const updatedComments = comments.map(comment =>
        comment.id === commentId
          ? { ...comment, likeCount: comment.likeCount + 1, isLiked: true }
          : comment
      );

      setComments(updatedComments);
      saveComments(updatedComments);

      return true;
    } catch (error) {
      console.error('Failed to like comment:', error);
      return false;
    }
  };

  // 获取所有照片
  const getAllPhotos = (): PostMedia[] => {
    const allMedia: PostMedia[] = [];
    posts.forEach(post => {
      const photos = post.media.filter(media => media.type === 'image');
      allMedia.push(...photos);
    });
    return allMedia;
  };

  // 根据作者获取照片
  const getPhotosByAuthor = (authorId: string): PostMedia[] => {
    const authorPosts = getPostsByAuthor(authorId);
    const allMedia: PostMedia[] = [];
    authorPosts.forEach(post => {
      const photos = post.media.filter(media => media.type === 'image');
      allMedia.push(...photos);
    });
    return allMedia;
  };

  // 根据时间范围获取照片
  const getPhotosByTimeRange = (startDate: Date, endDate: Date): PostMedia[] => {
    const filteredPosts = posts.filter(post =>
      post.createdAt >= startDate && post.createdAt <= endDate
    );
    const allMedia: PostMedia[] = [];
    filteredPosts.forEach(post => {
      const photos = post.media.filter(media => media.type === 'image');
      allMedia.push(...photos);
    });
    return allMedia;
  };

  // 获取社区统计
  const getCommunityStats = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayPosts = posts.filter(post => post.createdAt >= today).length;
    const totalPhotos = getAllPhotos().length;
    const totalVideos = posts.reduce((count, post) =>
      count + post.media.filter(media => media.type === 'video').length, 0
    );
    const activeMembers = new Set(posts.map(post => post.authorId)).size;

    return {
      totalPosts: posts.length,
      totalPhotos,
      totalVideos,
      activeMembers,
      todayPosts
    };
  };

  // 刷新数据
  const refreshPosts = async (): Promise<void> => {
    await loadData();
  };

  const value: FamilyCommunityContextType = {
    posts,
    getAllPosts,
    getPostsByAuthor,
    getPostById,
    addPost,
    updatePost,
    deletePost,
    likePost,
    unlikePost,
    sharePost,
    comments,
    getPostComments,
    addComment,
    deleteComment,
    likeComment,
    getAllPhotos,
    getPhotosByAuthor,
    getPhotosByTimeRange,
    getCommunityStats,
    isLoading,
    refreshPosts
  };

  return (
    <FamilyCommunityContext.Provider value={value}>
      {children}
    </FamilyCommunityContext.Provider>
  );
}

export function useFamilyCommunity() {
  const context = useContext(FamilyCommunityContext);
  if (context === undefined) {
    throw new Error('useFamilyCommunity must be used within a FamilyCommunityProvider');
  }
  return context;
}
