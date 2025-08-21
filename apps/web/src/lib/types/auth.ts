// 认证相关类型定义

/**
 * 用户信息接口
 */
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 登录请求参数
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * 注册请求参数
 */
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

/**
 * 认证响应
 */
export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // access token 过期时间（秒）
}

/**
 * Token刷新响应
 */
export interface TokenRefreshResponse {
  accessToken: string;
  expiresIn: number;
}

/**
 * 认证状态
 */
export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

/**
 * 用户资料更新请求
 */
export interface UpdateProfileRequest {
  name?: string;
  bio?: string;
  avatar?: string;
}

/**
 * 密码修改请求
 */
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * 通知偏好设置
 */
export interface NotificationPreferences {
  emailNotifications: boolean;
  siteNotifications: boolean;
  commentNotifications: boolean;
  likeNotifications: boolean;
}

/**
 * 用户设置
 */
export interface UserSettings {
  theme: 'light' | 'dark' | 'auto';
  notifications: NotificationPreferences;
}

/**
 * API错误响应
 */
export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, any>;
}

/**
 * API响应包装器
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
}

/**
 * 请求配置选项
 */
export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  skipAuth?: boolean; // 跳过自动添加认证头
  skipRetry?: boolean; // 跳过自动重试
}