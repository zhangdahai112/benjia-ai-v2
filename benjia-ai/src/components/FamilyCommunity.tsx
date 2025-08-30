"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFamilyCommunity, type Post } from "@/contexts/FamilyCommunityContext";
import { useFamilyMembers } from "@/contexts/FamilyMembersContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  MessageSquare,
  Heart,
  Share2,
  Eye,
  Plus,
  Send,
  Calendar,
  MapPin,
  Image,
  Video,
  Music,
  MoreHorizontal
} from "lucide-react";

interface FamilyCommunityProps {
  className?: string;
}

export default function FamilyCommunity({ className }: FamilyCommunityProps) {
  const {
    getAllPosts,
    addPost,
    likePost,
    addComment,
    getPostComments,
    getCommunityStats
  } = useFamilyCommunity();
  const { members } = useFamilyMembers();
  const { user } = useAuth();
  const { toast } = useToast();

  const [newPostContent, setNewPostContent] = useState("");
  const [newPostTags, setNewPostTags] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [commentContents, setCommentContents] = useState<Record<string, string>>({});

  const posts = getAllPosts();
  const stats = getCommunityStats();

  // 处理发布新动态
  const handleCreatePost = async () => {
    if (!user || !newPostContent.trim()) return;

    setIsPosting(true);
    try {
      const tags = newPostTags.split(',').map(tag => tag.trim()).filter(Boolean);

      const success = await addPost({
        authorId: user.id,
        authorName: user.name,
        authorAvatar: user.avatar,
        content: newPostContent.trim(),
        media: [],
        tags,
        visibility: 'family',
        familyId: user.familyId
      });

      if (success) {
        toast({
          title: "发布成功",
          description: "您的动态已发布到家族社区"
        });
        setNewPostContent("");
        setNewPostTags("");
        setShowNewPostForm(false);
      } else {
        toast({
          title: "发布失败",
          description: "请稍后重试",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "发布失败",
        description: "网络错误，请稍后重试",
        variant: "destructive"
      });
    } finally {
      setIsPosting(false);
    }
  };

  // 处理点赞
  const handleLike = async (postId: string) => {
    const success = await likePost(postId);
    if (success) {
      toast({
        title: "点赞成功",
        description: "感谢您的支持！"
      });
    }
  };

  // 处理评论
  const handleComment = async (postId: string) => {
    const content = commentContents[postId];
    if (!content?.trim()) return;

    const success = await addComment(postId, content.trim());
    if (success) {
      setCommentContents(prev => ({ ...prev, [postId]: "" }));
      toast({
        title: "评论成功",
        description: "您的评论已发布"
      });
    }
  };

  // 渲染动态项
  const renderPost = (post: Post) => {
    const postComments = getPostComments(post.id);
    const author = members.find(m => m.id === post.authorId);

    return (
      <Card key={post.id} className="border-orange-200">
        <CardHeader className="pb-4">
          <div className="flex items-start space-x-3">
            <Avatar className="w-12 h-12">
              <AvatarImage src={post.authorAvatar} />
              <AvatarFallback className="bg-orange-100 text-orange-600">
                {post.authorName.slice(-2)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h4 className="font-medium">{post.authorName}</h4>
                <span className="text-sm text-gray-500">
                  {author?.relation}
                </span>
                <span className="text-sm text-gray-400">
                  {post.createdAt.toLocaleString()}
                </span>
              </div>
              {post.location && (
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <MapPin className="w-4 h-4 mr-1" />
                  {post.location}
                </div>
              )}
            </div>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="space-y-4">
            {/* 动态内容 */}
            <p className="text-gray-800 leading-relaxed">{post.content}</p>

            {/* 媒体内容 */}
            {post.media.length > 0 && (
              <div className="grid grid-cols-1 gap-3">
                {post.media.map(media => (
                  <div key={media.id} className="rounded-lg overflow-hidden">
                    {media.type === 'image' && (
                      <img
                        src={media.url}
                        alt={media.description}
                        className="w-full max-h-96 object-cover"
                      />
                    )}
                    {media.type === 'video' && (
                      <div className="aspect-video bg-gray-100 flex items-center justify-center">
                        <Video className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* 标签 */}
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* 互动按钮 */}
            <div className="flex items-center justify-between pt-3 border-t">
              <div className="flex items-center space-x-6">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleLike(post.id)}
                  className="text-gray-600 hover:text-red-500"
                >
                  <Heart className="w-4 h-4 mr-1" />
                  {post.likeCount}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:text-blue-500"
                >
                  <MessageSquare className="w-4 h-4 mr-1" />
                  {post.commentCount}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:text-green-500"
                >
                  <Share2 className="w-4 h-4 mr-1" />
                  分享
                </Button>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Eye className="w-4 h-4 mr-1" />
                {post.viewCount}
              </div>
            </div>

            {/* 评论区 */}
            {postComments.length > 0 && (
              <div className="space-y-3 pt-3 border-t">
                {postComments.slice(0, 3).map(comment => (
                  <div key={comment.id} className="flex space-x-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={comment.authorAvatar} />
                      <AvatarFallback className="bg-gray-100 text-gray-600 text-sm">
                        {comment.authorName.slice(-2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-sm">{comment.authorName}</span>
                          <span className="text-xs text-gray-500">
                            {comment.createdAt.toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{comment.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {postComments.length > 3 && (
                  <Button variant="ghost" size="sm" className="w-full">
                    查看全部 {postComments.length} 条评论
                  </Button>
                )}
              </div>
            )}

            {/* 评论输入 */}
            <div className="flex space-x-3 pt-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback className="bg-orange-100 text-orange-600 text-sm">
                  {user?.name.slice(-2)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 flex space-x-2">
                <Input
                  placeholder="写点什么..."
                  value={commentContents[post.id] || ""}
                  onChange={(e) => setCommentContents(prev => ({
                    ...prev,
                    [post.id]: e.target.value
                  }))}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleComment(post.id);
                    }
                  }}
                />
                <Button
                  size="sm"
                  onClick={() => handleComment(post.id)}
                  disabled={!commentContents[post.id]?.trim()}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className={`space-y-6 ${className || ''}`}>
      {/* 社区统计 */}
      <Card className="border-orange-200">
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageSquare className="w-5 h-5 mr-2 text-orange-600" />
            本家社区
          </CardTitle>
          <CardDescription>
            家族成员共发布了 {stats.totalPosts} 条动态，今日新增 {stats.todayPosts} 条
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.totalPosts}</div>
              <p className="text-sm text-gray-600">总动态</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalPhotos}</div>
              <p className="text-sm text-gray-600">照片</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.activeMembers}</div>
              <p className="text-sm text-gray-600">活跃成员</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.todayPosts}</div>
              <p className="text-sm text-gray-600">今日动态</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 发布新动态 */}
      <Card className="border-orange-200">
        <CardContent className="p-4">
          {!showNewPostForm ? (
            <Button
              onClick={() => setShowNewPostForm(true)}
              className="w-full bg-orange-500 hover:bg-orange-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              分享新动态
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="bg-orange-100 text-orange-600">
                    {user?.name.slice(-2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-3">
                  <Textarea
                    placeholder="分享您的家族故事..."
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    rows={3}
                  />
                  <Input
                    placeholder="添加标签（用逗号分隔）"
                    value={newPostTags}
                    onChange={(e) => setNewPostTags(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Image className="w-4 h-4 mr-1" />
                    照片
                  </Button>
                  <Button variant="outline" size="sm">
                    <Video className="w-4 h-4 mr-1" />
                    视频
                  </Button>
                  <Button variant="outline" size="sm">
                    <MapPin className="w-4 h-4 mr-1" />
                    位置
                  </Button>
                </div>

                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowNewPostForm(false)}
                  >
                    取消
                  </Button>
                  <Button
                    onClick={handleCreatePost}
                    disabled={isPosting || !newPostContent.trim()}
                    className="bg-orange-500 hover:bg-orange-600"
                  >
                    {isPosting ? "发布中..." : "发布"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 动态列表 */}
      <div className="space-y-6">
        {posts.length === 0 ? (
          <Card className="border-orange-200">
            <CardContent className="text-center py-12">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">暂无动态</h3>
              <p className="text-gray-500">家族成员还没有发布动态，快来分享第一条动态吧！</p>
            </CardContent>
          </Card>
        ) : (
          posts.map(renderPost)
        )}
      </div>
    </div>
  );
}
