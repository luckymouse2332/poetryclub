import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { ApiResponse } from '@poetryclub/shared';
import { Observable, throwError, map, catchError } from 'rxjs';
import { isPlainObject } from '@poetryclub/shared';

function isApiResponse(val: any): val is ApiResponse<any> {
  return (
    isPlainObject(val) && 'success' in val && typeof val.success === 'boolean'
  );
}

function normalizeResponse(data: any): ApiResponse<any> {
  const timestamp = new Date().toISOString();

  if (isApiResponse(data)) {
    return {
      ...data,
      timestamp: (data as any).timestamp ?? timestamp,
    };
  }

  if (isPlainObject(data)) {
    return {
      ...data,
      success: data.success ?? true,
      message: data.message ?? '请求成功',
      timestamp: data.timestamp ?? timestamp,
    };
  }

  // 数组/原始值/null/undefined类型
  return {
    data,
    success: true,
    message: '请求成功',
    timestamp,
  };
}

@Injectable()
export class GlobalResponseFormatter implements NestInterceptor {
  intercept(
    _context: ExecutionContext,
    next: CallHandler
  ): Observable<ApiResponse<any>> {
    return next.handle().pipe(
      map((data) => normalizeResponse(data)),
      catchError((err) => {
        // 捕获到异常，重新抛出以便后续的异常过滤器处理
        return throwError(() => err);
      })
    );
  }
}
