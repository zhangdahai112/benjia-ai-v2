# 本家AI - 大语言模型服务配置指南

## 🚀 概述

本家AI已集成多个大语言模型服务，为AI家族故事生成提供强大支持：

### 支持的服务商
- **OpenAI GPT**：业界领先的大语言模型
- **百度文心一言**：国产先进的对话AI
- **模拟模式**：用于演示和开发测试

### 核心功能
- 🗣️ **智能对话**：与AI助手自然对话，分享家族信息
- 📸 **照片分析**：AI自动分析上传照片的内容和情感
- ✍️ **故事创作**：根据对话内容生成个性化家族故事
- 📖 **多种风格**：支持传统、现代、传记等多种故事风格

## 📋 配置步骤

### 方案一：OpenAI GPT（推荐）

#### 1. 注册OpenAI账号
1. 访问 [OpenAI平台](https://platform.openai.com/)
2. 注册账号并完成邮箱验证
3. 进入API Keys页面

#### 2. 获取API密钥
1. 点击"Create new secret key"
2. 复制生成的API密钥（以`sk-`开头）
3. 妥善保存密钥，离开页面后无法再次查看

#### 3. 配置环境变量
在项目根目录创建 `.env.local` 文件：

```bash
# OpenAI API配置
NEXT_PUBLIC_OPENAI_API_KEY=sk-your_openai_api_key_here
```

#### 4. 启用服务
编辑 `src/lib/ai-apis/llm-services.ts` 文件：

```typescript
// 将此行修改为 false 启用真实API
const USE_MOCK_API = false;
```

### 方案二：百度文心一言

#### 1. 注册百度智能云
1. 访问 [百度智能云](https://console.bce.baidu.com/)
2. 注册并登录百度账号
3. 进入千帆大模型平台

#### 2. 开通文心一言服务
1. 在产品服务中找到"千帆大模型平台"
2. 开通文心一言服务
3. 创建应用并获取API Key和Secret Key

#### 3. 配置环境变量
```bash
# 百度文心一言配置
NEXT_PUBLIC_BAIDU_WENXIN_API_KEY=your_api_key_here
BAIDU_WENXIN_SECRET_KEY=your_secret_key_here
```

### 方案三：模拟模式（默认）

无需配置，开箱即用，适合：
- 功能演示和测试
- 开发环境调试
- 不想使用付费服务的用户

## 💰 费用说明

### OpenAI GPT定价

| 模型 | 输入Token价格 | 输出Token价格 | 适用场景 |
|------|-------------|-------------|----------|
| GPT-3.5-turbo | $0.0015/1K tokens | $0.002/1K tokens | 日常对话，性价比高 |
| GPT-4 | $0.03/1K tokens | $0.06/1K tokens | 高质量创作，效果最佳 |

**估算**：生成一个3000字的家族故事约消耗5000-8000 tokens，成本约$0.01-0.05

### 百度文心一言定价

| 服务 | 免费额度 | 超出后价格 |
|------|----------|------------|
| ERNIE-Bot | 100万tokens/月 | ¥0.012/1K tokens |
| ERNIE-Bot-Pro | 10万tokens/月 | ¥0.12/1K tokens |

**估算**：免费额度可生成约100-200个家族故事

## 🔧 使用功能

### 已实现功能

✅ **智能对话界面**
- 自然语言交流
- 上下文记忆
- 多轮对话支持
- 实时响应显示

✅ **照片智能分析**
- 自动识别照片内容
- 提取人物和场景信息
- 分析情感氛围
- 生成描述文本

✅ **个性化故事创作**
- 多种故事风格选择
- 基于对话内容生成
- 支持实时预览
- 导出多种格式

✅ **项目管理**
- 创建多个故事项目
- 保存创作进度
- 查看历史对话
- 管理上传照片

### 使用流程

1. **创建项目**
   - 选择故事风格（传统/现代/传记/小说）
   - 设置写作语调（正式/温馨/幽默/励志）
   - 配置故事长度和语言

2. **与AI对话**
   - 描述家族成员和关系
   - 分享重要事件和传统
   - 讲述有趣的家族故事
   - 表达希望突出的主题

3. **上传照片**
   - 选择有代表性的家族照片
   - AI自动分析照片内容
   - 提取故事元素和细节
   - 增强故事的真实感

4. **生成故事**
   - AI根据对话生成故事大纲
   - 创作完整的家族故事
   - 支持在线预览和编辑
   - 下载保存最终作品

## 🛡️ 安全与隐私

### 数据安全
- 所有对话内容仅用于故事生成
- 照片分析完成后不会被存储
- API调用通过HTTPS加密传输
- 支持本地数据管理

### 隐私保护
- 对话记录仅保存在本地浏览器
- 不会向第三方分享个人信息
- 用户可随时删除项目数据
- 支持匿名使用模式

## 🐛 故障排除

### 常见问题

**Q: API调用失败，显示认证错误**
A: 检查API密钥是否正确配置，确认密钥有效且有足够余额

**Q: AI回复内容质量不高**
A: 尝试提供更详细的家族信息，或切换到更高级的模型（如GPT-4）

**Q: 对话响应速度慢**
A: 可能是网络问题或API服务器负载高，请稍后重试

**Q: 照片分析功能不可用**
A: 当前仅支持GPT-4V进行照片分析，请确认已配置相应模型

**Q: 故事生成中断或失败**
A: 检查网络连接和API配额，可尝试重新生成或联系技术支持

### 调试技巧

1. **开启调试模式**
```typescript
// 在 llm-services.ts 中启用日志
console.log('API Request:', requestData);
console.log('API Response:', responseData);
```

2. **检查API状态**
- OpenAI: https://status.openai.com/
- 百度云: https://cloud.baidu.com/status

3. **测试连接**
```typescript
import { checkLLMConfiguration } from '@/lib/ai-apis/llm-services';
const status = checkLLMConfiguration();
console.log('LLM配置状态:', status);
```

## 📈 高级配置

### 性能优化

1. **选择合适的模型**
- 日常对话：GPT-3.5-turbo（性价比高）
- 高质量创作：GPT-4（效果最佳）
- 中文场景：百度文心一言（本土化好）

2. **调整参数**
```typescript
// 在 llm-services.ts 中调整参数
{
  temperature: 0.7,  // 创造性（0-1）
  max_tokens: 2000,  // 最大输出长度
  top_p: 0.9        // 采样多样性
}
```

3. **缓存机制**
- 相似问题使用缓存回复
- 减少重复API调用
- 提升响应速度

### 自定义扩展

1. **添加新的AI服务商**
```typescript
// 在 llm-services.ts 中添加新提供商
case 'your_provider':
  return callYourProviderAPI(messages);
```

2. **自定义故事模板**
```typescript
// 修改系统提示词
const customPrompt = `你是专业的${style}风格作家...`;
```

3. **集成其他功能**
- 语音转文字
- 图像生成
- 音频朗读

## 📞 技术支持

### 官方文档
- [OpenAI API文档](https://platform.openai.com/docs)
- [百度文心一言文档](https://cloud.baidu.com/doc/WENXINWORKSHOP/index.html)

### 社区支持
- GitHub Issues：技术问题反馈
- 用户社区：经验分享交流
- 邮件支持：专业技术咨询

### 更新日志
- v1.0：基础对话功能
- v1.1：照片分析功能
- v1.2：多模型支持
- v1.3：故事生成优化

---

💡 **开始使用**：配置完成后，在家族主页点击"AI服务"→"AI家族故事"开始创作您的专属家族传奇！
