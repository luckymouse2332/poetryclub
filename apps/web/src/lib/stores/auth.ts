import { writable, derived, get } from 'svelte/store';
import { goto } from '$app/navigation';
import { browser } from '$app/environment';
import type {
  User,
  AuthState,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
} from '$lib/types/auth';
import {
  getAccessToken,
  setAccessToken,
  setRefreshTokenCookie,
  clearAllTokens,
  isTokenExpired,
  getUserFromToken,
} from '$lib/utils/token';

/**
 * 全局认证状态管理
 */

// 创建认证状态store
const createAuthStore = () => {
  const initialState: AuthState = {
    user: null,
    accessToken: null,
    isAuthenticated: false,
    isLoading: true,
  };

  const { subscribe, set, update } = writable<AuthState>(initialState);

  return {
    subscribe,

    /**
     * 初始化认证状态（从本地存储恢复）
     */
    init: async () => {
      if (!browser) return;

      try {
        const token = getAccessToken();

        if (token && !isTokenExpired(token)) {
          const user = getUserFromToken(token);
          if (user) {
            set({
              user,
              accessToken: token,
              isAuthenticated: true,
              isLoading: false,
            });
            return;
          }
        }

        // Token无效或不存在，清除所有认证信息
        clearAllTokens();
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          isLoading: false,
        });
      } catch (error) {
        console.error('初始化认证状态失败:', error);
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    },

    /**
     * 用户登录
     */
    login: async (
      credentials: LoginRequest
    ): Promise<{ success: boolean; error?: string }> => {
      try {
        update((state) => ({ ...state, isLoading: true }));

        // 模拟API调用
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // 模拟登录响应
        const mockResponse: AuthResponse = {
          user: {
            id: '1',
            name: '诗词爱好者',
            email: credentials.email,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent('诗词爱好者')}&background=10b981&color=fff&size=128`,
            bio: '热爱诗词，喜欢用文字记录生活的美好。',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          accessToken: 'mock_access_token_' + Date.now(),
          refreshToken: 'mock_refresh_token_' + Date.now(),
          expiresIn: 3600,
        };

        // 存储tokens
        setAccessToken(mockResponse.accessToken);
        setRefreshTokenCookie(mockResponse.refreshToken);

        // 更新状态
        set({
          user: mockResponse.user,
          accessToken: mockResponse.accessToken,
          isAuthenticated: true,
          isLoading: false,
        });

        return { success: true };
      } catch (error) {
        console.error('登录失败:', error);
        update((state) => ({ ...state, isLoading: false }));
        return { success: false, error: '登录失败，请稍后重试' };
      }
    },

    /**
     * 用户注册
     */
    register: async (
      userData: RegisterRequest
    ): Promise<{ success: boolean; error?: string }> => {
      try {
        update((state) => ({ ...state, isLoading: true }));

        // 模拟API调用
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // 模拟注册响应
        const mockResponse: AuthResponse = {
          user: {
            id: Date.now().toString(),
            name: userData.name,
            email: userData.email,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=10b981&color=fff&size=128`,
            bio: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          accessToken: 'mock_access_token_' + Date.now(),
          refreshToken: 'mock_refresh_token_' + Date.now(),
          expiresIn: 3600,
        };

        // 存储tokens
        setAccessToken(mockResponse.accessToken);
        setRefreshTokenCookie(mockResponse.refreshToken);

        // 更新状态
        set({
          user: mockResponse.user,
          accessToken: mockResponse.accessToken,
          isAuthenticated: true,
          isLoading: false,
        });

        return { success: true };
      } catch (error) {
        console.error('注册失败:', error);
        update((state) => ({ ...state, isLoading: false }));
        return { success: false, error: '注册失败，请稍后重试' };
      }
    },

    /**
     * 刷新访问令牌
     */
    refreshToken: async (): Promise<{ success: boolean; error?: string }> => {
      try {
        // 模拟API调用刷新token
        await new Promise((resolve) => setTimeout(resolve, 500));

        const newAccessToken = 'mock_refreshed_token_' + Date.now();
        setAccessToken(newAccessToken);

        update((state) => ({
          ...state,
          accessToken: newAccessToken,
        }));

        return { success: true };
      } catch (error) {
        console.error('刷新token失败:', error);
        // 刷新失败，清除认证状态
        authStore.logout();
        return { success: false, error: '认证已过期，请重新登录' };
      }
    },

    /**
     * 更新用户信息
     */
    updateUser: (user: User) => {
      update((state) => ({
        ...state,
        user,
      }));
    },

    /**
     * 用户登出
     */
    logout: async () => {
      try {
        // 清除所有认证信息
        clearAllTokens();

        // 重置状态
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          isLoading: false,
        });

        // 跳转到登录页
        if (browser) {
          goto('/login');
        }
      } catch (error) {
        console.error('登出失败:', error);
      }
    },

    /**
     * 检查认证状态
     */
    checkAuth: () => {
      const state = get({ subscribe });
      return state.isAuthenticated && state.user && state.accessToken;
    },
  };
};

// 创建全局认证store实例
export const authStore = createAuthStore();

// 派生store：当前用户
export const currentUser = derived(authStore, ($auth) => $auth.user);

// 派生store：是否已认证
export const isAuthenticated = derived(
  authStore,
  ($auth) => $auth.isAuthenticated
);

// 派生store：是否正在加载
export const isAuthLoading = derived(authStore, ($auth) => $auth.isLoading);

// 派生store：访问令牌
export const accessToken = derived(authStore, ($auth) => $auth.accessToken);
