import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from './auth.service';
import { User } from '@prisma/client';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super();
  }

  async validate(
    username: string,
    password: string
  ): Promise<Omit<User, 'passwordHash'>> {
    const result = await this.authService.validateUser(username, password);

    if (result.success == false) {
      throw new UnauthorizedException(result.error);
    }

    return result.data;
  }
}
