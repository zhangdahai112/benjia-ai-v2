"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useFamilyMembers, type FamilyMember } from "@/contexts/FamilyMembersContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  User,
  Calendar,
  Heart,
  Briefcase,
  Save,
  X,
  Loader2
} from "lucide-react";

interface MemberEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member?: FamilyMember | null; // null表示添加新成员
  generation?: number; // 添加新成员时指定代数
}

const GENERATION_NAMES = {
  1: '第一代（曾祖父母）',
  2: '第二代（祖父母）',
  3: '第三代（父母）',
  4: '第四代（本代）',
  5: '第五代（子女）'
};

const RELATION_OPTIONS = {
  1: [
    { value: '曾祖父', label: '曾祖父' },
    { value: '曾祖母', label: '曾祖母' },
    { value: 'custom', label: '自定义关系' }
  ],
  2: [
    { value: '祖父', label: '祖父' },
    { value: '祖母', label: '祖母' },
    { value: '外祖父', label: '外祖父' },
    { value: '外祖母', label: '外祖母' },
    { value: 'custom', label: '自定义关系' }
  ],
  3: [
    { value: '父亲', label: '父亲' },
    { value: '母亲', label: '母亲' },
    { value: '伯父', label: '伯父' },
    { value: '伯母', label: '伯母' },
    { value: '叔父', label: '叔父' },
    { value: '叔母', label: '叔母' },
    { value: '姑父', label: '姑父' },
    { value: '姑母', label: '姑母' },
    { value: 'custom', label: '自定义关系' }
  ],
  4: [
    { value: '本人', label: '本人' },
    { value: '配偶', label: '配偶' },
    { value: '兄弟', label: '兄弟' },
    { value: '姐妹', label: '姐妹' },
    { value: '堂兄弟', label: '堂兄弟' },
    { value: '堂姐妹', label: '堂姐妹' },
    { value: '表兄弟', label: '表兄弟' },
    { value: '表姐妹', label: '表姐妹' },
    { value: '嫂子', label: '嫂子' },
    { value: '弟媳', label: '弟媳' },
    { value: '姐夫', label: '姐夫' },
    { value: '妹夫', label: '妹夫' },
    { value: 'custom', label: '自定义关系' }
  ],
  5: [
    { value: '儿子', label: '儿子' },
    { value: '女儿', label: '女儿' },
    { value: '侄子', label: '侄子' },
    { value: '侄女', label: '侄女' },
    { value: '外甥', label: '外甥' },
    { value: '外甥女', label: '外甥女' },
    { value: 'custom', label: '自定义关系' }
  ]
};

export default function MemberEditDialog({ open, onOpenChange, member, generation = 4 }: MemberEditDialogProps) {
  const { addMember, updateMember, canEditMember } = useFamilyMembers();
  const { user, family } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const isEdit = !!member;
  const targetGeneration = member?.generation || generation;

  // 表单状态
  const [formData, setFormData] = useState({
    name: '',
    relation: '',
    gender: 'male' as 'male' | 'female',
    birth: '',
    death: '',
    alive: true,
    bio: '',
    occupation: ''
  });

  // 自定义关系状态
  const [customRelation, setCustomRelation] = useState('');
  const [isCustomRelation, setIsCustomRelation] = useState(false);

  // 表单验证错误
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 重置表单
  const resetForm = () => {
    if (member) {
      // 检查是否是自定义关系
      const relationOptions = RELATION_OPTIONS[targetGeneration as keyof typeof RELATION_OPTIONS] || [];
      const isCustom = !relationOptions.some(option => option.value === member.relation);

      setFormData({
        name: member.name,
        relation: isCustom ? 'custom' : member.relation,
        gender: member.gender,
        birth: member.birth,
        death: member.death || '',
        alive: member.alive,
        bio: member.bio || '',
        occupation: member.occupation || ''
      });

      setIsCustomRelation(isCustom);
      setCustomRelation(isCustom ? member.relation : '');
    } else {
      setFormData({
        name: '',
        relation: '',
        gender: 'male',
        birth: '',
        death: '',
        alive: true,
        bio: '',
        occupation: ''
      });
      setIsCustomRelation(false);
      setCustomRelation('');
    }
    setErrors({});
  };

  // 当对话框打开或成员变化时重置表单
  useEffect(() => {
    if (open) {
      resetForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, member]); // resetForm 在每次渲染时都会重新创建，所以不需要添加到依赖中

  // 表单验证
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = '请输入姓名';
    }

    if (!formData.relation.trim()) {
      newErrors.relation = '请选择关系';
    } else if (formData.relation === 'custom' && !customRelation.trim()) {
      newErrors.relation = '请输入自定义关系';
    }

    if (!formData.birth.trim()) {
      newErrors.birth = '请输入出生日期';
    } else {
      const birthDate = new Date(formData.birth);
      if (isNaN(birthDate.getTime())) {
        newErrors.birth = '请输入有效的日期格式';
      }
    }

    if (!formData.alive && !formData.death.trim()) {
      newErrors.death = '请输入逝世日期';
    }

    if (!formData.alive && formData.death.trim()) {
      const deathDate = new Date(formData.death);
      const birthDate = new Date(formData.birth);
      if (isNaN(deathDate.getTime())) {
        newErrors.death = '请输入有效的逝世日期';
      } else if (deathDate <= birthDate) {
        newErrors.death = '逝世日期不能早于出生日期';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 提交表单
  const handleSubmit = async () => {
    if (!validateForm()) return;
    if (!user || !family) return;

    // 检查编辑权限
    if (isEdit && member && !canEditMember(member.id)) {
      toast({
        title: "权限不足",
        description: "您没有权限编辑该成员信息",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // 确定最终的关系值
      const finalRelation = formData.relation === 'custom' ? customRelation.trim() : formData.relation;

      if (isEdit && member) {
        // 更新现有成员
        const success = await updateMember(member.id, {
          name: formData.name.trim(),
          relation: finalRelation,
          gender: formData.gender,
          birth: formData.birth,
          death: formData.alive ? undefined : formData.death,
          alive: formData.alive,
          bio: formData.bio.trim(),
          occupation: formData.occupation.trim()
        });

        if (success) {
          toast({
            title: "更新成功",
            description: `${formData.name}的信息已更新`
          });
          onOpenChange(false);
        } else {
          toast({
            title: "更新失败",
            description: "请稍后重试",
            variant: "destructive"
          });
        }
      } else {
        // 添加新成员
        const success = await addMember({
          name: formData.name.trim(),
          relation: finalRelation,
          generation: targetGeneration,
          gender: formData.gender,
          birth: formData.birth,
          death: formData.alive ? undefined : formData.death,
          alive: formData.alive,
          bio: formData.bio.trim(),
          occupation: formData.occupation.trim(),
          parentIds: [],
          childrenIds: [],
          familyId: family.id,
          createdBy: user.id
        });

        if (success) {
          toast({
            title: "添加成功",
            description: `${formData.name}已添加到家族`
          });
          onOpenChange(false);
        } else {
          toast({
            title: "添加失败",
            description: "请稍后重试",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      toast({
        title: "操作失败",
        description: "网络错误，请稍后重试",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {isEdit ? '编辑家族成员' : '添加家族成员'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? `编辑 ${member?.name} 的信息`
              : `添加新成员到${GENERATION_NAMES[targetGeneration as keyof typeof GENERATION_NAMES]}`
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 基本信息 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-800">基本信息</h3>

            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-700">
                姓名 *
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className={`pl-9 ${errors.name ? 'border-red-500' : ''}`}
                  placeholder="请输入姓名"
                />
              </div>
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="relation" className="text-gray-700">
                  关系 *
                </Label>
                <Select
                  value={formData.relation}
                  onValueChange={(value) => {
                    const isCustom = value === 'custom';
                    setFormData({...formData, relation: value});
                    setIsCustomRelation(isCustom);
                    if (!isCustom) {
                      setCustomRelation('');
                    }
                  }}
                >
                  <SelectTrigger className={errors.relation ? 'border-red-500' : ''}>
                    <SelectValue placeholder="选择关系" />
                  </SelectTrigger>
                  <SelectContent>
                    {RELATION_OPTIONS[targetGeneration as keyof typeof RELATION_OPTIONS]?.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.relation && (
                  <p className="text-sm text-red-600">{errors.relation}</p>
                )}

                {/* 自定义关系输入框 */}
                {isCustomRelation && (
                  <div className="mt-2">
                    <Input
                      value={customRelation}
                      onChange={(e) => setCustomRelation(e.target.value)}
                      placeholder="请输入具体关系称谓，如：嫂子、妹夫、大姑等"
                      className={errors.relation && formData.relation === 'custom' && !customRelation.trim() ? 'border-red-500' : ''}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      可输入：嫂子、弟媳、姐夫、妹夫、大姑、小姑、大伯、二叔、三婶等
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender" className="text-gray-700">
                  性别
                </Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value: 'male' | 'female') => setFormData({...formData, gender: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">男</SelectItem>
                    <SelectItem value="female">女</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="birth" className="text-gray-700">
                  出生日期 *
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="birth"
                    type="date"
                    value={formData.birth}
                    onChange={(e) => setFormData({...formData, birth: e.target.value})}
                    className={`pl-9 ${errors.birth ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.birth && (
                  <p className="text-sm text-red-600">{errors.birth}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700 flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={!formData.alive}
                    onChange={(e) => setFormData({...formData, alive: !e.target.checked, death: e.target.checked ? formData.death : ''})}
                    className="rounded"
                  />
                  <span>已故</span>
                </Label>
                {!formData.alive && (
                  <div className="relative">
                    <Heart className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      type="date"
                      value={formData.death}
                      onChange={(e) => setFormData({...formData, death: e.target.value})}
                      className={`pl-9 ${errors.death ? 'border-red-500' : ''}`}
                      placeholder="逝世日期"
                    />
                  </div>
                )}
                {errors.death && (
                  <p className="text-sm text-red-600">{errors.death}</p>
                )}
              </div>
            </div>
          </div>

          {/* 详细信息 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-800">详细信息（可选）</h3>

            <div className="space-y-2">
              <Label htmlFor="occupation" className="text-gray-700">
                职业
              </Label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="occupation"
                  value={formData.occupation}
                  onChange={(e) => setFormData({...formData, occupation: e.target.value})}
                  className="pl-9"
                  placeholder="如：教师、医生、工程师"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio" className="text-gray-700">
                个人简介
              </Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                placeholder="描述该成员的生平、成就、性格特点等..."
                className="min-h-20"
                maxLength={500}
              />
              <p className="text-xs text-gray-500">
                {formData.bio.length}/500
              </p>
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex space-x-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
            disabled={isLoading}
          >
            <X className="w-4 h-4 mr-2" />
            取消
          </Button>
          <Button
            onClick={handleSubmit}
            className="flex-1 bg-orange-500 hover:bg-orange-600"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {isEdit ? '更新中...' : '添加中...'}
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {isEdit ? '更新' : '添加'}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
