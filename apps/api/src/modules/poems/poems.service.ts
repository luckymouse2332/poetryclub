import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreatePoemDto, UpdatePoemDto } from './dto';

@Injectable()
export class PoemsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.poem.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.poem.findUnique({
      where: { id },
      include: {
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
  }

  async create(createPoemDto: CreatePoemDto) {
    return this.prisma.poem.create({
      data: createPoemDto,
    });
  }

  async update(id: string, updatePoemDto: UpdatePoemDto) {
    return this.prisma.poem.update({
      where: { id },
      data: updatePoemDto,
    });
  }

  async remove(id: string) {
    return this.prisma.poem.delete({
      where: { id },
    });
  }
}
