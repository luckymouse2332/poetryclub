import type { Page } from "@playwright/test";

/** Save a genuine UI action for replay after authority or content changes. */
export async function captureServerAction(page: Page, pattern: string, submit: () => Promise<void>) {
  type CapturedRequest = { url: string; headers: Record<string, string>; data: Buffer };
  let resolve!: (request: CapturedRequest) => void;
  const captured = new Promise<CapturedRequest>((done) => { resolve = done; });
  await page.route(pattern, async (route) => {
    const request = route.request();
    if (request.method() !== "POST" || !request.headers()["next-action"]) {
      await route.continue();
      return;
    }
    const headers = await request.allHeaders();
    delete headers.cookie;
    delete headers["content-length"];
    const data = request.postDataBuffer();
    if (!data) throw new Error("Expected captured Server Action body");
    resolve({ url: request.url(), headers, data });
    await route.abort();
  });
  try {
    await submit();
    return await captured;
  } finally { await page.unroute(pattern); }
}
