import { applyDecorators } from '@nestjs/common';
import { Roles } from './roles.decorator';
import { UserRole } from '@prisma/client';

export function RequireAdmin() {
  return applyDecorators(Roles([UserRole.Admin]));
}
