import { Reflector } from '@nestjs/core';

/**
 * 定义能访问接口的用户
 */
export const Roles = Reflector.createDecorator<string[]>();
