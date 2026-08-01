import "server-only";

import { auth } from "@/server/auth";
import { sanitizeAuthResponse } from "@/server/auth/sanitize-response";

export async function handleAuthRequest(request: Request) {
  const response = await auth.handler(request);
  return sanitizeAuthResponse(response);
}
