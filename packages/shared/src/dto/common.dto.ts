import { z } from '../z';

// 通用API响应DTO
export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z
    .object({
      success: z.boolean(),
      message: z.string(),
      data: dataSchema,
      timestamp: z.string().datetime().optional(),
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
    statusCode: z.number().optional(),
    timestamp: z.string().datetime().optional(),
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
export const IdParamDtoSchema = z
  .object({
    id: z.string().uuid('请提供有效的UUID'),
  })
  .openapi({
    title: 'IdParamDto',
    description: 'ID路径参数',
    example: {
      id: '123e4567-e89b-12d3-a456-426614174000',
    },
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

// 认证令牌响应DTO
export const AuthTokenResponseSchema = z
  .object({
    accessToken: z.string(),
    refreshToken: z.string(),
    expiresIn: z.number(),
    tokenType: z.literal('Bearer'),
  })
  .openapi({
    title: 'AuthTokenResponse',
    description: '认证令牌响应',
    example: {
      accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      expiresIn: 3600,
      tokenType: 'Bearer',
    },
  });

// 刷新令牌DTO
export const RefreshTokenDtoSchema = z
  .object({
    refreshToken: z.string().min(1, '刷新令牌不能为空'),
  })
  .openapi({
    title: 'RefreshTokenDto',
    description: '刷新令牌请求',
    example: {
      refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    },
  });

// 健康检查响应DTO
export const HealthCheckResponseSchema = z
  .object({
    status: z.literal('ok'),
    timestamp: z.string().datetime(),
    service: z.string(),
    version: z.string().optional(),
    uptime: z.number().optional(),
  })
  .openapi({
    title: 'HealthCheckResponse',
    description: '健康检查响应',
    example: {
      status: 'ok',
      timestamp: '2024-01-01T00:00:00.000Z',
      service: 'poetry-club-api',
      version: '1.0.0',
      uptime: 3600,
    },
  });

// 导出类型
export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  timestamp?: string;
};

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
export type PaginationDto = z.infer<typeof PaginationDtoSchema>;
export type PaginationResponse = z.infer<typeof PaginationResponseSchema>;
export type IdParamDto = z.infer<typeof IdParamDtoSchema>;
export type SearchDto = z.infer<typeof SearchDtoSchema>;
export type AuthTokenResponse = z.infer<typeof AuthTokenResponseSchema>;
export type RefreshTokenDto = z.infer<typeof RefreshTokenDtoSchema>;
export type HealthCheckResponse = z.infer<typeof HealthCheckResponseSchema>;