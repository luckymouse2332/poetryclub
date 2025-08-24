import { Test, TestingModule } from '@nestjs/testing';
import { CommentService } from './comment.service';
import { PrismaModule } from 'src/common/prisma/prisma.module';

describe('CommentService', () => {
  let service: CommentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule],
      providers: [CommentService],
    }).compile();

    service = module.get<CommentService>(CommentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  /// 测试 create 方法

  // 当用户不存在时抛出异常
  it('create method should throw NotFoundException if poem does not exist', async () => {
    const userId = 'non-existent-user-id';
    const createCommentDto = {
      content: 'Great poem!',
      poemId: 'non-existent-poem-id',
    };

    await expect(service.create(userId, createCommentDto)).rejects.toThrow(
      '诗歌不存在'
    );
  });

  // 当诗歌不存在时抛出异常
  it('create method should throw NotFoundException if user does not exist', async () => {
    const authorId = 'non-existent-user-id';
    const createCommentDto = {
      content: 'Great poem!',
      poemId: 'existent-poem-id',
    };

    // Mock the prisma service to simulate poem exists but user does not
    jest.spyOn(service['prisma'].poem, 'count').mockResolvedValue(1);
    jest.spyOn(service['prisma'].user, 'count').mockResolvedValue(0);

    await expect(service.create(authorId, createCommentDto)).rejects.toThrow(
      '用户不存在'
    );
  });

  // 当父评论不存在时抛出异常
  it('create method should throw NotFoundException if parent comment does not exist', async () => {
    const authorId = 'existent-user-id';
    const createCommentDto = {
      content: 'Great poem!',
      poemId: 'existent-poem-id',
      parentId: 'non-existent-parent-comment-id',
    };
    // Mock the prisma service to simulate poem and user exist but parent comment does not
    jest.spyOn(service['prisma'].poem, 'count').mockResolvedValue(1);
    jest.spyOn(service['prisma'].user, 'count').mockResolvedValue(1);
    jest.spyOn(service['prisma'].comment, 'count').mockResolvedValue(0);
    await expect(service.create(authorId, createCommentDto)).rejects.toThrow(
      '父评论不存在'
    );
  });

  // 成功创建评论
  it('create method should create comment successfully', async () => {
    const authorId = 'existent-user-id';
    const createCommentDto = {
      content: 'Great poem!',
      poemId: 'existent-poem-id',
    };
    // Mock the prisma service to simulate poem and user exist
    jest.spyOn(service['prisma'].poem, 'count').mockResolvedValue(1);
    jest.spyOn(service['prisma'].user, 'count').mockResolvedValue(1);
    jest.spyOn(service['prisma'].comment, 'count').mockResolvedValue(1);
    jest.spyOn(service['prisma'].comment, 'create').mockResolvedValue({
      id: 'new-comment-id',
      content: createCommentDto.content,
      poemId: createCommentDto.poemId,
      userId: authorId,
      user: {
        id: authorId,
        username: 'testuser',
        avatarUrl: null,
      },
    } as any);

    const result = await service.create(authorId, createCommentDto);

    expect(result).toEqual({
      id: 'new-comment-id',
      content: createCommentDto.content,
      poemId: createCommentDto.poemId,
      userId: authorId,
      user: {
        id: authorId,
        username: 'testuser',
        avatarUrl: null,
      },
    } as any);

    expect(service['prisma'].comment.create).toHaveBeenCalledWith({
      data: {
        content: createCommentDto.content,
        poem: { connect: { id: createCommentDto.poemId } },
        user: { connect: { id: authorId } },
        parent: {
          connect: undefined,
        },
      },
      include: { user: true },
    });
  });

  /// 测试 delete 方法

  // 当用户不存在时抛出异常
  it('delete method should throw NotFoundException if user does not exist', async () => {
    const userId = 'non-existent-user-id';
    const commentId = 'some-comment-id';

    jest.spyOn(service['prisma'].user, 'findUnique').mockResolvedValue(null);

    await expect(service.delete(userId, commentId)).rejects.toThrow(
      '用户不存在'
    );
  });

  // 当评论不存在时抛出异常
  it('delete method should throw NotFoundException if comment does not exist', async () => {
    const userId = 'existent-user-id';
    const commentId = 'non-existent-comment-id';

    jest.spyOn(service['prisma'].user, 'findUnique').mockResolvedValue({
      id: userId,
      role: 'User',
    } as any);
    jest.spyOn(service['prisma'].comment, 'findUnique').mockResolvedValue(null);

    await expect(service.delete(userId, commentId)).rejects.toThrow(
      '评论不存在'
    );
  });

  // 当用户既不是管理员也不是评论所有者时抛出异常
  it('delete method should throw ForbiddenException if user is not admin or comment owner', async () => {
    const userId = 'existent-user-id';
    const commentId = 'existent-comment-id';

    jest.spyOn(service['prisma'].user, 'findUnique').mockResolvedValue({
      id: userId,
      role: 'User',
    } as any);
    jest.spyOn(service['prisma'].comment, 'findUnique').mockResolvedValue({
      id: commentId,
      userId: 'another-user-id',
    } as any);

    await expect(service.delete(userId, commentId)).rejects.toThrow(
      '权限不足，只有管理员或评论作者可以删除评论'
    );
  });
});
