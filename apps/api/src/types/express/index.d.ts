import 'express';

declare global {
  namespace Express {
    export interface User {
      id: string;
      username: string;
      role: 'User' | 'Admin';
    }

    /**
     * 错误元信息，用于在中间件中记录日志
     */
    interface ErrorMetadata {
      errorId: string;
      message: string;
      stack?: string;
    }

    /**
     * 扩展 Express 的 Response 对象，添加 locals 属性用于存储错误元信息
     */
    interface Locals {
      errorMeta?: ErrorMetadata;
    }
  }
}
