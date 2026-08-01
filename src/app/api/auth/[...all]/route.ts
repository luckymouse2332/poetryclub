export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function routeAuthRequest(request: Request) {
  // Keep runtime secrets out of the image build while preserving Better Auth's
  // standard Web Request handler at request time.
  const authHandler = await import("@/server/auth/handler");
  return authHandler.handleAuthRequest(request);
}

export const GET = routeAuthRequest;
export const POST = routeAuthRequest;
