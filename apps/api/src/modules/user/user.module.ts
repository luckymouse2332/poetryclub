import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { UserController } from './user.controller';

@Module({
  providers: [UserService],
  imports: [PrismaModule],
  exports: [UserService],
  controllers: [UserController],
})
export class UserModule {}
