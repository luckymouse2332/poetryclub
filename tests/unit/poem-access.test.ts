import { describe, expect, it } from "vitest";

import { canReadMembersOnlyPoems } from "@/lib/poem-access";

describe("canReadMembersOnlyPoems", () => {
  it("allows only the active-member scope", () => {
    expect(canReadMembersOnlyPoems("active_member")).toBe(true);
    expect(canReadMembersOnlyPoems("anonymous")).toBe(false);
    expect(canReadMembersOnlyPoems("suspended")).toBe(false);
  });
});
