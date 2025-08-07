import { Controller, Get, Post, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { UserService } from './user.service';
import { ProfileDto, ProfileDtoSchema } from '@poetryclub/shared';
import { ZodBody } from 'src/common/decorators/zod-body.decorator';

@ApiTags('User controller')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: "Changes user's profile" })
  @Post('profile')
  @Roles([UserRole.User, UserRole.Admin])
  changeProfile(
    @Req() req: Request,
    @ZodBody(ProfileDtoSchema) newProfile: ProfileDto
  ) {
    // 转换角色值以匹配Prisma枚举
    const profileData = {
      ...newProfile,
      role: newProfile.role === 'admin' ? UserRole.Admin : 
            newProfile.role === 'user' ? UserRole.User : 
            undefined
    };
    
    // 移除undefined的role字段
    if (profileData.role === undefined) {
      delete profileData.role;
    }
    
    return this.userService.update(req.user.id, profileData);
  }

  @ApiOperation({ summary: "Gets current user's profile" })
  @Get('profile')
  @Roles([UserRole.User, UserRole.Admin])
  getProfile(@Req() req: Request) {
    return this.userService.findOneById(req.user.id);
  }
}
