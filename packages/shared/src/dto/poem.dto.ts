import { z } from '../z';

// 诗歌状态枚举
export const PoemStatusSchema = z.enum(['pending', 'approved', 'rejected']);

// 创建诗歌DTO
export const CreatePoemDtoSchema = z
  .object({
    title: z.string().min(1, '标题不能为空').max(50, '标题不能超过50个字符'),
    content: z.string().min(1, '内容不能为空').max(5000, '内容不能超过5000个字符'),
    isDraft: z.boolean().default(false).optional(),
  })
  .openapi({
    title: 'CreatePoemDto',
    description: '创建诗歌请求数据',
    example: {
      title: '春日吟',
      content: '春风十里不如你，\n诗意盎然满心田。\n文字如花绽放时，\n情深意切永流传。',
      isDraft: false,
    },
  });

// 更新诗歌DTO
export const UpdatePoemDtoSchema = z
  .object({
    title: z.string().min(1, '标题不能为空').max(50, '标题不能超过50个字符').optional(),
    content: z.string().min(1, '内容不能为空').max(5000, '内容不能超过5000个字符').optional(),
    isDraft: z.boolean().optional(),
  })
  .openapi({
    title: 'UpdatePoemDto',
    description: '更新诗歌请求数据',
    example: {
      title: '春日吟（修订版）',
      content: '春风十里不如你，\n诗意盎然满心田。\n文字如花绽放时，\n情深意切永流传。\n\n（修订于2024年）',
    },
  });

// 诗歌查询参数DTO
export const PoemQueryDtoSchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).default(20).optional(),
    sortBy: z.enum(['createdAt', 'updatedAt', 'title']).default('createdAt').optional(),
    sortOrder: z.enum(['asc', 'desc']).default('desc').optional(),
    status: PoemStatusSchema.optional(),
    authorId: z.uuid().optional(),
    search: z.string().max(100).optional(),
  })
  .openapi({
    title: 'PoemQueryDto',
    description: '诗歌查询参数',
    example: {
      page: 1,
      limit: 20,
      sortBy: 'createdAt',
      sortOrder: 'desc',
      status: 'approved',
    },
  });

// 诗歌审核DTO
export const ReviewPoemDtoSchema = z
  .object({
    status: z.enum(['approved', 'rejected']),
    rejectionReason: z.string().max(500).optional(),
  })
  .openapi({
    title: 'ReviewPoemDto',
    description: '诗歌审核请求数据',
    example: {
      status: 'approved',
    },
  });

// 诗歌响应DTO
export const PoemResponseSchema = z
  .object({
    id: z.uuid(),
    title: z.string(),
    content: z.string(),
    status: PoemStatusSchema,
    isDraft: z.boolean(),
    authorId: z.string().uuid(),
    author: z.object({
      id: z.string().uuid(),
      username: z.string(),
      bio: z.string().nullable(),
    }).optional(),
    rejectionReason: z.string().nullable(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  })
  .openapi({
    title: 'PoemResponse',
    description: '诗歌响应数据',
    example: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      title: '春日吟',
      content: '春风十里不如你，\n诗意盎然满心田。',
      status: 'approved',
      isDraft: false,
      authorId: '123e4567-e89b-12d3-a456-426614174001',
      author: {
        id: '123e4567-e89b-12d3-a456-426614174001',
        username: 'poetryuser',
        bio: '热爱诗歌的创作者',
      },
      rejectionReason: null,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
  });

// 诗歌列表响应DTO
export const PoemListResponseSchema = z
  .object({
    data: z.array(PoemResponseSchema),
    pagination: z.object({
      page: z.number(),
      limit: z.number(),
      total: z.number(),
      totalPages: z.number(),
    }),
  })
  .openapi({
    title: 'PoemListResponse',
    description: '诗歌列表响应数据',
  });

// 导出类型
export type PoemStatus = z.infer<typeof PoemStatusSchema>;
export type CreatePoemDto = z.infer<typeof CreatePoemDtoSchema>;
export type UpdatePoemDto = z.infer<typeof UpdatePoemDtoSchema>;
export type PoemQueryDto = z.infer<typeof PoemQueryDtoSchema>;
export type ReviewPoemDto = z.infer<typeof ReviewPoemDtoSchema>;
export type PoemResponse = z.infer<typeof PoemResponseSchema>;
export type PoemListResponse = z.infer<typeof PoemListResponseSchema>;