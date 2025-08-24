import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
} from '@nestjs/common';
import { ErrorResponse } from '@poetryclub/shared';
import { Request, Response } from 'express';

function makeErrorId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

@Catch()
export class ErrorHandlingFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    // 如果是HttpException，使用其状态码和消息
    // 如果不是，则视为其他的500服务器错误
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorName = InternalServerErrorException.name;
    let message: any = '服务器内部错误';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      errorName = exception.name;

      // 脱敏操作，避免泄露服务器内部错误信息
      const resp = exception.getResponse();
      message = typeof resp === 'string' ? resp : (resp as any).message || resp;
    }

    const errorId = makeErrorId();

    // 记录元信息，将日志工作交给中间件处理
    const includeStack =
      // 在生产环境下，如果设置了 LOG_STACK 环境变量为 true，则记录堆栈信息
      // 否则为了防止信息泄露，不记录堆栈
      // 在开发模式下总是记录堆栈，方便调试
      (process.env.NODE_ENV !== 'production' ||
        process.env.LOG_STACK === 'true') &&
      // 仅在服务器内部错误时记录堆栈，避免日志过于冗长
      status === HttpStatus.INTERNAL_SERVER_ERROR;

    res.locals = (res as any).locals || {};

    res.locals.errorMeta = {
      errorId,
      message: typeof message === 'string' ? message : JSON.stringify(message),
      // 如果需要由日志组件记录 stack，可在非生产环境或在此处选择性添加
      stack: includeStack ? (exception as any)?.stack : undefined,
    };

    // 返回给客户端的错误响应
    res.status(status).json({
      success: false,
      message,
      error: errorName,
      statusCode: status,
      timestamp: new Date(),
      path: req.url,
      errorId,
    } as ErrorResponse);
  }
}
