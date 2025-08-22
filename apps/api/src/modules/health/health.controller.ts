import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { HealthCheckResponseSchema } from '@poetryclub/shared';
import { ApiRoute } from 'src/common/decorators/api-route.decorator';

@ApiTags('健康检查')
@Controller('health')
export class HealthController {
  @ApiRoute({
    summary: '健康检查',
    description: '检查API服务的运行状态',
    responses: {
      200: {
        description: '服务正常运行',
        schema: HealthCheckResponseSchema,
        schemaName: 'HealthCheckResponse',
      },
    },
  })
  @Get()
  check() {
    return {
      status: 'ok' as const,
      timestamp: new Date().toISOString(),
      service: 'poetry-club-api',
      version: '1.0.0',
      uptime: process.uptime(),
    };
  }
}
