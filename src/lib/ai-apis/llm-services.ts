/**
 * 大语言模型服务集成
 * 支持OpenAI、百度文心一言、阿里云通义千问等服务
 */

// 环境配置
const USE_MOCK_API = true; // 设置为 false 使用真实API
const OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY || '';
const BAIDU_WENXIN_API_KEY = process.env.NEXT_PUBLIC_BAIDU_WENXIN_API_KEY || '';
const BAIDU_WENXIN_SECRET_KEY = process.env.BAIDU_WENXIN_SECRET_KEY || '';

// API端点配置
const API_ENDPOINTS = {
  OPENAI: {
    BASE_URL: 'https://api.openai.com/v1',
    CHAT_COMPLETIONS: '/chat/completions'
  },
  BAIDU_WENXIN: {
    BASE_URL: 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop',
    CHAT: '/chat/completions_pro'
  }
};

// 支持的模型类型
export type LLMProvider = 'openai' | 'baidu_wenxin' | 'mock';
export type LLMModel = 'gpt-3.5-turbo' | 'gpt-4' | 'ernie-bot-pro' | 'ernie-bot';

// 消息接口
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// AI响应接口
export interface LLMResponse {
  content: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  model?: string;
  finish_reason?: string;
}

// 家族信息接口
export interface FamilyInfo {
  photos: Array<{
    url: string;
    description?: string;
    date?: string;
    location?: string;
    people?: string[];
  }>;
  members: Array<{
    name: string;
    relation: string;
    birth?: string;
    occupation?: string;
    achievements?: string[];
    personality?: string;
  }>;
  events: Array<{
    date: string;
    title: string;
    description: string;
    participants?: string[];
    significance?: string;
  }>;
  traditions?: string[];
  values?: string[];
  heritage?: string;
}

// 故事生成配置
export interface StoryConfig {
  style: 'traditional' | 'modern' | 'novel' | 'biography';
  tone: 'formal' | 'warm' | 'humorous' | 'inspiring';
  length: 'short' | 'medium' | 'long';
  language: 'zh' | 'en';
  focusAreas?: string[];
}

/**
 * 获取百度文心一言访问令牌
 */
async function getBaiduWenxinToken(): Promise<string> {
  const response = await fetch(
    `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${BAIDU_WENXIN_API_KEY}&client_secret=${BAIDU_WENXIN_SECRET_KEY}`,
    { method: 'POST' }
  );

  const data = await response.json();
  if (data.error) {
    throw new Error(`获取百度文心一言Token失败: ${data.error_description}`);
  }

  return data.access_token;
}

/**
 * 调用OpenAI API
 */
async function callOpenAI(messages: ChatMessage[], model: string = 'gpt-3.5-turbo'): Promise<LLMResponse> {
  const response = await fetch(`${API_ENDPOINTS.OPENAI.BASE_URL}${API_ENDPOINTS.OPENAI.CHAT_COMPLETIONS}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 2000
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI API错误: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    content: data.choices[0].message.content,
    usage: data.usage,
    model: data.model,
    finish_reason: data.choices[0].finish_reason
  };
}

/**
 * 调用百度文心一言API
 */
async function callBaiduWenxin(messages: ChatMessage[]): Promise<LLMResponse> {
  const token = await getBaiduWenxinToken();

  const response = await fetch(`${API_ENDPOINTS.BAIDU_WENXIN.BASE_URL}${API_ENDPOINTS.BAIDU_WENXIN.CHAT}?access_token=${token}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messages,
      temperature: 0.7,
      max_output_tokens: 2000
    })
  });

  if (!response.ok) {
    throw new Error(`百度文心一言API错误: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    content: data.result,
    usage: data.usage,
    model: 'ernie-bot-pro'
  };
}

/**
 * 模拟AI响应（用于开发和演示）
 */
async function mockLLMResponse(messages: ChatMessage[]): Promise<LLMResponse> {
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

  const userMessage = messages[messages.length - 1]?.content || '';

  // 根据用户输入生成相应的回复
  let content = '';

  if (userMessage.includes('照片') || userMessage.includes('图片')) {
    content = `我看到了您上传的珍贵照片，这些影像记录着家族的美好时光。请告诉我更多关于照片中的人物和故事，比如：

• 照片中的主要人物是谁？
• 这张照片是在什么时候、什么地方拍摄的？
• 当时发生了什么特别的事情吗？
• 这张照片对您的家族有什么特殊意义？

有了这些信息，我就能为您创作一个更加生动、真实的家族故事。`;
  } else if (userMessage.includes('开始') || userMessage.includes('生成')) {
    content = `好的，让我们开始创作您的家族故事吧！

为了写出最符合您家族特色的故事，我需要了解：

1. **家族核心成员**：主要想要描写哪些家族成员？
2. **故事风格**：您希望是温馨的家庭记录、励志的奋斗历程，还是传统的家族传记？
3. **重点事件**：有什么特别重要的家族事件或转折点吗？
4. **家族特色**：您的家族有什么独特的传统、价值观或特长吗？

请分享这些信息，我会根据您的需求量身定制一个精彩的家族故事。`;
  } else if (userMessage.includes('成员') || userMessage.includes('人物')) {
    content = `感谢您分享的家族成员信息！每个人都是家族故事中的重要角色。

接下来，我想了解更多细节：

• **性格特点**：每个人有什么独特的性格特征？
• **重要贡献**：他们为家族做出了什么重要贡献？
• **互动关系**：家族成员之间有什么温馨或有趣的互动？
• **传承精神**：有什么品质或传统在家族中代代相传？

这些细节将让您的家族故事更加丰富和感人。`;
  } else {
    content = `谢谢您的分享！基于您提供的信息，我正在构思一个精彩的家族故事。

您的家族故事将包含：
✨ 温馨的家庭时光描述
📖 生动的人物性格刻画
🌟 激励人心的成长历程
💝 深刻的情感表达

如果您还有其他想要加入故事的元素，比如特殊的家族传统、难忘的节日庆祝、或者家族的座右铭等，请告诉我。这样我就能为您创作出一个真正独一无二的家族传奇！`;
  }

  return {
    content,
    usage: {
      prompt_tokens: userMessage.length,
      completion_tokens: content.length,
      total_tokens: userMessage.length + content.length
    },
    model: 'mock-gpt',
    finish_reason: 'stop'
  };
}

/**
 * 通用LLM调用接口
 */
export async function callLLM(
  messages: ChatMessage[],
  provider: LLMProvider = 'mock',
  model?: string
): Promise<LLMResponse> {
  if (USE_MOCK_API || provider === 'mock') {
    return mockLLMResponse(messages);
  }

  switch (provider) {
    case 'openai':
      return callOpenAI(messages, model || 'gpt-3.5-turbo');
    case 'baidu_wenxin':
      return callBaiduWenxin(messages);
    default:
      throw new Error(`不支持的LLM提供商: ${provider}`);
  }
}

/**
 * 分析照片内容（使用GPT-4V或其他视觉模型）
 */
export async function analyzePhoto(imageUrl: string, provider: LLMProvider = 'mock'): Promise<string> {
  if (USE_MOCK_API || provider === 'mock') {
    // 模拟照片分析
    await new Promise(resolve => setTimeout(resolve, 1500));

    const analyses = [
      "这张照片显示了一个温馨的家庭聚会场景，可以看到不同年龄段的家族成员围坐在一起，脸上洋溢着幸福的笑容。背景似乎是在家中的客厅，装饰温馨典雅。",
      "照片中记录了一个重要的家族庆祝时刻，可能是生日或节日聚会。桌上摆放着丰盛的食物，体现了家族重视团聚的传统。",
      "这是一张珍贵的多代同堂照片，从服装和背景可以看出拍摄时代，记录了家族在特定历史时期的生活状态。每个人的表情都很自然，体现了家族的和睦氛围。"
    ];

    return analyses[Math.floor(Math.random() * analyses.length)];
  }

  // 真实API调用逻辑
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: '你是一个专业的照片分析师，请详细描述照片中的内容，包括人物、场景、情感氛围等，用于家族故事创作。'
    },
    {
      role: 'user',
      content: `请分析这张照片的内容：${imageUrl}`
    }
  ];

  const response = await callLLM(messages, provider);
  return response.content;
}

/**
 * 生成家族故事大纲
 */
export async function generateStoryOutline(
  familyInfo: FamilyInfo,
  config: StoryConfig,
  provider: LLMProvider = 'mock'
): Promise<string> {
  const systemPrompt = `你是一位专业的家族史作家，擅长根据家族信息创作${config.style === 'traditional' ? '传统家族史' : config.style === 'modern' ? '现代家庭故事' : config.style === 'novel' ? '小说体裁' : '人物传记'}风格的作品。

请根据提供的家族信息生成一个详细的故事大纲，包括：
1. 故事主线和章节结构
2. 主要人物角色设定
3. 重要情节和转折点
4. 情感主题和价值观体现

风格要求：${config.tone === 'formal' ? '正式严谨' : config.tone === 'warm' ? '温馨感人' : config.tone === 'humorous' ? '轻松幽默' : '激励人心'}
篇幅：${config.length === 'short' ? '简短精炼' : config.length === 'medium' ? '中等篇幅' : '详细完整'}`;

  const userPrompt = `家族信息：
成员：${familyInfo.members.map(m => `${m.name}（${m.relation}）`).join('、')}
重要事件：${familyInfo.events.map(e => e.title).join('、')}
家族传统：${familyInfo.traditions?.join('、') || '暂无'}
家族价值观：${familyInfo.values?.join('、') || '暂无'}

请生成故事大纲。`;

  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ];

  const response = await callLLM(messages, provider);
  return response.content;
}

/**
 * 生成故事章节
 */
export async function generateStoryChapter(
  chapterTitle: string,
  chapterOutline: string,
  familyInfo: FamilyInfo,
  config: StoryConfig,
  provider: LLMProvider = 'mock'
): Promise<string> {
  const systemPrompt = `你是一位专业的家族史作家，正在创作一部${config.style}风格的家族故事。请根据章节大纲创作具体内容，要求：

1. 文笔${config.tone === 'formal' ? '正式典雅' : config.tone === 'warm' ? '温馨动人' : config.tone === 'humorous' ? '生动有趣' : '激励人心'}
2. 情节生动具体，富有画面感
3. 人物形象鲜明，对话自然
4. 体现家族的价值观和精神传承
5. 语言优美，富有文学性`;

  const userPrompt = `章节标题：${chapterTitle}
章节大纲：${chapterOutline}

相关家族信息：
${JSON.stringify(familyInfo, null, 2)}

请创作这一章节的具体内容。`;

  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ];

  const response = await callLLM(messages, provider);
  return response.content;
}

/**
 * 交互式故事生成
 */
export async function chatWithStoryAI(
  userMessage: string,
  conversationHistory: ChatMessage[],
  familyInfo?: Partial<FamilyInfo>,
  provider: LLMProvider = 'mock'
): Promise<LLMResponse> {
  const systemPrompt = `你是本家AI的专业家族故事创作助手，专门帮助用户创作个性化的家族故事。你的特点：

1. **专业性**：具有丰富的家族史创作经验
2. **耐心引导**：通过提问帮助用户提供更多信息
3. **创意丰富**：能够将零散信息编织成精彩故事
4. **情感共鸣**：理解家族情感的珍贵和复杂
5. **文化敏感**：尊重不同的家族传统和价值观

你的任务是：
- 引导用户分享家族信息
- 分析用户上传的照片
- 根据信息创作故事片段
- 提供创作建议和修改意见
- 帮助完善故事内容

请用温暖、专业的语气与用户交流，让他们感受到家族故事的珍贵价值。`;

  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory,
    { role: 'user', content: userMessage }
  ];

  return callLLM(messages, provider);
}

/**
 * 检查API配置
 */
export function checkLLMConfiguration(): { isValid: boolean; message: string; availableProviders: LLMProvider[] } {
  const availableProviders: LLMProvider[] = ['mock'];

  if (USE_MOCK_API) {
    return {
      isValid: true,
      message: '当前使用模拟API，可以体验完整功能',
      availableProviders
    };
  }

  let hasValidConfig = false;

  if (OPENAI_API_KEY) {
    availableProviders.push('openai');
    hasValidConfig = true;
  }

  if (BAIDU_WENXIN_API_KEY && BAIDU_WENXIN_SECRET_KEY) {
    availableProviders.push('baidu_wenxin');
    hasValidConfig = true;
  }

  return {
    isValid: hasValidConfig,
    message: hasValidConfig
      ? `已配置 ${availableProviders.filter(p => p !== 'mock').join('、')} 服务`
      : '请配置至少一个LLM服务的API密钥',
    availableProviders
  };
}

// 使用指南
export const LLM_SETUP_GUIDE = {
  title: "AI家族故事生成服务配置指南",
  providers: {
    openai: {
      name: "OpenAI GPT",
      steps: [
        "访问 https://platform.openai.com/",
        "注册账号并获取API Key",
        "设置环境变量 NEXT_PUBLIC_OPENAI_API_KEY"
      ],
      models: ["gpt-3.5-turbo", "gpt-4"],
      pricing: "按token计费，详见官网"
    },
    baidu_wenxin: {
      name: "百度文心一言",
      steps: [
        "访问 https://console.bce.baidu.com/qianfan/",
        "开通文心一言服务",
        "获取API Key和Secret Key",
        "设置环境变量 NEXT_PUBLIC_BAIDU_WENXIN_API_KEY 和 BAIDU_WENXIN_SECRET_KEY"
      ],
      models: ["ernie-bot-pro", "ernie-bot"],
      pricing: "有免费额度，超出按量计费"
    }
  }
};
