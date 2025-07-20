import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { PrismaModule } from 'src/common/prisma/prisma.module';

@Module({
  providers: [UserService],
  imports: [PrismaModule],
  exports: [UserService],
})
export class UserModule {}
