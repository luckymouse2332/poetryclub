import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsArray, IsOptional } from 'class-validator';

export class CreatePoemDto {
  @ApiProperty({ description: '诗歌标题' })
  @IsString()
  title: string;

  @ApiProperty({ description: '诗歌内容' })
  @IsString()
  content: string;

  @ApiProperty({ description: '作者' })
  @IsString()
  author: string;

  @ApiProperty({ description: '标签', type: [String], required: false })
  @IsOptional()
  @IsArray()
  tags?: string[];
}
