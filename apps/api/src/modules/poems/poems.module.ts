import { Module } from '@nestjs/common';
import { PoemsController } from './poems.controller';
import { PoemsService } from './poems.service';

@Module({
  controllers: [PoemsController],
  providers: [PoemsService],
  exports: [PoemsService],
})
export class PoemsModule {}
