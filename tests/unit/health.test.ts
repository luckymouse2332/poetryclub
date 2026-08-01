import { describe, expect, it } from "vitest";

import { getHealthStatus } from "@/server/services/health";

describe("getHealthStatus", () => {
  it("returns a minimal non-sensitive liveness response", () => {
    expect(getHealthStatus()).toEqual({ status: "ok" });
  });
});
