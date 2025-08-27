import { z } from '../z';

export const LikeResponseSchema = z.object({
  id: z.string(),
  poemId: z.string(),
  userId: z.string(),
  createdAt: z.date(),
});

export type LikeResponse = z.infer<typeof LikeResponseSchema>;
