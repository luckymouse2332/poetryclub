import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  UseGuards,
  ForbiddenException,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { PoemsService } from './poems.service';
import {
  CreatePoemDtoSchema,
  UpdatePoemDtoSchema,
  PoemQueryDtoSchema,
  PoemResponseSchema,
  PoemListResponseSchema,
  IdParamDtoSchema,
  ErrorResponseSchema,
  ReviewPoemDtoSchema,
  IdParamDto,
  PoemQueryDto,
  UpdatePoemDto,
  ReviewPoemDto,
  CreatePoemDto,
} from '@poetryclub/shared';
import { ApiRoute } from 'src/common/decorators/api-route.decorator';
import {
  ZodBody,
  ZodQuery,
  ZodParam,
} from 'src/common/decorators/zod-body.decorator';
import { Request } from 'express';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('诗作')
@Controller('poems')
export class PoemsController {
  constructor(private readonly poemsService: PoemsService) {}

  @ApiRoute({
    summary: '获取诗歌列表',
    description: '分页获取诗歌列表，支持筛选和排序',
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
  findAll(
    @ZodQuery(PoemQueryDtoSchema, { schemaName: 'PoemQueryDto' })
    query: PoemQueryDto
  ) {
    return this.poemsService.findAll(query);
  }

  @ApiRoute({
    summary: '获取诗歌详情',
    description: '根据ID获取单个诗歌的详细信息',
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
  findOne(@ZodParam(IdParamDtoSchema, 'id') id: IdParamDto) {
    return this.poemsService.findOne(id);
  }

  @ApiRoute({
    summary: '创建诗歌',
    description: '创建新的诗歌作品',
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
  @Roles([UserRole.User, UserRole.Admin])
  @ApiBearerAuth()
  create(
    @Req() req: Request,
    @ZodBody(CreatePoemDtoSchema, { schemaName: 'CreatePoemDto' })
    createPoemDto: CreatePoemDto
  ) {
    const userId = req.user.id;
    return this.poemsService.create(createPoemDto, userId);
  }

  @ApiRoute({
    summary: '更新诗歌',
    description: '更新现有诗歌作品',
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
  @Roles([UserRole.User, UserRole.Admin])
  @ApiBearerAuth()
  update(
    @Req() req: Request,
    @ZodParam(IdParamDtoSchema, 'id', { schemaName: 'IdParamDto' }) id: string,
    @ZodBody(UpdatePoemDtoSchema, { schemaName: 'UpdatePoemDto' })
    updatePoemDto: UpdatePoemDto
  ) {
    const userId = req.user.id;
    return this.poemsService.update(id, updatePoemDto, userId);
  }

  @ApiRoute({
    summary: '删除诗歌',
    description: '删除指定的诗歌作品',
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
  @Roles([UserRole.User, UserRole.Admin])
  @ApiBearerAuth()
  remove(
    @Req() req: Request,
    @ZodParam(IdParamDtoSchema, 'id', { schemaName: 'IdParamDto' }) id: string
  ) {
    const userId = req.user.id;
    return this.poemsService.remove(id, userId);
  }

  @ApiRoute({
    summary: '审核诗歌',
    description: '管理员审核诗歌，批准或拒绝发布',
    pathParams: {
      schema: IdParamDtoSchema,
      schemaName: 'IdParamDto',
      description: '诗歌ID',
    },
    requestBody: {
      schema: ReviewPoemDtoSchema,
      schemaName: 'ReviewPoemDto',
      description: '审核数据',
    },
    responses: {
      200: {
        description: '审核成功',
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
        description: '权限不足',
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
  @Post(':id/review')
  @ApiBearerAuth()
  @Roles([UserRole.Admin])
  review(
    @ZodParam(IdParamDtoSchema, 'id', { schemaName: 'IdParamDto' }) id: string,
    @ZodBody(ReviewPoemDtoSchema, { schemaName: 'ReviewPoemDto' })
    reviewDto: ReviewPoemDto
  ) {
    return this.poemsService.review(id, reviewDto);
  }

  @ApiRoute({
    summary: '获取用户诗作',
    description: '获取指定用户的所有诗作（包括草稿和各种状态）',
    pathParams: {
      schema: IdParamDtoSchema,
      schemaName: 'IdParamDto',
      description: '用户ID',
    },
    responses: {
      200: {
        description: '获取成功',
        schema: PoemListResponseSchema,
        schemaName: 'PoemListResponse',
      },
      401: {
        description: '未授权访问',
        schema: ErrorResponseSchema,
        schemaName: 'ErrorResponse',
      },
    },
  })
  @Get('user/:userId')
  @Roles([UserRole.User, UserRole.Admin])
  @ApiBearerAuth()
  findUserPoems(
    @Req() req: Request,
    @ZodParam(IdParamDtoSchema, 'userId', { schemaName: 'IdParamDto' })
    userId: string,
    @ZodQuery(PoemQueryDtoSchema, { schemaName: 'PoemQueryDto' }) query: any
  ) {
    // 只有用户本人或管理员可以查看用户的所有诗作
    if (req.user.id !== userId && req.user.role !== 'Admin') {
      throw new ForbiddenException('权限不足，只能查看自己的诗作');
    }
    return this.poemsService.findUserPoems(userId, query);
  }
}
