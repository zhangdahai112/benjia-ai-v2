"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useFamilyMembers } from './FamilyMembersContext';

// Raw data interfaces for localStorage parsing
interface RawCollaborator {
  id: string;
  name: string;
  avatar?: string;
  role: CollaboratorRole;
  isOnline: boolean;
  lastActive: string | Date;
  joinedAt: string | Date;
  contributions: {
    messages: number;
    photos: number;
    edits: number;
  };
}

interface RawCollaborationInvite {
  id: string;
  projectId: string;
  projectTitle: string;
  invitorId: string;
  invitorName: string;
  inviteeId: string;
  inviteeName: string;
  role: CollaboratorRole;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  message?: string;
  createdAt: string | Date;
  expiresAt: string | Date;
}

interface RawCollaborationActivity {
  id: string;
  projectId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  type: 'join' | 'leave' | 'message' | 'photo' | 'edit' | 'comment' | 'generate';
  action: string;
  details?: Record<string, unknown>;
  createdAt: string | Date;
}

interface RawCollaborationComment {
  id: string;
  projectId: string;
  messageId?: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  type: 'general' | 'suggestion' | 'approval' | 'question';
  replies: RawCollaborationComment[];
  createdAt: string | Date;
  updatedAt: string | Date;
}

interface RawCollaborationData {
  collaborators?: Record<string, RawCollaborator[]>;
  invitations?: RawCollaborationInvite[];
  activities?: Record<string, RawCollaborationActivity[]>;
  comments?: Record<string, RawCollaborationComment[]>;
}

// 协作者角色类型
export type CollaboratorRole = 'owner' | 'editor' | 'reviewer' | 'viewer';

// 协作者信息
export interface Collaborator {
  id: string;
  name: string;
  avatar?: string;
  role: CollaboratorRole;
  isOnline: boolean;
  lastActive: Date;
  joinedAt: Date;
  contributions: {
    messages: number;
    photos: number;
    edits: number;
  };
}

// 协作邀请
export interface CollaborationInvite {
  id: string;
  projectId: string;
  projectTitle: string;
  invitorId: string;
  invitorName: string;
  inviteeId: string;
  inviteeName: string;
  role: CollaboratorRole;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  message?: string;
  createdAt: Date;
  expiresAt: Date;
}

// 协作活动记录
export interface CollaborationActivity {
  id: string;
  projectId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  type: 'join' | 'leave' | 'message' | 'photo' | 'edit' | 'comment' | 'generate';
  action: string;
  details?: Record<string, unknown>;
  createdAt: Date;
}

// 协作评论
export interface CollaborationComment {
  id: string;
  projectId: string;
  messageId?: string; // 针对特定消息的评论
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  type: 'general' | 'suggestion' | 'approval' | 'question';
  replies: CollaborationComment[];
  createdAt: Date;
  updatedAt: Date;
}

// 协作权限配置
export interface CollaborationPermissions {
  canInvite: boolean;
  canEdit: boolean;
  canComment: boolean;
  canGenerate: boolean;
  canDelete: boolean;
  canManageRoles: boolean;
}

interface CollaborationContextType {
  // 协作者管理
  getProjectCollaborators: (projectId: string) => Collaborator[];
  inviteCollaborator: (projectId: string, memberId: string, role: CollaboratorRole, message?: string) => Promise<boolean>;
  removeCollaborator: (projectId: string, collaboratorId: string) => Promise<boolean>;
  updateCollaboratorRole: (projectId: string, collaboratorId: string, newRole: CollaboratorRole) => Promise<boolean>;

  // 邀请管理
  getInvitations: () => CollaborationInvite[];
  respondToInvitation: (inviteId: string, response: 'accept' | 'decline') => Promise<boolean>;

  // 活动记录
  getProjectActivities: (projectId: string) => CollaborationActivity[];
  addActivity: (projectId: string, type: CollaborationActivity['type'], action: string, details?: Record<string, unknown>) => void;

  // 评论系统
  getProjectComments: (projectId: string) => CollaborationComment[];
  addComment: (projectId: string, content: string, type: CollaborationComment['type'], messageId?: string) => Promise<boolean>;
  replyToComment: (commentId: string, content: string) => Promise<boolean>;

  // 权限检查
  getPermissions: (projectId: string, userId?: string) => CollaborationPermissions;
  canUserAccess: (projectId: string, userId?: string) => boolean;

  // 在线状态
  getOnlineCollaborators: (projectId: string) => Collaborator[];
  updateOnlineStatus: (projectId: string) => void;

  isLoading: boolean;
}

const CollaborationContext = createContext<CollaborationContextType | undefined>(undefined);

const STORAGE_KEY = 'benjia_collaboration';

export function CollaborationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { members } = useFamilyMembers();

  const [collaborators, setCollaborators] = useState<Record<string, Collaborator[]>>({});
  const [invitations, setInvitations] = useState<CollaborationInvite[]>([]);
  const [activities, setActivities] = useState<Record<string, CollaborationActivity[]>>({});
  const [comments, setComments] = useState<Record<string, CollaborationComment[]>>({});
  const [isLoading, setIsLoading] = useState(false);

  // 加载数据
  const loadData = useCallback(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);

        if (data.collaborators) {
          const collaboratorsWithDates = Object.entries(data.collaborators as Record<string, RawCollaborator[]>).reduce((acc, [projectId, colls]) => {
            acc[projectId] = colls.map((coll: RawCollaborator) => ({
              ...coll,
              lastActive: new Date(coll.lastActive),
              joinedAt: new Date(coll.joinedAt)
            }));
            return acc;
          }, {} as Record<string, Collaborator[]>);
          setCollaborators(collaboratorsWithDates);
        }

        if (data.invitations) {
          const invitationsWithDates = data.invitations.map((invite: RawCollaborationInvite) => ({
            ...invite,
            createdAt: new Date(invite.createdAt),
            expiresAt: new Date(invite.expiresAt)
          }));
          setInvitations(invitationsWithDates);
        }

        if (data.activities) {
          const activitiesWithDates = Object.entries(data.activities as Record<string, RawCollaborationActivity[]>).reduce((acc, [projectId, acts]) => {
            acc[projectId] = acts.map((act: RawCollaborationActivity) => ({
              ...act,
              createdAt: new Date(act.createdAt)
            }));
            return acc;
          }, {} as Record<string, CollaborationActivity[]>);
          setActivities(activitiesWithDates);
        }

        if (data.comments) {
          const commentsWithDates = Object.entries(data.comments as Record<string, RawCollaborationComment[]>).reduce((acc, [projectId, comms]) => {
            acc[projectId] = comms.map((comm: RawCollaborationComment) => ({
              ...comm,
              createdAt: new Date(comm.createdAt),
              updatedAt: new Date(comm.updatedAt),
              replies: comm.replies.map((reply: RawCollaborationComment) => ({
                ...reply,
                createdAt: new Date(reply.createdAt),
                updatedAt: new Date(reply.updatedAt),
                replies: [] // Reset nested replies to avoid deep nesting issues
              }))
            }));
            return acc;
          }, {} as Record<string, CollaborationComment[]>);
          setComments(commentsWithDates);
        }
      }
    } catch (error) {
      console.error('Failed to load collaboration data:', error);
    }
  }, []);

  // 保存数据
  const saveData = useCallback(() => {
    try {
      const data = {
        collaborators,
        invitations,
        activities,
        comments
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save collaboration data:', error);
    }
  }, [collaborators, invitations, activities, comments]);

  // 初始化加载
  useEffect(() => {
    loadData();
  }, [loadData]);

  // 保存数据变化
  useEffect(() => {
    saveData();
  }, [saveData]);

  // 获取项目协作者
  const getProjectCollaborators = useCallback((projectId: string): Collaborator[] => {
    return collaborators[projectId] || [];
  }, [collaborators]);

  // 邀请协作者
  const inviteCollaborator = async (
    projectId: string,
    memberId: string,
    role: CollaboratorRole,
    message?: string
  ): Promise<boolean> => {
    if (!user) return false;

    try {
      const member = members.find(m => m.id === memberId);
      if (!member) return false;

      // 检查是否已经是协作者
      const existingCollaborators = getProjectCollaborators(projectId);
      if (existingCollaborators.some(c => c.id === memberId)) {
        return false; // 已经是协作者
      }

      // 创建邀请
      const invite: CollaborationInvite = {
        id: `invite_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        projectId,
        projectTitle: `家族故事项目`, // 实际应该从项目信息获取
        invitorId: user.id,
        invitorName: user.name,
        inviteeId: memberId,
        inviteeName: member.name,
        role,
        status: 'pending',
        message,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7天后过期
      };

      setInvitations(prev => [...prev, invite]);

      // 记录活动
      addActivity(projectId, 'join', `邀请 ${member.name} 参与协作`, { role, inviteId: invite.id });

      return true;
    } catch (error) {
      console.error('Failed to invite collaborator:', error);
      return false;
    }
  };

  // 移除协作者
  const removeCollaborator = async (projectId: string, collaboratorId: string): Promise<boolean> => {
    try {
      setCollaborators(prev => ({
        ...prev,
        [projectId]: (prev[projectId] || []).filter(c => c.id !== collaboratorId)
      }));

      const collaborator = getProjectCollaborators(projectId).find(c => c.id === collaboratorId);
      if (collaborator) {
        addActivity(projectId, 'leave', `${collaborator.name} 离开了协作`, { collaboratorId });
      }

      return true;
    } catch (error) {
      console.error('Failed to remove collaborator:', error);
      return false;
    }
  };

  // 更新协作者角色
  const updateCollaboratorRole = async (
    projectId: string,
    collaboratorId: string,
    newRole: CollaboratorRole
  ): Promise<boolean> => {
    try {
      setCollaborators(prev => ({
        ...prev,
        [projectId]: (prev[projectId] || []).map(c =>
          c.id === collaboratorId ? { ...c, role: newRole } : c
        )
      }));

      const collaborator = getProjectCollaborators(projectId).find(c => c.id === collaboratorId);
      if (collaborator) {
        addActivity(projectId, 'edit', `${collaborator.name} 的角色更新为 ${newRole}`, { newRole, oldRole: collaborator.role });
      }

      return true;
    } catch (error) {
      console.error('Failed to update collaborator role:', error);
      return false;
    }
  };

  // 获取邀请列表
  const getInvitations = useCallback((): CollaborationInvite[] => {
    if (!user) return [];
    return invitations.filter(invite =>
      invite.inviteeId === user.id &&
      invite.status === 'pending' &&
      invite.expiresAt > new Date()
    );
  }, [invitations, user]);

  // 响应邀请
  const respondToInvitation = async (inviteId: string, response: 'accept' | 'decline'): Promise<boolean> => {
    if (!user) return false;

    try {
      const invite = invitations.find(i => i.id === inviteId);
      if (!invite) return false;

      // 更新邀请状态
      setInvitations(prev => prev.map(i =>
        i.id === inviteId
          ? { ...i, status: response === 'accept' ? 'accepted' : 'declined' }
          : i
      ));

      if (response === 'accept') {
        // 添加为协作者
        const newCollaborator: Collaborator = {
          id: user.id,
          name: user.name,
          avatar: user.avatar,
          role: invite.role,
          isOnline: true,
          lastActive: new Date(),
          joinedAt: new Date(),
          contributions: {
            messages: 0,
            photos: 0,
            edits: 0
          }
        };

        setCollaborators(prev => ({
          ...prev,
          [invite.projectId]: [...(prev[invite.projectId] || []), newCollaborator]
        }));

        addActivity(invite.projectId, 'join', `${user.name} 加入了协作`, { role: invite.role });
      }

      return true;
    } catch (error) {
      console.error('Failed to respond to invitation:', error);
      return false;
    }
  };

  // 获取项目活动
  const getProjectActivities = useCallback((projectId: string): CollaborationActivity[] => {
    return (activities[projectId] || []).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }, [activities]);

  // 添加活动记录
  const addActivity = useCallback((
    projectId: string,
    type: CollaborationActivity['type'],
    action: string,
    details?: Record<string, unknown>
  ) => {
    if (!user) return;

    const activity: CollaborationActivity = {
      id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      projectId,
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      type,
      action,
      details,
      createdAt: new Date()
    };

    setActivities(prev => ({
      ...prev,
      [projectId]: [...(prev[projectId] || []), activity]
    }));
  }, [user]);

  // 获取项目评论
  const getProjectComments = useCallback((projectId: string): CollaborationComment[] => {
    return (comments[projectId] || []).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }, [comments]);

  // 添加评论
  const addComment = async (
    projectId: string,
    content: string,
    type: CollaborationComment['type'],
    messageId?: string
  ): Promise<boolean> => {
    if (!user) return false;

    try {
      const comment: CollaborationComment = {
        id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        projectId,
        messageId,
        authorId: user.id,
        authorName: user.name,
        authorAvatar: user.avatar,
        content,
        type,
        replies: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      setComments(prev => ({
        ...prev,
        [projectId]: [...(prev[projectId] || []), comment]
      }));

      addActivity(projectId, 'comment', `${user.name} 添加了评论`, { commentType: type });

      return true;
    } catch (error) {
      console.error('Failed to add comment:', error);
      return false;
    }
  };

  // 回复评论
  const replyToComment = async (commentId: string, content: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const reply: CollaborationComment = {
        id: `reply_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        projectId: '', // 会从父评论获取
        authorId: user.id,
        authorName: user.name,
        authorAvatar: user.avatar,
        content,
        type: 'general',
        replies: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      setComments(prev => {
        const newComments = { ...prev };
        Object.keys(newComments).forEach(projectId => {
          newComments[projectId] = newComments[projectId].map(comment =>
            comment.id === commentId
              ? {
                  ...comment,
                  replies: [...comment.replies, { ...reply, projectId }]
                }
              : comment
          );
        });
        return newComments;
      });

      return true;
    } catch (error) {
      console.error('Failed to reply to comment:', error);
      return false;
    }
  };

  // 获取权限
  const getPermissions = useCallback((projectId: string, userId?: string): CollaborationPermissions => {
    const currentUserId = userId || user?.id;
    if (!currentUserId) {
      return {
        canInvite: false,
        canEdit: false,
        canComment: false,
        canGenerate: false,
        canDelete: false,
        canManageRoles: false
      };
    }

    const collaborator = getProjectCollaborators(projectId).find(c => c.id === currentUserId);
    if (!collaborator) {
      return {
        canInvite: false,
        canEdit: false,
        canComment: false,
        canGenerate: false,
        canDelete: false,
        canManageRoles: false
      };
    }

    switch (collaborator.role) {
      case 'owner':
        return {
          canInvite: true,
          canEdit: true,
          canComment: true,
          canGenerate: true,
          canDelete: true,
          canManageRoles: true
        };
      case 'editor':
        return {
          canInvite: true,
          canEdit: true,
          canComment: true,
          canGenerate: true,
          canDelete: false,
          canManageRoles: false
        };
      case 'reviewer':
        return {
          canInvite: false,
          canEdit: false,
          canComment: true,
          canGenerate: false,
          canDelete: false,
          canManageRoles: false
        };
      case 'viewer':
        return {
          canInvite: false,
          canEdit: false,
          canComment: false,
          canGenerate: false,
          canDelete: false,
          canManageRoles: false
        };
      default:
        return {
          canInvite: false,
          canEdit: false,
          canComment: false,
          canGenerate: false,
          canDelete: false,
          canManageRoles: false
        };
    }
  }, [getProjectCollaborators, user]);

  // 检查用户访问权限
  const canUserAccess = useCallback((projectId: string, userId?: string): boolean => {
    const currentUserId = userId || user?.id;
    if (!currentUserId) return false;

    const collaborator = getProjectCollaborators(projectId).find(c => c.id === currentUserId);
    return !!collaborator;
  }, [getProjectCollaborators, user]);

  // 获取在线协作者
  const getOnlineCollaborators = useCallback((projectId: string): Collaborator[] => {
    return getProjectCollaborators(projectId).filter(c => c.isOnline);
  }, [getProjectCollaborators]);

  // 更新在线状态
  const updateOnlineStatus = useCallback((projectId: string) => {
    if (!user) return;

    setCollaborators(prev => ({
      ...prev,
      [projectId]: (prev[projectId] || []).map(c =>
        c.id === user.id
          ? { ...c, isOnline: true, lastActive: new Date() }
          : c
      )
    }));

    // 模拟其他用户离线
    setTimeout(() => {
      setCollaborators(prev => ({
        ...prev,
        [projectId]: (prev[projectId] || []).map(c =>
          c.id !== user.id && Math.random() > 0.7
            ? { ...c, isOnline: false }
            : c
        )
      }));
    }, 30000); // 30秒后随机设置一些用户离线
  }, [user]);

  const value: CollaborationContextType = {
    getProjectCollaborators,
    inviteCollaborator,
    removeCollaborator,
    updateCollaboratorRole,
    getInvitations,
    respondToInvitation,
    getProjectActivities,
    addActivity,
    getProjectComments,
    addComment,
    replyToComment,
    getPermissions,
    canUserAccess,
    getOnlineCollaborators,
    updateOnlineStatus,
    isLoading
  };

  return (
    <CollaborationContext.Provider value={value}>
      {children}
    </CollaborationContext.Provider>
  );
}

export function useCollaboration() {
  const context = useContext(CollaborationContext);
  if (context === undefined) {
    throw new Error('useCollaboration must be used within a CollaborationProvider');
  }
  return context;
}
