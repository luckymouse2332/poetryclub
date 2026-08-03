import { describe, expect, it } from "vitest";

import { cn } from "../../src/lib/utils";

describe("cn", () => {
  it("combines truthy class names", () => {
    expect(cn("a", "b", "c")).toBe("a b c");
  });

  it("ignores falsy values", () => {
    expect(cn("a", null, undefined, false, 0, "b")).toBe("a b");
  });

  it("merges conflicting tailwind classes in favor of the last one", () => {
    expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
  });

  it("keeps project font-size and text-color classes together", () => {
    expect(cn("text-label", "text-primary-foreground")).toBe(
      "text-label text-primary-foreground",
    );
    expect(cn("text-primary-foreground", "text-label")).toBe(
      "text-primary-foreground text-label",
    );
    expect(cn("text-label", "text-caption")).toBe("text-caption");
  });

  it("accepts clsx object syntax", () => {
    expect(cn({ "font-bold": true, "text-sm": false }, "block")).toBe(
      "font-bold block",
    );
  });
});
