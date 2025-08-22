// 导出所有DTO schemas和类型
export * from './dto/login.dto';
export * from './dto/passwords.dto';
export * from './dto/register.dto';
export * from './dto/poem.dto';
export * from './dto/user.dto';
export * from './dto/common.dto';
export * from './dto/comment.dto';

// 导出zod实例
export { z } from './z';

// 共享工具函数
export function formatDate(date: Date): string {
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateTime(date: Date): string {
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

// API配置
export const API_CONFIG = {
  baseUrl: process.env.API_BASE_URL || 'http://localhost:3000',
  timeout: 10000,
} as const;
