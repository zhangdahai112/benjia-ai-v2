"use client";

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useFamilyMembers, type FamilyMember } from '@/contexts/FamilyMembersContext';

interface FamilyTreeLinesProps {
  containerRef: React.RefObject<HTMLDivElement>;
}

interface MemberPosition {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  generation: number;
}

interface RelationLine {
  id: string;
  type: 'parent-child' | 'spouse' | 'sibling';
  from: { x: number; y: number };
  to: { x: number; y: number };
  color: string;
  strokeWidth: number;
  strokeDasharray?: string;
}

export default function FamilyTreeLines({ containerRef }: FamilyTreeLinesProps) {
  const { members, getMembersByGeneration } = useFamilyMembers();
  const [memberPositions, setMemberPositions] = useState<MemberPosition[]>([]);
  const [relationLines, setRelationLines] = useState<RelationLine[]>([]);
  const svgRef = useRef<SVGSVGElement>(null);

  // 计算成员位置
  const calculateMemberPositions = useCallback(() => {
    if (!containerRef.current) return;

    const positions: MemberPosition[] = [];
    const container = containerRef.current;

    // 查找所有成员卡片元素
    for (let generation = 1; generation <= 5; generation++) {
      const generationCard = container.querySelector(`[data-generation="${generation}"]`);
      if (!generationCard) continue;

      const memberCards = generationCard.querySelectorAll('[data-member-id]');
      memberCards.forEach((card, index) => {
        const memberId = card.getAttribute('data-member-id');
        if (!memberId) return;

        const rect = card.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();

        positions.push({
          id: memberId,
          x: rect.left - containerRect.left + rect.width / 2,
          y: rect.top - containerRect.top + rect.height / 2,
          width: rect.width,
          height: rect.height,
          generation
        });
      });
    }

    setMemberPositions(positions);
  }, [containerRef]);

  // 生成关系线
  const generateRelationLines = useCallback(() => {
    if (memberPositions.length === 0) return;

    const lines: RelationLine[] = [];
    const positionMap = new Map(memberPositions.map(pos => [pos.id, pos]));

    // 生成父子关系线
    members.forEach(member => {
      const memberPos = positionMap.get(member.id);
      if (!memberPos) return;

      // 父子关系线（向下连接）
      member.childrenIds.forEach(childId => {
        const childPos = positionMap.get(childId);
        if (!childPos) return;

        // 父子垂直连接线
        const midY = memberPos.y + (childPos.y - memberPos.y) / 2;

        // 简化的父子连接线
        lines.push({
          id: `parent-child-${member.id}-${childId}`,
          type: 'parent-child',
          from: { x: memberPos.x, y: memberPos.y + memberPos.height / 2 + 15 },
          to: { x: childPos.x, y: childPos.y - childPos.height / 2 - 15 },
          color: '#059669', // green-600
          strokeWidth: 2
        });
      });

      // 夫妻关系线（水平连接）
      if (member.spouse) {
        const spousePos = positionMap.get(member.spouse);
        if (spousePos && memberPos.generation === spousePos.generation) {
          // 避免重复绘制同一对夫妻的关系线
          if (member.id < member.spouse) {
            const leftPos = memberPos.x < spousePos.x ? memberPos : spousePos;
            const rightPos = memberPos.x < spousePos.x ? spousePos : memberPos;

            lines.push({
              id: `spouse-${member.id}-${member.spouse}`,
              type: 'spouse',
              from: { x: leftPos.x + leftPos.width / 4, y: leftPos.y },
              to: { x: rightPos.x - rightPos.width / 4, y: rightPos.y },
              color: '#dc2626', // red-600
              strokeWidth: 3,
              strokeDasharray: '5,5'
            });
          }
        }
      }
    });

    // 生成兄弟姐妹关系线
    for (let generation = 1; generation <= 5; generation++) {
      const generationMembers = getMembersByGeneration(generation)
        .map(member => ({ member, position: positionMap.get(member.id) }))
        .filter(item => item.position)
        .sort((a, b) => a.position!.x - b.position!.x);

      // 连接同父母的兄弟姐妹
      const siblingGroups = new Map<string, typeof generationMembers>();

      generationMembers.forEach(({ member, position }) => {
        if (member.parentIds.length > 0) {
          const parentKey = member.parentIds.sort().join('-');
          if (!siblingGroups.has(parentKey)) {
            siblingGroups.set(parentKey, []);
          }
          siblingGroups.get(parentKey)!.push({ member, position });
        }
      });

      siblingGroups.forEach(siblings => {
        if (siblings.length > 1) {
          for (let i = 0; i < siblings.length - 1; i++) {
            const current = siblings[i].position!;
            const next = siblings[i + 1].position!;

            lines.push({
              id: `sibling-${siblings[i].member.id}-${siblings[i + 1].member.id}`,
              type: 'sibling',
              from: { x: current.x + current.width / 2, y: current.y - 20 },
              to: { x: next.x - next.width / 2, y: next.y - 20 },
              color: '#2563eb', // blue-600
              strokeWidth: 1,
              strokeDasharray: '3,3'
            });
          }
        }
      });
    }

    setRelationLines(lines);
  }, [memberPositions, members, getMembersByGeneration]);

  // 监听窗口大小变化和成员变化
  useEffect(() => {
    const handleResize = () => {
      calculateMemberPositions();
    };

    const timer = setTimeout(() => {
      calculateMemberPositions();
    }, 100);

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, [members, containerRef, calculateMemberPositions]);

  // 当位置计算完成后生成关系线
  useEffect(() => {
    if (memberPositions.length > 0) {
      generateRelationLines();
    }
  }, [memberPositions, generateRelationLines]);

  // 如果没有关系线，不渲染SVG
  if (relationLines.length === 0) {
    return null;
  }

  const containerRect = containerRef.current?.getBoundingClientRect();
  if (!containerRect) return null;

  return (
    <svg
      ref={svgRef}
      className="absolute top-0 left-0 pointer-events-none z-10"
      style={{
        width: containerRect.width,
        height: containerRect.height
      }}
    >
      <defs>
        {/* 定义箭头标记 */}
        <marker
          id="arrowhead-parent"
          markerWidth="10"
          markerHeight="7"
          refX="10"
          refY="3.5"
          orient="auto"
        >
          <polygon
            points="0 0, 10 3.5, 0 7"
            fill="#059669"
          />
        </marker>
        <marker
          id="heart-spouse"
          markerWidth="12"
          markerHeight="12"
          refX="6"
          refY="6"
          orient="auto"
        >
          <path
            d="M6 10c-2-2-6-4-6-7 0-2 2-3 3-3s3 1 3 3c0-2 2-3 3-3s3 1 3 3c0 3-4 5-6 7z"
            fill="#dc2626"
          />
        </marker>
      </defs>

      {relationLines.map(line => (
        <g key={line.id}>
          {line.type === 'parent-child' && (
            <line
              x1={line.from.x}
              y1={line.from.y}
              x2={line.to.x}
              y2={line.to.y}
              stroke={line.color}
              strokeWidth={line.strokeWidth}
              strokeDasharray={line.strokeDasharray}
              markerEnd={line.type === 'parent-child' ? 'url(#arrowhead-parent)' : undefined}
            />
          )}
          {line.type === 'spouse' && (
            <line
              x1={line.from.x}
              y1={line.from.y}
              x2={line.to.x}
              y2={line.to.y}
              stroke={line.color}
              strokeWidth={line.strokeWidth}
              strokeDasharray={line.strokeDasharray}
              markerMid="url(#heart-spouse)"
            />
          )}
          {line.type === 'sibling' && (
            <line
              x1={line.from.x}
              y1={line.from.y}
              x2={line.to.x}
              y2={line.to.y}
              stroke={line.color}
              strokeWidth={line.strokeWidth}
              strokeDasharray={line.strokeDasharray}
            />
          )}
        </g>
      ))}

      {/* 关系说明图例 */}
      <g transform="translate(20, 20)">
        <rect
          x="0"
          y="0"
          width="180"
          height="80"
          fill="white"
          stroke="#e5e7eb"
          strokeWidth="1"
          rx="6"
          fillOpacity="0.95"
        />
        <text x="10" y="20" fontSize="12" fontWeight="bold" fill="#374151">
          关系说明
        </text>

        {/* 父子关系 */}
        <line x1="10" y1="35" x2="30" y2="35" stroke="#059669" strokeWidth="2" markerEnd="url(#arrowhead-parent)" />
        <text x="35" y="39" fontSize="10" fill="#374151">父子关系</text>

        {/* 夫妻关系 */}
        <line x1="10" y1="50" x2="30" y2="50" stroke="#dc2626" strokeWidth="3" strokeDasharray="5,5" />
        <text x="35" y="54" fontSize="10" fill="#374151">夫妻关系</text>

        {/* 兄弟姐妹关系 */}
        <line x1="10" y1="65" x2="30" y2="65" stroke="#2563eb" strokeWidth="1" strokeDasharray="3,3" />
        <text x="35" y="69" fontSize="10" fill="#374151">兄弟姐妹</text>
      </g>
    </svg>
  );
}
