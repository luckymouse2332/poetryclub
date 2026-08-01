import "server-only";

import { parseServerEnv, type ServerEnv } from "@/server/validation/env";

let cachedEnv: ServerEnv | undefined;

export function getServerEnv(): ServerEnv {
  cachedEnv ??= parseServerEnv(process.env);
  return cachedEnv;
}
