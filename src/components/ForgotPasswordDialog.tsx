"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  Phone,
  MessageSquare,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle,
  ArrowLeft,
  Clock
} from "lucide-react";

interface ForgotPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLoginSuccess?: () => void;
}

type Step = 'phone' | 'verification' | 'password' | 'success';

export default function ForgotPasswordDialog({
  open,
  onOpenChange,
  onLoginSuccess
}: ForgotPasswordDialogProps) {
  const { sendVerificationCode, verifyCodeAndResetPassword } = useAuth();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState<Step>('phone');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // 表单数据
  const [formData, setFormData] = useState({
    phone: '',
    verificationCode: '',
    newPassword: '',
    confirmPassword: ''
  });

  // 表单错误
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 倒计时效果
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // 重置表单
  const resetForm = () => {
    setCurrentStep('phone');
    setFormData({
      phone: '',
      verificationCode: '',
      newPassword: '',
      confirmPassword: ''
    });
    setErrors({});
    setCountdown(0);
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  // 当对话框关闭时重置表单
  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);

  // 验证手机号
  const validatePhone = (): boolean => {
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!formData.phone.trim()) {
      setErrors({ phone: '请输入手机号' });
      return false;
    }
    if (!phoneRegex.test(formData.phone)) {
      setErrors({ phone: '请输入正确的11位手机号' });
      return false;
    }
    setErrors({});
    return true;
  };

  // 验证验证码
  const validateVerificationCode = (): boolean => {
    if (!formData.verificationCode.trim()) {
      setErrors({ verificationCode: '请输入验证码' });
      return false;
    }
    if (formData.verificationCode.length !== 6) {
      setErrors({ verificationCode: '验证码应为6位数字' });
      return false;
    }
    setErrors({});
    return true;
  };

  // 验证密码
  const validatePassword = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.newPassword.trim()) {
      newErrors.newPassword = '请输入新密码';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = '密码至少需要6位';
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = '请确认新密码';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = '两次输入的密码不一致';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 发送验证码
  const handleSendCode = async () => {
    if (!validatePhone()) return;

    setIsLoading(true);
    try {
      const result = await sendVerificationCode(formData.phone);

      if (result.success) {
        toast({
          title: "验证码已发送",
          description: result.message
        });
        setCurrentStep('verification');
        setCountdown(60); // 60秒倒计时
      } else {
        toast({
          title: "发送失败",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "发送失败",
        description: "网络错误，请稍后重试",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 验证验证码并继续
  const handleVerifyCode = () => {
    if (validateVerificationCode()) {
      setCurrentStep('password');
    }
  };

  // 重置密码
  const handleResetPassword = async () => {
    if (!validatePassword()) return;

    setIsLoading(true);
    try {
      const result = await verifyCodeAndResetPassword(
        formData.phone,
        formData.verificationCode,
        formData.newPassword
      );

      if (result.success) {
        toast({
          title: "密码重置成功",
          description: result.message
        });
        setCurrentStep('success');
      } else {
        toast({
          title: "重置失败",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "重置失败",
        description: "网络错误，请稍后重试",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 完成并返回登录
  const handleComplete = () => {
    onOpenChange(false);
    if (onLoginSuccess) {
      onLoginSuccess();
    }
  };

  // 返回上一步
  const goBack = () => {
    switch (currentStep) {
      case 'verification':
        setCurrentStep('phone');
        break;
      case 'password':
        setCurrentStep('verification');
        break;
      default:
        break;
    }
  };

  // 渲染步骤指示器
  const renderStepIndicator = () => {
    const steps = [
      { key: 'phone', label: '验证手机', icon: Phone },
      { key: 'verification', label: '输入验证码', icon: MessageSquare },
      { key: 'password', label: '设置密码', icon: Lock },
      { key: 'success', label: '完成', icon: CheckCircle }
    ];

    return (
      <div className="flex items-center justify-center mb-6">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = currentStep === step.key;
          const isCompleted = steps.findIndex(s => s.key === currentStep) > index;

          return (
            <div key={step.key} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                isActive
                  ? 'bg-orange-500 text-white'
                  : isCompleted
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-500'
              }`}>
                <Icon className="w-4 h-4" />
              </div>
              {index < steps.length - 1 && (
                <div className={`w-8 h-0.5 mx-2 ${
                  isCompleted ? 'bg-green-500' : 'bg-gray-200'
                }`} />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // 渲染手机号输入步骤
  const renderPhoneStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-medium mb-2">验证您的手机号</h3>
        <p className="text-gray-600">请输入注册时使用的手机号码</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="phone">手机号码</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              id="phone"
              type="tel"
              placeholder="请输入手机号"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              className={`pl-10 h-12 text-lg ${errors.phone ? 'border-red-500' : ''}`}
              maxLength={11}
            />
          </div>
          {errors.phone && (
            <p className="text-sm text-red-600">{errors.phone}</p>
          )}
        </div>

        <Button
          onClick={handleSendCode}
          disabled={isLoading}
          className="w-full h-12 text-lg bg-orange-500 hover:bg-orange-600"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              发送中...
            </>
          ) : (
            "发送验证码"
          )}
        </Button>
      </div>
    </div>
  );

  // 渲染验证码输入步骤
  const renderVerificationStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-medium mb-2">输入验证码</h3>
        <p className="text-gray-600">
          验证码已发送到 {formData.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')}
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="verificationCode">验证码</Label>
          <div className="relative">
            <MessageSquare className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              id="verificationCode"
              type="text"
              placeholder="请输入6位验证码"
              value={formData.verificationCode}
              onChange={(e) => setFormData(prev => ({ ...prev, verificationCode: e.target.value.replace(/\D/g, '') }))}
              className={`pl-10 h-12 text-lg text-center tracking-widest ${errors.verificationCode ? 'border-red-500' : ''}`}
              maxLength={6}
            />
          </div>
          {errors.verificationCode && (
            <p className="text-sm text-red-600">{errors.verificationCode}</p>
          )}
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">验证码5分钟内有效</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSendCode}
            disabled={countdown > 0 || isLoading}
            className="text-orange-600 hover:text-orange-700"
          >
            {countdown > 0 ? (
              <>
                <Clock className="w-4 h-4 mr-1" />
                {countdown}秒后重发
              </>
            ) : (
              "重新发送"
            )}
          </Button>
        </div>

        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={goBack}
            className="flex-1"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回
          </Button>
          <Button
            onClick={handleVerifyCode}
            className="flex-1 bg-orange-500 hover:bg-orange-600"
          >
            下一步
          </Button>
        </div>
      </div>
    </div>
  );

  // 渲染密码设置步骤
  const renderPasswordStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-medium mb-2">设置新密码</h3>
        <p className="text-gray-600">请设置一个安全的新密码</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="newPassword">新密码</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              id="newPassword"
              type={showPassword ? "text" : "password"}
              placeholder="请输入新密码（至少6位）"
              value={formData.newPassword}
              onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
              className={`pl-10 pr-10 h-12 text-lg ${errors.newPassword ? 'border-red-500' : ''}`}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          </div>
          {errors.newPassword && (
            <p className="text-sm text-red-600">{errors.newPassword}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">确认新密码</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="请再次输入新密码"
              value={formData.confirmPassword}
              onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              className={`pl-10 pr-10 h-12 text-lg ${errors.confirmPassword ? 'border-red-500' : ''}`}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          </div>
          {errors.confirmPassword && (
            <p className="text-sm text-red-600">{errors.confirmPassword}</p>
          )}
        </div>

        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={goBack}
            className="flex-1"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回
          </Button>
          <Button
            onClick={handleResetPassword}
            disabled={isLoading}
            className="flex-1 bg-orange-500 hover:bg-orange-600"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                重置中...
              </>
            ) : (
              "重置密码"
            )}
          </Button>
        </div>
      </div>
    </div>
  );

  // 渲染成功步骤
  const renderSuccessStep = () => (
    <div className="space-y-6 text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle className="w-10 h-10 text-green-600" />
      </div>

      <div>
        <h3 className="text-lg font-medium mb-2">密码重置成功！</h3>
        <p className="text-gray-600">
          您的密码已成功重置，现在可以使用新密码登录了
        </p>
      </div>

      <Button
        onClick={handleComplete}
        className="w-full h-12 text-lg bg-green-600 hover:bg-green-700"
      >
        <CheckCircle className="w-5 h-5 mr-2" />
        返回登录
      </Button>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">忘记密码</DialogTitle>
          <DialogDescription className="text-center">
            通过手机验证码重置您的登录密码
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {renderStepIndicator()}

          {currentStep === 'phone' && renderPhoneStep()}
          {currentStep === 'verification' && renderVerificationStep()}
          {currentStep === 'password' && renderPasswordStep()}
          {currentStep === 'success' && renderSuccessStep()}
        </div>
      </DialogContent>
    </Dialog>
  );
}
