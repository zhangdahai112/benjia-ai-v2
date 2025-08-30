"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import ProtectedRoute from "@/components/ProtectedRoute";
import MemberEditDialog from "@/components/MemberEditDialog";
import FamilyTreeLines from "@/components/FamilyTreeLines";
import { useAuth } from "@/contexts/AuthContext";
import { useFamilyMembers, type FamilyMember } from "@/contexts/FamilyMembersContext";
import { useFamilyCommunity } from "@/contexts/FamilyCommunityContext";
import { useAIServices } from "@/contexts/AIServicesContext";
import { useToast } from "@/hooks/use-toast";
import PhotoWall from "@/components/PhotoWall";
import FamilyCommunity from "@/components/FamilyCommunity";
import {
  ArrowLeft,
  Users,
  Plus,
  Heart,
  Calendar,
  MapPin,
  Phone,
  Camera,
  MessageSquare,
  Crown,
  Edit3,
  Trash2,
  UserPlus,
  Brain,
  Sparkles,
  BookOpen,
  Upload,
  Download,
  Clock,
  CheckCircle,
  Image as ImageIcon,
  Wand2
} from "lucide-react";
import Link from "next/link";

function FamilyHomePageContent() {
  const { user, family } = useAuth();
  const {
    members,
    getMembersByGeneration,
    canEditMember,
    deleteMember,
    isLoading
  } = useFamilyMembers();
  const { toast } = useToast();

  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [activeTab, setActiveTab] = useState("tree");
  const { getCommunityStats } = useFamilyCommunity();
  const {
    photoJobs,
    storyJobs,
    memorialJobs,
    submitPhotoRestore,
    submitMemorialCreation,
    getPhotoJobsByStatus
  } = useAIServices();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [addingGeneration, setAddingGeneration] = useState<number | null>(null);
  const [showRelationLines, setShowRelationLines] = useState(true);
  const treeContainerRef = useRef<HTMLDivElement>(null);

  // 加载状态
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full animate-pulse mx-auto mb-4"></div>
          <p className="text-gray-600">正在加载家族信息...</p>
        </div>
      </div>
    );
  }

  // 编辑成员
  const handleEditMember = (member: FamilyMember) => {
    if (!canEditMember(member.id)) {
      toast({
        title: "权限不足",
        description: "您没有权限编辑该成员信息",
        variant: "destructive"
      });
      return;
    }
    setEditingMember(member);
    setEditDialogOpen(true);
  };

  // 删除成员
  const handleDeleteMember = async (member: FamilyMember) => {
    if (!canEditMember(member.id)) {
      toast({
        title: "权限不足",
        description: "您没有权限删除该成员",
        variant: "destructive"
      });
      return;
    }

    if (member.isCurrentUser) {
      toast({
        title: "无法删除",
        description: "不能删除自己的信息",
        variant: "destructive"
      });
      return;
    }

    if (confirm(`确定要删除 ${member.name} 吗？此操作无法撤销。`)) {
      const success = await deleteMember(member.id);
      if (success) {
        toast({
          title: "删除成功",
          description: `${member.name} 已从家族中移除`
        });
      } else {
        toast({
          title: "删除失败",
          description: "请稍后重试",
          variant: "destructive"
        });
      }
    }
  };

  // 添加成员
  const handleAddMember = (generation: number) => {
    setAddingGeneration(generation);
    setEditingMember(null);
    setEditDialogOpen(true);
  };

  // 渲染家族成员卡片
  const renderFamilyMember = (member: FamilyMember) => {
    const canEdit = canEditMember(member.id);

    return (
      <div
        key={member.id}
        className="relative group"
        data-member-id={member.id}
      >
        <Link href={`/family-home/${member.id}`}>
          <div className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
            member.alive
              ? 'border-green-200 bg-green-50 hover:border-green-300'
              : 'border-gray-300 bg-gray-100 hover:border-gray-400'
          } ${member.isCurrentUser ? 'ring-2 ring-orange-400' : ''}`}
          >
          <Avatar className="w-12 h-12 mx-auto mb-2">
            <AvatarImage src={member.avatar} />
            <AvatarFallback className={member.alive ? "bg-green-200 text-green-700" : "bg-gray-200 text-gray-600"}>
              {member.name.slice(-2)}
            </AvatarFallback>
          </Avatar>
          <div className="text-center">
            <p className="font-medium text-gray-800 text-sm">{member.name}</p>
            <p className="text-xs text-gray-600 mb-1">{member.relation}</p>
            <p className="text-xs text-gray-500">
              {member.birth}{member.death && ` - ${member.death}`}
            </p>
            {member.isCurrentUser && (
              <Badge className="mt-1 bg-orange-100 text-orange-700 text-xs">本人</Badge>
            )}
            {member.occupation && (
              <p className="text-xs text-blue-600 mt-1">{member.occupation}</p>
            )}
          </div>
          </div>
        </Link>

        {/* 编辑按钮 */}
        {canEdit && (
          <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
            <Button
              size="sm"
              variant="outline"
              className="w-8 h-8 p-0 bg-white shadow-md hover:bg-blue-50"
              onClick={(e) => {
                e.stopPropagation();
                handleEditMember(member);
              }}
            >
              <Edit3 className="w-3 h-3 text-blue-600" />
            </Button>
            {!member.isCurrentUser && (
              <Button
                size="sm"
                variant="outline"
                className="w-8 h-8 p-0 bg-white shadow-md hover:bg-red-50"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteMember(member);
                }}
              >
                <Trash2 className="w-3 h-3 text-red-600" />
              </Button>
            )}
          </div>
        )}
      </div>
    );
  };

  // 渲染代数卡片
  const renderGenerationCard = (generation: number, title: string) => {
    const generationMembers = getMembersByGeneration(generation);
    const canAddMember = user?.role === 'admin';

    return (
      <Card key={generation} className="border-orange-200" data-generation={generation}>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center">
              <span className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm mr-2">
                {generation}
              </span>
              {title}
            </CardTitle>
            {canAddMember && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleAddMember(generation)}
                className="border-orange-200 hover:bg-orange-50"
              >
                <UserPlus className="w-4 h-4 mr-1" />
                添加
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {generationMembers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {generationMembers.map(renderFamilyMember)}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>暂无成员</p>
              {canAddMember && (
                <Button
                  variant="ghost"
                  onClick={() => handleAddMember(generation)}
                  className="mt-2 text-orange-600 hover:text-orange-700"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  添加第一位成员
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50">
      {/* 顶部导航 */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-orange-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/">
                <Button variant="outline" size="sm" className="border-orange-200 hover:bg-orange-50 text-orange-600">
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  返回首页
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-800">本家大院</h1>
                <p className="text-sm text-gray-600">{family?.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-sm">
                共 {members.length} 位成员
              </Badge>
              {user?.role === 'admin' && (
                <Badge className="bg-orange-100 text-orange-700 text-sm">
                  <Crown className="w-3 h-3 mr-1" />
                  管理员
                </Badge>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 标签切换 */}
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex space-x-2 mb-6 overflow-x-auto">
          <Button
            variant={activeTab === "tree" ? "default" : "outline"}
            onClick={() => setActiveTab("tree")}
            className={activeTab === "tree" ? "bg-orange-500 hover:bg-orange-600" : "border-orange-200"}
          >
            <Users className="w-4 h-4 mr-2" />
            五代族谱
          </Button>
          <Button
            variant={activeTab === "spaces" ? "default" : "outline"}
            onClick={() => setActiveTab("spaces")}
            className={activeTab === "spaces" ? "bg-orange-500 hover:bg-orange-600" : "border-orange-200"}
          >
            <Heart className="w-4 h-4 mr-2" />
            家人空间
          </Button>
          <Button
            variant={activeTab === "photos" ? "default" : "outline"}
            onClick={() => setActiveTab("photos")}
            className={activeTab === "photos" ? "bg-orange-500 hover:bg-orange-600" : "border-orange-200"}
          >
            <Camera className="w-4 h-4 mr-2" />
            照片墙
          </Button>
          <Button
            variant={activeTab === "community" ? "default" : "outline"}
            onClick={() => setActiveTab("community")}
            className={activeTab === "community" ? "bg-orange-500 hover:bg-orange-600" : "border-orange-200"}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            本家社区
          </Button>
          <Button
            variant={activeTab === "ai-services" ? "default" : "outline"}
            onClick={() => setActiveTab("ai-services")}
            className={activeTab === "ai-services" ? "bg-orange-500 hover:bg-orange-600" : "border-orange-200"}
          >
            <Brain className="w-4 h-4 mr-2" />
            AI服务
          </Button>
        </div>

        {/* 五代族谱 */}
        {activeTab === "tree" && (
          <div className="space-y-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{family?.surname}氏五代族谱</h2>
              <p className="text-gray-600">传承家族血脉，延续文化根基</p>
              {user?.role === 'admin' && (
                <p className="text-sm text-orange-600 mt-2">
                  <Crown className="w-4 h-4 inline mr-1" />
                  您是管理员，可以添加、编辑和删除家族成员
                </p>
              )}

              {/* 关系线控制 */}
              <div className="flex justify-center mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowRelationLines(!showRelationLines)}
                  className={`border-2 ${showRelationLines ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300'}`}
                >
                  {showRelationLines ? (
                    <>
                      <Heart className="w-4 h-4 mr-2" />
                      隐藏关系线
                    </>
                  ) : (
                    <>
                      <Users className="w-4 h-4 mr-2" />
                      显示关系线
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* 族谱容器 - 添加相对定位和ref */}
            <div ref={treeContainerRef} className="relative">
              {/* 关系线组件 */}
              {showRelationLines && (
                <FamilyTreeLines containerRef={treeContainerRef} />
              )}

              {/* 各代成员 */}
              <div className="space-y-8">
                {renderGenerationCard(1, "第一代（曾祖父母）")}
                {renderGenerationCard(2, "第二代（祖父母）")}
                {renderGenerationCard(3, "第三代（父母）")}
                {renderGenerationCard(4, "第四代（本代）")}
                {renderGenerationCard(5, "第五代（子女）")}
              </div>
            </div>
          </div>
        )}

        {/* 家人空间 */}
        {activeTab === "spaces" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {members.filter(member => member.alive).map(member => (
              <Card key={member.id} className="border-orange-200 hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="text-center pb-4">
                  <Avatar className="w-16 h-16 mx-auto mb-3">
                    <AvatarImage src={member.avatar} />
                    <AvatarFallback className="bg-orange-100 text-orange-600 text-xl">
                      {member.name.slice(-2)}
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle className="text-lg">{member.name}</CardTitle>
                  <CardDescription>{member.relation}</CardDescription>
                  {member.isCurrentUser && (
                    <Badge className="bg-orange-100 text-orange-700">我的空间</Badge>
                  )}
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>生于 {member.birth}</span>
                    </div>
                    {member.occupation && (
                      <div className="flex items-center">
                        <Crown className="w-4 h-4 mr-2" />
                        <span>{member.occupation}</span>
                      </div>
                    )}
                    <div className="flex items-center">
                      <Camera className="w-4 h-4 mr-2" />
                      <span>照片 0张</span>
                    </div>
                    <div className="flex items-center">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      <span>动态 0条</span>
                    </div>
                  </div>
                  <Link href={`/family-home/${member.id}`}>
                    <Button className="w-full mt-4 bg-orange-500 hover:bg-orange-600">
                      进入空间
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* 照片墙 */}
        {activeTab === "photos" && (
          <PhotoWall />
        )}

        {/* 本家社区 */}
        {activeTab === "community" && (
          <FamilyCommunity />
        )}

        {/* AI服务 */}
        {activeTab === "ai-services" && (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">本家AI智能服务</h2>
              <p className="text-gray-600">运用先进AI技术，为您的家族记忆提供专业服务</p>
            </div>

            {/* AI服务概览卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="border-blue-200 hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Camera className="w-8 h-8 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg">AI照片修复</CardTitle>
                  <CardDescription>
                    智能修复老旧、模糊、破损的家族照片
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>处理中:</span>
                      <span>{getPhotoJobsByStatus('processing').length}张</span>
                    </div>
                    <div className="flex justify-between">
                      <span>已完成:</span>
                      <span>{getPhotoJobsByStatus('completed').length}张</span>
                    </div>
                  </div>
                  <Link href="/ai-photo-restore">
                    <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700">
                      开始修复照片
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="border-green-200 hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-8 h-8 text-green-600" />
                  </div>
                  <CardTitle className="text-lg">AI家族故事</CardTitle>
                  <CardDescription>
                    智能生成精彩的家族传奇故事
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>生成中:</span>
                      <span>{storyJobs.filter(j => j.status === 'generating').length}个</span>
                    </div>
                    <div className="flex justify-between">
                      <span>已完成:</span>
                      <span>{storyJobs.filter(j => j.status === 'completed').length}个</span>
                    </div>
                  </div>
                  <Link href="/ai-family-story">
                    <Button className="w-full mt-4 bg-green-600 hover:bg-green-700">
                      创作家族故事
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="border-purple-200 hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-8 h-8 text-purple-600" />
                  </div>
                  <CardTitle className="text-lg">AI纪念空间</CardTitle>
                  <CardDescription>
                    为逝去的亲人创建温馨纪念空间
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>创建中:</span>
                      <span>{memorialJobs.filter(j => j.status === 'creating').length}个</span>
                    </div>
                    <div className="flex justify-between">
                      <span>已完成:</span>
                      <span>{memorialJobs.filter(j => j.status === 'completed').length}个</span>
                    </div>
                  </div>
                  <Link href="/ai-memorial">
                    <Button className="w-full mt-4 bg-purple-600 hover:bg-purple-700">
                      创建纪念空间
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>

            {/* 最近的AI任务 */}
            <Card className="border-orange-200">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-orange-600" />
                  最近的AI任务
                </CardTitle>
                <CardDescription>
                  查看您最近提交的AI处理任务进度
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* 照片修复任务 */}
                  {photoJobs.slice(0, 3).map(job => (
                    <div key={job.id} className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Camera className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            照片{job.type === 'restore' ? '修复' : job.type === 'colorize' ? '上色' : '增强'}
                          </p>
                          <p className="text-sm text-gray-600">
                            {job.status === 'processing' ? '处理中...' :
                             job.status === 'completed' ? '已完成' :
                             job.status === 'failed' ? '处理失败' : '上传中...'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {job.status === 'completed' && (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        )}
                        {job.status === 'processing' && (
                          <div className="w-8 h-2 bg-gray-200 rounded-full">
                            <div
                              className="h-full bg-blue-500 rounded-full transition-all"
                              style={{ width: `${job.progress}%` }}
                            ></div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* 家族故事任务 */}
                  {storyJobs.slice(0, 2).map(job => (
                    <div key={job.id} className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <BookOpen className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{job.title}</p>
                          <p className="text-sm text-gray-600">
                            {job.status === 'generating' ? '生成中...' :
                             job.status === 'completed' ? '已完成' : '生成失败'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {job.status === 'completed' && (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        )}
                        {job.status === 'generating' && (
                          <div className="w-8 h-2 bg-gray-200 rounded-full">
                            <div
                              className="h-full bg-green-500 rounded-full transition-all"
                              style={{ width: `${job.progress}%` }}
                            ></div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* 纪念空间任务 */}
                  {memorialJobs.slice(0, 2).map(job => (
                    <div key={job.id} className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Heart className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{job.deceasedName} 纪念空间</p>
                          <p className="text-sm text-gray-600">
                            {job.status === 'creating' ? '创建中...' :
                             job.status === 'completed' ? '已完成' : '创建失败'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {job.status === 'completed' && (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        )}
                        {job.status === 'creating' && (
                          <div className="w-8 h-2 bg-gray-200 rounded-full">
                            <div
                              className="h-full bg-purple-500 rounded-full transition-all"
                              style={{ width: `${job.progress}%` }}
                            ></div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {photoJobs.length === 0 && storyJobs.length === 0 && memorialJobs.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Brain className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p>还没有AI任务记录</p>
                      <p className="text-sm">开始使用AI服务，这里将显示任务进度</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 快速操作 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-dashed border-2 border-gray-300 hover:border-blue-400 cursor-pointer transition-colors">
                <CardContent className="p-6 text-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-600">快速上传照片修复</p>
                  <p className="text-xs text-gray-500">拖拽或点击上传</p>
                </CardContent>
              </Card>

              <Card className="border-dashed border-2 border-gray-300 hover:border-green-400 cursor-pointer transition-colors">
                <CardContent className="p-6 text-center">
                  <Wand2 className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-600">一键生成家族故事</p>
                  <p className="text-xs text-gray-500">基于现有信息</p>
                </CardContent>
              </Card>

              <Card className="border-dashed border-2 border-gray-300 hover:border-purple-400 cursor-pointer transition-colors">
                <CardContent className="p-6 text-center">
                  <Heart className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-600">创建纪念空间</p>
                  <p className="text-xs text-gray-500">温馨缅怀</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* 家人详情弹窗 */}
      {selectedMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedMember(null)}>
          <Card className="w-full max-w-md border-orange-200" onClick={e => e.stopPropagation()}>
            <CardHeader className="text-center">
              <Avatar className="w-20 h-20 mx-auto mb-4">
                <AvatarImage src={selectedMember.avatar} />
                <AvatarFallback className="bg-orange-100 text-orange-600 text-2xl">
                  {selectedMember.name.slice(-2)}
                </AvatarFallback>
              </Avatar>
              <CardTitle className="text-xl">{selectedMember.name}</CardTitle>
              <CardDescription className="text-lg">{selectedMember.relation}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center">
                <Calendar className="w-5 h-5 mr-3 text-gray-500" />
                <div>
                  <p className="font-medium">出生日期</p>
                  <p className="text-gray-600">{selectedMember.birth}</p>
                </div>
              </div>
              {selectedMember.death && (
                <div className="flex items-center">
                  <Heart className="w-5 h-5 mr-3 text-gray-500" />
                  <div>
                    <p className="font-medium">仙逝</p>
                    <p className="text-gray-600">{selectedMember.death}</p>
                  </div>
                </div>
              )}
              {selectedMember.occupation && (
                <div className="flex items-center">
                  <Crown className="w-5 h-5 mr-3 text-gray-500" />
                  <div>
                    <p className="font-medium">职业</p>
                    <p className="text-gray-600">{selectedMember.occupation}</p>
                  </div>
                </div>
              )}
              {selectedMember.bio && (
                <div>
                  <p className="font-medium mb-2">个人简介</p>
                  <p className="text-gray-600 text-sm">{selectedMember.bio}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-2 pt-4">
                <Button variant="outline" size="sm">
                  <Camera className="w-4 h-4 mr-1" />
                  查看照片
                </Button>
                <Button variant="outline" size="sm">
                  <MessageSquare className="w-4 h-4 mr-1" />
                  查看动态
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {canEditMember(selectedMember.id) && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedMember(null);
                      handleEditMember(selectedMember);
                    }}
                  >
                    <Edit3 className="w-4 h-4 mr-1" />
                    编辑
                  </Button>
                )}
                <Button
                  className="bg-orange-500 hover:bg-orange-600"
                  onClick={() => setSelectedMember(null)}
                >
                  关闭
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 成员编辑对话框 */}
      <MemberEditDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        member={editingMember}
        generation={addingGeneration || 4}
      />
    </div>
  );
}

export default function FamilyHomePage() {
  return (
    <ProtectedRoute>
      <FamilyHomePageContent />
    </ProtectedRoute>
  );
}
