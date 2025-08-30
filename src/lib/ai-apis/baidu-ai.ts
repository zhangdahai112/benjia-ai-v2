/**
 * 百度AI照片修复API集成
 *
 * 使用方法：
 * 1. 在百度AI开放平台注册账号并创建应用
 * 2. 获取API Key和Secret Key
 * 3. 在环境变量中设置 BAIDU_AI_API_KEY 和 BAIDU_AI_SECRET_KEY
 * 4. 将 USE_MOCK_API 设置为 false 启用真实API
 */

// 环境配置
const USE_MOCK_API = true; // 设置为 false 使用真实API
const BAIDU_AI_API_KEY = process.env.NEXT_PUBLIC_BAIDU_AI_API_KEY || '';
const BAIDU_AI_SECRET_KEY = process.env.BAIDU_AI_SECRET_KEY || '';

// API端点
const BAIDU_AI_ENDPOINTS = {
  // 图像修复
  IMAGE_INPAINTING: 'https://aip.baidubce.com/rest/2.0/image-process/v1/inpainting',
  // 图像增强
  IMAGE_ENHANCE: 'https://aip.baidubce.com/rest/2.0/image-process/v1/image_enhance',
  // 图像去噪
  IMAGE_DENOISE: 'https://aip.baidubce.com/rest/2.0/image-process/v1/denoise',
  // 黑白图像上色
  IMAGE_COLOURIZE: 'https://aip.baidubce.com/rest/2.0/image-process/v1/colourize',
  // 获取Access Token
  TOKEN: 'https://aip.baidubce.com/oauth/2.0/token'
};

// 响应接口
interface BaiduAIResponse {
  error_code?: number;
  error_msg?: string;
  result?: {
    image: string; // base64编码的图像
  };
}

interface TokenResponse {
  access_token: string;
  expires_in: number;
  error?: string;
  error_description?: string;
}

// 缓存Token
let cachedToken: string | null = null;
let tokenExpireTime: number = 0;

/**
 * 获取百度AI访问令牌
 */
async function getAccessToken(): Promise<string> {
  // 检查缓存的token是否有效
  if (cachedToken && Date.now() < tokenExpireTime) {
    return cachedToken;
  }

  try {
    const response = await fetch(BAIDU_AI_ENDPOINTS.TOKEN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: BAIDU_AI_API_KEY,
        client_secret: BAIDU_AI_SECRET_KEY
      })
    });

    const data: TokenResponse = await response.json();

    if (data.error) {
      throw new Error(`获取Token失败: ${data.error_description || data.error}`);
    }

    cachedToken = data.access_token;
    tokenExpireTime = Date.now() + (data.expires_in - 300) * 1000; // 提前5分钟过期

    return cachedToken;
  } catch (error) {
    console.error('获取百度AI Token失败:', error);
    throw new Error('无法获取API访问令牌');
  }
}

/**
 * 将图片文件转换为base64
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // 移除data:image/...;base64,前缀
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * 调用百度AI API
 */
async function callBaiduAPI(endpoint: string, params: Record<string, string>): Promise<BaiduAIResponse> {
  const token = await getAccessToken();

  const response = await fetch(`${endpoint}?access_token=${token}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(params)
  });

  const data: BaiduAIResponse = await response.json();

  if (data.error_code) {
    throw new Error(`API调用失败: ${data.error_msg || '未知错误'}`);
  }

  return data;
}

/**
 * 模拟API响应（用于开发和演示）
 */
async function mockAPIResponse(imageData: string, type: string): Promise<string> {
  // 模拟处理时间
  await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));

  // 根据类型返回不同的示例图片
  const sampleImages = {
    restore: 'https://source.unsplash.com/800x600/?restored,vintage,clear',
    colorize: 'https://source.unsplash.com/800x600/?colorful,vintage,family',
    enhance: 'https://source.unsplash.com/800x600/?hd,clear,portrait',
    denoise: 'https://source.unsplash.com/800x600/?clean,clear,portrait'
  };

  return sampleImages[type as keyof typeof sampleImages] || sampleImages.restore;
}

/**
 * 图像修复
 */
export async function restoreImage(imageFile: File): Promise<string> {
  if (USE_MOCK_API) {
    const base64 = await fileToBase64(imageFile);
    return mockAPIResponse(base64, 'restore');
  }

  try {
    const imageBase64 = await fileToBase64(imageFile);

    const response = await callBaiduAPI(BAIDU_AI_ENDPOINTS.IMAGE_INPAINTING, {
      image: imageBase64
    });

    if (response.result?.image) {
      return `data:image/jpeg;base64,${response.result.image}`;
    }

    throw new Error('API返回数据格式错误');
  } catch (error) {
    console.error('图像修复失败:', error);
    throw error;
  }
}

/**
 * 图像增强
 */
export async function enhanceImage(imageFile: File): Promise<string> {
  if (USE_MOCK_API) {
    const base64 = await fileToBase64(imageFile);
    return mockAPIResponse(base64, 'enhance');
  }

  try {
    const imageBase64 = await fileToBase64(imageFile);

    const response = await callBaiduAPI(BAIDU_AI_ENDPOINTS.IMAGE_ENHANCE, {
      image: imageBase64
    });

    if (response.result?.image) {
      return `data:image/jpeg;base64,${response.result.image}`;
    }

    throw new Error('API返回数据格式错误');
  } catch (error) {
    console.error('图像增强失败:', error);
    throw error;
  }
}

/**
 * 图像去噪
 */
export async function denoiseImage(imageFile: File): Promise<string> {
  if (USE_MOCK_API) {
    const base64 = await fileToBase64(imageFile);
    return mockAPIResponse(base64, 'denoise');
  }

  try {
    const imageBase64 = await fileToBase64(imageFile);

    const response = await callBaiduAPI(BAIDU_AI_ENDPOINTS.IMAGE_DENOISE, {
      image: imageBase64
    });

    if (response.result?.image) {
      return `data:image/jpeg;base64,${response.result.image}`;
    }

    throw new Error('API返回数据格式错误');
  } catch (error) {
    console.error('图像去噪失败:', error);
    throw error;
  }
}

/**
 * 黑白图像上色
 */
export async function colorizeImage(imageFile: File): Promise<string> {
  if (USE_MOCK_API) {
    const base64 = await fileToBase64(imageFile);
    return mockAPIResponse(base64, 'colorize');
  }

  try {
    const imageBase64 = await fileToBase64(imageFile);

    const response = await callBaiduAPI(BAIDU_AI_ENDPOINTS.IMAGE_COLOURIZE, {
      image: imageBase64
    });

    if (response.result?.image) {
      return `data:image/jpeg;base64,${response.result.image}`;
    }

    throw new Error('API返回数据格式错误');
  } catch (error) {
    console.error('图像上色失败:', error);
    throw error;
  }
}

/**
 * 统一的照片处理接口
 */
export async function processPhoto(
  imageFile: File,
  type: 'restore' | 'enhance' | 'denoise' | 'colorize'
): Promise<string> {
  switch (type) {
    case 'restore':
      return restoreImage(imageFile);
    case 'enhance':
      return enhanceImage(imageFile);
    case 'denoise':
      return denoiseImage(imageFile);
    case 'colorize':
      return colorizeImage(imageFile);
    default:
      throw new Error(`不支持的处理类型: ${type}`);
  }
}

/**
 * 检查API配置是否正确
 */
export function checkAPIConfiguration(): { isValid: boolean; message: string } {
  if (USE_MOCK_API) {
    return {
      isValid: true,
      message: '当前使用模拟API，用于演示目的'
    };
  }

  if (!BAIDU_AI_API_KEY || !BAIDU_AI_SECRET_KEY) {
    return {
      isValid: false,
      message: '请在环境变量中设置百度AI的API密钥'
    };
  }

  return {
    isValid: true,
    message: 'API配置正确'
  };
}

// 使用说明和配置指南
export const API_SETUP_GUIDE = {
  title: "百度AI照片修复API设置指南",
  steps: [
    "1. 访问百度AI开放平台 (https://ai.baidu.com/)",
    "2. 注册账号并登录",
    "3. 创建应用，选择图像处理相关服务",
    "4. 获取API Key和Secret Key",
    "5. 在项目根目录创建 .env.local 文件",
    "6. 添加以下环境变量：",
    "   NEXT_PUBLIC_BAIDU_AI_API_KEY=你的API_KEY",
    "   BAIDU_AI_SECRET_KEY=你的SECRET_KEY",
    "7. 在 baidu-ai.ts 中将 USE_MOCK_API 设置为 false",
    "8. 重启开发服务器"
  ],
  pricing: "百度AI提供一定的免费调用量，超出后按量计费",
  documentation: "详细API文档: https://ai.baidu.com/ai-doc/IMAGEPROCESS/Yk37c6y54"
};
