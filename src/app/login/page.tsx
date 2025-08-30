"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import ForgotPasswordDialog from "@/components/ForgotPasswordDialog";
import {
  Home,
  Phone,
  Lock,
  Loader2,
  Users
} from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  // 如果已登录，重定向到首页
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phone.trim() || !password.trim()) {
      toast({
        title: "请填写完整信息",
        description: "手机号和密码不能为空",
        variant: "destructive"
      });
      return;
    }

    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      toast({
        title: "手机号格式错误",
        description: "请输入正确的11位手机号",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const success = await login(phone, password);

      if (success) {
        toast({
          title: "登录成功",
          description: "欢迎回到本家！"
        });
        router.push("/");
      } else {
        toast({
          title: "登录失败",
          description: "手机号或密码错误，请重试",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "登录失败",
        description: "网络错误，请稍后重试",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 快速登录演示账号
  const handleDemoLogin = async () => {
    setIsLoading(true);

    // 设置表单值以便用户看到
    setPhone("13800138000");
    setPassword("123456");

    // 模拟演示账号登录
    setTimeout(async () => {
      const success = await login("13800138000", "123456");
      if (!success) {
        // 如果演示账号不存在，创建一个
        toast({
          title: "演示账号",
          description: "正在为您创建演示账号...",
        });
        router.push("/register?demo=true");
      } else {
        toast({
          title: "登录成功",
          description: "欢迎使用演示账号体验！"
        });
        router.push("/");
      }
      setIsLoading(false);
    }, 1000);
  };

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

        {/* 登录表单 */}
        <Card className="border-orange-200 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-gray-800">登录账号</CardTitle>
            <CardDescription>
              登录您的家族账号，继续传承珍贵记忆
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
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
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-10 h-12 text-lg border-orange-200 focus:border-orange-400"
                    maxLength={11}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-gray-700 font-medium">
                    登录密码
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-orange-600 hover:text-orange-700 p-0 h-auto"
                  >
                    忘记密码？
                  </Button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="请输入密码"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-12 text-lg border-orange-200 focus:border-orange-400"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-lg bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    登录中...
                  </>
                ) : (
                  "登录"
                )}
              </Button>
            </form>

            <div className="mt-6 space-y-4">
              {/* 分割线 */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">或</span>
                </div>
              </div>

              {/* 演示登录 */}
              <Button
                onClick={handleDemoLogin}
                variant="outline"
                className="w-full h-12 text-lg border-orange-200 hover:bg-orange-50"
                disabled={isLoading}
              >
                <Users className="w-5 h-5 mr-2" />
                体验演示账号
              </Button>

              {/* 注册链接 */}
              <div className="text-center">
                <p className="text-gray-600">
                  还没有账号？
                  <Link href="/register" className="text-orange-600 hover:text-orange-700 font-medium ml-1">
                    立即注册
                  </Link>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6 text-sm text-gray-500">
          <p>登录即表示您同意我们的</p>
          <div className="space-x-4">
            <a href="#" className="text-orange-600 hover:text-orange-700">服务协议</a>
            <a href="#" className="text-orange-600 hover:text-orange-700">隐私政策</a>
          </div>
        </div>
      </div>

      {/* 忘记密码对话框 */}
      <ForgotPasswordDialog
        open={showForgotPassword}
        onOpenChange={setShowForgotPassword}
        onLoginSuccess={() => {
          // 密码重置成功后，可以自动填充手机号
          toast({
            title: "密码重置成功",
            description: "请使用新密码登录"
          });
        }}
      />
    </div>
  );
}
