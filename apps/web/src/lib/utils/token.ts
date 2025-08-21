import { browser } from '$app/environment';

/**
 * Token管理工具类
 * 负责access_token的存储和获取，以及refresh_token的Cookie操作
 */

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_COOKIE = 'refresh_token';

/**
 * 获取存储的access token
 */
export function getAccessToken(): string | null {
  if (!browser) return null;
  
  try {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  } catch (error) {
    console.error('获取access token失败:', error);
    return null;
  }
}

/**
 * 存储access token
 */
export function setAccessToken(token: string): void {
  if (!browser) return;
  
  try {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  } catch (error) {
    console.error('存储access token失败:', error);
  }
}

/**
 * 清除access token
 */
export function clearAccessToken(): void {
  if (!browser) return;
  
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  } catch (error) {
    console.error('清除access token失败:', error);
  }
}

/**
 * 检查access token是否存在
 */
export function hasAccessToken(): boolean {
  return getAccessToken() !== null;
}

/**
 * 解析JWT token获取过期时间
 */
export function getTokenExpiration(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp ? payload.exp * 1000 : null; // 转换为毫秒
  } catch (error) {
    console.error('解析token失败:', error);
    return null;
  }
}

/**
 * 检查token是否即将过期（5分钟内过期）
 */
export function isTokenExpiringSoon(token: string): boolean {
  const expiration = getTokenExpiration(token);
  if (!expiration) return true;
  
  const now = Date.now();
  const fiveMinutes = 5 * 60 * 1000;
  
  return expiration - now < fiveMinutes;
}

/**
 * 检查token是否已过期
 */
export function isTokenExpired(token: string): boolean {
  const expiration = getTokenExpiration(token);
  if (!expiration) return true;
  
  return Date.now() >= expiration;
}

/**
 * 设置refresh token cookie（模拟，实际应由服务端设置）
 * 在真实环境中，这个函数主要用于开发和测试
 */
export function setRefreshTokenCookie(token: string): void {
  if (!browser) return;
  
  try {
    // 设置7天过期的HttpOnly cookie（模拟）
    // 注意：在真实环境中，HttpOnly cookie只能由服务端设置
    const expires = new Date();
    expires.setDate(expires.getDate() + 7);
    
    // 这里只是模拟，真实的HttpOnly cookie无法通过JS设置
    document.cookie = `${REFRESH_TOKEN_COOKIE}=${token}; expires=${expires.toUTCString()}; path=/; secure; samesite=strict`;
  } catch (error) {
    console.error('设置refresh token cookie失败:', error);
  }
}

/**
 * 获取refresh token（模拟从cookie读取）
 * 注意：真实的HttpOnly cookie无法通过JS读取，这里只是模拟
 */
export function getRefreshTokenFromCookie(): string | null {
  if (!browser) return null;
  
  try {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === REFRESH_TOKEN_COOKIE) {
        return value;
      }
    }
    return null;
  } catch (error) {
    console.error('获取refresh token失败:', error);
    return null;
  }
}

/**
 * 清除refresh token cookie
 */
export function clearRefreshTokenCookie(): void {
  if (!browser) return;
  
  try {
    document.cookie = `${REFRESH_TOKEN_COOKIE}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  } catch (error) {
    console.error('清除refresh token cookie失败:', error);
  }
}

/**
 * 清除所有认证相关的token
 */
export function clearAllTokens(): void {
  clearAccessToken();
  clearRefreshTokenCookie();
}

/**
 * 验证token格式是否正确（简单的JWT格式检查）
 */
export function isValidTokenFormat(token: string): boolean {
  if (!token) return false;
  
  const parts = token.split('.');
  return parts.length === 3;
}

/**
 * 从token中提取用户信息
 */
export function getUserFromToken(token: string): any | null {
  try {
    if (!isValidTokenFormat(token)) return null;
    
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.user || payload.sub || null;
  } catch (error) {
    console.error('从token提取用户信息失败:', error);
    return null;
  }
}