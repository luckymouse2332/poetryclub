import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserDto } from '../user/dto/user.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { LoginDto } from '@poetryclub/shared';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService
  ) {}

  async validateUser(username: string, password: string): Promise<UserDto> {
    const queryResult = await this.prisma.user.findUnique({
      where: { username },
      omit: { createdAt: true, updatedAt: true },
    });

    if (!queryResult) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    const { passwordHash, ...user } = queryResult;

    const compareResult = await bcrypt.compare(password, passwordHash);

    if (!compareResult) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    return user;
  }

  async registerUser(
    email: string,
    password: string,
    username?: string
  ): Promise<UserDto> {
    const userExists = await this.prisma.user.findUnique({ where: { email } });

    if (userExists) {
      throw new BadRequestException('该邮箱已被注册');
    }

    const salt = await bcrypt.genSalt();
    const passwordHashed = await bcrypt.hash(password, salt);
    const result = await this.prisma.user.create({
      data: {
        username: username ?? email,
        email,
        passwordHash: passwordHashed,
      },
      omit: {
        // 数据脱敏
        passwordHash: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return result;
  }

  async signIn(userDto: UserDto): Promise<string> {
    return await this.jwtService.signAsync({
      sub: userDto.id,
      username: userDto.username,
      role: userDto.role as string,
    });
  }
}
