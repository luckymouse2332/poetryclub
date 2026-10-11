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

  it("allows page-specific spacing and width to override project layout tokens", () => {
    expect(cn("px-page py-section", "py-0")).toBe("px-page py-0");
    expect(cn("max-w-content", "max-w-reading")).toBe("max-w-reading");
    expect(cn("max-w-reading", "max-w-narrow")).toBe("max-w-narrow");
    expect(cn("h-control", "h-12")).toBe("h-12");
    expect(cn("py-section sm:py-section", "py-0 sm:py-8")).toBe("py-0 sm:py-8");
  });

  it("merges journal typography, elevation, and motion tokens without duplicate states", () => {
    expect(cn("text-body leading-copy", "leading-reading")).toBe("text-body leading-reading");
    expect(cn("shadow-floating", "shadow-none")).toBe("shadow-none");
    expect(cn("rounded-floating", "rounded-md")).toBe("rounded-md");
    expect(cn("duration-fast", "duration-normal")).toBe("duration-normal");
    expect(cn("z-floating", "z-sheet")).toBe("z-sheet");
  });
});
