import "server-only";

import { resetPasswordTokenSchema } from "@/lib/reset-token";
import { auth } from "@/server/auth";
import { getServerEnv } from "@/server/env";

export async function isPasswordResetTokenValid(
  token: string,
  forwardedFor: string | null,
): Promise<boolean> {
  if (!resetPasswordTokenSchema.safeParse(token).success) return false;

  const env = getServerEnv();
  const origin = new URL(env.BETTER_AUTH_URL).origin;
  const callbackUrl = new URL("/reset-password", origin);
  const verificationUrl = new URL(
    `/api/auth/reset-password/${encodeURIComponent(token)}`,
    origin,
  );
  verificationUrl.searchParams.set("callbackURL", callbackUrl.toString());

  const requestHeaders = new Headers({ origin });
  if (forwardedFor) requestHeaders.set("x-forwarded-for", forwardedFor);

  const response = await auth.handler(
    new Request(verificationUrl, {
      method: "GET",
      headers: requestHeaders,
      redirect: "manual",
    }),
  );
  const location = response.headers.get("location");
  if (!location) return false;

  const redirectUrl = new URL(location, origin);
  return (
    redirectUrl.origin === origin &&
    redirectUrl.pathname === "/reset-password" &&
    redirectUrl.searchParams.get("error") === null &&
    redirectUrl.searchParams.get("token") === token
  );
}
