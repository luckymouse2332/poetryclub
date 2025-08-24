import { z } from '../z';

export const LoginDtoSchema = z
  .object({
    username: z
      .string()
      .min(1, '用户名不能为空')
      .max(50, '用户名不能超过50个字符'),
    password: z
      .string()
      .min(6, '密码至少6个字符')
      .max(50, '密码不能超过50个字符'),
  })
  .openapi({
    title: 'LoginDto',
    description: '用户登录请求数据',
    example: {
      username: 'poetryuser',
      password: 'password123',
    },
  });

export const RegisterDtoSchema = z
  .object({
    email: z.email('请输入有效的邮箱地址'),
    username: z
      .string()
      .min(2, '用户名至少2个字符')
      .max(50, '用户名不能超过50个字符')
      .optional(),
    password: z
      .string()
      .min(6, '密码至少6个字符')
      .max(50, '密码不能超过50个字符'),
  })
  .openapi({
    title: 'RegisterDto',
    description: '用户注册请求数据',
    example: {
      email: 'user@example.com',
      username: 'poetryuser',
      password: 'password123',
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

export type LoginDto = z.infer<typeof LoginDtoSchema>;
export type RegisterDto = z.infer<typeof RegisterDtoSchema>;
export type AuthTokenResponse = z.infer<typeof AuthTokenResponseSchema>;
export type RefreshTokenDto = z.infer<typeof RefreshTokenDtoSchema>;
