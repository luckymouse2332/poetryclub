import { readFileSync } from "node:fs";
import { expect, it } from "vitest";

import { EMAIL_COLORS } from "@/server/email/styles";
import { renderTransactionalEmail } from "@/server/email/template";

it("keeps the email palette aligned with the website light palette", () => {
  const css = readFileSync(
    new URL("../../src/app/globals.css", import.meta.url),
    "utf8",
  ).split(':root[data-theme="dark"]')[0];
  const palette = {
    background: "page",
    paper: "paper",
    foreground: "ink",
    subtle: "ink-secondary",
    border: "border",
    primary: "action-600",
    primaryForeground: "ink-inverse",
  } as const;
  for (const [key, token] of Object.entries(palette)) {
    expect(css).toMatch(
      new RegExp(
        `--palette-${token}:\\s*${EMAIL_COLORS[key as keyof typeof EMAIL_COLORS]};`,
        "i",
      ),
    );
  }
});

it("escapes every content slot and includes an action only when provided", () => {
  const common = {
    title: "<标题>",
    intro: "<简介>",
    expiry: "<有效期>",
    note: "<提示>",
  };
  const html = renderTransactionalEmail({
    ...common,
    code: '"<123>&',
    action: { href: 'https://example.test/?a=1&b="2"', label: "<重置>" },
  });
  for (const text of ["标题", "简介", "有效期", "提示", "重置"])
    expect(html).toContain(`&lt;${text}&gt;`);
  expect(html).toContain("&quot;&lt;123&gt;&amp;");
  expect(html).toContain(
    'href="https://example.test/?a=1&amp;b=&quot;2&quot;"',
  );
  expect(renderTransactionalEmail(common)).not.toContain("<a ");
  expect(html).not.toContain("var(--");
});
