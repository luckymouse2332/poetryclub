import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBody } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local.guard';
import { UserDto } from '../user/dto/user.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import {
  LoginDto,
  LoginDtoSchema,
  PasswordsDto,
  PasswordsDtoSchema,
  RegisterDto,
  RegisterDtoSchema,
  AuthTokenResponseSchema,
  UserResponseSchema,
  ChangePasswordDtoSchema,
  ChangePasswordDto,
} from '@poetryclub/shared';
import { ZodBody } from 'src/common/decorators/zod-body.decorator';
import { ApiRoute } from 'src/common/decorators/api-route.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiRoute({
    summary: '用户登录',
    description: '使用用户名和密码进行登录认证',
    tags: ['auth'],
    requestBody: {
      schema: LoginDtoSchema,
      schemaName: 'LoginDto',
      description: '登录请求数据',
    },
    responses: {
      200: {
        description: '登录成功',
        schema: AuthTokenResponseSchema,
        schemaName: 'AuthTokenResponse',
      },
      401: {
        description: '用户名或密码错误',
      },
      400: {
        description: '请求参数错误',
      },
    },
  })
  @ApiBody({
    description: '登录请求数据',
    schema: {
      $ref: '#/components/schemas/LoginDto',
    },
  })
  @Post('/login')
  @UseGuards(LocalAuthGuard)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  login(@Req() req: Request, @ZodBody(LoginDtoSchema, { schemaName: 'LoginDto' }) _loginDto: LoginDto) {
    return this.authService.signIn(req.user as UserDto);
  }

  @ApiRoute({
    summary: '用户注册',
    description: '注册新用户账号',
    tags: ['auth'],
    requestBody: {
      schema: RegisterDtoSchema,
      schemaName: 'RegisterDto',
      description: '注册请求数据',
    },
    responses: {
      201: {
        description: '注册成功',
        schema: UserResponseSchema,
        schemaName: 'UserResponse',
      },
      409: {
        description: '用户名或邮箱已存在',
      },
      400: {
        description: '请求参数错误',
      },
    },
  })
  @ApiBody({
    description: '注册请求数据',
    schema: {
      $ref: '#/components/schemas/RegisterDto',
    },
  })
  @Post('/register')
  register(@ZodBody(RegisterDtoSchema, { schemaName: 'RegisterDto' }) registerDto: RegisterDto) {
    return this.authService.registerUser(
      registerDto.email,
      registerDto.password,
      registerDto.username
    );
  }

  @ApiRoute({
    summary: '修改密码',
    description: '修改当前用户的密码',
    tags: ['auth'],
    requestBody: {
      schema: ChangePasswordDtoSchema,
      schemaName: 'ChangePasswordDto',
      description: '修改密码请求数据',
    },
    responses: {
      200: {
        description: '密码修改成功',
      },
      400: {
        description: '当前密码错误或新密码格式不正确',
      },
      401: {
        description: '未授权访问',
      },
    },
  })
  @ApiBody({
    description: '修改密码请求数据',
    schema: {
      $ref: '#/components/schemas/ChangePasswordDto',
    },
  })
  @Post('/change-password')
  @Roles([UserRole.Admin, UserRole.User])
  changePassword(
    @Req() req: Request,
    @ZodBody(ChangePasswordDtoSchema, { schemaName: 'ChangePasswordDto' }) passwords: ChangePasswordDto
  ) {
    return this.authService.changePassword(
      req.user.id,
      passwords.currentPassword,
      passwords.newPassword
    );
  }
}
