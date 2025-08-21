import { goto } from '$app/navigation';
import { browser } from '$app/environment';
import type { ApiResponse, RequestOptions } from '$lib/types/auth';
import { getAccessToken, isTokenExpired } from '$lib/utils/token';
import { authStore } from '$lib/stores/auth';

/**
 * 统一的HTTP请求工具类
 * 封装fetch API，提供自动认证、token刷新和错误处理
 */

const API_BASE_URL = '/api'; // API基础URL
const MAX_RETRY_COUNT = 3; // 最大重试次数
const RETRY_DELAY = 1000; // 重试间隔（毫秒）

/**
 * 延迟函数
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 创建请求头
 */
function createHeaders(options: RequestOptions = {}): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // 自动添加认证头（除非明确跳过）
  if (!options.skipAuth) {
    const token = getAccessToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  return headers;
}

/**
 * 处理响应
 */
async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  try {
    const data = await response.json();

    if (response.ok) {
      return {
        success: true,
        data,
        message: data.message,
      };
    } else {
      return {
        success: false,
        error: {
          message: data.message || '请求失败',
          code: data.code,
          details: data.details,
        },
      };
    }
  } catch (error) {
    return {
      success: false,
      error: {
        message: response.ok ? '解析响应失败' : `请求失败 (${response.status})`,
        code: response.status.toString(),
      },
    };
  }
}

/**
 * 刷新访问令牌
 */
async function refreshAccessToken(): Promise<boolean> {
  try {
    const result = await authStore.refreshToken();
    return result.success;
  } catch (error) {
    console.error('刷新token失败:', error);
    return false;
  }
}

/**
 * 处理401未授权错误
 */
async function handle401Error(): Promise<boolean> {
  console.log('检测到401错误，尝试刷新token...');

  const refreshSuccess = await refreshAccessToken();

  if (!refreshSuccess) {
    console.log('刷新token失败，跳转到登录页');
    authStore.logout();
    if (browser) {
      goto('/login');
    }
    return false;
  }

  console.log('token刷新成功');
  return true;
}

/**
 * 执行HTTP请求
 */
async function executeRequest<T>(
  url: string,
  options: RequestOptions = {},
  retryCount = 0
): Promise<ApiResponse<T>> {
  try {
    // 检查token是否过期
    if (!options.skipAuth) {
      const token = getAccessToken();
      if (token && isTokenExpired(token)) {
        console.log('token已过期，尝试刷新...');
        const refreshSuccess = await refreshAccessToken();
        if (!refreshSuccess) {
          return {
            success: false,
            error: {
              message: '认证已过期，请重新登录',
              code: 'TOKEN_EXPIRED',
            },
          };
        }
      }
    }

    const headers = createHeaders(options);
    const requestConfig: RequestInit = {
      method: options.method || 'GET',
      headers,
      credentials: 'include', // 包含cookies
    };

    // 添加请求体
    if (options.body && options.method !== 'GET') {
      if (typeof options.body === 'string') {
        requestConfig.body = options.body;
      } else {
        requestConfig.body = JSON.stringify(options.body);
      }
    }

    const response = await fetch(`${API_BASE_URL}${url}`, requestConfig);

    // 处理401未授权错误
    if (response.status === 401 && !options.skipAuth && !options.skipRetry) {
      const canRetry = await handle401Error();

      if (canRetry && retryCount < MAX_RETRY_COUNT) {
        console.log(`重试请求 (${retryCount + 1}/${MAX_RETRY_COUNT})...`);
        await delay(RETRY_DELAY);
        return executeRequest<T>(url, options, retryCount + 1);
      }
    }

    return handleResponse<T>(response);
  } catch (error) {
    console.error('请求执行失败:', error);

    // 网络错误重试
    if (!options.skipRetry && retryCount < MAX_RETRY_COUNT) {
      console.log(
        `网络错误，重试请求 (${retryCount + 1}/${MAX_RETRY_COUNT})...`
      );
      await delay(RETRY_DELAY);
      return executeRequest<T>(url, options, retryCount + 1);
    }

    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : '网络请求失败',
        code: 'NETWORK_ERROR',
      },
    };
  }
}

/**
 * 统一的请求工具类
 */
export class ApiClient {
  /**
   * GET请求
   */
  static async get<T>(
    url: string,
    options: Omit<RequestOptions, 'method'> = {}
  ): Promise<ApiResponse<T>> {
    return executeRequest<T>(url, { ...options, method: 'GET' });
  }

  /**
   * POST请求
   */
  static async post<T>(
    url: string,
    data?: any,
    options: Omit<RequestOptions, 'method' | 'body'> = {}
  ): Promise<ApiResponse<T>> {
    return executeRequest<T>(url, { ...options, method: 'POST', body: data });
  }

  /**
   * PUT请求
   */
  static async put<T>(
    url: string,
    data?: any,
    options: Omit<RequestOptions, 'method' | 'body'> = {}
  ): Promise<ApiResponse<T>> {
    return executeRequest<T>(url, { ...options, method: 'PUT', body: data });
  }

  /**
   * PATCH请求
   */
  static async patch<T>(
    url: string,
    data?: any,
    options: Omit<RequestOptions, 'method' | 'body'> = {}
  ): Promise<ApiResponse<T>> {
    return executeRequest<T>(url, { ...options, method: 'PATCH', body: data });
  }

  /**
   * DELETE请求
   */
  static async delete<T>(
    url: string,
    options: Omit<RequestOptions, 'method'> = {}
  ): Promise<ApiResponse<T>> {
    return executeRequest<T>(url, { ...options, method: 'DELETE' });
  }

  /**
   * 上传文件
   */
  static async upload<T>(
    url: string,
    formData: FormData,
    options: Omit<RequestOptions, 'method' | 'body'> = {}
  ): Promise<ApiResponse<T>> {
    // 上传文件时不设置Content-Type，让浏览器自动设置
    const uploadOptions: RequestOptions = {
      ...options,
      method: 'POST',
      body: formData,
      headers: {
        ...options.headers,
        // 不设置Content-Type，让浏览器自动处理multipart/form-data
      },
    };

    // 移除Content-Type以让浏览器自动设置
    delete uploadOptions.headers?.['Content-Type'];

    return executeRequest<T>(url, uploadOptions);
  }
}

// 导出便捷方法
export const api = ApiClient;

// 导出默认实例方法
export default {
  get: ApiClient.get,
  post: ApiClient.post,
  put: ApiClient.put,
  patch: ApiClient.patch,
  delete: ApiClient.delete,
  upload: ApiClient.upload,
};
