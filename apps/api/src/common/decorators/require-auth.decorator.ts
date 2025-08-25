import { applyDecorators } from '@nestjs/common';
import { Roles } from './roles.decorator';
import { UserRole } from '@prisma/client';

/**
 * 需要身份认证的接口
 */
export function RequireAuth() {
  return applyDecorators(Roles([UserRole.Admin, UserRole.User]));
}
