import { z } from '../z';

export const PasswordsDtoSchema = z.object({
  oldPassword: z.string().min(6),
  newPassword: z.string().min(6),
});

export type PasswordsDto = z.infer<typeof PasswordsDtoSchema>;
