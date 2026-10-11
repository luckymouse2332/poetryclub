import { join } from "node:path";

/** Keep task verification screenshots separate from existing local artifacts. */
export function artifactPath(relativePath: string): string {
  return join(process.env.PLAYWRIGHT_ARTIFACT_ROOT ?? "output/playwright", relativePath);
}
