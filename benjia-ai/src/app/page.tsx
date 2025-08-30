"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import {
  Home,
  Users,
  Camera,
  Heart,
  Sparkles,
  Brain,
  TreePine,
  MessageSquare,
  Clock,
  Star,
  ArrowRight,
  Phone,
  Mail,
  ChevronDown,
  Play,
  Shield,
  Award,
  Globe
} from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  // 如果已登录，重定向到家族大院
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/family-home");
    }
  }, [isAuthenticated, router]);

  // 轮播见证
  const testimonials = [
    {
      content: "本家AI让我们的家族故事得以完整保存，孩子们终于了解了祖辈的传奇经历。",
      author: "李女士",
      role: "三代同堂家庭",
      avatar: "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=80&h=80&fit=crop&crop=face"
    },
    {
      content: "通过AI修复，爷爷奶奶的老照片重新焕发光彩，仿佛回到了那个年代。",
      author: "王先生",
      role: "家族史研究者",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face"
    },
    {
      content: "五代族谱功能帮助我们梳理了复杂的家族关系，每个人都找到了自己的位置。",
      author: "张阿姨",
      role: "大家族管理员",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face"
    }
  ];

  // 自动切换见证
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  return (
    <div className="min-h-screen">
      {/* 导航栏 */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <Home className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">本家AI</h1>
                <p className="text-xs text-gray-600">家族文化传承平台</p>
              </div>
            </div>

            <nav className="hidden md:flex items-center space-x-8">
              <a href="#family-home" className="text-gray-700 hover:text-orange-600 transition-colors">本家大院</a>
              <a href="#ai-services" className="text-gray-700 hover:text-orange-600 transition-colors">AI服务</a>
              <a href="#testimonials" className="text-gray-700 hover:text-orange-600 transition-colors">用户见证</a>
              <a href="#about" className="text-gray-700 hover:text-orange-600 transition-colors">关于我们</a>
            </nav>

            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost" className="text-gray-700 hover:text-orange-600">
                  登录
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white">
                  开始使用
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* 背景图片 - 明快的树林天空，预示家族兴旺 */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1745299039187-46e5364d6d9b?w=1920&h=1080&fit=crop&crop=center"
            alt="明快的森林天空，生机勃勃"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center">
            {/* 主要内容 */}
            <div className="text-white text-center max-w-4xl">
              <div className="inline-flex items-center px-4 py-2 bg-orange-500/20 backdrop-blur-sm rounded-full text-orange-200 text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4 mr-2" />
                AI驱动的家族文化传承
              </div>

              <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-6">
                让家族记忆
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400">
                  永世传承
                </span>
              </h1>

              <p className="text-xl text-gray-200 leading-relaxed mb-8 max-w-lg">
                用AI科技重塑家族文化传承方式，从五代族谱到珍贵照片修复，从家族故事到纪念空间，让每一份情感都得到最好的保存和传递。
              </p>

              <div className="flex justify-center mb-8">
                <Link href="/register">
                  <Button size="lg" className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-4 text-lg">
                    <Heart className="w-5 h-5 mr-2" />
                    免费创建家族
                  </Button>
                </Link>
              </div>

              {/* 特色标签 */}
              <div className="flex flex-wrap gap-3">
                <Badge variant="secondary" className="bg-white/20 text-white px-3 py-1">
                  <Brain className="w-4 h-4 mr-1" />
                  AI智能修复
                </Badge>
                <Badge variant="secondary" className="bg-white/20 text-white px-3 py-1">
                  <TreePine className="w-4 h-4 mr-1" />
                  五代族谱
                </Badge>
                <Badge variant="secondary" className="bg-white/20 text-white px-3 py-1">
                  <Shield className="w-4 h-4 mr-1" />
                  永久保存
                </Badge>
              </div>
            </div>


          </div>
        </div>

        {/* 滚动指示器 */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white">
          <div className="animate-bounce">
            <ChevronDown className="w-6 h-6" />
          </div>
        </div>
      </section>



      {/* 本家大院介绍 */}
      <section id="family-home" className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-medium mb-6">
              <Home className="w-4 h-4 mr-2" />
              本家大院
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              您的专属家族数字空间
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              集照片墙、家族动态、五代族谱于一体的综合家族管理平台，让每个家族都拥有属于自己的数字家园
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-6">
                打造属于您家族的数字大院
              </h3>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                本家大院是您家族的专属数字空间，整合了照片墙展示、家族动态分享、五代族谱管理等核心功能。让家族成员无论身在何处，都能感受到家的温暖与联系。
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                {[
                  { icon: Camera, title: "照片墙", desc: "珍贵影像集中展示", count: "1000+" },
                  { icon: MessageSquare, title: "家族动态", desc: "实时分享生活点滴", count: "365天" },
                  { icon: TreePine, title: "五代族谱", desc: "完整家族关系图谱", count: "5代" }
                ].map((feature, index) => (
                  <div key={index} className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg mb-4">
                      <feature.icon className="w-6 h-6 text-orange-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">{feature.title}</h4>
                    <p className="text-sm text-gray-600 mb-2">{feature.desc}</p>
                    <div className="text-orange-600 font-bold text-lg">{feature.count}</div>
                  </div>
                ))}
              </div>

              <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white">
                <Home className="w-4 h-4 mr-2" />
                进入本家大院
              </Button>
            </div>

            <div className="relative">
              <img
                src="https://static-cse.canva.com/blob/1134304/graph_family-trees_promo-showcase_03-min.jpg"
                alt="本家大院功能展示"
                className="rounded-2xl shadow-xl"
              />
              <div className="absolute -bottom-4 -right-4 bg-white rounded-xl shadow-lg p-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-gray-700">23位家族成员在线</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI服务展示 */}
      <section id="ai-services" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6">
              <Brain className="w-4 h-4 mr-2" />
              AI智能服务
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              先进AI技术，重塑家族记忆传承
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              运用前沿人工智能技术，为您的家族记忆提供专业的修复、整理和传承服务
            </p>
          </div>

          {/* AI照片修复 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
            <div>
              <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6">
                <Camera className="w-4 h-4 mr-2" />
                AI照片修复
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-6">
                让珍贵回忆重新焕发光彩
              </h3>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                运用先进的AI修复技术，自动修复老旧、模糊、破损的家族照片。无论是泛黄的老照片，还是破损的历史影像，都能通过智能算法恢复清晰度，还原真实色彩。
              </p>
              <div className="grid grid-cols-2 gap-6 mb-8">
                {[
                  { title: "智能修复", desc: "自动识别并修复照片缺陷" },
                  { title: "色彩还原", desc: "恢复照片原有的真实色彩" },
                  { title: "清晰增强", desc: "提升照片分辨率和清晰度" },
                  { title: "批量处理", desc: "支持大量照片同时修复" }
                ].map((feature, index) => (
                  <div key={index} className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">{feature.title}</h4>
                      <p className="text-sm text-gray-600">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/ai-photo-restore">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Camera className="w-4 h-4 mr-2" />
                  立即体验修复
                </Button>
              </Link>
            </div>
            <div className="relative">
              <img
                src="https://cfcdn.unblurimage.ai/blogs/turn-old-family-photos-into-hd-memories/before-after-comparison.webp"
                alt="AI照片修复前后对比"
                className="rounded-2xl shadow-xl"
              />
              <div className="absolute -bottom-4 -right-4 bg-white rounded-xl shadow-lg p-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-gray-700">AI修复中...</span>
                </div>
              </div>
            </div>
          </div>

          {/* AI家族故事 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
            <div className="order-2 lg:order-1">
              <img
                src="https://cdn.prod.website-files.com/615c0fadc8e1d78fcc34e6f0/683841b752bc563e42ea38c7_DescribeTheFauna_Storyworth_27%20(2).png"
                alt="AI家族故事生成"
                className="rounded-2xl shadow-xl"
              />
            </div>
            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4 mr-2" />
                AI家族故事
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-6">
                智能生成专属家族传奇
              </h3>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                基于家族照片、记录和成员提供的信息，AI智能生成精彩的家族故事。将零散的记忆片段串联成完整的家族传奇，让后代能够深入了解家族历史和文化传承。
              </p>
              <div className="space-y-4 mb-8">
                {[
                  "智能分析家族照片和文档资料",
                  "自动生成个性化家族故事章节",
                  "支持多种故事风格和叙述方式",
                  "可导出为精美的数字家族史书"
                ].map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    </div>
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
              <Link href="/ai-family-story">
                <Button className="bg-green-600 hover:bg-green-700 text-white">
                  <Sparkles className="w-4 h-4 mr-2" />
                  生成家族故事
                </Button>
              </Link>
            </div>
          </div>

          {/* AI纪念空间 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium mb-6">
                <Heart className="w-4 h-4 mr-2" />
                AI纪念空间
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-6">
                用科技延续永恒的爱与思念
              </h3>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                为逝去的亲人创建个性化的数字纪念空间。AI技术能够整理生前照片、视频和回忆，营造温馨的纪念氛围，让思念以最美好的方式得以延续和表达。
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {[
                  { icon: Camera, title: "影像纪念", desc: "珍贵照片永久保存" },
                  { icon: MessageSquare, title: "留言追思", desc: "家人朋友深情寄语" },
                  { icon: Star, title: "纪念活动", desc: "重要日期温馨提醒" },
                  { icon: Heart, title: "情感陪伴", desc: "AI智能情感支持" }
                ].map((feature, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <feature.icon className="w-6 h-6 text-purple-600 mb-2" />
                    <h4 className="font-semibold text-gray-900 mb-1">{feature.title}</h4>
                    <p className="text-sm text-gray-600">{feature.desc}</p>
                  </div>
                ))}
              </div>
              <Link href="/ai-memorial">
                <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                  <Heart className="w-4 h-4 mr-2" />
                  创建纪念空间
                </Button>
              </Link>
            </div>
            <div className="relative">
              <img
                src="https://www.honoryou.com/content/uploads/2024/09/DALL%C2%B7E-2024-09-17-16.27.59-A-serene-outdoor-scene-where-a-tablet-or-laptop-is-placed-on-a-wooden-table-displaying-a-peaceful-digital-memorial-interface-with-images-of-flowers-a-1.webp"
                alt="AI纪念空间界面"
                className="rounded-2xl shadow-xl"
              />
              <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-purple-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">永恒的爱</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 用户见证与数据展示 */}
      <section id="testimonials" className="py-20 bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              千万家庭的信赖之选
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              用数据见证家族文化传承的力量，用真实故事分享用户的温暖体验
            </p>
          </div>

          {/* 数据展示 */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {[
              { number: "50万+", label: "服务家庭", icon: Home },
              { number: "1200万+", label: "修复照片", icon: Camera },
              { number: "98.5%", label: "用户满意度", icon: Heart },
              { number: "永久", label: "数据保存", icon: Shield }
            ].map((stat, index) => (
              <div key={index} className="text-center bg-white rounded-2xl p-6 shadow-md">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl mb-4">
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* 用户见证轮播 */}
          <div className="relative max-w-4xl mx-auto">
            <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-6">
                  <img
                    src={testimonials[currentTestimonial].avatar}
                    alt={testimonials[currentTestimonial].author}
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
                <blockquote className="text-2xl font-medium text-gray-900 mb-6 leading-relaxed">
                  "{testimonials[currentTestimonial].content}"
                </blockquote>
                <div className="text-center">
                  <div className="font-semibold text-gray-900">
                    {testimonials[currentTestimonial].author}
                  </div>
                  <div className="text-gray-600">
                    {testimonials[currentTestimonial].role}
                  </div>
                </div>
              </div>
            </div>

            {/* 指示器 */}
            <div className="flex justify-center mt-8 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentTestimonial ? 'bg-orange-500' : 'bg-gray-300'
                  }`}
                  onClick={() => setCurrentTestimonial(index)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 关于我们 */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium mb-6">
                <Globe className="w-4 h-4 mr-2" />
                关于本家AI
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                科技赋能家族文化传承的领航者
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                本家AI致力于用最先进的人工智能技术，帮助每个家庭更好地保存、整理和传承珍贵的家族记忆。我们相信，每个家族都有属于自己的独特故事，值得被完整地记录和传承给后代。
              </p>

              <div className="space-y-6 mb-8">
                {[
                  {
                    title: "技术创新",
                    desc: "采用业界领先的AI算法，不断提升服务质量",
                    icon: Brain
                  },
                  {
                    title: "用户至上",
                    desc: "以用户需求为核心，打造最贴心的产品体验",
                    icon: Heart
                  },
                  {
                    title: "文化传承",
                    desc: "致力于弘扬家族文化，促进家庭和谐发展",
                    icon: TreePine
                  }
                ].map((value, index) => (
                  <div key={index} className="flex items-start">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                      <value.icon className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">{value.title}</h4>
                      <p className="text-gray-600">{value.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-6 p-6 bg-gray-50 rounded-xl">
                {[
                  { number: "2024", label: "成立年份" },
                  { number: "50+", label: "技术专家" },
                  { number: "7×24", label: "贴心服务" }
                ].map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl font-bold text-orange-600 mb-1">{stat.number}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-orange-100 to-red-100 rounded-3xl p-8">
                <img
                  src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&h=600&fit=crop"
                  alt="团队协作"
                  className="rounded-2xl shadow-lg w-full"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">行业领先</div>
                    <div className="text-sm text-gray-600">AI技术创新</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-gray-900 via-orange-900 to-red-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            开始您的家族文化传承之旅
          </h2>
          <p className="text-xl text-orange-100 mb-8 max-w-3xl mx-auto">
            立即注册本家AI，为您的家族创建永恒的数字记忆空间，让爱与记忆跨越时空传承
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-4 text-lg">
                <Heart className="w-5 h-5 mr-2" />
                免费创建家族
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 px-8 py-4 text-lg">
              <Phone className="w-5 h-5 mr-2" />
              联系专属顾问
            </Button>
          </div>

          {/* 信任标识 */}
          <div className="mt-12 pt-8 border-t border-white/20">
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 text-orange-200">
              <div className="flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                <span>数据安全认证</span>
              </div>
              <div className="flex items-center">
                <Award className="w-5 h-5 mr-2" />
                <span>行业领先技术</span>
              </div>
              <div className="flex items-center">
                <Globe className="w-5 h-5 mr-2" />
                <span>全球用户信赖</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                  <Home className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-bold text-white">本家AI</span>
              </div>
              <p className="text-gray-400 mb-4">
                让家族文化传承更美好，用科技连接情感，让爱跨越时空。
              </p>
              <div className="flex space-x-4">
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                  <Phone className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                  <Mail className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">产品功能</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-orange-400 transition-colors">AI照片修复</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors">五代族谱</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors">家族故事</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors">纪念空间</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">解决方案</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-orange-400 transition-colors">家庭用户</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors">大家族管理</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors">家谱研究</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors">文化传承</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">支持与帮助</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-orange-400 transition-colors">使用指南</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors">常见问题</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors">联系客服</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors">用户社区</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 本家AI. 让家族文化传承更美好.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
