"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AIStoryGenerator from "@/components/AIStoryGenerator";
import { useAIServices, type FamilyStoryJob } from "@/contexts/AIServicesContext";
import {
  BookOpen,
  Brain,
  Sparkles,
  Upload,
  FileText,
  CheckCircle,
  Star,
  Clock,
  Users,
  Wand2,
  ArrowRight,
  Play,
  Download,
  Share2,
  Heart,
  PenTool,
  Image as ImageIcon,
  MessageSquare,
  Bot
} from "lucide-react";
import Link from "next/link";

export default function AIFamilyStoryPage() {
  const [completedStories, setCompletedStories] = useState<FamilyStoryJob[]>([]);
  const { storyJobs } = useAIServices();

  const handleStoryComplete = (story: FamilyStoryJob) => {
    setCompletedStories(prev => [story, ...prev]);
  };

  const features = [
    {
      icon: MessageSquare,
      title: "智能对话",
      desc: "与AI助手对话，分享家族信息和故事细节"
    },
    {
      icon: PenTool,
      title: "个性化创作",
      desc: "根据家族特色和用户偏好，生成独一无二的故事风格"
    },
    {
      icon: ImageIcon,
      title: "照片分析",
      desc: "AI分析上传的家族照片，提取故事元素和情感"
    },
    {
      icon: Brain,
      title: "智能生成",
      desc: "运用先进的大语言模型，创作精彩的家族传奇"
    },
    {
      icon: Wand2,
      title: "多种体裁",
      desc: "支持传记、纪实、散文等多种文学体裁"
    },
    {
      icon: Download,
      title: "多格式输出",
      desc: "支持文本、PDF等多种格式，便于分享和保存"
    }
  ];

  const storyStyles = [
    {
      title: "传统家族史",
      desc: "按时间顺序记录家族发展历程",
      example: "从祖辈创业到家族兴旺，完整记录每一个重要时刻...",
      color: "bg-amber-100 text-amber-700"
    },
    {
      title: "人物传记",
      desc: "聚焦家族重要人物的生平故事",
      example: "爷爷的创业传奇、奶奶的持家智慧，每个人都是家族的英雄...",
      color: "bg-blue-100 text-blue-700"
    },
    {
      title: "温情回忆录",
      desc: "以情感为主线的家族故事",
      example: "那些温暖的家庭时光、难忘的节日聚会，爱在字里行间流淌...",
      color: "bg-pink-100 text-pink-700"
    },
    {
      title: "励志成长录",
      desc: "记录家族奋斗与成就的故事",
      example: "从贫困到富裕，从平凡到辉煌，见证家族的华丽蜕变...",
      color: "bg-green-100 text-green-700"
    }
  ];

  const creationSteps = [
    {
      title: "创建项目",
      desc: "选择故事风格和写作偏好",
      icon: FileText
    },
    {
      title: "上传照片",
      desc: "上传珍贵的家族照片",
      icon: Upload
    },
    {
      title: "AI对话",
      desc: "与AI助手分享家族信息",
      icon: MessageSquare
    },
    {
      title: "生成故事",
      desc: "AI创作完整的家族传奇",
      icon: Sparkles
    }
  ];

  const testimonials = [
    {
      content: "AI生成的家族故事比我预想的要精彩得多，连我都不知道的家族历史都被挖掘出来了。",
      author: "刘教授",
      role: "退休历史学者",
      rating: 5
    },
    {
      content: "通过与AI对话，我重新整理了家族的记忆，故事内容丰富感人，全家人都很喜欢。",
      author: "陈女士",
      role: "家庭主妇",
      rating: 5
    },
    {
      content: "孩子们看了AI创作的家族故事后，对家族历史产生了浓厚兴趣，这正是我想要的效果。",
      author: "马先生",
      role: "企业高管",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">本家AI</h1>
                <p className="text-xs text-gray-600">AI家族故事</p>
              </div>
            </Link>

            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost">返回首页</Button>
              </Link>
              <Link href="/family-home">
                <Button className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white">
                  进入家族
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-6">
              <Bot className="w-4 h-4 mr-2" />
              AI智能创作助手
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              与AI对话，
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600">
                谱写家族传奇
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              通过上传照片和智能对话，AI将帮您创作独一无二的家族故事。先进的大语言模型技术，让每个家族的记忆都能得到最完美的表达。
            </p>

            <div className="flex flex-wrap justify-center gap-3 mb-8">
              <Badge variant="secondary" className="bg-green-100 text-green-700 px-3 py-1">
                <MessageSquare className="w-4 h-4 mr-1" />
                智能对话创作
              </Badge>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700 px-3 py-1">
                <ImageIcon className="w-4 h-4 mr-1" />
                照片智能分析
              </Badge>
              <Badge variant="secondary" className="bg-purple-100 text-purple-700 px-3 py-1">
                <Brain className="w-4 h-4 mr-1" />
                大语言模型
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* AI故事生成器 */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              开始创作您的家族故事
            </h2>
            <p className="text-xl text-gray-600">
              与AI助手对话，上传照片，一起创作专属的家族传奇
            </p>
          </div>

          <AIStoryGenerator onJobComplete={handleStoryComplete} />
        </div>
      </section>

      {/* 故事风格展示 */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              多样化的故事风格
            </h2>
            <p className="text-xl text-gray-600">
              选择最适合您家族特色的故事风格和表达方式
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {storyStyles.map((style, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-4 ${style.color}`}>
                    {style.title}
                  </div>
                  <CardTitle className="text-xl">{style.title}</CardTitle>
                  <CardDescription>{style.desc}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 italic bg-gray-50 p-4 rounded-lg">
                    "{style.example}"
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 创作流程 */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              简单四步，轻松创作
            </h2>
            <p className="text-xl text-gray-600">
              AI助手全程指导，让故事创作变得简单有趣
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {creationSteps.map((step, index) => (
              <div key={index} className="relative text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl mb-4">
                  <step.icon className="w-8 h-8 text-white" />
                </div>
                <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold mx-auto mb-4">
                  {index + 1}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-600">{step.desc}</p>

                {index < creationSteps.length - 1 && (
                  <div className="hidden md:block absolute top-8 -right-4 transform">
                    <ArrowRight className="w-6 h-6 text-gray-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 核心功能 */}
      <section className="py-20 bg-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              强大的AI创作能力
            </h2>
            <p className="text-xl text-gray-600">
              先进的人工智能技术，让每个家族故事都独一无二
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="h-full hover:shadow-lg transition-shadow bg-white">
                <CardHeader>
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4">
                    <feature.icon className="w-6 h-6 text-green-600" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 已完成的故事 */}
      {completedStories.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                最近完成的作品
              </h2>
              <p className="text-xl text-gray-600">
                看看您创作的精彩家族故事
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {completedStories.slice(0, 6).map((story) => (
                <Card key={story.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{story.title}</CardTitle>
                    <CardDescription>
                      完成于 {story.completedAt?.toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-gray-600 mb-4">
                      {story.chatHistory.length} 轮对话 • {story.uploadedPhotos.length} 张照片
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1">
                        <Download className="w-4 h-4 mr-2" />
                        下载
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Share2 className="w-4 h-4 mr-2" />
                        分享
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 用户评价 */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              用户创作体验
            </h2>
            <p className="text-xl text-gray-600">
              听听用户对AI家族故事创作的真实感受
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="h-full bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <blockquote className="text-gray-900 mb-4">
                    "{testimonial.content}"
                  </blockquote>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.author}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 立即开始 */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            准备好创作您的家族传奇了吗？
          </h2>
          <p className="text-xl text-green-100 mb-8">
            与AI助手一起，将珍贵的家族记忆编织成永恒的故事
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100 px-8 py-4">
              <MessageSquare className="w-5 h-5 mr-2" />
              开始与AI对话
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 px-8 py-4">
              <Users className="w-5 h-5 mr-2" />
              了解更多功能
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 text-green-200">
            <div className="flex items-center">
              <Brain className="w-5 h-5 mr-2" />
              <span>AI智能创作</span>
            </div>
            <div className="flex items-center">
              <MessageSquare className="w-5 h-5 mr-2" />
              <span>互动对话</span>
            </div>
            <div className="flex items-center">
              <Star className="w-5 h-5 mr-2" />
              <span>专业品质</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
