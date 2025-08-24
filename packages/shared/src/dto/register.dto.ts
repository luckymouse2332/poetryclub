import { z } from '../z';

export const RegisterDtoSchema = z
  .object({
    email: z.email('请输入有效的邮箱地址'),
    username: z.string().min(2, '用户名至少2个字符').max(50, '用户名不能超过50个字符').optional(),
    password: z.string().min(6, '密码至少6个字符').max(50, '密码不能超过50个字符'),
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

export type RegisterDto = z.infer<typeof RegisterDtoSchema>;
