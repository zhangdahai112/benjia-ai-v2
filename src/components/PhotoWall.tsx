"use client";

import { useState, useMemo, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useFamilyCommunity, type PostMedia } from "@/contexts/FamilyCommunityContext";
import { useFamilyMembers } from "@/contexts/FamilyMembersContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  Camera,
  Heart,
  MessageSquare,
  Eye,
  Search,
  Filter,
  Grid3X3,
  List,
  Calendar,
  User,
  Download,
  Share2,
  X,
  ChevronLeft,
  ChevronRight,
  Upload,
  Plus,
  ImagePlus,
  Loader2
} from "lucide-react";

interface PhotoWithPost {
  photo: PostMedia;
  postId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  createdAt: Date;
  likeCount: number;
  commentCount: number;
}

type SortBy = 'newest' | 'oldest' | 'mostLiked' | 'mostCommented';
type FilterBy = 'all' | 'thisWeek' | 'thisMonth' | 'thisYear';
type ViewMode = 'grid' | 'list';

export default function PhotoWall() {
  const { getAllPosts, likePost } = useFamilyCommunity();
  const { members } = useFamilyMembers();
  const { user } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>('newest');
  const [filterBy, setFilterBy] = useState<FilterBy>('all');
  const [selectedAuthor, setSelectedAuthor] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoWithPost | null>(null);

  // 获取带动态信息的照片数据
  const photosWithPosts = useMemo(() => {
    const posts = getAllPosts();
    const photos: PhotoWithPost[] = [];

    posts.forEach(post => {
      post.media.filter(media => media.type === 'image').forEach(photo => {
        photos.push({
          photo,
          postId: post.id,
          authorId: post.authorId,
          authorName: post.authorName,
          authorAvatar: post.authorAvatar,
          content: post.content,
          createdAt: post.createdAt,
          likeCount: post.likeCount,
          commentCount: post.commentCount
        });
      });
    });

    return photos;
  }, [getAllPosts]);

  // 过滤和排序照片
  const filteredAndSortedPhotos = useMemo(() => {
    let filtered = photosWithPosts;

    // 搜索过滤
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.photo.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // 作者过滤
    if (selectedAuthor !== 'all') {
      filtered = filtered.filter(item => item.authorId === selectedAuthor);
    }

    // 时间过滤
    if (filterBy !== 'all') {
      const now = new Date();
      const startDate = new Date();

      switch (filterBy) {
        case 'thisWeek':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'thisMonth':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'thisYear':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      filtered = filtered.filter(item => item.createdAt >= startDate);
    }

    // 排序
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return b.createdAt.getTime() - a.createdAt.getTime();
        case 'oldest':
          return a.createdAt.getTime() - b.createdAt.getTime();
        case 'mostLiked':
          return b.likeCount - a.likeCount;
        case 'mostCommented':
          return b.commentCount - a.commentCount;
        default:
          return 0;
      }
    });

    return filtered;
  }, [photosWithPosts, searchQuery, selectedAuthor, filterBy, sortBy]);

  // 处理点赞
  const handleLike = async (postId: string) => {
    await likePost(postId);
  };

  // 渲染网格视图
  const renderGridView = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {filteredAndSortedPhotos.map((item, index) => (
        <div
          key={`${item.postId}-${item.photo.id}`}
          className="aspect-square relative group cursor-pointer overflow-hidden rounded-lg border border-orange-200 hover:shadow-lg transition-all"
          onClick={() => setSelectedPhoto(item)}
        >
          <img
            src={item.photo.url}
            alt={item.photo.description || '家族照片'}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
            <div className="p-3 text-white text-sm">
              <div className="flex items-center space-x-3">
                <div className="flex items-center">
                  <Heart className="w-4 h-4 mr-1" />
                  {item.likeCount}
                </div>
                <div className="flex items-center">
                  <MessageSquare className="w-4 h-4 mr-1" />
                  {item.commentCount}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // 渲染列表视图
  const renderListView = () => (
    <div className="space-y-6">
      {filteredAndSortedPhotos.map((item, index) => (
        <Card key={`${item.postId}-${item.photo.id}`} className="border-orange-200">
          <CardContent className="p-6">
            <div className="flex space-x-4">
              <Avatar className="w-12 h-12">
                <AvatarImage src={item.authorAvatar} />
                <AvatarFallback className="bg-orange-100 text-orange-600">
                  {item.authorName.slice(-2)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-3">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{item.authorName}</span>
                  <span className="text-sm text-gray-500">
                    {item.createdAt.toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-700">{item.content}</p>
                <div
                  className="relative aspect-video max-w-md cursor-pointer rounded-lg overflow-hidden"
                  onClick={() => setSelectedPhoto(item)}
                >
                  <img
                    src={item.photo.url}
                    alt={item.photo.description || '家族照片'}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="flex items-center space-x-6 text-sm text-gray-600">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLike(item.postId)}
                    className="text-gray-600 hover:text-red-500"
                  >
                    <Heart className="w-4 h-4 mr-1" />
                    {item.likeCount}
                  </Button>
                  <Button variant="ghost" size="sm" className="text-gray-600">
                    <MessageSquare className="w-4 h-4 mr-1" />
                    {item.commentCount}
                  </Button>
                  <Button variant="ghost" size="sm" className="text-gray-600">
                    <Share2 className="w-4 h-4 mr-1" />
                    分享
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* 顶部统计 */}
      <Card className="border-orange-200">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Camera className="w-5 h-5 mr-2 text-orange-600" />
            家族照片墙
          </CardTitle>
          <CardDescription>
            珍藏家族美好时光，共计 {photosWithPosts.length} 张照片
          </CardDescription>
        </CardHeader>
      </Card>

      {/* 搜索和过滤 */}
      <Card className="border-orange-200">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="搜索照片、作者或描述..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={selectedAuthor} onValueChange={setSelectedAuthor}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="选择作者" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有作者</SelectItem>
                {members.map(member => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterBy} onValueChange={(value: FilterBy) => setFilterBy(value)}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部时间</SelectItem>
                <SelectItem value="thisWeek">本周</SelectItem>
                <SelectItem value="thisMonth">本月</SelectItem>
                <SelectItem value="thisYear">本年</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(value: SortBy) => setSortBy(value)}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">最新</SelectItem>
                <SelectItem value="oldest">最早</SelectItem>
                <SelectItem value="mostLiked">最多点赞</SelectItem>
                <SelectItem value="mostCommented">最多评论</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex border rounded-md">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="border-none rounded-r-none"
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="border-none rounded-l-none"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 照片展示 */}
      {filteredAndSortedPhotos.length === 0 ? (
        <Card className="border-orange-200">
          <CardContent className="text-center py-12">
            <Camera className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">暂无照片</h3>
            <p className="text-gray-500">
              {searchQuery || selectedAuthor !== 'all' || filterBy !== 'all'
                ? "没有找到符合条件的照片"
                : "家族成员还没有上传照片"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {viewMode === 'grid' ? renderGridView() : renderListView()}
        </>
      )}

      {/* 照片详情弹窗 */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50" onClick={() => setSelectedPhoto(null)}>
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center space-x-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={selectedPhoto.authorAvatar} />
                  <AvatarFallback className="bg-orange-100 text-orange-600">
                    {selectedPhoto.authorName.slice(-2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedPhoto.authorName}</p>
                  <p className="text-sm text-gray-500">
                    {selectedPhoto.createdAt.toLocaleString()}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedPhoto(null)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="flex flex-col lg:flex-row max-h-[calc(90vh-120px)]">
              <div className="flex-1 flex items-center justify-center bg-gray-100">
                <img
                  src={selectedPhoto.photo.url}
                  alt={selectedPhoto.photo.description || '家族照片'}
                  className="max-w-full max-h-full object-contain"
                />
              </div>

              <div className="w-full lg:w-96 p-4 space-y-4 overflow-y-auto">
                <p className="text-gray-700">{selectedPhoto.content}</p>

                {selectedPhoto.photo.description && (
                  <p className="text-sm text-gray-600">{selectedPhoto.photo.description}</p>
                )}

                <div className="flex items-center space-x-6 py-3 border-t border-b">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLike(selectedPhoto.postId)}
                    className="text-gray-600 hover:text-red-500"
                  >
                    <Heart className="w-5 h-5 mr-2" />
                    {selectedPhoto.likeCount}
                  </Button>
                  <Button variant="ghost" size="sm" className="text-gray-600">
                    <MessageSquare className="w-5 h-5 mr-2" />
                    {selectedPhoto.commentCount}
                  </Button>
                  <Button variant="ghost" size="sm" className="text-gray-600">
                    <Share2 className="w-5 h-5 mr-2" />
                    分享
                  </Button>
                  <Button variant="ghost" size="sm" className="text-gray-600">
                    <Download className="w-5 h-5 mr-2" />
                    下载
                  </Button>
                </div>

                <div className="text-sm text-gray-500">
                  <p>拍摄时间：{selectedPhoto.createdAt.toLocaleDateString()}</p>
                  <p>上传者：{selectedPhoto.authorName}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
