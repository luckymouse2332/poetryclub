import { Injectable } from '@nestjs/common';
import { err, ok, PromiseResult } from '@poetryclub/types';
import { UserService } from 'src/modules/user/user.service';
import * as bcrypt from 'bcrypt';
import { HASH_ROUNDS } from 'src/common/constants/password.const';
import { JwtService } from '@nestjs/jwt';
import { UserDto } from '../user/dto/user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService
  ) {}

  async validateUser(
    username: string,
    password: string
  ): PromiseResult<UserDto> {
    const queryResult = await this.userService.findOne({ username }, false); // 只查询用户基本信息，不包含其他关联数据

    if (!queryResult) {
      return err('用户不存在！');
    }

    const { passwordHash, ...results } = queryResult;

    const compareResult = await bcrypt.compare(password, passwordHash);

    if (!compareResult) {
      return err('密码无效！');
    }

    return ok(results);
  }

  async registerUser(
    email: string,
    password: string,
    username?: string
  ): PromiseResult<UserDto> {
    const userExists = await this.userService.userExists({ email });

    if (userExists) {
      return err('该邮箱已注册！');
    }

    const passwordHashed = await bcrypt.hash(password, HASH_ROUNDS);
    const { passwordHash, ...results } = await this.userService.add({
      username: username ?? email,
      passwordHash: passwordHashed,
      email,
    });

    return ok(results);
  }

  async signIn(userDto: UserDto): Promise<string> {
    return await this.jwtService.signAsync({
      sub: userDto.id,
      username: userDto.username,
      role: userDto.role as 'User' | 'Admin',
    });
  }
}
