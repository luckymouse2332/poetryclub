import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthService } from './auth.service';
import { User } from '@prisma/client';
import { LocalAuthGuard } from './local.guard';
import { Roles } from 'src/common/decorators/roles.decorator';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'User login' })
  @Post('/login')
  @UseGuards(LocalAuthGuard)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  login(@Req() req: Request, @Body() _loginDto: LoginDto) {
    return this.authService.signIn(req.user as Omit<User, 'passwordHash'>);
  }

  @ApiOperation({ summary: 'Registers a new user' })
  @Post('/register')
  register(@Body() registerRequest: RegisterDto) {
    return this.authService.registerUser(
      registerRequest.email,
      registerRequest.password,
      registerRequest.username
    );
  }

  @ApiOperation({ summary: 'Gets user info' })
  @Get('/info')
  @Roles(['User', 'Admin'])
  info(@Req() req: Request) {
    return req.user;
  }
}
