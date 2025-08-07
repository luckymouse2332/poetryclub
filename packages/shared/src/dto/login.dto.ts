import { z } from '../z';

export const LoginDtoSchema = z
  .object({
    username: z.string().min(1, '用户名不能为空').max(50, '用户名不能超过50个字符'),
    password: z.string().min(6, '密码至少6个字符').max(50, '密码不能超过50个字符'),
  })
  .openapi({
    title: 'LoginDto',
    description: '用户登录请求数据',
    example: {
      username: 'poetryuser',
      password: 'password123',
    },
  });

export type LoginDto = z.infer<typeof LoginDtoSchema>;
