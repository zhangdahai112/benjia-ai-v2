"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({
  children,
  requireAuth = true,
  requireAdmin = false
}: ProtectedRouteProps) {
  const { user, family, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (requireAuth && !isAuthenticated) {
        router.push("/login");
        return;
      }

      if (requireAdmin && user?.role !== 'admin') {
        router.push("/");
        return;
      }
    }
  }, [isAuthenticated, isLoading, user, requireAuth, requireAdmin, router]);

  // 加载中状态
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full animate-pulse mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  // 检查认证状态
  if (requireAuth && !isAuthenticated) {
    return null; // 重定向处理中
  }

  // 检查管理员权限
  if (requireAdmin && user?.role !== 'admin') {
    return null; // 重定向处理中
  }

  return <>{children}</>;
}
