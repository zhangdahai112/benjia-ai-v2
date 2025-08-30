"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  id: string;
  name: string;
  phone: string;
  role: 'admin' | 'member';
  familyId: string;
  avatar?: string;
  joinedAt: Date;
}

export interface Family {
  id: string;
  name: string; // 堂号名称，如"李氏祖堂"
  location: string; // 地名，如"山东济南"
  surname: string; // 姓氏
  adminId: string; // 管理员ID
  memberCount: number;
  createdAt: Date;
  description?: string;
}

interface AuthContextType {
  user: User | null;
  family: Family | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (phone: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  createFamily: (familyData: CreateFamilyData) => Promise<boolean>;
  joinFamily: (familyName: string) => Promise<boolean>;
  // 密码重置功能
  sendVerificationCode: (phone: string) => Promise<{ success: boolean; message: string }>;
  verifyCodeAndResetPassword: (phone: string, code: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
}

export interface RegisterData {
  name: string;
  phone: string;
  password: string;
  familyName?: string; // 如果是创建新家族
  familyLocation?: string;
  surname?: string;
  isAdmin?: boolean;
}

export interface CreateFamilyData {
  name: string;
  location: string;
  surname: string;
  description?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 模拟数据存储
const STORAGE_KEYS = {
  USER: 'benjia_user',
  FAMILY: 'benjia_family',
  FAMILIES: 'benjia_families',
  USERS: 'benjia_users',
  VERIFICATION_CODES: 'benjia_verification_codes'
};

// 验证码接口
interface VerificationCode {
  phone: string;
  code: string;
  createdAt: Date;
  expiresAt: Date;
  used: boolean;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [family, setFamily] = useState<Family | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 初始化演示数据
  const initializeDemoData = () => {
    const users = getAllUsers();
    const families = getAllFamilies();

    // 检查演示用户是否存在
    const demoUser = users.find(u => u.phone === '13800138000');

    if (!demoUser) {
      // 创建演示家族
      const demoFamily = {
        id: 'demo_family',
        name: '山东济南李氏祖堂',
        location: '山东济南',
        surname: '李',
        adminId: 'demo_user',
        memberCount: 1,
        createdAt: new Date(),
        description: '演示家族'
      };

      // 创建演示用户
      const newDemoUser = {
        id: 'demo_user',
        name: '李小明',
        phone: '13800138000',
        role: 'admin' as const,
        familyId: 'demo_family',
        joinedAt: new Date(),
        password: '123456' // 演示密码
      };

      // 保存到本地存储
      const updatedFamilies = [...families, demoFamily];
      const updatedUsers = [...users, newDemoUser];

      localStorage.setItem(STORAGE_KEYS.FAMILIES, JSON.stringify(updatedFamilies));
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updatedUsers));

      console.log('演示数据已初始化');
    } else {
      // 确保演示用户有密码字段
      const userWithPassword = demoUser as User & { password?: string };
      if (!userWithPassword.password) {
        userWithPassword.password = '123456';
        const userIndex = users.findIndex(u => u.id === demoUser.id);
        if (userIndex >= 0) {
          users[userIndex] = userWithPassword;
          localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
          console.log('演示用户密码已更新');
        }
      }
    }
  };

  // 从本地存储加载用户数据
  useEffect(() => {
    const loadUserData = () => {
      try {
        // 初始化演示数据
        initializeDemoData();

        const savedUser = localStorage.getItem(STORAGE_KEYS.USER);
        const savedFamily = localStorage.getItem(STORAGE_KEYS.FAMILY);

        if (savedUser && savedFamily) {
          const parsedUser = JSON.parse(savedUser) as User;
          const parsedFamily = JSON.parse(savedFamily) as Family;

          // 转换日期字符串回 Date 对象
          const userWithDate = {
            ...parsedUser,
            joinedAt: new Date(parsedUser.joinedAt)
          };

          const familyWithDate = {
            ...parsedFamily,
            createdAt: new Date(parsedFamily.createdAt)
          };

          setUser(userWithDate);
          setFamily(familyWithDate);
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, []);

  // 保存用户数据到本地存储
  const saveUserData = (userData: User, familyData: Family) => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
    localStorage.setItem(STORAGE_KEYS.FAMILY, JSON.stringify(familyData));
  };

  // 获取所有用户数据（模拟数据库）
  const getAllUsers = (): User[] => {
    try {
      const users = localStorage.getItem(STORAGE_KEYS.USERS);
      return users ? JSON.parse(users) : [];
    } catch {
      return [];
    }
  };

  // 保存用户到数据库（模拟）
  const saveUser = (userData: User) => {
    const users = getAllUsers();
    const existingIndex = users.findIndex(u => u.id === userData.id);

    if (existingIndex >= 0) {
      users[existingIndex] = userData;
    } else {
      users.push(userData);
    }

    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  };

  // 获取所有家族数据（模拟数据库）
  const getAllFamilies = (): Family[] => {
    try {
      const families = localStorage.getItem(STORAGE_KEYS.FAMILIES);
      return families ? JSON.parse(families) : [];
    } catch {
      return [];
    }
  };

  // 保存家族到数据库（模拟）
  const saveFamily = (familyData: Family) => {
    const families = getAllFamilies();
    const existingIndex = families.findIndex(f => f.id === familyData.id);

    if (existingIndex >= 0) {
      families[existingIndex] = familyData;
    } else {
      families.push(familyData);
    }

    localStorage.setItem(STORAGE_KEYS.FAMILIES, JSON.stringify(families));
  };

  // 登录功能
  const login = async (phone: string, password: string): Promise<boolean> => {
    setIsLoading(true);

    try {
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 1000));

      const users = getAllUsers();
      const foundUser = users.find(u => u.phone === phone);

      if (foundUser) {
        // 在真实应用中，这里应该验证密码哈希
        // 兼容处理：如果是演示账号或者没有密码字段，使用简单验证
        const userWithPassword = foundUser as User & { password?: string };
        const storedPassword = userWithPassword.password;

        // 如果用户没有密码字段（老数据），或者是演示账号，使用宽松验证
        if (storedPassword && storedPassword !== password) {
          return false; // 密码不匹配
        }
        // 如果没有密码字段，认为是老数据，允许登录（开发环境）
        if (!storedPassword && process.env.NODE_ENV === 'development') {
          console.log('使用兼容模式登录，用户无密码字段');
        }

        const families = getAllFamilies();
        const userFamily = families.find(f => f.id === foundUser.familyId);

        if (userFamily) {
          setUser(foundUser);
          setFamily(userFamily);
          saveUserData(foundUser, userFamily);
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // 注册功能
  const register = async (userData: RegisterData): Promise<boolean> => {
    setIsLoading(true);

    try {
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 1000));

      const users = getAllUsers();

      // 检查手机号是否已存在
      if (users.some(u => u.phone === userData.phone)) {
        return false;
      }

      const userId = Date.now().toString();
      let targetFamily: Family;

      if (userData.familyName && userData.familyLocation && userData.surname) {
        // 创建新家族
        const familyId = `family_${Date.now()}`;
        targetFamily = {
          id: familyId,
          name: `${userData.familyLocation}${userData.surname}氏祖堂`,
          location: userData.familyLocation,
          surname: userData.surname,
          adminId: userId,
          memberCount: 1,
          createdAt: new Date(),
          description: userData.familyName
        };

        saveFamily(targetFamily);
      } else {
        // 加入现有家族（这里需要搜索功能）
        return false;
      }

      const newUser: User = {
        id: userId,
        name: userData.name,
        phone: userData.phone,
        role: userData.isAdmin ? 'admin' : 'member',
        familyId: targetFamily.id,
        joinedAt: new Date()
      };

      // 添加密码字段（在真实应用中应该是加密的passwordHash）
      const userWithPassword = newUser as User & { password: string };
      userWithPassword.password = userData.password;

      saveUser(newUser);
      setUser(newUser);
      setFamily(targetFamily);
      saveUserData(newUser, targetFamily);

      return true;
    } catch (error) {
      console.error('Registration failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // 创建家族
  const createFamily = async (familyData: CreateFamilyData): Promise<boolean> => {
    if (!user) return false;

    try {
      const familyId = `family_${Date.now()}`;
      const newFamily: Family = {
        id: familyId,
        name: `${familyData.location}${familyData.surname}氏祖堂`,
        location: familyData.location,
        surname: familyData.surname,
        adminId: user.id,
        memberCount: 1,
        createdAt: new Date(),
        description: familyData.description
      };

      saveFamily(newFamily);

      // 更新用户家族ID
      const updatedUser = { ...user, familyId: familyId, role: 'admin' as const };
      saveUser(updatedUser);
      setUser(updatedUser);
      setFamily(newFamily);
      saveUserData(updatedUser, newFamily);

      return true;
    } catch (error) {
      console.error('Failed to create family:', error);
      return false;
    }
  };

  // 加入家族
  const joinFamily = async (familyName: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const families = getAllFamilies();
      const targetFamily = families.find(f =>
        f.name.includes(familyName) ||
        f.location.includes(familyName) ||
        f.surname.includes(familyName)
      );

      if (targetFamily) {
        // 更新用户家族ID
        const updatedUser = { ...user, familyId: targetFamily.id, role: 'member' as const };
        saveUser(updatedUser);

        // 更新家族成员数量
        const updatedFamily = { ...targetFamily, memberCount: targetFamily.memberCount + 1 };
        saveFamily(updatedFamily);

        setUser(updatedUser);
        setFamily(updatedFamily);
        saveUserData(updatedUser, updatedFamily);

        return true;
      }

      return false;
    } catch (error) {
      console.error('Failed to join family:', error);
      return false;
    }
  };

  // 登出功能
  const logout = () => {
    setUser(null);
    setFamily(null);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.FAMILY);
  };

  // 更新用户信息
  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      saveUser(updatedUser);
      if (family) {
        saveUserData(updatedUser, family);
      }
    }
  };

  // 获取验证码存储
  const getVerificationCodes = (): VerificationCode[] => {
    try {
      const codes = localStorage.getItem(STORAGE_KEYS.VERIFICATION_CODES);
      return codes ? JSON.parse(codes) : [];
    } catch {
      return [];
    }
  };

  // 保存验证码
  const saveVerificationCode = (code: VerificationCode) => {
    const codes = getVerificationCodes().filter(c =>
      c.phone !== code.phone || new Date(c.expiresAt) > new Date()
    );
    codes.push(code);
    localStorage.setItem(STORAGE_KEYS.VERIFICATION_CODES, JSON.stringify(codes));
  };

  // 生成6位数字验证码
  const generateVerificationCode = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // 发送验证码（模拟短信发送）
  const sendVerificationCode = async (phone: string): Promise<{ success: boolean; message: string }> => {
    try {
      // 验证手机号格式
      const phoneRegex = /^1[3-9]\d{9}$/;
      if (!phoneRegex.test(phone)) {
        return { success: false, message: '请输入正确的手机号码' };
      }

      // 检查用户是否存在
      const users = getAllUsers();
      const user = users.find(u => u.phone === phone);
      if (!user) {
        return { success: false, message: '该手机号尚未注册' };
      }

      // 检查是否频繁发送验证码
      const existingCodes = getVerificationCodes();
      const recentCode = existingCodes.find(c =>
        c.phone === phone &&
        new Date(c.createdAt).getTime() > Date.now() - 60000 // 1分钟内
      );

      if (recentCode) {
        return { success: false, message: '验证码发送过于频繁，请稍后再试' };
      }

      // 生成验证码
      const code = generateVerificationCode();
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 300000); // 5分钟过期

      const verificationCode: VerificationCode = {
        phone,
        code,
        createdAt: now,
        expiresAt,
        used: false
      };

      // 保存验证码
      saveVerificationCode(verificationCode);

      // 在开发环境中，将验证码打印到控制台
      if (process.env.NODE_ENV === 'development') {
        console.log(`📱 验证码已发送到 ${phone}: ${code}`);
        console.log(`验证码将在5分钟后过期`);
      }

      // 模拟发送延迟
      await new Promise(resolve => setTimeout(resolve, 1000));

      return {
        success: true,
        message: `验证码已发送到 ${phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')}，请注意查收`
      };

    } catch (error) {
      console.error('发送验证码失败:', error);
      return { success: false, message: '发送验证码失败，请稍后重试' };
    }
  };

  // 验证验证码并重置密码
  const verifyCodeAndResetPassword = async (
    phone: string,
    code: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      // 验证输入
      if (!phone || !code || !newPassword) {
        return { success: false, message: '请填写完整信息' };
      }

      if (newPassword.length < 6) {
        return { success: false, message: '新密码至少需要6位' };
      }

      // 获取验证码
      const codes = getVerificationCodes();
      const verificationCode = codes.find(c =>
        c.phone === phone &&
        c.code === code &&
        !c.used &&
        new Date(c.expiresAt) > new Date()
      );

      if (!verificationCode) {
        return { success: false, message: '验证码无效或已过期' };
      }

      // 查找用户
      const users = getAllUsers();
      const userIndex = users.findIndex(u => u.phone === phone);

      if (userIndex === -1) {
        return { success: false, message: '用户不存在' };
      }

      // 更新密码（在真实应用中应该加密存储）
      // 这里我们只是模拟，实际应该使用bcrypt等加密
      const updatedUser = { ...users[userIndex] };
      // 在真实应用中，这里应该是: updatedUser.passwordHash = await bcrypt.hash(newPassword, 10);
      // 为了演示，我们直接存储（不安全，仅用于演示）
      Object.assign(updatedUser, { password: newPassword });

      users[userIndex] = updatedUser;
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

      // 标记验证码为已使用
      verificationCode.used = true;
      localStorage.setItem(STORAGE_KEYS.VERIFICATION_CODES, JSON.stringify(codes));

      // 模拟处理延迟
      await new Promise(resolve => setTimeout(resolve, 1000));

      return { success: true, message: '密码重置成功，请使用新密码登录' };

    } catch (error) {
      console.error('密码重置失败:', error);
      return { success: false, message: '密码重置失败，请稍后重试' };
    }
  };

  const value: AuthContextType = {
    user,
    family,
    isAuthenticated: !!user && !!family,
    isLoading,
    login,
    register,
    logout,
    updateUser,
    createFamily,
    joinFamily,
    sendVerificationCode,
    verifyCodeAndResetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
