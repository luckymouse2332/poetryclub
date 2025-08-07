import { OpenAPIRegistry, OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';
import { ZodType } from 'zod';

export class ZodOpenApiUtil {
  private static registry = new OpenAPIRegistry();
  private static schemas = new Map<string, ZodType>();

  /**
   * 注册zod schema到OpenAPI registry
   */
  static registerSchema(name: string, schema: ZodType, description?: string): void {
    this.schemas.set(name, schema);
    this.registry.register(name, schema.openapi(description || name));
  }

  /**
   * 注册路径到OpenAPI registry
   */
  static registerPath(config: any): void {
    this.registry.registerPath(config);
  }

  /**
   * 生成OpenAPI文档
   */
  static generateDocument(info: {
    title: string;
    version: string;
    description?: string;
  }): any {
    const generator = new OpenApiGeneratorV3(this.registry.definitions);
    
    return generator.generateDocument({
      openapi: '3.1.0',
      info,
      servers: [
        {
          url: process.env.API_BASE_URL || 'http://localhost:3000',
          description: 'Development server',
        },
      ],
    });
  }

  /**
   * 获取已注册的schema
   */
  static getSchema(name: string): ZodType | undefined {
    return this.schemas.get(name);
  }

  /**
   * 获取所有已注册的schema名称
   */
  static getSchemaNames(): string[] {
    return Array.from(this.schemas.keys());
  }

  /**
   * 清空registry（主要用于测试）
   */
  static clearRegistry(): void {
    this.registry = new OpenAPIRegistry();
    this.schemas.clear();
  }
}