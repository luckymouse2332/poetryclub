import { Controller, Delete, Get, Post, Req } from '@nestjs/common';
import { CommentService } from './comment.service';
import { Request } from 'express';
import {
  ZodBody,
  ZodParam,
  ZodQuery,
} from 'src/common/decorators/zod-body.decorator';
import {
  CommentQueryDto,
  CommentQueryDtoSchema,
  CreateCommentDto,
  CreateCommentDtoSchema,
  IdParamDtoSchema,
} from '@poetryclub/shared';
import { ApiRoute } from 'src/common/decorators/api-route.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('评论')
@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @ApiRoute({
    summary: '创建评论',
    description: '创建一条新的评论',
    requestBody: {
      schema: CreateCommentDtoSchema,
      schemaName: 'CreateCommentDto',
      description: '评论内容和诗作ID',
    },
    responses: {
      201: { description: '评论创建成功' },
      404: { description: '诗歌或用户不存在' },
      400: { description: '请求参数错误' },
      401: { description: '未完成认证' },
    },
  })
  @Post()
  @ApiBearerAuth()
  @Roles([UserRole.User, UserRole.Admin])
  create(
    @Req() req: Request,
    @ZodBody(CreateCommentDtoSchema) body: CreateCommentDto
  ) {
    return this.commentService.create(req.user['id'], body);
  }

  @ApiRoute({
    summary: '获取评论列表',
    description: '获取指定用户ID的所有评论，支持分页和排序',
    queryParams: {
      schema: CommentQueryDtoSchema,
      schemaName: 'CommentQueryDto',
      description: '分页和过滤参数',
    },
    responses: {
      200: { description: '评论列表获取成功' },
      400: { description: '请求参数错误' },
      404: { description: '用户不存在' },
    },
  })
  @Get()
  findAll(@ZodQuery(CommentQueryDtoSchema) query: CommentQueryDto) {
    return this.commentService.findAll(query); // 使用 param 中提供的 userId
  }

  @ApiRoute({
    summary: '删除评论',
    description: '根据评论ID删除指定的评论',
    pathParams: {
      schema: IdParamDtoSchema,
      schemaName: 'IdParamDto',
      description: '评论ID',
    },
    responses: {
      200: { description: '评论删除成功' },
      404: { description: '评论不存在' },
      400: { description: '请求参数错误' },
      401: { description: '未完成认证' },
      403: { description: '没有权限删除该评论' },
    },
  })
  @Roles([UserRole.User, UserRole.Admin])
  @ApiBearerAuth()
  @Delete(':commentId')
  delete(
    @Req() req: Request,
    @ZodParam(IdParamDtoSchema, 'commentId') commentId: string
  ) {
    return this.commentService.delete(req.user.id, commentId);
  }
}
