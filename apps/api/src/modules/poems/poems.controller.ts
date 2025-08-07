import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { PoemsService } from './poems.service';
import {
  CreatePoemDtoSchema,
  UpdatePoemDtoSchema,
  PoemQueryDtoSchema,
  ReviewPoemDtoSchema,
  PoemResponseSchema,
  PoemListResponseSchema,
  IdParamDtoSchema,
  ErrorResponseSchema,
} from '@poetryclub/shared';
import { ApiRoute } from 'src/common/decorators/api-route.decorator';
import { ZodBody, ZodQuery, ZodParam } from 'src/common/decorators/zod-body.decorator';

@ApiTags('poems')
@Controller('poems')
export class PoemsController {
  constructor(private readonly poemsService: PoemsService) {}

  @ApiRoute({
    summary: '获取诗歌列表',
    description: '分页获取诗歌列表，支持筛选和排序',
    tags: ['poems'],
    responses: {
      200: {
        description: '成功获取诗歌列表',
        schema: PoemListResponseSchema,
        schemaName: 'PoemListResponse',
      },
      400: {
        description: '请求参数错误',
        schema: ErrorResponseSchema,
        schemaName: 'ErrorResponse',
      },
    },
  })
  @Get()
  findAll(@ZodQuery(PoemQueryDtoSchema, { schemaName: 'PoemQueryDto' }) query: any) {
    // TODO: 实现分页和筛选逻辑
    return this.poemsService.findAll();
  }

  @ApiRoute({
    summary: '获取诗歌详情',
    description: '根据ID获取单个诗歌的详细信息',
    tags: ['poems'],
    pathParams: {
      schema: IdParamDtoSchema,
      schemaName: 'IdParamDto',
      description: '诗歌ID',
    },
    responses: {
      200: {
        description: '获取成功',
        schema: PoemResponseSchema,
        schemaName: 'PoemResponse',
      },
      404: {
        description: '诗歌不存在',
      },
    },
  })
  @Get(':id')
  findOne(@ZodParam(IdParamDtoSchema, 'id', { schemaName: 'IdParamDto' }) id: string) {
    return this.poemsService.findOne(id);
  }

  @ApiRoute({
    summary: '创建诗歌',
    description: '创建新的诗歌作品',
    tags: ['poems'],
    requestBody: {
      schema: CreatePoemDtoSchema,
      schemaName: 'CreatePoemDto',
      description: '诗歌创建数据',
    },
    responses: {
      201: {
        description: '创建成功',
        schema: PoemResponseSchema,
        schemaName: 'PoemResponse',
      },
      400: {
        description: '请求参数错误',
        schema: ErrorResponseSchema,
        schemaName: 'ErrorResponse',
      },
      401: {
        description: '未授权',
        schema: ErrorResponseSchema,
        schemaName: 'ErrorResponse',
      },
    },
  })
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  create(
    @Request() req: any,
    @ZodBody(CreatePoemDtoSchema, { schemaName: 'CreatePoemDto' }) createPoemDto: any,
  ) {
    // TODO: 将用户ID添加到创建数据中
    return this.poemsService.create({ ...createPoemDto, authorId: req.user.id });
  }

  @ApiRoute({
    summary: '更新诗歌',
    description: '更新现有诗歌作品',
    tags: ['poems'],
    pathParams: {
      schema: IdParamDtoSchema,
      schemaName: 'IdParamDto',
      description: '诗歌ID',
    },
    requestBody: {
      schema: UpdatePoemDtoSchema,
      schemaName: 'UpdatePoemDto',
      description: '诗歌更新数据',
    },
    responses: {
      200: {
        description: '更新成功',
        schema: PoemResponseSchema,
        schemaName: 'PoemResponse',
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
        description: '无权限修改此诗歌',
        schema: ErrorResponseSchema,
        schemaName: 'ErrorResponse',
      },
      404: {
        description: '诗歌不存在',
        schema: ErrorResponseSchema,
        schemaName: 'ErrorResponse',
      },
    },
  })
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  update(
    @Request() req: any,
    @ZodParam(IdParamDtoSchema, 'id', { schemaName: 'IdParamDto' }) id: string,
    @ZodBody(UpdatePoemDtoSchema, { schemaName: 'UpdatePoemDto' }) updatePoemDto: any
  ) {
    // TODO: 添加权限检查，确保只有作者可以更新
    return this.poemsService.update(id, updatePoemDto);
  }

  @ApiRoute({
    summary: '删除诗歌',
    description: '删除指定的诗歌作品',
    tags: ['poems'],
    pathParams: {
      schema: IdParamDtoSchema,
      schemaName: 'IdParamDto',
      description: '诗歌ID',
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
        description: '无权限删除此诗歌',
        schema: ErrorResponseSchema,
        schemaName: 'ErrorResponse',
      },
      404: {
        description: '诗歌不存在',
        schema: ErrorResponseSchema,
        schemaName: 'ErrorResponse',
      },
    },
  })
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  remove(
    @Request() req: any,
    @ZodParam(IdParamDtoSchema, 'id', { schemaName: 'IdParamDto' }) id: string
  ) {
    // TODO: 添加权限检查，确保只有作者可以删除
    return this.poemsService.remove(id);
  }

  // TODO: 实现审核功能
  // @ApiRoute({
  //   summary: '审核诗歌',
  //   description: '管理员审核诗歌，批准或拒绝发布',
  //   tags: ['poems'],
  //   responses: {
  //     200: {
  //       description: '审核成功',
  //       schema: PoemResponseSchema,
  //       schemaName: 'PoemResponse',
  //     },
  //   },
  // })
  // @Post(':id/review')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(['admin'])
  // @ApiBearerAuth()
  // review(
  //   @ZodParam(IdParamDtoSchema, 'IdParamDto') id: string,
  //   @ZodBody(ReviewPoemDtoSchema, 'ReviewPoemDto') reviewDto: any,
  // ) {
  //   return this.poemsService.review(id, reviewDto);
  // }
}
