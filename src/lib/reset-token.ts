import { z } from "zod";

export const resetPasswordTokenSchema = z
  .string()
  .min(20)
  .max(256)
  .regex(/^[A-Za-z0-9_-]+$/);
