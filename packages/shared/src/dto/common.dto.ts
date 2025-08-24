import { z } from '../z';

// 通用API响应DTO
export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z
    .object({
      success: z.boolean(),
      message: z.string(),
      data: dataSchema,
      timestamp: z.date().optional(),
    })
    .openapi({
      title: 'ApiResponse',
      description: '通用API响应格式',
    });

// 错误响应DTO
export const ErrorResponseSchema = z
  .object({
    success: z.literal(false),
    message: z.string(),
    error: z.string().optional(),
    errorId: z.string().optional(),
    statusCode: z.number().optional(),
    timestamp: z.date().optional(),
    path: z.string().optional(),
  })
  .openapi({
    title: 'ErrorResponse',
    description: '错误响应格式',
    example: {
      success: false,
      message: '请求参数错误',
      error: 'Bad Request',
      statusCode: 400,
      timestamp: '2024-01-01T00:00:00.000Z',
      path: '/api/poems',
      errorId: 'ERR1234567890'
    },
  });

// 分页参数DTO
export const PaginationDtoSchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  })
  .openapi({
    title: 'PaginationDto',
    description: '分页参数',
    example: {
      page: 1,
      limit: 20,
    },
  });

// 分页响应DTO
export const PaginationResponseSchema = z
  .object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
    hasNext: z.boolean(),
    hasPrev: z.boolean(),
  })
  .openapi({
    title: 'PaginationResponse',
    description: '分页响应信息',
    example: {
      page: 1,
      limit: 20,
      total: 100,
      totalPages: 5,
      hasNext: true,
      hasPrev: false,
    },
  });

// 分页列表响应DTO
export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z
    .object({
      data: z.array(dataSchema),
      pagination: PaginationResponseSchema,
    })
    .openapi({
      title: 'PaginatedResponse',
      description: '分页列表响应格式',
    });

// ID参数DTO
export const IdParamDtoSchema = z.uuid('请提供有效的uuid')
  .openapi({
    title: 'IdParamDto',
    description: 'ID路径参数',
    example: '123e4567-e89b-12d3-a456-426614174000',
  });

// 搜索参数DTO
export const SearchDtoSchema = z
  .object({
    q: z.string().min(1, '搜索关键词不能为空').max(100, '搜索关键词不能超过100个字符'),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  })
  .openapi({
    title: 'SearchDto',
    description: '搜索参数',
    example: {
      q: '春天',
      page: 1,
      limit: 20,
    },
  });

// 健康检查响应DTO
export const HealthCheckResponseSchema = z
  .object({
    service: z.string(),
    version: z.string().optional(),
    uptime: z.number().optional(),
  })
  .openapi({
    title: 'HealthCheckResponse',
    description: '健康检查响应',
    example: {
      service: 'poetry-club-api',
      version: '1.0.0',
      uptime: 3600,
    },
  });

// 导出类型
export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data?: T;
  timestamp?: string;
};

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
export type PaginationDto = z.infer<typeof PaginationDtoSchema>;
export type PaginationResponse = z.infer<typeof PaginationResponseSchema>;
export type IdParamDto = z.infer<typeof IdParamDtoSchema>;
export type SearchDto = z.infer<typeof SearchDtoSchema>;
export type HealthCheckResponse = z.infer<typeof HealthCheckResponseSchema>;