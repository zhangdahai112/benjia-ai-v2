"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { useFamilyMembers, type FamilyMember } from "@/contexts/FamilyMembersContext";
import { useMemberContent, type ContentItem, type ContentType } from "@/contexts/MemberContentContext";
import ContentUploadDialog from "@/components/ContentUploadDialog";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Camera,
  Video,
  Music,
  FileText,
  Plus,
  Heart,
  MessageSquare,
  Eye,
  Calendar,
  MapPin,
  Briefcase,
  Upload,
  Play,
  Download,
  Settings,
  Share2,
  MoreHorizontal
} from "lucide-react";
import Link from "next/link";

function MemberSpacePageContent() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { getMemberById } = useFamilyMembers();
  const {
    getMemberContents,
    getContentStats,
    likeContent,
    canEditContent,
    isLoading: contentLoading
  } = useMemberContent();
  const { toast } = useToast();

  const memberId = params?.memberId as string;
  const [member, setMember] = useState<FamilyMember | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedContentType, setSelectedContentType] = useState<ContentType | 'all'>('all');
  const [showUploadDialog, setShowUploadDialog] = useState(false);

  // 加载成员信息
  useEffect(() => {
    if (memberId) {
      const foundMember = getMemberById(memberId);
      if (foundMember) {
        setMember(foundMember);
      } else {
        toast({
          title: "成员不存在",
          description: "找不到指定的家族成员",
          variant: "destructive"
        });
        router.push("/family-home");
      }
    }
  }, [memberId, getMemberById, router, toast]);

  if (!member) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full animate-pulse mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  const memberContents = getMemberContents(member.id);
  const contentStats = getContentStats(member.id);
  const isOwnSpace = member.isCurrentUser || user?.id === member.id;
  const canEdit = canEditContent(member.id) || user?.role === 'admin';

  // 根据内容类型过滤
  const filteredContents = selectedContentType === 'all'
    ? memberContents
    : memberContents.filter(content => content.type === selectedContentType);

  // 处理点赞
  const handleLike = async (contentId: string) => {
    const success = await likeContent(contentId);
    if (success) {
      toast({
        title: "点赞成功",
        description: "感谢您的支持！"
      });
    }
  };

  // 渲染内容项
  const renderContentItem = (content: ContentItem) => {
    return (
      <Card key={content.id} className="border-orange-200 hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg">{content.title}</CardTitle>
              {content.description && (
                <CardDescription className="mt-1">{content.description}</CardDescription>
              )}
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {content.createdAt.toLocaleDateString()}
                </div>
                <div className="flex items-center">
                  <Eye className="w-4 h-4 mr-1" />
                  {content.viewCount}
                </div>
              </div>
            </div>
            <Badge variant="outline" className="text-xs">
              {content.type === 'photo' && '照片'}
              {content.type === 'video' && '视频'}
              {content.type === 'audio' && '音频'}
              {content.type === 'article' && '文章'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {/* 内容预览 */}
          {content.type === 'photo' && content.fileUrl && (
            <div className="aspect-video bg-gray-100 rounded-lg mb-4 overflow-hidden">
              <img
                src={content.fileUrl}
                alt={content.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {content.type === 'video' && content.fileUrl && (
            <div className="aspect-video bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
              <Button variant="outline" size="lg" className="h-16 w-16 rounded-full">
                <Play className="w-8 h-8" />
              </Button>
            </div>
          )}

          {content.type === 'audio' && content.fileUrl && (
            <div className="bg-gray-100 rounded-lg p-4 mb-4 flex items-center space-x-4">
              <Button variant="outline" size="sm" className="rounded-full">
                <Play className="w-4 h-4" />
              </Button>
              <div className="flex-1">
                <div className="h-2 bg-gray-200 rounded-full">
                  <div className="h-2 bg-orange-500 rounded-full w-1/3"></div>
                </div>
              </div>
              <span className="text-sm text-gray-500">2:30</span>
            </div>
          )}

          {content.type === 'article' && (
            <div className="mb-4">
              <p className="text-gray-700 line-clamp-3">
                {content.content?.slice(0, 200)}...
              </p>
            </div>
          )}

          {/* 标签 */}
          {content.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {content.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* 互动按钮 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleLike(content.id)}
                className="text-gray-600 hover:text-red-500"
              >
                <Heart className="w-4 h-4 mr-1" />
                {content.likeCount}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:text-blue-500"
              >
                <MessageSquare className="w-4 h-4 mr-1" />
                {content.commentCount}
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <Share2 className="w-4 h-4" />
              </Button>
              {content.type !== 'article' && (
                <Button variant="ghost" size="sm">
                  <Download className="w-4 h-4" />
                </Button>
              )}
              {canEditContent(content.id) && (
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50">
      {/* 顶部导航 */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-orange-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/family-home">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-800">{member.name}的空间</h1>
                <p className="text-sm text-gray-600">{member.relation}</p>
              </div>
            </div>
            {canEdit && (
              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => setShowUploadDialog(true)}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  添加内容
                </Button>
                <Button variant="outline">
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 左侧个人信息 */}
          <div className="lg:col-span-1 space-y-6">
            {/* 基本信息卡片 */}
            <Card className="border-orange-200">
              <CardHeader className="text-center">
                <Avatar className="w-24 h-24 mx-auto mb-4">
                  <AvatarImage src={member.avatar} />
                  <AvatarFallback className="bg-orange-100 text-orange-600 text-2xl">
                    {member.name.slice(-2)}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="text-xl">{member.name}</CardTitle>
                <CardDescription className="text-lg">{member.relation}</CardDescription>
                {isOwnSpace && (
                  <Badge className="bg-orange-100 text-orange-700 mt-2">我的空间</Badge>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-sm">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                    <span>生于 {member.birth}</span>
                  </div>
                  {member.death && (
                    <div className="flex items-center">
                      <Heart className="w-4 h-4 mr-2 text-gray-500" />
                      <span>逝于 {member.death}</span>
                    </div>
                  )}
                  {member.occupation && (
                    <div className="flex items-center">
                      <Briefcase className="w-4 h-4 mr-2 text-gray-500" />
                      <span>{member.occupation}</span>
                    </div>
                  )}
                </div>
                {member.bio && (
                  <div>
                    <h4 className="font-medium mb-2">个人简介</h4>
                    <p className="text-sm text-gray-700">{member.bio}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 内容统计 */}
            <Card className="border-orange-200">
              <CardHeader>
                <CardTitle className="text-lg">内容统计</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {contentStats.totalContents}
                    </div>
                    <p className="text-xs text-gray-600">总内容</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {contentStats.photoCount}
                    </div>
                    <p className="text-xs text-gray-600">照片</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {contentStats.videoCount}
                    </div>
                    <p className="text-xs text-gray-600">视频</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {contentStats.articleCount}
                    </div>
                    <p className="text-xs text-gray-600">文章</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 右侧内容区域 */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">概览</TabsTrigger>
                <TabsTrigger value="photos">照片</TabsTrigger>
                <TabsTrigger value="media">影音</TabsTrigger>
                <TabsTrigger value="articles">文章</TabsTrigger>
              </TabsList>

              {/* 概览页面 */}
              <TabsContent value="overview" className="space-y-6">
                {/* 内容类型过滤 */}
                <div className="flex items-center space-x-4">
                  <h3 className="font-medium">内容类型：</h3>
                  <div className="flex space-x-2">
                    {[
                      { key: 'all', label: '全部', icon: null },
                      { key: 'photo', label: '照片', icon: Camera },
                      { key: 'video', label: '视频', icon: Video },
                      { key: 'audio', label: '音频', icon: Music },
                      { key: 'article', label: '文章', icon: FileText }
                    ].map(type => {
                      const Icon = type.icon;
                      return (
                        <Button
                          key={type.key}
                          variant={selectedContentType === type.key ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedContentType(type.key as ContentType | 'all')}
                          className={selectedContentType === type.key ? "bg-orange-500 hover:bg-orange-600" : ""}
                        >
                          {Icon && <Icon className="w-4 h-4 mr-1" />}
                          {type.label}
                        </Button>
                      );
                    })}
                  </div>
                </div>

                {/* 内容列表 */}
                <div className="space-y-4">
                  {filteredContents.length === 0 ? (
                    <Card className="border-orange-200">
                      <CardContent className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <FileText className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">暂无内容</h3>
                        <p className="text-gray-500 mb-4">
                          {isOwnSpace ? "开始上传您的第一个内容吧！" : `${member.name}还没有分享任何内容`}
                        </p>
                        {canEdit && (
                          <Button
                            onClick={() => setShowUploadDialog(true)}
                            className="bg-orange-500 hover:bg-orange-600"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            添加内容
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ) : (
                    filteredContents.map(renderContentItem)
                  )}
                </div>
              </TabsContent>

              {/* 照片页面 */}
              <TabsContent value="photos" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getMemberContents(member.id, 'photo').map(photo => (
                    <Card key={photo.id} className="border-orange-200 overflow-hidden">
                      <div className="aspect-square relative">
                        <img
                          src={photo.fileUrl}
                          alt={photo.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button variant="secondary" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            查看
                          </Button>
                        </div>
                      </div>
                      <CardContent className="p-3">
                        <h4 className="font-medium truncate">{photo.title}</h4>
                        <p className="text-sm text-gray-600 truncate">{photo.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* 影音页面 */}
              <TabsContent value="media" className="space-y-6">
                <div className="space-y-4">
                  {[...getMemberContents(member.id, 'video'), ...getMemberContents(member.id, 'audio')].map(renderContentItem)}
                </div>
              </TabsContent>

              {/* 文章页面 */}
              <TabsContent value="articles" className="space-y-6">
                <div className="space-y-4">
                  {getMemberContents(member.id, 'article').map(renderContentItem)}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* 内容上传对话框 */}
      <ContentUploadDialog
        open={showUploadDialog}
        onOpenChange={setShowUploadDialog}
        memberId={member.id}
      />
    </div>
  );
}

export default function MemberSpacePage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full animate-pulse mx-auto mb-4"></div>
            <p className="text-gray-600">加载中...</p>
          </div>
        </div>
      }>
        <MemberSpacePageContent />
      </Suspense>
    </ProtectedRoute>
  );
}
