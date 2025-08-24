import { Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * 请求日志记录中间件
 * @param req 请求对象
 * @param res 响应对象
 * @param next 继续
 */
export function loggingMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;

    if (res.locals?.errorMeta) { // TODO：上传到日志系统
      // 详细记录错误信息
      const { errorId, message, stack } = res.locals.errorMeta;
      Logger.error(
        `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms - ErrorID: ${errorId} - Message: ${message}`,
        stack
      );
      return;
    }

    // 记录基本的请求信息
    Logger.log(
      `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`
    );
  });
  next();
}
