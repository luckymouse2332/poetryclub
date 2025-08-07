import { Body, createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ZodValidationPipe } from '../pipes/zod-validation.pipe';
import { ZodType } from 'zod';
import { ZodOpenApiUtil } from '../utils/zod-openapi.util';

/**
 * Zod Body装饰器，支持自动OpenAPI文档生成
 */
export const ZodBody = <T extends ZodType>(
  schema: T,
  options?: {
    schemaName?: string;
    description?: string;
  }
) => {
  // 如果提供了schema名称，注册到OpenAPI
  if (options?.schemaName) {
    ZodOpenApiUtil.registerSchema(
      options.schemaName,
      schema,
      options.description
    );
  }

  return Body(new ZodValidationPipe(schema));
};

/**
 * Zod Query装饰器
 */
export const ZodQuery = <T extends ZodType>(
  schema: T,
  options?: {
    schemaName?: string;
    description?: string;
  }
) => {
  if (options?.schemaName) {
    ZodOpenApiUtil.registerSchema(
      options.schemaName,
      schema,
      options.description
    );
  }

  return createParamDecorator((data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const pipe = new ZodValidationPipe(schema);
    return pipe.transform(request.query, { type: 'query' });
  })();
};

/**
 * Zod Param装饰器
 */
export const ZodParam = <T extends ZodType>(
  schema: T,
  paramName?: string,
  options?: {
    schemaName?: string;
    description?: string;
  }
) => {
  if (options?.schemaName) {
    ZodOpenApiUtil.registerSchema(
      options.schemaName,
      schema,
      options.description
    );
  }

  return createParamDecorator((data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const paramValue = paramName ? request.params[paramName] : request.params;
    const pipe = new ZodValidationPipe(schema);
    return pipe.transform(paramValue, { type: 'param' });
  })();
};
