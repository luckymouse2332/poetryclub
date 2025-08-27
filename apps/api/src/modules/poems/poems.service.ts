import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
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

  /**
   * 轻量级诗歌存在性检查方法
   * 仅检查诗歌是否存在，不加载关联数据
   * 适用于权限验证等场景
   */
  async checkPoemExists(id: string): Promise<boolean> {
    const count = await this.prisma.poem.count({
      where: { id },
    });
    return count > 0;
  }

  /**
   * 获取诗歌基本信息（不含评论和点赞详情）
   * 适用于需要诗歌基本信息但不需要完整关联数据的场景
   */
  async findOneBasic(id: string) {
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
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
    });

    if (!poem) {
      throw new NotFoundException('诗作不存在');
    }

    return poem;
  }

  /**
   * 获取诗歌完整信息（包含所有关联数据）
   * 适用于诗歌详情页等需要完整信息的场景
   */
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
    // 使用基本信息查询进行权限检查，避免加载不必要的关联数据
    const poem = await this.findOneBasic(id);

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
    // 使用基本信息查询进行权限检查，避免加载不必要的关联数据
    const poem = await this.findOneBasic(id);

    // 检查权限：只有作者可以删除
    if (poem.authorId !== userId) {
      throw new ForbiddenException('只有作者可以删除诗作');
    }

    return this.prisma.poem.delete({
      where: { id },
    });
  }

  async review(id: string, reviewDto: ReviewPoemDto) {
    const result = await this.checkPoemExists(id);

    if (!result) {
      throw new NotFoundException('诗作不存在');
    }

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

    const where: Prisma.PoemWhereInput = {
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

  /**
   * 点赞操作
   *
   * 该操作会在数据库中创建一个点赞记录
   *
   * 点赞记录包含用户ID和诗作ID
   *
   * 点赞记录的创建时间会自动设置为当前时间
   *
   * @param id 诗作ID
   * @param userId 用户ID
   * @returns 点赞信息
   *
   * @throws ConflictException 已点赞
   * @throws NotFoundException 诗作不存在
   */
  async like(id: string, userId: string) {
    const result = await this.checkPoemExists(id);

    if (!result) {
      throw new NotFoundException('诗作不存在');
    }

    const like = await this.prisma.like.findUnique({
      where: {
        poemId_userId: {
          poemId: id,
          userId,
        },
      },
    });

    if (like) {
      throw new ConflictException('已点赞');
    }

    return await this.prisma.like.create({
      data: {
        userId,
        poemId: id,
      },
    });
  }

  /**
   * 取消点赞
   *
   * 该操作直接从数据库中删除点赞对象
   *
   * @param id 诗作ID
   * @param userId 用户ID
   * @returns 取消点赞信息
   *
   * @throws ConflictException 未点赞
   * @throws NotFoundException 诗作不存在
   */
  async unlike(id: string, userId: string) {
    const result = await this.checkPoemExists(id);

    if (!result) {
      throw new NotFoundException('诗作不存在');
    }

    const like = await this.prisma.like.findUnique({
      where: {
        poemId_userId: {
          poemId: id,
          userId,
        },
      },
    });

    if (!like) {
      throw new ConflictException('未点赞');
    }

    return await this.prisma.like.delete({
      where: {
        id: like.id,
      },
    });
  }
}
