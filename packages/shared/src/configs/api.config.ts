// API配置
export const API_CONFIG = {
  baseUrl: process.env.API_BASE_URL || 'http://localhost:3000',
  timeout: 10000,
} as const;
