import { Controller, Post, Req, UseGuards, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local.guard';
import { UserDto } from '../user/dto/user.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import {
  LoginDto,
  LoginDtoSchema,
  RegisterDto,
  RegisterDtoSchema,
  AuthTokenResponseSchema,
  UserResponseSchema,
} from '@poetryclub/shared';
import { ZodBody } from 'src/common/decorators/zod-body.decorator';
import { ApiRoute } from 'src/common/decorators/api-route.decorator';

@ApiTags('身份认证')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiRoute({
    summary: '用户登录',
    description: '使用用户名和密码进行登录认证',
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
  @Post('/login')
  @UseGuards(LocalAuthGuard)
  login(
    @Req() req: Request,
    @ZodBody(LoginDtoSchema, { schemaName: 'LoginDto' }) _loginDto: LoginDto
  ) {
    return this.authService.signIn(req.user as UserDto);
  }

  @ApiRoute({
    summary: '用户注册',
    description: '注册新用户账号',
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
  @Post('/register')
  register(
    @ZodBody(RegisterDtoSchema, { schemaName: 'RegisterDto' })
    registerDto: RegisterDto
  ) {
    return this.authService.registerUser(
      registerDto.email,
      registerDto.password,
      registerDto.username
    );
  }
}
