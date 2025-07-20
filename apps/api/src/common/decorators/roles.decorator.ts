import { Reflector } from '@nestjs/core';

/**
 * Defines roles required by API endpoint
 */
export const Roles = Reflector.createDecorator<string[]>();
