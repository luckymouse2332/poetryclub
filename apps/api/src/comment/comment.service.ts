import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CommentListResponse,
  CommentQueryDto,
  CommentResponse,
  CreateCommentDto,
} from '@poetryclub/shared';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/common/prisma/prisma.service';

@Injectable()
export class CommentService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: CommentQueryDto): Promise<CommentListResponse> {
    const {
      page = 1,
      limit = 20,
      poemId,
      userId,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.CommentWhereInput = {};

    if (poemId) where.poemId = poemId;
    if (userId) where.userId = userId;

    const order: Prisma.CommentOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    const [comments, count] = await Promise.all([
      this.prisma.comment.findMany({
        where,
        skip,
        take: limit,
        orderBy: order,
        include: {
          user: { select: { id: true, username: true, avatarUrl: true } },
          _count: { select: { replies: true } },
        },
      }),
      this.prisma.comment.count({ where }),
    ]);

    // TODO：加入点赞按点赞数量排序的前几条的评论

    return {
      data: comments.map((c) => { // 进行映射
        const { _count, ...rest } = c;
        return { ...rest, replyCount: _count.replies };
      }),
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  async findOne(id: string): Promise<CommentResponse> {
    return this.prisma.comment.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, username: true, avatarUrl: true } },
        _count: { select: { replies: true } },
      },
    });
  }

  async create(
    authorId: string,
    comment: CreateCommentDto
  ): Promise<CommentResponse> {
    const [poemCount, userCount, parentCount] = await Promise.all([
      this.prisma.poem.count({ where: { id: comment.poemId } }),
      this.prisma.user.count({ where: { id: authorId } }),
      this.prisma.comment.count({ where: { id: comment.parentId } }),
    ]);

    if (poemCount === 0) {
      throw new NotFoundException('诗歌不存在');
    }

    if (userCount === 0) {
      throw new NotFoundException('用户不存在');
    }

    if (comment.parentId && parentCount === 0) {
      throw new NotFoundException('父评论不存在');
    }

    return this.prisma.comment.create({
      data: {
        content: comment.content,
        poem: { connect: { id: comment.poemId } },
        user: { connect: { id: authorId } },
        parent: {
          connect: comment.parentId ? { id: comment.parentId } : undefined,
        },
      },
      include: { user: true },
    });
  }

  async delete(userId: string, commentId: string) {
    const [user, comment] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, role: true },
      }),
      this.prisma.comment.findUnique({
        where: { id: commentId },
        select: { userId: true },
      }),
    ]);

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    if (!comment) {
      throw new NotFoundException('评论不存在');
    }

    if (user.role !== 'Admin' && comment.userId !== userId) {
      throw new ForbiddenException(
        '权限不足，只有管理员或评论作者可以删除评论'
      );
    }

    return this.prisma.comment.delete({ where: { id: commentId } });
  }
}
