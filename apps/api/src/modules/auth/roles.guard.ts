import { ExecutionContext, Injectable } from '@nestjs/common';
import { JwtAuthGuard } from './jwt.guard';
import { Reflector } from '@nestjs/core';
import { UserService } from '../user/user.service';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Request } from 'express';

@Injectable()
export class RolesGuard extends JwtAuthGuard {
  constructor(
    private readonly reflector: Reflector,
    private readonly userService: UserService
  ) {
    super();
  }

  async canActivate(context: ExecutionContext) {
    const roles = this.reflector.getAllAndOverride(Roles, [
      context.getClass(),
      context.getHandler(),
    ]);

    if (roles?.length === 0 || !roles) {
      // 无需验证即可登录
      return true;
    }

    // 确保用户已登录
    // 向请求数据中注入用户登录信息
    const result = await super.canActivate(context);

    if (!result) {
      return false;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const currentUser = await this.userService.findOne(
      { id: request.user.id },
      false
    );

    if (!roles.includes(currentUser.role)) {
      return false;
    }

    return true;
  }
}
