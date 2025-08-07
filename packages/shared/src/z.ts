import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

// 扩展zod以支持OpenAPI
extendZodWithOpenApi(z);

export { z };
