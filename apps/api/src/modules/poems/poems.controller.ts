import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PoemsService } from './poems.service';
import { CreatePoemDto, UpdatePoemDto } from './dto';
import { Roles } from 'src/common/decorators/roles.decorator';

@ApiTags('诗歌')
@Controller('poems')
@Roles(['Admin'])
export class PoemsController {
  constructor(private readonly poemsService: PoemsService) {}

  @Get()
  @ApiOperation({ summary: '获取所有诗歌' })
  findAll() {
    return this.poemsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '获取单个诗歌' })
  findOne(@Param('id') id: string) {
    return this.poemsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: '创建诗歌' })
  @ApiBearerAuth()
  create(@Body() createPoemDto: CreatePoemDto) {
    return this.poemsService.create(createPoemDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新诗歌' })
  @ApiBearerAuth()
  update(@Param('id') id: string, @Body() updatePoemDto: UpdatePoemDto) {
    return this.poemsService.update(id, updatePoemDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除诗歌' })
  @ApiBearerAuth()
  remove(@Param('id') id: string) {
    return this.poemsService.remove(id);
  }
}
