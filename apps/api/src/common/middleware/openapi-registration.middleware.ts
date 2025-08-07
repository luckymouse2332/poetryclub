import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ZodOpenApiUtil } from '../utils/zod-openapi.util';

@Injectable()
export class OpenApiRegistrationMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // 这个中间件可以用来在运行时动态注册路由信息
    // 目前我们主要通过装饰器在编译时注册，所以这里只是一个占位符
    
    // 可以在这里添加运行时的路由信息收集逻辑
    // 例如：记录实际的请求路径、方法等信息
    
    next();
  }
}

/**
 * 手动注册路由到OpenAPI的工具函数
 * 可以在模块初始化时调用
 */
export function registerRouteToOpenApi(config: {
  method: 'get' | 'post' | 'put' | 'patch' | 'delete';
  path: string;
  summary?: string;
  description?: string;
  tags?: string[];
  operationId?: string;
}) {
  try {
    ZodOpenApiUtil.registerPath({
      method: config.method,
      path: config.path,
      summary: config.summary,
      description: config.description,
      tags: config.tags,
      responses: {
        '200': {
          description: 'Success',
        },
      },
    });
  } catch (error) {
    console.warn(`Failed to register route ${config.method.toUpperCase()} ${config.path}:`, error);
  }
}