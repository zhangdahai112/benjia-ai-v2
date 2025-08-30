"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth, type RegisterData } from "@/contexts/AuthContext";
import {
  Home,
  Phone,
  Lock,
  User,
  MapPin,
  Users,
  Crown,
  Search,
  ArrowLeft,
  Loader2,
  Check
} from "lucide-react";
import Link from "next/link";

type RegistrationStep = 'personal' | 'family-choice' | 'create-family' | 'join-family';

function RegisterPageContent() {
  const [step, setStep] = useState<RegistrationStep>('personal');
  const [isLoading, setIsLoading] = useState(false);
  const { register, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isDemo = searchParams?.get('demo') === 'true';

  // 个人信息
  const [personalData, setPersonalData] = useState({
    name: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });

  // 家族信息
  const [familyData, setFamilyData] = useState({
    familyName: "",
    location: "",
    surname: "",
    searchQuery: ""
  });

  // 如果已登录，重定向到首页
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  // 演示模式自动填充
  useEffect(() => {
    if (isDemo) {
      setPersonalData({
        name: "李小明",
        phone: "13800138000",
        password: "123456",
        confirmPassword: "123456"
      });
      setFamilyData({
        familyName: "李氏祖堂",
        location: "山东济南",
        surname: "李",
        searchQuery: ""
      });
    }
  }, [isDemo]);

  const validatePersonalInfo = () => {
    if (!personalData.name.trim()) {
      toast({
        title: "请输入姓名",
        variant: "destructive"
      });
      return false;
    }

    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(personalData.phone)) {
      toast({
        title: "请输入正确的手机号",
        variant: "destructive"
      });
      return false;
    }

    if (personalData.password.length < 6) {
      toast({
        title: "密码至少6位",
        variant: "destructive"
      });
      return false;
    }

    if (personalData.password !== personalData.confirmPassword) {
      toast({
        title: "两次密码不一致",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const validateFamilyInfo = () => {
    if (!familyData.location.trim() || !familyData.surname.trim()) {
      toast({
        title: "请填写完整的家族信息",
        variant: "destructive"
      });
      return false;
    }
    return true;
  };

  const handlePersonalNext = () => {
    if (validatePersonalInfo()) {
      setStep('family-choice');
    }
  };

  const handleCreateFamily = async () => {
    if (!validateFamilyInfo()) return;

    setIsLoading(true);

    try {
      const registerData: RegisterData = {
        name: personalData.name,
        phone: personalData.phone,
        password: personalData.password,
        familyName: familyData.familyName,
        familyLocation: familyData.location,
        surname: familyData.surname,
        isAdmin: true
      };

      const success = await register(registerData);

      if (success) {
        toast({
          title: "注册成功",
          description: `欢迎创建${familyData.location}${familyData.surname}氏祖堂！`
        });
        router.push("/");
      } else {
        toast({
          title: "注册失败",
          description: "该手机号已被注册，请使用其他手机号",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "注册失败",
        description: "网络错误，请稍后重试",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinFamily = async () => {
    if (!familyData.searchQuery.trim()) {
      toast({
        title: "请输入要搜索的家族信息",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // 这里模拟搜索和加入家族的过程
      toast({
        title: "功能开发中",
        description: "家族搜索功能正在开发中，请先创建新家族",
        variant: "destructive"
      });
    } catch (error) {
      toast({
        title: "加入失败",
        description: "网络错误，请稍后重试",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderPersonalStep = () => (
    <Card className="border-orange-200 shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl text-gray-800">注册账号</CardTitle>
        <CardDescription>
          填写您的个人信息，开始家族文化传承之旅
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-gray-700 font-medium">
            真实姓名
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              id="name"
              type="text"
              placeholder="请输入您的真实姓名"
              value={personalData.name}
              onChange={(e) => setPersonalData({...personalData, name: e.target.value})}
              className="pl-10 h-12 text-lg border-orange-200 focus:border-orange-400"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-gray-700 font-medium">
            手机号码
          </Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              id="phone"
              type="tel"
              placeholder="请输入手机号"
              value={personalData.phone}
              onChange={(e) => setPersonalData({...personalData, phone: e.target.value})}
              className="pl-10 h-12 text-lg border-orange-200 focus:border-orange-400"
              maxLength={11}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-gray-700 font-medium">
            设置密码
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              id="password"
              type="password"
              placeholder="请设置密码（至少6位）"
              value={personalData.password}
              onChange={(e) => setPersonalData({...personalData, password: e.target.value})}
              className="pl-10 h-12 text-lg border-orange-200 focus:border-orange-400"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">
            确认密码
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              id="confirmPassword"
              type="password"
              placeholder="请再次输入密码"
              value={personalData.confirmPassword}
              onChange={(e) => setPersonalData({...personalData, confirmPassword: e.target.value})}
              className="pl-10 h-12 text-lg border-orange-200 focus:border-orange-400"
            />
          </div>
        </div>

        <Button
          onClick={handlePersonalNext}
          className="w-full h-12 text-lg bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
        >
          下一步
        </Button>

        <div className="text-center">
          <p className="text-gray-600">
            已有账号？
            <Link href="/login" className="text-orange-600 hover:text-orange-700 font-medium ml-1">
              立即登录
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );

  const renderFamilyChoiceStep = () => (
    <Card className="border-orange-200 shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl text-gray-800">选择家族</CardTitle>
        <CardDescription>
          您希望创建新的家族还是加入现有家族？
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-4">
          <Button
            onClick={() => setStep('create-family')}
            variant="outline"
            className="h-20 border-2 border-orange-200 hover:border-orange-400 hover:bg-orange-50"
          >
            <div className="flex flex-col items-center">
              <Crown className="w-8 h-8 text-orange-600 mb-2" />
              <div>
                <p className="font-medium">创建新家族</p>
                <p className="text-sm text-gray-600">成为家族管理员，邀请家人加入</p>
              </div>
            </div>
          </Button>

          <Button
            onClick={() => setStep('join-family')}
            variant="outline"
            className="h-20 border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50"
          >
            <div className="flex flex-col items-center">
              <Users className="w-8 h-8 text-blue-600 mb-2" />
              <div>
                <p className="font-medium">加入现有家族</p>
                <p className="text-sm text-gray-600">搜索并加入已创建的家族</p>
              </div>
            </div>
          </Button>
        </div>

        <Button
          onClick={() => setStep('personal')}
          variant="ghost"
          className="w-full"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回上一步
        </Button>
      </CardContent>
    </Card>
  );

  const renderCreateFamilyStep = () => (
    <Card className="border-orange-200 shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl text-gray-800 flex items-center justify-center">
          <Crown className="w-6 h-6 mr-2 text-orange-600" />
          创建新家族
        </CardTitle>
        <CardDescription>
          设置您的家族堂号，成为家族管理员
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="location" className="text-gray-700 font-medium">
            祖籍地名 *
          </Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              id="location"
              type="text"
              placeholder="如：山东济南、湖南长沙"
              value={familyData.location}
              onChange={(e) => setFamilyData({...familyData, location: e.target.value})}
              className="pl-10 h-12 text-lg border-orange-200 focus:border-orange-400"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="surname" className="text-gray-700 font-medium">
            家族姓氏 *
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              id="surname"
              type="text"
              placeholder="如：李、王、张、刘"
              value={familyData.surname}
              onChange={(e) => setFamilyData({...familyData, surname: e.target.value})}
              className="pl-10 h-12 text-lg border-orange-200 focus:border-orange-400"
              maxLength={5}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="familyName" className="text-gray-700 font-medium">
            堂号描述（可选）
          </Label>
          <Input
            id="familyName"
            type="text"
            placeholder="如：世代书香、忠厚传家"
            value={familyData.familyName}
            onChange={(e) => setFamilyData({...familyData, familyName: e.target.value})}
            className="h-12 text-lg border-orange-200 focus:border-orange-400"
          />
        </div>

        {familyData.location && familyData.surname && (
          <div className="p-4 bg-orange-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">堂号预览：</p>
            <div className="flex items-center">
              <Badge className="bg-orange-100 text-orange-800 text-lg px-3 py-1">
                {familyData.location}{familyData.surname}氏祖堂
              </Badge>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <Button
            onClick={handleCreateFamily}
            className="w-full h-12 text-lg bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                创建中...
              </>
            ) : (
              <>
                <Crown className="w-5 h-5 mr-2" />
                创建家族
              </>
            )}
          </Button>

          <Button
            onClick={() => setStep('family-choice')}
            variant="ghost"
            className="w-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回选择
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderJoinFamilyStep = () => (
    <Card className="border-blue-200 shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl text-gray-800 flex items-center justify-center">
          <Users className="w-6 h-6 mr-2 text-blue-600" />
          加入家族
        </CardTitle>
        <CardDescription>
          搜索并加入已创建的家族
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="searchQuery" className="text-gray-700 font-medium">
            搜索家族
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              id="searchQuery"
              type="text"
              placeholder="输入地名、姓氏或堂号进行搜索"
              value={familyData.searchQuery}
              onChange={(e) => setFamilyData({...familyData, searchQuery: e.target.value})}
              className="pl-10 h-12 text-lg border-blue-200 focus:border-blue-400"
            />
          </div>
        </div>

        <div className="p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700 mb-2">
            <strong>搜索提示：</strong>
          </p>
          <ul className="text-sm text-blue-600 space-y-1">
            <li>• 可按地名搜索：如"山东"、"济南"</li>
            <li>• 可按姓氏搜索：如"李氏"、"王氏"</li>
            <li>• 可按堂号搜索：如"李氏祖堂"</li>
          </ul>
        </div>

        <div className="space-y-3">
          <Button
            onClick={handleJoinFamily}
            className="w-full h-12 text-lg bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                搜索中...
              </>
            ) : (
              <>
                <Search className="w-5 h-5 mr-2" />
                搜索家族
              </>
            )}
          </Button>

          <Button
            onClick={() => setStep('family-choice')}
            variant="ghost"
            className="w-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回选择
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Home className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">本家AI</h1>
          <p className="text-gray-600">让家族文化传承更美好</p>
        </div>

        {/* 步骤指示器 */}
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center space-x-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step === 'personal' ? 'bg-orange-500 text-white' : 'bg-green-500 text-white'
            }`}>
              {step === 'personal' ? '1' : <Check className="w-4 h-4" />}
            </div>
            <div className="w-8 border-t border-gray-300"></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              ['family-choice', 'create-family', 'join-family'].includes(step)
                ? 'bg-orange-500 text-white'
                : 'bg-gray-300 text-gray-500'
            }`}>
              2
            </div>
          </div>
        </div>

        {/* 渲染对应步骤 */}
        {step === 'personal' && renderPersonalStep()}
        {step === 'family-choice' && renderFamilyChoiceStep()}
        {step === 'create-family' && renderCreateFamilyStep()}
        {step === 'join-family' && renderJoinFamilyStep()}

        <div className="text-center mt-6 text-sm text-gray-500">
          <p>注册即表示您同意我们的</p>
          <div className="space-x-4">
            <a href="#" className="text-orange-600 hover:text-orange-700">服务协议</a>
            <a href="#" className="text-orange-600 hover:text-orange-700">隐私政策</a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full animate-pulse mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    }>
      <RegisterPageContent />
    </Suspense>
  );
}
