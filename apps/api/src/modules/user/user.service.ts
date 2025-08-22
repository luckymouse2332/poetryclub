import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import {
  UpdateUserProfileDto,
  UserPaginationQueryDto,
  ChangePasswordDto,
  UserUniqueQueryDto,
  AdminUpdateUserDto,
} from '@poetryclub/shared';
import { User, Prisma, UserRole, UserStatus } from '@prisma/client';
import { PrismaService } from 'src/common/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query?: UserPaginationQueryDto) {
    const {
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      role,
      status,
      search,
    } = query || {};

    const skip = (page - 1) * limit;

    const orderBy: Prisma.UserOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    // 构建查询条件
    const where: Prisma.UserWhereInput = {};
    if (search) {
      where.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) {
      const roleMap = {
        admin: UserRole.Admin,
        user: UserRole.User,
      };
      where.role = roleMap[role] || undefined;
    }

    if (status) {
      const statusMap = {
        active: UserStatus.Active,
        locked: UserStatus.Locked,
        banned: UserStatus.Banned,
      };
      where.status = statusMap[status] || UserStatus.Active;
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          poems: {
            select: {
              id: true,
              title: true,
              createdAt: true,
            },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async userExists(query: Prisma.UserWhereInput): Promise<boolean> {
    const count = await this.prisma.user.count({ where: query });
    return count > 0;
  }

  async findOne(
    query: UserUniqueQueryDto,
    includeOtherData = true
  ): Promise<User> {
    const { username, id, email } = query;
    const user = await this.prisma.user.findUnique({
      where: { username, id, email },
      include: includeOtherData // 在某些情况下只需要返回最基本的用户信息即可，避免不必要的查询
        ? {
            poems: {
              select: {
                id: true,
                title: true,
                status: true,
                createdAt: true,
              },
              orderBy: { createdAt: 'desc' },
            },
            _count: {
              select: {
                poems: true,
                comments: true,
                likes: true,
              },
            },
          }
        : undefined,
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    return user;
  }

  async add(user: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({ data: user });
  }

  async updateProfile(id: string, updateDto: UpdateUserProfileDto) {
    const user = await this.findOne({ id });

    // 检查用户名是否已被使用
    if (updateDto.username && updateDto.username !== user.username) {
      const existingUser = await this.userExists({
        username: updateDto.username,
      });
      if (existingUser) {
        throw new ConflictException('用户名已被使用');
      }
    }

    return this.prisma.user.update({
      where: { id },
      data: updateDto,
      include: {
        _count: {
          select: {
            poems: true,
            comments: true,
            likes: true,
          },
        },
      },
    });
  }

  async adminUpdateUser(id: string, updateDto: AdminUpdateUserDto) {
    const userExists = await this.userExists({ id });
    if (!userExists) {
      throw new NotFoundException('用户不存在');
    }

    // 转换枚举值为Prisma格式
    const data: Prisma.UserUpdateInput = {};
    if (updateDto.role) {
      const roleMap = {
        admin: UserRole.Admin,
        user: UserRole.User,
      };
      data.role = roleMap[updateDto.role];
    }
    if (updateDto.status) {
      const statusMap = {
        active: UserStatus.Active,
        locked: UserStatus.Locked,
        banned: UserStatus.Banned,
      };
      data.status = statusMap[updateDto.status];
    }
    if (updateDto.banReason !== undefined) {
      data.banReason = updateDto.banReason;
    }

    return this.prisma.user.update({
      where: { id },
      data,
      include: {
        _count: {
          select: {
            poems: true,
            comments: true,
            likes: true,
          },
        },
      },
    });
  }

  async changePassword(id: string, changePasswordDto: ChangePasswordDto) {
    const { currentPassword, newPassword } = changePasswordDto;
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 验证当前密码
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.passwordHash
    );
    if (!isCurrentPasswordValid) {
      throw new ForbiddenException('当前密码不正确');
    }

    // 加密新密码
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    return this.prisma.user.update({
      where: { id },
      data: { passwordHash: hashedNewPassword },
      select: {
        id: true,
        username: true,
        email: true,
        updatedAt: true,
      },
    });
  }

  async remove(id: string) {
    const userExists = await this.userExists({ id });
    if (!userExists) {
      throw new NotFoundException('用户不存在');
    }

    // 检查用户是否有关联的诗作
    const poemCount = await this.prisma.poem.count({
      where: { authorId: id },
    });

    if (poemCount > 0) {
      throw new ForbiddenException(
        '无法删除用户，该用户还有关联的诗作。请先删除或转移相关诗作。'
      );
    }

    return this.prisma.user.delete({
      where: { id },
    });
  }
}
