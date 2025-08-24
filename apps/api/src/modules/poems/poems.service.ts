import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import {
  CreatePoemDto,
  UpdatePoemDto,
  PoemQueryDto,
  ReviewPoemDto,
  PoemListResponse,
  PoemResponse,
} from '@poetryclub/shared';
import { PoemStatus, Prisma } from '@prisma/client';

@Injectable()
export class PoemsService {
  constructor(private prisma: PrismaService) {}

  async create(
    createPoemDto: CreatePoemDto,
    authorId: string
  ): Promise<PoemResponse> {
    const { title, content, isDraft = false } = createPoemDto;

    return this.prisma.poem.create({
      data: {
        title,
        content,
        author: title, // 保持向后兼容
        authorId,
        isDraft,
        status: 'Pending', // 所有诗作都需要审核
      },
      include: {
        authorUser: {
          select: {
            id: true,
            username: true,
            bio: true,
          },
        },
      },
    });
  }

  async findAll(query?: PoemQueryDto): Promise<PoemListResponse> {
    const {
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      status,
      authorId,
      search,
    } = query || {};

    const skip = (page - 1) * limit;

    // 构建查询条件
    const where: Prisma.PoemWhereInput = {};

    if (status) {
      // 转换为Prisma枚举格式
      const statusMap = {
        pending: 'Pending',
        approved: 'Approved',
        rejected: 'Rejected',
      };
      where.status = (statusMap[status] || 'Pending') as PoemStatus;
    }

    if (authorId) {
      where.authorId = authorId;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    // 只显示已发布的诗作（非草稿且已审核通过）
    if (!authorId) {
      // 如果不是查询特定作者，则只显示公开的诗作
      where.isDraft = false;
      where.status = 'Approved';
    }

    const [poems, total] = await Promise.all([
      this.prisma.poem.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          authorUser: {
            select: {
              id: true,
              username: true,
              bio: true,
            },
          },
        },
      }),
      this.prisma.poem.count({ where }),
    ]);

    return {
      data: poems,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const poem = await this.prisma.poem.findUnique({
      where: { id },
      include: {
        authorUser: {
          select: {
            id: true,
            username: true,
            bio: true,
          },
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        likes: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
      },
    });

    if (!poem) {
      throw new NotFoundException('诗作不存在');
    }

    return poem;
  }

  async update(id: string, updatePoemDto: UpdatePoemDto, userId: string) {
    const poem = await this.findOne(id);

    // 检查权限：只有作者可以更新
    if (poem.authorId !== userId) {
      throw new ForbiddenException('只有作者可以更新诗作');
    }

    return this.prisma.poem.update({
      where: { id },
      data: {
        ...updatePoemDto,
        // 如果更新了内容，重置审核状态
        ...(updatePoemDto.content && { status: 'Pending' }),
      },
      include: {
        authorUser: {
          select: {
            id: true,
            username: true,
            bio: true,
          },
        },
      },
    });
  }

  async remove(id: string, userId: string) {
    const poem = await this.findOne(id);

    // 检查权限：只有作者可以删除
    if (poem.authorId !== userId) {
      throw new ForbiddenException('只有作者可以删除诗作');
    }

    return this.prisma.poem.delete({
      where: { id },
    });
  }

  async review(id: string, reviewDto: ReviewPoemDto) {
    const poem = await this.findOne(id);

    const { status, rejectionReason } = reviewDto;

    return this.prisma.poem.update({
      where: { id },
      data: {
        status: status === 'approved' ? 'Approved' : 'Rejected', // 转换为Prisma枚举格式
        rejectionReason: status === 'rejected' ? rejectionReason : null,
      },
      include: {
        authorUser: {
          select: {
            id: true,
            username: true,
            bio: true,
          },
        },
      },
    });
  }

  // 获取用户的诗作（包括草稿和所有状态）
  async findUserPoems(userId: string, query?: PoemQueryDto) {
    const {
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      status,
      search,
    } = query || {};

    const skip = (page - 1) * limit;

    const where: any = {
      authorId: userId,
    };

    if (status) {
      // 转换为Prisma枚举格式
      const statusMap = {
        pending: 'Pending',
        approved: 'Approved',
        rejected: 'Rejected',
      };
      where.status = statusMap[status] || 'Pending';
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [poems, total] = await Promise.all([
      this.prisma.poem.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          authorUser: {
            select: {
              id: true,
              username: true,
              bio: true,
            },
          },
        },
      }),
      this.prisma.poem.count({ where }),
    ]);

    return {
      data: poems,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
