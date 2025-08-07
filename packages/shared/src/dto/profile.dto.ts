import { z } from '../z';
import { UserRoleSchema } from './user.dto';

export const ProfileDtoSchema = z.object({
  username: z.string().optional(),
  email: z.email().optional(),
  avatar: z.url().optional(),
  bio: z.string().optional(),
  role: UserRoleSchema.optional(),
});

export type ProfileDto = z.infer<typeof ProfileDtoSchema>;
