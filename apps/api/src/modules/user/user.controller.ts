import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  ForbiddenException,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { UserService } from './user.service';
import {
  UserListResponseSchema,
  UserResponseSchema,
  IdParamDtoSchema,
  ErrorResponseSchema,
  UpdateUserProfileDtoSchema,
  AdminUpdateUserDtoSchema,
  ChangePasswordDtoSchema,
  IdParamDto,
  UpdateUserProfileDto,
  UserPaginationQueryDto,
  ChangePasswordDto,
  UserPaginationQueryDtoSchema,
} from '@poetryclub/shared';
import {
  ZodBody,
  ZodQuery,
  ZodParam,
} from 'src/common/decorators/zod-body.decorator';
import { ApiRoute } from 'src/common/decorators/api-route.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('用户管理')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiRoute({
    summary: '获取用户列表',
    description: '分页获取用户列表，支持筛选和排序（仅管理员）',
    responses: {
      200: {
        description: '成功获取用户列表',
        schema: UserListResponseSchema,
        schemaName: 'UserListResponse',
      },
      400: {
        description: '请求参数错误',
        schema: ErrorResponseSchema,
        schemaName: 'ErrorResponse',
      },
      401: {
        description: '未授权访问',
        schema: ErrorResponseSchema,
        schemaName: 'ErrorResponse',
      },
      403: {
        description: '权限不足',
        schema: ErrorResponseSchema,
        schemaName: 'ErrorResponse',
      },
    },
  })
  @Get()
  @Roles([UserRole.Admin, UserRole.User])
  @ApiBearerAuth()
  findAll(
    @Req() req: Request,
    @ZodQuery(UserPaginationQueryDtoSchema, {
      schemaName: 'UserPaginationQueryDto',
    })
    query: UserPaginationQueryDto
  ) {
    // 只有管理员可以查看用户列表
    if (req.user.role !== 'Admin') {
      throw new ForbiddenException('权限不足，只有管理员可以查看用户列表');
    }
    return this.userService.findAll(query);
  }

  @ApiRoute({
    summary: '获取用户详情',
    description: '根据ID获取单个用户的详细信息',
    pathParams: {
      schema: IdParamDtoSchema,
      schemaName: 'IdParamDto',
      description: '用户ID',
    },
    responses: {
      200: {
        description: '获取成功',
        schema: UserResponseSchema,
        schemaName: 'UserResponse',
      },
      401: {
        description: '未授权访问',
        schema: ErrorResponseSchema,
        schemaName: 'ErrorResponse',
      },
      403: {
        description: '权限不足',
        schema: ErrorResponseSchema,
        schemaName: 'ErrorResponse',
      },
      404: {
        description: '用户不存在',
        schema: ErrorResponseSchema,
        schemaName: 'ErrorResponse',
      },
    },
  })
  @Get(':id')
  @Roles([UserRole.Admin, UserRole.User])
  @ApiBearerAuth()
  findOne(
    @Req() req: Request,
    @ZodParam(IdParamDtoSchema, 'id') id: IdParamDto
  ) {
    // 用户只能查看自己的详细信息，管理员可以查看所有用户
    if (req.user.id !== id && req.user.role !== 'Admin') {
      throw new ForbiddenException('权限不足，只能查看自己的信息');
    }
    return this.userService.findOne({ id });
  }

  @ApiRoute({
    summary: '管理员更新用户信息',
    description: '管理员更新用户角色、状态等信息',
    pathParams: {
      schema: IdParamDtoSchema,
      schemaName: 'IdParamDto',
      description: '用户ID',
    },
    requestBody: {
      schema: AdminUpdateUserDtoSchema,
      schemaName: 'AdminUpdateUserDto',
      description: '管理员更新用户数据',
    },
    responses: {
      200: {
        description: '更新成功',
        schema: UserResponseSchema,
        schemaName: 'UserResponse',
      },
      400: {
        description: '请求参数错误',
        schema: ErrorResponseSchema,
        schemaName: 'ErrorResponse',
      },
      401: {
        description: '未授权访问',
        schema: ErrorResponseSchema,
        schemaName: 'ErrorResponse',
      },
      403: {
        description: '权限不足',
        schema: ErrorResponseSchema,
        schemaName: 'ErrorResponse',
      },
      404: {
        description: '用户不存在',
        schema: ErrorResponseSchema,
        schemaName: 'ErrorResponse',
      },
    },
  })
  @Patch(':id')
  @Roles([UserRole.Admin])
  @ApiBearerAuth()
  adminUpdate(
    @Req() req: Request,
    @ZodParam(IdParamDtoSchema, 'id', { schemaName: 'IdParamDto' }) id: string,
    @ZodBody(AdminUpdateUserDtoSchema, { schemaName: 'AdminUpdateUserDto' })
    updateDto: UserPaginationQueryDto
  ) {
    return this.userService.adminUpdateUser(id, updateDto);
  }

  @ApiRoute({
    summary: '删除用户',
    description: '删除指定的用户（仅管理员）',
    pathParams: {
      schema: IdParamDtoSchema,
      schemaName: 'IdParamDto',
      description: '用户ID',
    },
    responses: {
      200: {
        description: '删除成功',
      },
      401: {
        description: '未授权访问',
        schema: ErrorResponseSchema,
        schemaName: 'ErrorResponse',
      },
      403: {
        description: '权限不足',
        schema: ErrorResponseSchema,
        schemaName: 'ErrorResponse',
      },
      404: {
        description: '用户不存在',
        schema: ErrorResponseSchema,
        schemaName: 'ErrorResponse',
      },
    },
  })
  @Delete(':id')
  @Roles([UserRole.Admin])
  @ApiBearerAuth()
  remove(
    @Req() req: Request,
    @ZodParam(IdParamDtoSchema, 'id', { schemaName: 'IdParamDto' }) id: string
  ) {
    return this.userService.remove(id);
  }

  @ApiRoute({
    summary: '获取当前用户信息',
    description: '获取当前登录用户的详细信息',
    responses: {
      200: {
        description: '获取成功',
        schema: UserResponseSchema,
        schemaName: 'UserResponse',
      },
      401: {
        description: '未授权访问',
        schema: ErrorResponseSchema,
        schemaName: 'ErrorResponse',
      },
    },
  })
  @Get('profile/me')
  @Roles([UserRole.Admin, UserRole.User])
  @ApiBearerAuth()
  getProfile(@Req() req: Request) {
    return this.userService.findOne({ id: req.user.id });
  }

  @ApiRoute({
    summary: '更新当前用户资料',
    description: '更新当前登录用户的个人资料',
    requestBody: {
      schema: UpdateUserProfileDtoSchema,
      schemaName: 'UpdateUserProfileDto',
      description: '用户资料更新数据',
    },
    responses: {
      200: {
        description: '更新成功',
        schema: UserResponseSchema,
        schemaName: 'UserResponse',
      },
      400: {
        description: '请求参数错误',
        schema: ErrorResponseSchema,
        schemaName: 'ErrorResponse',
      },
      401: {
        description: '未授权访问',
        schema: ErrorResponseSchema,
        schemaName: 'ErrorResponse',
      },
      409: {
        description: '用户名已被使用',
        schema: ErrorResponseSchema,
        schemaName: 'ErrorResponse',
      },
    },
  })
  @Patch('profile/me')
  @Roles([UserRole.Admin, UserRole.User])
  @ApiBearerAuth()
  updateProfile(
    @Req() req: Request,
    @ZodBody(UpdateUserProfileDtoSchema, { schemaName: 'UpdateUserProfileDto' })
    updateDto: UpdateUserProfileDto
  ) {
    return this.userService.updateProfile(req.user.id, updateDto);
  }

  @ApiRoute({
    summary: '修改密码',
    description: '修改当前用户的登录密码',
    requestBody: {
      schema: ChangePasswordDtoSchema,
      schemaName: 'ChangePasswordDto',
      description: '修改密码数据',
    },
    responses: {
      200: {
        description: '密码修改成功',
      },
      400: {
        description: '请求参数错误',
        schema: ErrorResponseSchema,
        schemaName: 'ErrorResponse',
      },
      401: {
        description: '未授权访问',
        schema: ErrorResponseSchema,
        schemaName: 'ErrorResponse',
      },
      403: {
        description: '当前密码不正确',
        schema: ErrorResponseSchema,
        schemaName: 'ErrorResponse',
      },
    },
  })
  @Post('profile/change-password')
  @Roles([UserRole.Admin, UserRole.User])
  @ApiBearerAuth()
  changePassword(
    @Req() req: Request,
    @ZodBody(ChangePasswordDtoSchema, { schemaName: 'ChangePasswordDto' })
    changePasswordDto: ChangePasswordDto
  ) {
    return this.userService.changePassword(req.user.id, changePasswordDto);
  }
}
