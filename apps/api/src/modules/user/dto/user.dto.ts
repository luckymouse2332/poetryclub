import { User } from '@prisma/client';

/**
 * Some fields that should be excluded
 */
export const SENSITIVE_USER_FIELDS = [
  'passwordHash',
  'createdAt',
  'updatedAt',
] as const;

/**
 * User's data for demonstration
 */
export type UserDto = Omit<User, (typeof SENSITIVE_USER_FIELDS)[number]>;
