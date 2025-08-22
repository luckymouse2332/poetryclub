import { z } from '../z';

// 用户角色枚举
export const UserRoleSchema = z.enum(['admin', 'user']);

// 用户状态枚举
export const UserStatusSchema = z.enum(['active', 'banned', 'locked']);

// 更新用户资料DTO
export const UpdateUserProfileDtoSchema = z
  .object({
    username: z
      .string()
      .min(2, '用户名至少2个字符')
      .max(50, '用户名不能超过50个字符')
      .optional(),
    bio: z.string().max(500, '个人简介不能超过500个字符').optional(),
    avatarUrl: z.url('请输入有效的头像URL').optional(),
  })
  .openapi({
    title: 'UpdateUserProfileDto',
    description: '更新用户资料请求数据',
    example: {
      username: 'newusername',
      bio: '热爱诗歌的创作者，用文字记录生活的美好。',
      avatarUrl: 'https://example.com/avatar.jpg',
    },
  });

// 修改密码DTO
export const ChangePasswordDtoSchema = z
  .object({
    currentPassword: z.string().min(1, '当前密码不能为空'),
    newPassword: z
      .string()
      .min(6, '新密码至少6个字符')
      .max(50, '新密码不能超过50个字符'),
    confirmPassword: z.string().min(1, '确认密码不能为空'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: '新密码和确认密码不匹配',
    path: ['confirmPassword'],
  })
  .openapi({
    title: 'ChangePasswordDto',
    description: '修改密码请求数据',
    example: {
      currentPassword: 'oldpassword123',
      newPassword: 'newpassword123',
      confirmPassword: 'newpassword123',
    },
  });

// 用户分页查询参数DTO
export const UserPaginationQueryDtoSchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    sortBy: z.enum(['createdAt', 'username', 'email']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
    role: UserRoleSchema.optional(),
    status: UserStatusSchema.optional(),
    search: z.string().max(100).optional(),
  })
  .openapi({
    title: 'UserQueryDto',
    description: '用户查询参数',
    example: {
      page: 1,
      limit: 20,
      sortBy: 'createdAt',
      sortOrder: 'desc',
      role: 'user',
      status: 'active',
    },
  });

// 用户唯一查询参数DTO
export const UserUniqueQueryDtoSchema = z
  .object({
    username: z
      .string()
      .min(1, '用户名不能为空')
      .max(50, '用户名不能超过50个字符')
      .optional(),
    email: z.email('请输入有效的电子邮件地址').optional(),
    id: z.uuid('请输入有效的用户ID').optional(),
  })
  .openapi({
    title: 'UserUniqueQueryDto',
    description: '用户唯一查询参数',
    example: {
      username: 'poetryuser',
      email: 'user@example.com',
      id: '123e4567-e89b-12d3-a456-426614174000',
    },
  });

// 管理员更新用户DTO
export const AdminUpdateUserDtoSchema = z
  .object({
    role: UserRoleSchema.optional(),
    status: UserStatusSchema.optional(),
    banReason: z.string().max(500).optional(),
  })
  .openapi({
    title: 'AdminUpdateUserDto',
    description: '管理员更新用户请求数据',
    example: {
      role: 'admin',
      status: 'active',
    },
  });

// 用户响应DTO
export const UserResponseSchema = z
  .object({
    id: z.uuid(),
    username: z.string(),
    email: z.email(),
    bio: z.string().nullable(),
    avatarUrl: z.string().url().nullable(),
    role: UserRoleSchema,
    status: UserStatusSchema,
    banReason: z.string().nullable(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    _count: z
      .object({
        poems: z.number(),
      })
      .optional(),
  })
  .openapi({
    title: 'UserResponse',
    description: '用户响应数据',
    example: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      username: 'poetryuser',
      email: 'user@example.com',
      bio: '热爱诗歌的创作者',
      avatarUrl: 'https://example.com/avatar.jpg',
      role: 'user',
      status: 'active',
      banReason: null,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      _count: {
        poems: 5,
      },
    },
  });

// 用户公开信息DTO（不包含敏感信息）
export const UserPublicResponseSchema = UserResponseSchema.omit({
  email: true,
  banReason: true,
}).openapi({
  title: 'UserPublicResponse',
  description: '用户公开信息响应数据',
});

// 用户列表响应DTO
export const UserListResponseSchema = z
  .object({
    data: z.array(UserResponseSchema),
    pagination: z.object({
      page: z.number(),
      limit: z.number(),
      total: z.number(),
      totalPages: z.number(),
    }),
  })
  .openapi({
    title: 'UserListResponse',
    description: '用户列表响应数据',
  });

// 导出类型
export type UserRole = z.infer<typeof UserRoleSchema>;
export type UserStatus = z.infer<typeof UserStatusSchema>;
export type UpdateUserProfileDto = z.infer<typeof UpdateUserProfileDtoSchema>;
export type ChangePasswordDto = z.infer<typeof ChangePasswordDtoSchema>;
export type UserPaginationQueryDto = z.infer<
  typeof UserPaginationQueryDtoSchema
>;
export type UserUniqueQueryDto = z.infer<typeof UserUniqueQueryDtoSchema>;
export type AdminUpdateUserDto = z.infer<typeof AdminUpdateUserDtoSchema>;
export type UserResponse = z.infer<typeof UserResponseSchema>;
export type UserPublicResponse = z.infer<typeof UserPublicResponseSchema>;
export type UserListResponse = z.infer<typeof UserListResponseSchema>;
