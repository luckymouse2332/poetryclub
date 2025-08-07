import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import compression from 'compression';
import { ZodOpenApiUtil } from './common/utils/zod-openapi.util';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());
  app.use(compression());

  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  });

  // 生成基于zod的OpenAPI文档
  const zodDocument = ZodOpenApiUtil.generateDocument({
    title: 'Poetry Club API',
    version: '1.0.0',
    description: 'Poetry Club 后端API文档 - 基于Zod Schema自动生成',
  });

  // 传统的NestJS Swagger配置（作为备用）
  const config = new DocumentBuilder()
    .setTitle('Poetry Club API')
    .setDescription('Poetry Club 后端API文档')
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'JWT',
      description: 'Enter JWT token',
      in: 'header',
    })
    .build();

  const nestDocument = SwaggerModule.createDocument(app, config);

  // 合并zod生成的文档和NestJS文档
  const mergedDocument = {
    ...nestDocument,
    components: {
      ...nestDocument.components,
      schemas: {
        ...nestDocument.components?.schemas,
        ...zodDocument.components?.schemas,
      },
    },
  };

  // 设置API文档
  SwaggerModule.setup('api/docs', app, mergedDocument as any, {
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      docExpansion: 'none',
      filter: true,
      showRequestHeaders: true,
      tryItOutEnabled: true,
    },
    customSiteTitle: 'Poetry Club API Documentation',
    customfavIcon: '/favicon.ico',
    customJs: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.min.js',
    ],
    customCssUrl: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
    ],
  });

  // 提供原始的zod生成的OpenAPI JSON
  SwaggerModule.setup('api/docs/zod', app, zodDocument as any, {
    swaggerOptions: {
      displayRequestDuration: true,
      docExpansion: 'none',
    },
    customSiteTitle: 'Poetry Club API - Zod Generated',
  });

  const port = +process.env.PORT || 3000;
  await app.listen(port);

  Logger.log(`🚀 API服务运行在: http://localhost:${port}`);
  Logger.log(`📚 API文档地址: http://localhost:${port}/api/docs`);
  Logger.log(`🔧 Zod生成的API文档: http://localhost:${port}/api/docs/zod`);
  Logger.log(`📊 已注册的Zod Schema: ${ZodOpenApiUtil.getSchemaNames().join(', ')}`);
}

bootstrap();
