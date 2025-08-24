import { applyDecorators, SetMetadata } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBody,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { ZodType } from 'zod';
import { ZodOpenApiUtil } from '../utils/zod-openapi.util';

export interface ApiRouteOptions {
  summary?: string;
  description?: string;
  tags?: string[];
  responses?: {
    [statusCode: number]: {
      description: string;
      schema?: ZodType;
      schemaName?: string;
    };
  };
  requestBody?: {
    schema: ZodType;
    schemaName?: string;
    description?: string;
  };
  queryParams?: {
    schema: ZodType;
    schemaName?: string;
    description?: string;
  };
  pathParams?: {
    schema: ZodType;
    schemaName?: string;
    description?: string;
  };
}

/**
 * API路由装饰器，自动生成OpenAPI文档
 */
export function ApiRoute(options: ApiRouteOptions) {
  const decorators: any[] = [];

  // 添加基本的API文档装饰器
  if (options.summary) {
    decorators.push(
      ApiOperation({
        summary: options.summary,
        description: options.description,
      })
    );
  }

  if (options.tags) {
    decorators.push(ApiTags(...options.tags));
  }

  // 注册响应schema
  if (options.responses) {
    Object.entries(options.responses).forEach(([statusCode, response]) => {
      decorators.push(
        ApiResponse({
          status: parseInt(statusCode),
          description: response.description,
        })
      );

      // 注册响应schema到OpenAPI
      if (response.schema && response.schemaName) {
        ZodOpenApiUtil.registerSchema(
          response.schemaName,
          response.schema,
          response.description || `Response schema for ${statusCode}`
        );
      }
    });
  }

  // 注册请求体schema
  if (options.requestBody?.schema && options.requestBody.schemaName) {
    ZodOpenApiUtil.registerSchema(
      options.requestBody.schemaName,
      options.requestBody.schema,
      options.requestBody.description || 'Request body schema'
    );

    // 添加ApiBody装饰器以在Swagger中显示请求体
    decorators.push(
      ApiBody({
        description: options.requestBody.description || 'Request body',
        schema: {
          $ref: `#/components/schemas/${options.requestBody.schemaName}`,
        },
      })
    );
  }

  // 注册查询参数schema
  if (options.queryParams?.schema && options.queryParams.schemaName) {
    ZodOpenApiUtil.registerSchema(
      options.queryParams.schemaName,
      options.queryParams.schema,
      options.queryParams.description || 'Query parameters schema'
    );

    // 添加ApiQuery装饰器以在Swagger中显示查询参数
    decorators.push(
      ApiQuery({
        description: options.queryParams.description || 'Query parameters',
        schema: {
          $ref: `#/components/schemas/${options.queryParams.schemaName}`,
        },
      })
    );
  }

  // 注册路径参数schema
  if (options.pathParams?.schema && options.pathParams.schemaName) {
    ZodOpenApiUtil.registerSchema(
      options.pathParams.schemaName,
      options.pathParams.schema,
      options.pathParams.description || 'Path parameters schema'
    );
  }

  // 存储元数据供后续使用
  decorators.push(SetMetadata('api-route-options', options));

  return applyDecorators(...decorators);
}
