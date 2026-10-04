import { runInNewContext } from "node:vm";
import { expect, test } from "vitest";
import { parseTheme, resolveTheme, THEME_INITIALIZATION_SCRIPT, THEME_STORAGE_KEY } from "@/lib/theme";

test("only recognized preferences override the system theme", () => {
  for (const value of [null, undefined, "system", "invalid", {}, 0]) {
    expect(parseTheme(value)).toBeNull();
    expect(resolveTheme(value, true)).toBe("dark");
    expect(resolveTheme(value, false)).toBe("light");
  }
  expect(resolveTheme("light", true)).toBe("light");
  expect(resolveTheme("dark", false)).toBe("dark");
});

test("head initialization applies preference before hydration and tolerates blocked storage", () => {
  for (const [stored, systemDark, blocked, expected] of [
    ["dark", false, false, "dark"],
    ["light", true, false, "light"],
    [null, true, false, "dark"],
    ["invalid", false, false, "light"],
    [null, true, true, "dark"],
  ] as const) {
    const root = { dataset: {} as { theme?: string } };
    runInNewContext(THEME_INITIALIZATION_SCRIPT, {
      document: { documentElement: root },
      window: { matchMedia: () => ({ matches: systemDark }) },
      localStorage: { getItem: (key: string) => {
        expect(key).toBe(THEME_STORAGE_KEY);
        if (blocked) throw new Error("Storage denied");
        return stored;
      } },
    });
    expect(root.dataset.theme).toBe(expected);
  }
});
