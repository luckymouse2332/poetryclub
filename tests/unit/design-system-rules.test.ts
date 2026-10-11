import { Linter } from "eslint";
import stylelint from "stylelint";
import { describe, expect, it } from "vitest";

import { semanticStylesRule } from "../../scripts/eslint-design-system.mjs";
import stylelintConfig from "../../stylelint.config.mjs";

function check(source: string) {
  return new Linter().verify(source, [
    {
      languageOptions: {
        ecmaVersion: 2022,
        sourceType: "module",
        parserOptions: { ecmaFeatures: { jsx: true } },
      },
      plugins: { design: { rules: { tokens: semanticStylesRule } } },
      rules: { "design/tokens": "error" },
    },
  ]);
}

describe("semantic style rules", () => {
  it.each([
    'const x = <div className="bg-blue-500" />;',
    'const x = <div className={cn("dark:bg-paper")} />;',
    'const x = cva("text-body", { variants: { tone: { bad: "text-red-600" } } });',
    'const x = <div style={{ color: "#ffffff" }} />;',
    'const x = <div style={{ background: "rgba(255, 0, 0, .5)" }} />;',
    "const x = <div className={`bg-[var(--palette-paper)]`} />;",
    'const menuClassName = "hover:text-black";',
  ])("rejects literal colors and per-component themes: %s", (source) => {
    expect(check(source)).toHaveLength(1);
    expect(check(source)[0]!.ruleId).toBe("design/tokens");
  });

  it("allows semantic tokens, layout sizes, templates, and unrelated text", () => {
    expect(
      check(
        'const note = "dark:bg-blue-500"; const x = <div className={cn("bg-paper text-foreground sm:w-[30rem]", { "text-danger": true })} />;',
      ),
    ).toEqual([]);
    expect(
      check(
        'const x = cva("text-body", { variants: { tone: { good: "bg-danger-surface text-danger" } } });',
      ),
    ).toEqual([]);
  });

  it("allows Tailwind theme metadata, local selectors and reduced motion", async () => {
    const result = await stylelint.lint({
      code: "@theme inline { --text-body--line-height: var(--line-height-copy); } .heroTitle { color: var(--foreground); } @media (prefers-reduced-motion: reduce) { .heroTitle { transition-duration: 0.01ms; } }",
      codeFilename: "src/test.module.css",
      config: stylelintConfig,
    });
    expect(result.errored).toBe(false);
  });

  it("rejects invalid properties and module palette access", async () => {
    const result = await stylelint.lint({
      code: ".example { colr: red; color: var(--palette-ink); background: #fff; border-color: hsla(0, 100%, 50%, .5); }",
      codeFilename: "src/test.module.css",
      config: stylelintConfig,
    });
    expect(result.errored).toBe(true);
    expect(
      result.results[0]!.warnings.map((warning) => warning.rule),
    ).toContain("property-no-unknown");
    expect(
      result.results[0]!.warnings.map((warning) => warning.rule),
    ).toContain("declaration-property-value-disallowed-list");
  });
});
