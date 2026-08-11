import { readFileSync } from "node:fs";

import { expect, test } from "vitest";

const floatingUnfoldCss = readFileSync(
  new URL("../../src/components/ui/floating-unfold.module.css", import.meta.url),
  "utf8",
);

test("浮层展开动画的裁剪区域始终为阴影预留空间", () => {
  expect(floatingUnfoldCss.match(/animation: dropdown-unfold-.* both;/g)).toHaveLength(
    2,
  );
  expect(floatingUnfoldCss.match(/clip-path: inset\(-4rem\);/g)).toHaveLength(2);
  expect(
    floatingUnfoldCss.match(/clip-path: inset\(0 -4rem 100%\);/g),
  ).toHaveLength(2);
  expect(floatingUnfoldCss).not.toContain("clip-path: inset(0 0 0 0)");
});
