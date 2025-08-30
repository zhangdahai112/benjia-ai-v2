"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  Brain,
  Sparkles,
  Upload,
  MessageSquare,
  CheckCircle,
  Star,
  Clock,
  Users,
  Flame,
  ArrowRight,
  Play,
  Download,
  Share2,
  Camera,
  Calendar,
  Music,
  Shield,
  Flower,
  BookOpen
} from "lucide-react";
import Link from "next/link";

export default function AIMemorialPage() {
  const [activeFeature, setActiveFeature] = useState(0);

  const memorialFeatures = [
    {
      title: "数字相册",
      desc: "珍贵照片永久保存，智能整理分类",
      icon: Camera,
      preview: "AI自动整理逝者生前照片，按时间、地点、人物智能分类，创建温馨的数字相册..."
    },
    {
      title: "思念留言",
      desc: "家人朋友可留下深情寄语",
      icon: MessageSquare,
      preview: "家人和朋友可以在这里留下对逝者的思念和回忆，这些珍贵的话语将永远保存..."
    },
    {
      title: "纪念活动",
      desc: "重要日期智能提醒，温馨纪念",
      icon: Calendar,
      preview: "生日、忌日等重要日期智能提醒，组织线上纪念活动，让思念有所寄托..."
    },
    {
      title: "音乐陪伴",
      desc: "播放逝者喜爱的音乐，营造氛围",
      icon: Music,
      preview: "播放逝者生前喜爱的歌曲，或者安静的轻音乐，为纪念空间营造温馨氛围..."
    }
  ];

  const features = [
    {
      icon: Heart,
      title: "温馨设计",
      desc: "采用温暖的色调和柔和的界面设计，营造安静祥和的纪念氛围"
    },
    {
      icon: Shield,
      title: "隐私保护",
      desc: "严格的隐私控制，只有被授权的家人朋友才能访问纪念空间"
    },
    {
      icon: Brain,
      title: "AI整理",
      desc: "智能整理逝者的照片、视频和文字资料，自动生成生平回顾"
    },
    {
      icon: Sparkles,
      title: "个性化定制",
      desc: "根据逝者的性格特点和生前喜好，定制专属的纪念空间风格"
    },
    {
      icon: Clock,
      title: "永久保存",
      desc: "云端永久保存，确保珍贵记忆不会丢失，随时可以回访"
    },
    {
      icon: Share2,
      title: "便捷分享",
      desc: "支持生成纪念链接，方便与远方的亲友分享和共同纪念"
    }
  ];

  const creationSteps = [
    {
      title: "创建空间",
      desc: "填写逝者基本信息，选择纪念主题",
      icon: Heart,
      details: "输入逝者姓名、生卒年月等基本信息，选择合适的纪念主题风格"
    },
    {
      title: "上传资料",
      desc: "上传照片、视频等珍贵资料",
      icon: Upload,
      details: "支持照片、视频、音频、文档等多种格式，AI自动分类整理"
    },
    {
      title: "AI生成",
      desc: "AI智能生成生平回顾和纪念内容",
      icon: Brain,
      details: "基于上传的资料，AI自动生成温馨的生平回顾和纪念文字"
    },
    {
      title: "个性化设置",
      desc: "调整空间布局和功能设置",
      icon: Sparkles,
      details: "自定义空间颜色、背景音乐、访问权限等个性化设置"
    },
    {
      title: "邀请访问",
      desc: "邀请家人朋友共同纪念",
      icon: Users,
      details: "生成邀请链接，邀请亲友访问纪念空间，共同留下思念"
    },
    {
      title: "持续更新",
      desc: "定期更新内容，保持纪念的活跃",
      icon: Clock,
      details: "可以随时添加新的照片、留言，让纪念空间充满生机"
    }
  ];

  const memorialStyles = [
    {
      title: "花园主题",
      desc: "以花卉和自然为背景的温馨风格",
      image: "https://cdn.shopify.com/s/files/1/0556/4258/7328/files/DALL_E_2024-11-15_10.35.55_-_Create_an_image_of_a_virtual_memorial_candle_lighting_ceremony._Depict_a_glowing_candle_on_a_soft_background_with_a_warm_inviting_light._Add_subtle_d_480x480.webp?v=1731688565",
      features: ["鲜花背景", "自然音效", "柔和色调"]
    },
    {
      title: "蜡烛主题",
      desc: "以温暖烛光为主的静谧纪念风格",
      image: "https://cdn.shopify.com/s/files/1/0556/4258/7328/files/DALL_E_2024-11-15_12.49.12_-_Create_an_image_of_custom_photo_memorial_candles_with_a_softly_glowing_flame_featuring_a_clear_space_for_a_personalized_photo_of_a_loved_one_along_wi_480x480.webp?v=1731696560",
      features: ["虚拟蜡烛", "温暖光效", "宁静氛围"]
    },
    {
      title: "现代简约",
      desc: "简洁大方的现代设计风格",
      image: "https://www.allenfamilyfuneraloptions.com/wp-content/uploads/Digital-Memorials.jpg",
      features: ["简洁界面", "现代设计", "清爽布局"]
    }
  ];

  const testimonials = [
    {
      content: "为妈妈创建的纪念空间让我们一家人都能随时怀念她，每次看到都很温暖。",
      author: "李女士",
      role: "失独母亲",
      rating: 5
    },
    {
      content: "AI整理的爷爷生平回顾写得很感人，连我们都不记得的细节都被记录下来了。",
      author: "王先生",
      role: "孙子",
      rating: 5
    },
    {
      content: "海外的亲戚也能通过纪念空间参与祭奠，科技让我们的思念没有距离。",
      author: "张阿姨",
      role: "海外华人",
      rating: 5
    }
  ];

  const comfortFeatures = [
    {
      icon: Flower,
      title: "虚拟献花",
      desc: "选择不同的鲜花表达思念之情"
    },
    {
      icon: Flame,
      title: "点亮心灯",
      desc: "为逝者点亮虚拟蜡烛，寄托哀思"
    },
    {
      icon: Music,
      title: "静心音乐",
      desc: "播放安静的音乐，抚慰悲伤的心灵"
    },
    {
      icon: BookOpen,
      title: "回忆录",
      desc: "AI生成的温馨回忆录，记录美好时光"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">本家AI</h1>
                <p className="text-xs text-gray-600">AI纪念空间</p>
              </div>
            </Link>

            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost">返回首页</Button>
              </Link>
              <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                创建纪念空间
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium mb-6">
              <Heart className="w-4 h-4 mr-2" />
              温馨纪念空间
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              用科技延续
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                永恒的爱与思念
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              为逝去的亲人创建个性化的数字纪念空间。AI技术智能整理生前照片、视频和回忆，营造温馨的纪念氛围，让思念以最美好的方式得以延续和表达。
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4">
                <Heart className="w-5 h-5 mr-2" />
                创建纪念空间
              </Button>
              <Button size="lg" variant="outline" className="px-8 py-4">
                <Play className="w-5 h-5 mr-2" />
                查看演示
              </Button>
            </div>

            {/* 特色标签 */}
            <div className="flex flex-wrap justify-center gap-3">
              <Badge variant="secondary" className="bg-purple-100 text-purple-700 px-3 py-1">
                <Shield className="w-4 h-4 mr-1" />
                隐私保护
              </Badge>
              <Badge variant="secondary" className="bg-pink-100 text-pink-700 px-3 py-1">
                <Clock className="w-4 h-4 mr-1" />
                永久保存
              </Badge>
              <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 px-3 py-1">
                <Sparkles className="w-4 h-4 mr-1" />
                AI智能整理
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* 纪念功能 */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              贴心的纪念功能
            </h2>
            <p className="text-xl text-gray-600">
              每一个功能都充满关怀，让思念有所寄托
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {memorialFeatures.map((feature, index) => (
              <Card
                key={index}
                className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                  activeFeature === index ? 'ring-2 ring-purple-500 shadow-lg' : ''
                }`}
                onClick={() => setActiveFeature(index)}
              >
                <CardHeader className="text-center">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg mb-4 mx-auto ${
                    activeFeature === index
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                      : 'bg-gray-100'
                  }`}>
                    <feature.icon className={`w-6 h-6 ${
                      activeFeature === index ? 'text-white' : 'text-gray-600'
                    }`} />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                  <CardDescription>{feature.desc}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 italic">
                    {feature.preview}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 纪念主题 */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              精美的纪念主题
            </h2>
            <p className="text-xl text-gray-600">
              选择最符合逝者性格的纪念风格
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {memorialStyles.map((style, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video relative">
                  <img
                    src={style.image}
                    alt={style.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-2">{style.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{style.desc}</p>
                  <div className="flex flex-wrap gap-2">
                    {style.features.map((feature, featureIndex) => (
                      <Badge key={featureIndex} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 创建流程 */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              创建流程
            </h2>
            <p className="text-xl text-gray-600">
              简单六步，创建温馨的纪念空间
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {creationSteps.map((step, index) => (
              <div key={index} className="relative">
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-4">
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg">
                        <step.icon className="w-6 h-6 text-purple-600" />
                      </div>
                      <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                    </div>
                    <CardTitle className="text-xl">{step.title}</CardTitle>
                    <CardDescription>{step.desc}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">{step.details}</p>
                  </CardContent>
                </Card>

                {index < creationSteps.length - 1 && (index + 1) % 3 !== 0 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="w-6 h-6 text-gray-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 核心功能 */}
      <section className="py-20 bg-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              核心功能特色
            </h2>
            <p className="text-xl text-gray-600">
              每一个细节都体现对逝者的尊重和对家属的关怀
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="h-full hover:shadow-lg transition-shadow bg-white">
                <CardHeader>
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-4">
                    <feature.icon className="w-6 h-6 text-purple-600" />
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

      {/* 温馨功能 */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              温馨互动功能
            </h2>
            <p className="text-xl text-gray-600">
              让思念有形，让爱有所寄托
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {comfortFeatures.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full mb-4">
                    <feature.icon className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 用户评价 */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              用户真实感受
            </h2>
            <p className="text-xl text-gray-600">
              听听家属对纪念空间的真实感受
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
      <section className="py-20 bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            为挚爱的人创建永恒的纪念空间
          </h2>
          <p className="text-xl text-purple-100 mb-8">
            让科技承载情感，让思念有所寄托，让爱永远延续
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-4">
              <Heart className="w-5 h-5 mr-2" />
              免费创建纪念空间
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 px-8 py-4">
              <Users className="w-5 h-5 mr-2" />
              咨询专业顾问
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 text-purple-200">
            <div className="flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              <span>隐私保护</span>
            </div>
            <div className="flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              <span>永久保存</span>
            </div>
            <div className="flex items-center">
              <Heart className="w-5 h-5 mr-2" />
              <span>温馨关怀</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
