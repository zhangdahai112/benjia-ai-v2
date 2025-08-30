"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PhotoRestoreUpload from "@/components/PhotoRestoreUpload";
import { useAIServices, type PhotoRestoreJob } from "@/contexts/AIServicesContext";
import {
  Camera,
  Brain,
  Sparkles,
  Upload,
  Download,
  CheckCircle,
  Star,
  Clock,
  Shield,
  Zap,
  ArrowRight,
  Play,
  Users,
  Award
} from "lucide-react";
import Link from "next/link";

export default function AIPhotoRestorePage() {
  const [activeStep, setActiveStep] = useState(0);
  const [completedJobs, setCompletedJobs] = useState<PhotoRestoreJob[]>([]);
  const { photoJobs, getPhotoJobsByStatus } = useAIServices();

  const handleJobComplete = (job: PhotoRestoreJob) => {
    setCompletedJobs(prev => [job, ...prev]);
  };

  const steps = [
    {
      title: "上传照片",
      desc: "支持JPG、PNG等多种格式",
      icon: Upload
    },
    {
      title: "AI智能分析",
      desc: "自动识别照片损伤程度",
      icon: Brain
    },
    {
      title: "精准修复",
      desc: "还原色彩、增强清晰度",
      icon: Sparkles
    },
    {
      title: "下载保存",
      desc: "获得高清修复后的照片",
      icon: Download
    }
  ];

  const features = [
    {
      icon: Brain,
      title: "智能识别",
      desc: "AI自动识别照片中的人物、物体和背景，精准定位需要修复的区域"
    },
    {
      icon: Sparkles,
      title: "色彩还原",
      desc: "智能分析原始色彩，自动去除泛黄、褪色等问题，还原真实色彩"
    },
    {
      icon: Zap,
      title: "清晰增强",
      desc: "提升照片分辨率和清晰度，让模糊的细节重新变得清晰可见"
    },
    {
      icon: Shield,
      title: "损伤修复",
      desc: "修复划痕、污渍、折痕等物理损伤，让老照片焕然一新"
    },
    {
      icon: Clock,
      title: "快速处理",
      desc: "通常在1-3分钟内完成修复，大幅提升工作效率"
    },
    {
      icon: CheckCircle,
      title: "批量处理",
      desc: "支持同时上传多张照片进行批量修复，节省宝贵时间"
    }
  ];

  const beforeAfterExamples = [
    {
      before: "https://www.restory.pics/blog/restore_ancestry_photos_ai/restory-restore-old-family-photos-with-ai-easy-realistic-colorize-old-photos-in-one-click-before-and-after-3.webp",
      title: "严重破损照片修复",
      desc: "修复大面积破损和污渍"
    },
    {
      before: "https://cfcdn.unblurimage.ai/blogs/turn-old-family-photos-into-hd-memories/before-after-comparison.webp",
      title: "老旧照片清晰化",
      desc: "提升分辨率和清晰度"
    },
    {
      before: "https://strapi-wasabi-bucket-prod-cdn.phot.ai/Why_restore_old_pictures_e952de8c3a.webp",
      title: "色彩还原处理",
      desc: "去除泛黄，还原真实色彩"
    }
  ];

  const testimonials = [
    {
      content: "修复效果超出了我的预期，爷爷的军装照片重新变得清晰，仿佛回到了当年。",
      author: "李明",
      role: "家族史爱好者",
      rating: 5
    },
    {
      content: "操作简单，几分钟就能完成修复，质量非常好，强烈推荐给大家。",
      author: "王芳",
      role: "普通用户",
      rating: 5
    },
    {
      content: "批量修复功能很实用，一次性处理了50多张老照片，效果都很满意。",
      author: "张教授",
      role: "退休教师",
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
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <Camera className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">本家AI</h1>
                <p className="text-xs text-gray-600">AI照片修复</p>
              </div>
            </Link>

            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost">返回首页</Button>
              </Link>
              <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white">
                开始修复
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6">
              <Brain className="w-4 h-4 mr-2" />
              AI智能修复技术
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              让珍贵回忆重新
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                焕发光彩
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              运用先进的人工智能技术，自动修复老旧、模糊、破损的家族照片。无论多么严重的损伤，都能通过智能算法让珍贵记忆重获新生。
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4">
                <Camera className="w-5 h-5 mr-2" />
                立即开始修复
              </Button>
              <Button size="lg" variant="outline" className="px-8 py-4">
                <Play className="w-5 h-5 mr-2" />
                观看演示视频
              </Button>
            </div>

            {/* 特色标签 */}
            <div className="flex flex-wrap justify-center gap-3">
              <Badge variant="secondary" className="bg-blue-100 text-blue-700 px-3 py-1">
                <Zap className="w-4 h-4 mr-1" />
                1-3分钟快速修复
              </Badge>
              <Badge variant="secondary" className="bg-purple-100 text-purple-700 px-3 py-1">
                <Shield className="w-4 h-4 mr-1" />
                隐私安全保护
              </Badge>
              <Badge variant="secondary" className="bg-green-100 text-green-700 px-3 py-1">
                <CheckCircle className="w-4 h-4 mr-1" />
                支持批量处理
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* 照片修复工具 */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              开始修复您的照片
            </h2>
            <p className="text-xl text-gray-600">
              上传照片，AI将自动识别问题并进行智能修复
            </p>
          </div>

          <PhotoRestoreUpload onJobComplete={handleJobComplete} />

          {/* 最近完成的修复 */}
          {completedJobs.length > 0 && (
            <div className="mt-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">最近完成的修复</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedJobs.slice(0, 6).map(job => (
                  <Card key={job.id} className="overflow-hidden">
                    <div className="aspect-video relative">
                      <img
                        src={job.restoredImage}
                        alt="修复后的照片"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-green-500 text-white">
                          {job.type === 'restore' ? '修复' :
                           job.type === 'colorize' ? '上色' :
                           job.type === 'enhance' ? '增强' : '降噪'}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <p className="text-sm text-gray-600">
                        完成于 {job.completedAt?.toLocaleString()}
                      </p>
                      <Button
                        size="sm"
                        className="w-full mt-2"
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = job.restoredImage || '';
                          link.download = `restored_photo_${job.id}.jpg`;
                          link.click();
                        }}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        下载
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 修复步骤 */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              简单四步，轻松修复
            </h2>
            <p className="text-xl text-gray-600">
              无需专业技能，AI自动完成所有复杂工作
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`relative cursor-pointer transition-all duration-300 ${
                  activeStep === index ? 'transform scale-105' : ''
                }`}
                onMouseEnter={() => setActiveStep(index)}
              >
                <Card className={`h-full ${activeStep === index ? 'ring-2 ring-blue-500 shadow-lg' : ''}`}>
                  <CardHeader className="text-center">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 mx-auto ${
                      activeStep === index
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500'
                        : 'bg-gray-100'
                    }`}>
                      <step.icon className={`w-8 h-8 ${
                        activeStep === index ? 'text-white' : 'text-gray-600'
                      }`} />
                    </div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 ${
                      activeStep === index
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {index + 1}
                    </div>
                  </CardHeader>
                  <CardContent className="text-center">
                    <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
                    <p className="text-sm text-gray-600">{step.desc}</p>
                  </CardContent>
                </Card>

                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="w-6 h-6 text-gray-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 核心功能 */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              强大的AI修复能力
            </h2>
            <p className="text-xl text-gray-600">
              专业级别的修复效果，让每张照片都重获新生
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="h-full hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
                    <feature.icon className="w-6 h-6 text-blue-600" />
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

      {/* 修复效果展示 */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              真实修复效果展示
            </h2>
            <p className="text-xl text-gray-600">
              见证AI技术带来的惊人变化
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {beforeAfterExamples.map((example, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video relative">
                  <img
                    src={example.before}
                    alt={example.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-red-500 text-white">修复前</Badge>
                  </div>
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-green-500 text-white">修复后</Badge>
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-2">{example.title}</h3>
                  <p className="text-gray-600">{example.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 用户评价 */}
      <section className="py-20 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              用户真实评价
            </h2>
            <p className="text-xl text-gray-600">
              听听用户对我们AI修复服务的评价
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="h-full">
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
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            准备好修复您的珍贵照片了吗？
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            立即开始，让AI技术为您的家族记忆注入新的生命力
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4">
              <Camera className="w-5 h-5 mr-2" />
              开始免费修复
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 px-8 py-4">
              <Users className="w-5 h-5 mr-2" />
              联系专业顾问
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 text-blue-200">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              <span>免费试用</span>
            </div>
            <div className="flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              <span>隐私保护</span>
            </div>
            <div className="flex items-center">
              <Award className="w-5 h-5 mr-2" />
              <span>专业品质</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
