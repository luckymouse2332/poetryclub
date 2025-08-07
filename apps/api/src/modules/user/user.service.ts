import { Injectable } from '@nestjs/common';
import { User, Prisma } from '@prisma/client';
import { PrismaService } from 'src/common/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Finds a user by username.
   *
   * @param username - The username to search for.
   * @returns A Promise resolving to the user if found, or null if no matching user exists.
   */
  async findOneByName(username: string): Promise<User | null> {
    return this.prisma.user.findFirst({ where: { username } });
  }

  /**
   * Finds a user by id
   * @param id - The id to search for.
   * @returns A Promise resolving to the user if found, or null if no matching user exists.
   */
  async findOneById(id: string): Promise<User | null> {
    return this.prisma.user.findFirst({ where: { id } });
  }

  /**
   * Creates a new user in the database.
   *
   * @param user - The user data to create, conforming to Prisma's UserCreateInput.
   * @returns A Promise that resolves to the created user entity.
   */
  async add(user: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({ data: user });
  }

  async update(id: string, user: Prisma.UserUpdateInput): Promise<User> {
    return this.prisma.user.update({ where: { id }, data: user });
  }
}
