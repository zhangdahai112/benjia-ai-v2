"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from './AuthContext';

export interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  generation: number; // 1-5代
  birth: string;
  death?: string;
  alive: boolean;
  avatar?: string;
  isCurrentUser?: boolean;
  gender: 'male' | 'female';
  spouse?: string; // 配偶ID
  parentIds: string[]; // 父母ID数组
  childrenIds: string[]; // 子女ID数组
  bio?: string; // 个人简介
  occupation?: string; // 职业
  familyId: string;
  createdBy: string; // 创建者ID
  createdAt: Date;
  updatedAt: Date;
}

interface FamilyMembersContextType {
  members: FamilyMember[];
  getMembersByGeneration: (generation: number) => FamilyMember[];
  getMemberById: (id: string) => FamilyMember | undefined;
  addMember: (memberData: Omit<FamilyMember, 'id' | 'createdAt' | 'updatedAt'>) => Promise<boolean>;
  updateMember: (id: string, memberData: Partial<FamilyMember>) => Promise<boolean>;
  deleteMember: (id: string) => Promise<boolean>;
  canEditMember: (memberId: string) => boolean;
  isLoading: boolean;
  refreshMembers: () => Promise<void>;
  // 关系分析功能
  getSpouse: (memberId: string) => FamilyMember | undefined;
  getParents: (memberId: string) => FamilyMember[];
  getChildren: (memberId: string) => FamilyMember[];
  getSiblings: (memberId: string) => FamilyMember[];
  establishRelationship: (member1Id: string, member2Id: string, relationshipType: 'spouse' | 'parent-child') => Promise<boolean>;
}

const FamilyMembersContext = createContext<FamilyMembersContextType | undefined>(undefined);

// 本地存储键
const STORAGE_KEY = 'benjia_family_members';

export function FamilyMembersProvider({ children }: { children: ReactNode }) {
  const { user, family } = useAuth();
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 从本地存储加载成员数据
  const loadMembers = useCallback(async () => {
    if (!family) return;

    try {
      const savedMembers = localStorage.getItem(`${STORAGE_KEY}_${family.id}`);
      if (savedMembers) {
        const parsedMembers = JSON.parse(savedMembers) as FamilyMember[];
        // 转换日期字符串回 Date 对象
        const membersWithDates = parsedMembers.map(member => ({
          ...member,
          createdAt: new Date(member.createdAt),
          updatedAt: new Date(member.updatedAt)
        }));
        setMembers(membersWithDates);
      } else {
        // 如果没有保存的数据，创建默认的演示数据
        const defaultMembers = createDefaultMembers(family.id, family.surname);
        setMembers(defaultMembers);
        saveMembers(defaultMembers);
      }
    } catch (error) {
      console.error('Failed to load family members:', error);
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [family, user]); // createDefaultMembers 和 saveMembers 函数稳定，不需要添加到依赖中

  // 保存成员数据到本地存储
  const saveMembers = (membersData: FamilyMember[]) => {
    if (!family) return;
    localStorage.setItem(`${STORAGE_KEY}_${family.id}`, JSON.stringify(membersData));
  };

  // 创建默认的演示数据
  const createDefaultMembers = (familyId: string, surname: string): FamilyMember[] => {
    const now = new Date();
    const currentUserId = user?.id || 'current_user';

    return [
      // 第一代（曾祖父母）
      {
        id: 'member_1',
        name: `${surname}老爷爷`,
        relation: '曾祖父',
        generation: 1,
        birth: '1920-03-15',
        death: '2010-12-20',
        alive: false,
        gender: 'male',
        parentIds: [],
        childrenIds: ['member_3'],
        familyId,
        createdBy: currentUserId,
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'member_2',
        name: `${surname}老奶奶`,
        relation: '曾祖母',
        generation: 1,
        birth: '1925-07-08',
        death: '2015-06-12',
        alive: false,
        gender: 'female',
        spouse: 'member_1',
        parentIds: [],
        childrenIds: ['member_3'],
        familyId,
        createdBy: currentUserId,
        createdAt: now,
        updatedAt: now
      },
      // 第二代（祖父母）
      {
        id: 'member_3',
        name: `${surname}爷爷`,
        relation: '祖父',
        generation: 2,
        birth: '1945-11-20',
        alive: true,
        gender: 'male',
        spouse: 'member_4',
        parentIds: ['member_1', 'member_2'],
        childrenIds: ['member_5'],
        familyId,
        createdBy: currentUserId,
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'member_4',
        name: `${surname}奶奶`,
        relation: '祖母',
        generation: 2,
        birth: '1948-05-10',
        alive: true,
        gender: 'female',
        spouse: 'member_3',
        parentIds: [],
        childrenIds: ['member_5'],
        familyId,
        createdBy: currentUserId,
        createdAt: now,
        updatedAt: now
      },
      // 第三代（父母）
      {
        id: 'member_5',
        name: `${surname}父亲`,
        relation: '父亲',
        generation: 3,
        birth: '1970-08-15',
        alive: true,
        gender: 'male',
        spouse: 'member_6',
        parentIds: ['member_3', 'member_4'],
        childrenIds: ['member_7', 'member_8'],
        familyId,
        createdBy: currentUserId,
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'member_6',
        name: `${surname}母亲`,
        relation: '母亲',
        generation: 3,
        birth: '1972-12-25',
        alive: true,
        gender: 'female',
        spouse: 'member_5',
        parentIds: [],
        childrenIds: ['member_7', 'member_8'],
        familyId,
        createdBy: currentUserId,
        createdAt: now,
        updatedAt: now
      },
      // 第四代（本代）
      {
        id: 'member_7',
        name: user?.name || `${surname}小明`,
        relation: '本人',
        generation: 4,
        birth: '1995-03-10',
        alive: true,
        gender: 'male',
        isCurrentUser: true,
        parentIds: ['member_5', 'member_6'],
        childrenIds: ['member_9'],
        familyId,
        createdBy: currentUserId,
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'member_8',
        name: `${surname}小红`,
        relation: '姐姐',
        generation: 4,
        birth: '1992-08-20',
        alive: true,
        gender: 'female',
        parentIds: ['member_5', 'member_6'],
        childrenIds: [],
        familyId,
        createdBy: currentUserId,
        createdAt: now,
        updatedAt: now
      },
      // 第五代（子女）
      {
        id: 'member_9',
        name: `${surname}小宝`,
        relation: '儿子',
        generation: 5,
        birth: '2020-06-01',
        alive: true,
        gender: 'male',
        parentIds: ['member_7'],
        childrenIds: [],
        familyId,
        createdBy: currentUserId,
        createdAt: now,
        updatedAt: now
      }
    ];
  };

  // 加载成员数据
  useEffect(() => {
    if (family) {
      loadMembers();
    }
  }, [family, loadMembers]);

  // 按代数获取成员
  const getMembersByGeneration = (generation: number): FamilyMember[] => {
    return members.filter(member => member.generation === generation);
  };

  // 根据ID获取成员
  const getMemberById = (id: string): FamilyMember | undefined => {
    return members.find(member => member.id === id);
  };

  // 检查是否可以编辑成员
  const canEditMember = (memberId: string): boolean => {
    if (!user) return false;

    // 管理员可以编辑所有成员
    if (user.role === 'admin') return true;

    // 普通用户只能编辑自己的信息
    const member = getMemberById(memberId);
    return member?.isCurrentUser === true;
  };

  // 添加成员
  const addMember = async (memberData: Omit<FamilyMember, 'id' | 'createdAt' | 'updatedAt'>): Promise<boolean> => {
    if (!user || !family) return false;

    try {
      const newMember: FamilyMember = {
        ...memberData,
        id: `member_${Date.now()}`,
        familyId: family.id,
        createdBy: user.id,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const updatedMembers = [...members, newMember];
      setMembers(updatedMembers);
      saveMembers(updatedMembers);

      return true;
    } catch (error) {
      console.error('Failed to add member:', error);
      return false;
    }
  };

  // 更新成员
  const updateMember = async (id: string, memberData: Partial<FamilyMember>): Promise<boolean> => {
    if (!user || !canEditMember(id)) return false;

    try {
      const updatedMembers = members.map(member =>
        member.id === id
          ? { ...member, ...memberData, updatedAt: new Date() }
          : member
      );

      setMembers(updatedMembers);
      saveMembers(updatedMembers);

      return true;
    } catch (error) {
      console.error('Failed to update member:', error);
      return false;
    }
  };

  // 删除成员
  const deleteMember = async (id: string): Promise<boolean> => {
    if (!user || !canEditMember(id)) return false;

    try {
      // 不允许删除当前用户自己
      const member = getMemberById(id);
      if (member?.isCurrentUser) return false;

      const updatedMembers = members.filter(member => member.id !== id);
      setMembers(updatedMembers);
      saveMembers(updatedMembers);

      return true;
    } catch (error) {
      console.error('Failed to delete member:', error);
      return false;
    }
  };

  // 刷新成员数据
  const refreshMembers = async (): Promise<void> => {
    await loadMembers();
  };

  // 关系分析功能
  const getSpouse = (memberId: string): FamilyMember | undefined => {
    const member = getMemberById(memberId);
    if (!member?.spouse) return undefined;
    return getMemberById(member.spouse);
  };

  const getParents = (memberId: string): FamilyMember[] => {
    const member = getMemberById(memberId);
    if (!member?.parentIds.length) return [];
    return member.parentIds.map(id => getMemberById(id)).filter(Boolean) as FamilyMember[];
  };

  const getChildren = (memberId: string): FamilyMember[] => {
    const member = getMemberById(memberId);
    if (!member?.childrenIds.length) return [];
    return member.childrenIds.map(id => getMemberById(id)).filter(Boolean) as FamilyMember[];
  };

  const getSiblings = (memberId: string): FamilyMember[] => {
    const member = getMemberById(memberId);
    if (!member?.parentIds.length) return [];

    // 找到有相同父母的成员
    return members.filter(m =>
      m.id !== memberId &&
      m.parentIds.length > 0 &&
      m.parentIds.some(parentId => member.parentIds.includes(parentId))
    );
  };

  const establishRelationship = async (member1Id: string, member2Id: string, relationshipType: 'spouse' | 'parent-child'): Promise<boolean> => {
    if (!user || user.role !== 'admin') return false;

    try {
      const member1 = getMemberById(member1Id);
      const member2 = getMemberById(member2Id);

      if (!member1 || !member2) return false;

      if (relationshipType === 'spouse') {
        // 建立夫妻关系
        await updateMember(member1Id, { spouse: member2Id });
        await updateMember(member2Id, { spouse: member1Id });
      } else if (relationshipType === 'parent-child') {
        // 建立父子关系
        const updatedMember1 = { ...member1, childrenIds: [...member1.childrenIds, member2Id] };
        const updatedMember2 = { ...member2, parentIds: [...member2.parentIds, member1Id] };

        await updateMember(member1Id, { childrenIds: updatedMember1.childrenIds });
        await updateMember(member2Id, { parentIds: updatedMember2.parentIds });
      }

      return true;
    } catch (error) {
      console.error('Failed to establish relationship:', error);
      return false;
    }
  };

  const value: FamilyMembersContextType = {
    members,
    getMembersByGeneration,
    getMemberById,
    addMember,
    updateMember,
    deleteMember,
    canEditMember,
    isLoading,
    refreshMembers,
    // 关系分析功能
    getSpouse,
    getParents,
    getChildren,
    getSiblings,
    establishRelationship
  };

  return (
    <FamilyMembersContext.Provider value={value}>
      {children}
    </FamilyMembersContext.Provider>
  );
}

export function useFamilyMembers() {
  const context = useContext(FamilyMembersContext);
  if (context === undefined) {
    throw new Error('useFamilyMembers must be used within a FamilyMembersProvider');
  }
  return context;
}
