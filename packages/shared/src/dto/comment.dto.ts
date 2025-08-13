import { z } from '../z';

// 评论DTO
export const CommentSchema = z.object({
  id: z.string(),
  author: z.string(),
  avatar: z.string(),
  date: z.string(),
  content: z.string(),
});

// 诗歌评论映射类型
export const PoemCommentsMapSchema = z.record(z.string(), z.array(CommentSchema));

// 创建评论DTO
export const CreateCommentDtoSchema = z
  .object({
    poemId: z.string().min(1, '诗歌ID不能为空'),
    content: z.string().min(1, '评论内容不能为空').max(1000, '评论内容不能超过1000个字符'),
    parentId: z.string().optional(), // 用于回复评论
  })
  .openapi({
    title: 'CreateCommentDto',
    description: '创建评论请求数据',
    example: {
      poemId: '1',
      content: '这首诗写得很有意境！',
    },
  });

// 更新评论DTO
export const UpdateCommentDtoSchema = z
  .object({
    content: z.string().min(1, '评论内容不能为空').max(1000, '评论内容不能超过1000个字符'),
  })
  .openapi({
    title: 'UpdateCommentDto',
    description: '更新评论请求数据',
    example: {
      content: '这首诗写得非常有意境！',
    },
  });

// 评论查询参数DTO
export const CommentQueryDtoSchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    poemId: z.string().optional(),
    authorId: z.string().optional(),
    sortBy: z.enum(['createdAt', 'updatedAt']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  })
  .openapi({
    title: 'CommentQueryDto',
    description: '评论查询参数',
    example: {
      page: 1,
      limit: 20,
      poemId: '1',
      sortBy: 'createdAt',
      sortOrder: 'desc',
    },
  });

// 评论响应DTO基础结构
const BaseCommentResponseSchema = z.object({
  id: z.string(),
  content: z.string(),
  poemId: z.string(),
  authorId: z.string(),
  author: z.object({
    id: z.string(),
    username: z.string(),
    avatar: z.string().nullable(),
  }),
  parentId: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// 评论响应DTO（支持嵌套回复）
export const CommentResponseSchema: z.ZodType<{
  id: string;
  content: string;
  poemId: string;
  authorId: string;
  author: {
    id: string;
    username: string;
    avatar: string | null;
  };
  parentId: string | null;
  replies?: Array<{
    id: string;
    content: string;
    poemId: string;
    authorId: string;
    author: {
      id: string;
      username: string;
      avatar: string | null;
    };
    parentId: string | null;
    replies?: any[];
    createdAt: string;
    updatedAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}> = BaseCommentResponseSchema.extend({
  replies: z.array(z.lazy(() => CommentResponseSchema)).optional(),
})
  .openapi({
    title: 'CommentResponse',
    description: '评论响应数据',
    example: {
      id: '1',
      content: '这首诗写得很有意境！',
      poemId: '1',
      authorId: 'user1',
      author: {
        id: 'user1',
        username: '用户A',
        avatar: null,
      },
      parentId: null,
      createdAt: '2024-04-24T00:00:00.000Z',
      updatedAt: '2024-04-24T00:00:00.000Z',
    },
  });

// 评论列表响应DTO
export const CommentListResponseSchema = z
  .object({
    data: z.array(CommentResponseSchema),
    pagination: z.object({
      page: z.number(),
      limit: z.number(),
      total: z.number(),
      totalPages: z.number(),
    }),
  })
  .openapi({
    title: 'CommentListResponse',
    description: '评论列表响应数据',
  });

// 导出类型
export type Comment = z.infer<typeof CommentSchema>;
export type PoemCommentsMap = z.infer<typeof PoemCommentsMapSchema>;
export type CreateCommentDto = z.infer<typeof CreateCommentDtoSchema>;
export type UpdateCommentDto = z.infer<typeof UpdateCommentDtoSchema>;
export type CommentQueryDto = z.infer<typeof CommentQueryDtoSchema>;
export type CommentResponse = z.infer<typeof CommentResponseSchema>;
export type CommentListResponse = z.infer<typeof CommentListResponseSchema>;