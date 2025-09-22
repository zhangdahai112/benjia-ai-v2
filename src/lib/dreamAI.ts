// DeepSeek API 解梦服务
interface DreamAnalysis {
  score: number;
  meanings: string[];
  keywords: string[];
  advice: string;
  cultural_context: string;
}

interface DeepSeekResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

class DreamAIService {
  private apiKey: string = '';
  private baseURL = 'https://api.deepseek.com/v1/chat/completions';

  constructor() {
    // 从环境变量或localStorage获取API密钥
    if (typeof window !== 'undefined') {
      this.apiKey = localStorage.getItem('deepseek_api_key') || '';
    }
  }

  // 设置API密钥
  setApiKey(key: string): void {
    this.apiKey = key;
    if (typeof window !== 'undefined') {
      localStorage.setItem('deepseek_api_key', key);
    }
  }

  // 获取API密钥状态
  hasApiKey(): boolean {
    return !!this.apiKey;
  }

  // 构建解梦提示词
  private buildPrompt(dream: string): string {
    return `你是一位精通香港传统文化和周公解梦的大师，请分析以下梦境：

梦境描述：${dream}

请按照以下JSON格式返回分析结果：
{
  "score": 数字(-10到10，负数代表不吉利，正数代表吉利),
  "meanings": ["解读1", "解读2", "解读3"],
  "keywords": ["关键词1", "关键词2"],
  "advice": "给梦者的建议",
  "cultural_context": "香港文化相关解读"
}

要求：
1. 评分范围：-10（极不吉利）到 +10（极吉利）
2. 解读要结合传统周公解梦和现代心理学
3. 融入香港本地文化元素（如财运、事业、人际关系等）
4. 语言风格要贴近香港人的表达习惯
5. 如果梦境包含香港特色元素（维港、太平山、茶餐厅、叮叮车等），要特别解读
6. 建议要实用且积极向上

请直接返回JSON格式，不要包含其他文字。`;
  }

  // 调用DeepSeek API
  async analyzeDream(dream: string): Promise<DreamAnalysis> {
    if (!this.apiKey) {
      throw new Error('请先设置DeepSeek API密钥');
    }

    if (!dream.trim()) {
      throw new Error('请输入梦境描述');
    }

    try {
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'user',
              content: this.buildPrompt(dream)
            }
          ],
          max_tokens: 1000,
          temperature: 0.7,
          stream: false
        })
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('API密钥无效，请检查设置');
        } else if (response.status === 429) {
          throw new Error('API调用频率过高，请稍后再试');
        } else {
          throw new Error(`API调用失败: ${response.status}`);
        }
      }

      const data: DeepSeekResponse = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error('API返回数据格式错误');
      }

      // 解析JSON响应
      try {
        const analysis: DreamAnalysis = JSON.parse(content);

        // 验证返回数据格式
        if (typeof analysis.score !== 'number' ||
            !Array.isArray(analysis.meanings) ||
            !Array.isArray(analysis.keywords)) {
          throw new Error('AI返回数据格式不正确');
        }

        // 确保分数在有效范围内
        analysis.score = Math.max(-10, Math.min(10, analysis.score));

        return analysis;
      } catch (parseError) {
        console.error('JSON解析错误:', parseError);
        throw new Error('AI响应格式解析失败');
      }

    } catch (error) {
      console.error('DeepSeek API调用错误:', error);

      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error('网络连接失败，请检查网络');
      }
    }
  }

  // 备用本地解梦（当API不可用时）
  getFallbackAnalysis(dream: string): DreamAnalysis {
    const keywords = this.extractKeywords(dream);
    const score = this.calculateLocalScore(keywords, dream);

    return {
      score,
      meanings: [
        '这是一个充满象征意义的梦境',
        '反映了您内心深处的想法和情感',
        '建议关注梦境中的细节和感受'
      ],
      keywords: keywords.slice(0, 3),
      advice: score >= 0 ? '保持积极心态，好运将会到来' : '建议多注意生活细节，避免小麻烦',
      cultural_context: '从传统周公解梦角度来看，此梦有其特殊含义'
    };
  }

  // 提取本地关键词
  private extractKeywords(dream: string): string[] {
    const localKeywords = [
      '龙', '蛇', '死', '水', '飞', '钱', '鱼', '火', '考试', '结婚', '生病', '掉牙',
      '茶餐厅', '维港', '太平山', '叮叮车', '港币', '月饼', '麻将', '菠萝包',
      '台风', '红包', '狮子舞', '观音', '黄大仙', '粤语'
    ];

    return localKeywords.filter(keyword => dream.includes(keyword));
  }

  // 计算本地分数
  private calculateLocalScore(keywords: string[], dream: string): number {
    const keywordScores: Record<string, number> = {
      '龙': 8, '水': 5, '飞': 7, '钱': 6, '鱼': 4, '考试': 3, '结婚': 9,
      '茶餐厅': 5, '维港': 8, '太平山': 6, '港币': 7, '月饼': 5, '红包': 8,
      '狮子舞': 7, '观音': 9, '黄大仙': 8, '粤语': 4,
      '蛇': -3, '死': -7, '火': -2, '生病': -5, '掉牙': -4, '台风': -6
    };

    let totalScore = 0;
    keywords.forEach(keyword => {
      totalScore += keywordScores[keyword] || 0;
    });

    // 如果没有关键词，给随机分数
    if (keywords.length === 0) {
      totalScore = Math.floor(Math.random() * 21) - 10;
    }

    return Math.max(-10, Math.min(10, totalScore));
  }
}

// 导出单例
export const dreamAI = new DreamAIService();
export type { DreamAnalysis };
