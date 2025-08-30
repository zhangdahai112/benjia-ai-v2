"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useCollaboration, type Collaborator, type CollaboratorRole, type CollaborationActivity, type CollaborationComment } from "@/contexts/CollaborationContext";
import { useFamilyMembers } from "@/contexts/FamilyMembersContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  Users,
  UserPlus,
  Crown,
  Edit3,
  Eye,
  MessageSquare,
  Clock,
  Send,
  MoreHorizontal,
  Trash2,
  Settings,
  Online,
  Offline,
  Activity,
  Comment,
  Share2,
  Shield,
  Bell,
  Check,
  X,
  AlertCircle,
  Heart,
  ThumbsUp,
  Reply
} from "lucide-react";

interface CollaborationPanelProps {
  projectId: string;
  onCollaboratorAdd?: (collaborator: Collaborator) => void;
  className?: string;
}

export default function CollaborationPanel({ projectId, onCollaboratorAdd, className = "" }: CollaborationPanelProps) {
  const { user } = useAuth();
  const { members } = useFamilyMembers();
  const {
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
    getOnlineCollaborators,
    updateOnlineStatus
  } = useCollaboration();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<'collaborators' | 'invitations' | 'activities' | 'comments'>('collaborators');
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<CollaboratorRole>('editor');
  const [inviteMessage, setInviteMessage] = useState("");
  const [newComment, setNewComment] = useState("");
  const [commentType, setCommentType] = useState<CollaborationComment['type']>('general');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");

  const collaborators = getProjectCollaborators(projectId);
  const invitations = getInvitations();
  const activities = getProjectActivities(projectId);
  const comments = getProjectComments(projectId);
  const permissions = getPermissions(projectId);
  const onlineCollaborators = getOnlineCollaborators(projectId);

  // 更新在线状态
  useEffect(() => {
    updateOnlineStatus(projectId);
    const interval = setInterval(() => {
      updateOnlineStatus(projectId);
    }, 60000); // 每分钟更新一次

    return () => clearInterval(interval);
  }, [projectId, updateOnlineStatus]);

  // 处理邀请成员
  const handleInvite = async () => {
    if (!selectedMemberId) {
      toast({
        title: "请选择成员",
        description: "请选择要邀请的家族成员",
        variant: "destructive"
      });
      return;
    }

    const success = await inviteCollaborator(selectedMemberId, selectedRole, inviteMessage || undefined);
    if (success) {
      toast({
        title: "邀请已发送",
        description: "邀请已成功发送给所选成员"
      });
      setShowInviteDialog(false);
      setSelectedMemberId("");
      setInviteMessage("");
    } else {
      toast({
        title: "邀请失败",
        description: "可能该成员已经是协作者或发生其他错误",
        variant: "destructive"
      });
    }
  };

  // 处理响应邀请
  const handleInvitationResponse = async (inviteId: string, response: 'accept' | 'decline') => {
    const success = await respondToInvitation(inviteId, response);
    if (success) {
      toast({
        title: response === 'accept' ? "已接受邀请" : "已拒绝邀请",
        description: response === 'accept' ? "您已成功加入协作项目" : "已拒绝协作邀请"
      });
    }
  };

  // 处理移除协作者
  const handleRemoveCollaborator = async (collaboratorId: string) => {
    if (confirm("确定要移除此协作者吗？")) {
      const success = await removeCollaborator(projectId, collaboratorId);
      if (success) {
        toast({
          title: "协作者已移除",
          description: "已成功移除协作者"
        });
      }
    }
  };

  // 处理角色更新
  const handleRoleUpdate = async (collaboratorId: string, newRole: CollaboratorRole) => {
    const success = await updateCollaboratorRole(projectId, collaboratorId, newRole);
    if (success) {
      toast({
        title: "角色已更新",
        description: "协作者角色已成功更新"
      });
    }
  };

  // 处理添加评论
  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    const success = await addComment(projectId, newComment, commentType);
    if (success) {
      setNewComment("");
      toast({
        title: "评论已添加",
        description: "您的评论已成功发布"
      });
    }
  };

  // 处理回复评论
  const handleReplyComment = async (commentId: string) => {
    if (!replyContent.trim()) return;

    const success = await replyToComment(commentId, replyContent);
    if (success) {
      setReplyContent("");
      setReplyingTo(null);
      toast({
        title: "回复已发布",
        description: "您的回复已成功发布"
      });
    }
  };

  // 获取角色颜色和图标
  const getRoleInfo = (role: CollaboratorRole) => {
    switch (role) {
      case 'owner':
        return { color: 'bg-yellow-100 text-yellow-700', icon: Crown, label: '所有者' };
      case 'editor':
        return { color: 'bg-blue-100 text-blue-700', icon: Edit3, label: '编辑者' };
      case 'reviewer':
        return { color: 'bg-green-100 text-green-700', icon: MessageSquare, label: '评审者' };
      case 'viewer':
        return { color: 'bg-gray-100 text-gray-700', icon: Eye, label: '查看者' };
      default:
        return { color: 'bg-gray-100 text-gray-700', icon: Eye, label: '未知' };
    }
  };

  // 获取活动图标
  const getActivityIcon = (type: CollaborationActivity['type']) => {
    switch (type) {
      case 'join': return UserPlus;
      case 'leave': return Trash2;
      case 'message': return MessageSquare;
      case 'photo': return Share2;
      case 'edit': return Edit3;
      case 'comment': return Comment;
      case 'generate': return Activity;
      default: return Activity;
    }
  };

  // 获取可邀请的成员（排除已有协作者）
  const availableMembers = members.filter(member =>
    !collaborators.some(collab => collab.id === member.id) && member.id !== user?.id
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 协作状态概览 */}
      <Card className="border-blue-200">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2 text-blue-600" />
              协作状态
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="text-xs">
                {collaborators.length} 位协作者
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {onlineCollaborators.length} 人在线
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex -space-x-2">
            {collaborators.slice(0, 5).map(collaborator => (
              <div key={collaborator.id} className="relative">
                <Avatar className="w-8 h-8 border-2 border-white">
                  <AvatarImage src={collaborator.avatar} />
                  <AvatarFallback className="text-xs">
                    {collaborator.name.slice(-2)}
                  </AvatarFallback>
                </Avatar>
                {collaborator.isOnline && (
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                )}
              </div>
            ))}
            {collaborators.length > 5 && (
              <div className="w-8 h-8 bg-gray-100 rounded-full border-2 border-white flex items-center justify-center">
                <span className="text-xs text-gray-600">+{collaborators.length - 5}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 标签切换 */}
      <div className="flex space-x-2 overflow-x-auto">
        <Button
          variant={activeTab === 'collaborators' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('collaborators')}
          className="whitespace-nowrap"
        >
          <Users className="w-4 h-4 mr-1" />
          协作者 ({collaborators.length})
        </Button>
        <Button
          variant={activeTab === 'invitations' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('invitations')}
          className="whitespace-nowrap"
        >
          <Bell className="w-4 h-4 mr-1" />
          邀请 ({invitations.length})
        </Button>
        <Button
          variant={activeTab === 'activities' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('activities')}
          className="whitespace-nowrap"
        >
          <Activity className="w-4 h-4 mr-1" />
          动态 ({activities.length})
        </Button>
        <Button
          variant={activeTab === 'comments' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('comments')}
          className="whitespace-nowrap"
        >
          <MessageSquare className="w-4 h-4 mr-1" />
          评论 ({comments.length})
        </Button>
      </div>

      {/* 协作者列表 */}
      {activeTab === 'collaborators' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">协作者管理</CardTitle>
              {permissions.canInvite && (
                <Button
                  size="sm"
                  onClick={() => setShowInviteDialog(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <UserPlus className="w-4 h-4 mr-1" />
                  邀请成员
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {collaborators.map(collaborator => {
                const roleInfo = getRoleInfo(collaborator.role);
                const RoleIcon = roleInfo.icon;

                return (
                  <div key={collaborator.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={collaborator.avatar} />
                          <AvatarFallback>
                            {collaborator.name.slice(-2)}
                          </AvatarFallback>
                        </Avatar>
                        {collaborator.isOnline ? (
                          <Online className="absolute -bottom-1 -right-1 w-3 h-3 text-green-500" />
                        ) : (
                          <Offline className="absolute -bottom-1 -right-1 w-3 h-3 text-gray-400" />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="font-medium text-gray-900">{collaborator.name}</p>
                          <Badge className={`text-xs ${roleInfo.color}`}>
                            <RoleIcon className="w-3 h-3 mr-1" />
                            {roleInfo.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          加入于 {collaborator.joinedAt.toLocaleDateString()}
                          {collaborator.isOnline ? ' • 在线' : ` • ${collaborator.lastActive.toLocaleString()}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {permissions.canManageRoles && collaborator.id !== user?.id && (
                        <Select
                          value={collaborator.role}
                          onValueChange={(value: CollaboratorRole) =>
                            handleRoleUpdate(collaborator.id, value)
                          }
                        >
                          <SelectTrigger className="w-24 h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="editor">编辑者</SelectItem>
                            <SelectItem value="reviewer">评审者</SelectItem>
                            <SelectItem value="viewer">查看者</SelectItem>
                          </SelectContent>
                        </Select>
                      )}

                      {permissions.canManageRoles && collaborator.id !== user?.id && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveCollaborator(collaborator.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}

              {collaborators.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>暂无协作者</p>
                  {permissions.canInvite && (
                    <Button
                      variant="ghost"
                      onClick={() => setShowInviteDialog(true)}
                      className="mt-2"
                    >
                      邀请家族成员参与协作
                    </Button>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 邀请管理 */}
      {activeTab === 'invitations' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">邀请管理</CardTitle>
            <CardDescription>查看和回应协作邀请</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {invitations.map(invitation => (
                <div key={invitation.id} className="p-4 border border-orange-200 rounded-lg bg-orange-50">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-medium text-gray-900">
                        {invitation.invitorName} 邀请您参与协作
                      </p>
                      <p className="text-sm text-gray-600">
                        项目：{invitation.projectTitle} • 角色：{getRoleInfo(invitation.role).label}
                      </p>
                    </div>
                    <Badge variant="outline" className="bg-orange-100 text-orange-700">
                      待回应
                    </Badge>
                  </div>

                  {invitation.message && (
                    <div className="mb-3 p-3 bg-white rounded border">
                      <p className="text-sm text-gray-700">{invitation.message}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500">
                      {invitation.expiresAt.toLocaleDateString()} 前有效
                    </p>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => handleInvitationResponse(invitation.id, 'accept')}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Check className="w-4 h-4 mr-1" />
                        接受
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleInvitationResponse(invitation.id, 'decline')}
                        className="text-red-600"
                      >
                        <X className="w-4 h-4 mr-1" />
                        拒绝
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {invitations.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Bell className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>暂无邀请</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 活动记录 */}
      {activeTab === 'activities' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">协作动态</CardTitle>
            <CardDescription>查看项目的所有协作活动</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activities.map(activity => {
                const ActivityIcon = getActivityIcon(activity.type);

                return (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <ActivityIcon className="w-4 h-4 text-blue-600" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.userName}
                        </p>
                        <p className="text-sm text-gray-600">
                          {activity.action}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500">
                        {activity.createdAt.toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })}

              {activities.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Activity className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>暂无活动记录</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 评论系统 */}
      {activeTab === 'comments' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">项目评论</CardTitle>
            <CardDescription>协作成员的讨论和建议</CardDescription>
          </CardHeader>
          <CardContent>
            {/* 添加评论 */}
            {permissions.canComment && (
              <div className="mb-6 p-4 border rounded-lg bg-gray-50">
                <div className="flex items-center space-x-2 mb-3">
                  <Select value={commentType} onValueChange={(value: any) => setCommentType(value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">常规</SelectItem>
                      <SelectItem value="suggestion">建议</SelectItem>
                      <SelectItem value="approval">认可</SelectItem>
                      <SelectItem value="question">疑问</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="分享您的想法和建议..."
                  className="mb-3"
                  rows={3}
                />

                <Button
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Send className="w-4 h-4 mr-1" />
                  发布评论
                </Button>
              </div>
            )}

            {/* 评论列表 */}
            <div className="space-y-4">
              {comments.map(comment => (
                <div key={comment.id} className="border-l-4 border-blue-200 pl-4">
                  <div className="flex items-start space-x-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={comment.authorAvatar} />
                      <AvatarFallback className="text-xs">
                        {comment.authorName.slice(-2)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <p className="font-medium text-gray-900">{comment.authorName}</p>
                        <Badge variant="secondary" className="text-xs">
                          {comment.type === 'general' ? '常规' :
                           comment.type === 'suggestion' ? '建议' :
                           comment.type === 'approval' ? '认可' : '疑问'}
                        </Badge>
                        <p className="text-xs text-gray-500">
                          {comment.createdAt.toLocaleString()}
                        </p>
                      </div>

                      <p className="text-gray-700 mb-2">{comment.content}</p>

                      <div className="flex items-center space-x-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setReplyingTo(comment.id)}
                          className="text-xs p-1 h-auto"
                        >
                          <Reply className="w-3 h-3 mr-1" />
                          回复
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs p-1 h-auto text-blue-600"
                        >
                          <ThumbsUp className="w-3 h-3 mr-1" />
                          有用
                        </Button>
                      </div>

                      {/* 回复输入 */}
                      {replyingTo === comment.id && (
                        <div className="mt-3 p-3 bg-gray-50 rounded">
                          <Textarea
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            placeholder="回复这条评论..."
                            rows={2}
                            className="mb-2"
                          />
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              onClick={() => handleReplyComment(comment.id)}
                              disabled={!replyContent.trim()}
                            >
                              回复
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setReplyingTo(null);
                                setReplyContent("");
                              }}
                            >
                              取消
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* 回复列表 */}
                      {comment.replies.length > 0 && (
                        <div className="mt-3 space-y-2 border-l-2 border-gray-200 pl-3">
                          {comment.replies.map(reply => (
                            <div key={reply.id} className="flex items-start space-x-2">
                              <Avatar className="w-6 h-6">
                                <AvatarImage src={reply.authorAvatar} />
                                <AvatarFallback className="text-xs">
                                  {reply.authorName.slice(-1)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <p className="text-sm">
                                  <span className="font-medium">{reply.authorName}</span>
                                  <span className="text-gray-600 ml-2">{reply.content}</span>
                                </p>
                                <p className="text-xs text-gray-500">
                                  {reply.createdAt.toLocaleString()}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {comments.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>暂无评论</p>
                  {permissions.canComment && (
                    <p className="text-sm">成为第一个发表评论的人</p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 邀请对话框 */}
      {showInviteDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>邀请协作成员</CardTitle>
              <CardDescription>
                邀请家族成员参与故事创作
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">选择成员</label>
                <Select value={selectedMemberId} onValueChange={setSelectedMemberId}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择要邀请的成员" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableMembers.map(member => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name} ({member.relation})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">协作角色</label>
                <Select value={selectedRole} onValueChange={(value: any) => setSelectedRole(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="editor">编辑者 - 可以编辑和生成内容</SelectItem>
                    <SelectItem value="reviewer">评审者 - 可以评论和建议</SelectItem>
                    <SelectItem value="viewer">查看者 - 只能查看内容</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">邀请留言（可选）</label>
                <Textarea
                  value={inviteMessage}
                  onChange={(e) => setInviteMessage(e.target.value)}
                  placeholder="向被邀请人说明邀请原因..."
                  rows={3}
                />
              </div>

              <div className="flex space-x-3">
                <Button
                  onClick={handleInvite}
                  disabled={!selectedMemberId}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  发送邀请
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowInviteDialog(false);
                    setSelectedMemberId("");
                    setInviteMessage("");
                  }}
                  className="flex-1"
                >
                  取消
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
