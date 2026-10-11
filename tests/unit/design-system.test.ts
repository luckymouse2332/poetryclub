import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { CatalogRow } from "@/components/catalog-row";
import { EditorLayout } from "@/components/layout/editor-layout";
import { ManagementRow } from "@/components/layout/management-row";
import { PaperList } from "@/components/paper-list";
import { PoemReading, ReadingContext } from "@/components/poem-reading";
import { RadioOption } from "@/components/radio-option";
import { Card, CardFooter, CardHeader } from "@/components/ui/card";
import { Empty } from "@/components/ui/empty";
import { RadioGroup } from "@/components/ui/radio-group";

describe("design system compositions", () => {
  it("keeps standalone Card defaults and caller overrides", () => {
    const html = renderToStaticMarkup(
      h(Card, { className: "gap-8 py-0" }, h(CardHeader, null, "标题")),
    );
    expect(html).toContain('data-variant="default"');
    expect(html).toContain("bg-card");
    expect(html).toContain("border-y");
    expect(html).toContain("gap-8");
    expect(html).not.toMatch(/class="[^"]*\bgap-4\b/);
    expect(html).not.toMatch(/class="[^"]*\bpy-5\b/);
  });

  it("expresses list sections through the Card group without per-caller overrides", () => {
    const html = renderToStaticMarkup(
      h(
        Card,
        { variant: "list" },
        h(CardHeader, null, "标题"),
        h(CardFooter, null, "操作"),
      ),
    );
    expect(html).toContain('data-variant="list"');
    expect(html).toContain("bg-transparent");
    expect(html).toContain("group-data-[variant=list]/card:border-b-0");
    expect(html).toContain("group-data-[variant=list]/card:pt-0");
    expect(html).not.toContain("bg-card");
  });

  it("renders one common divider container or the provided empty state", () => {
    const full = renderToStaticMarkup(
      h(PaperList, { inset: false }, [
        h(Card, { key: "1", variant: "list" }),
        h(Card, { key: "2", variant: "list" }),
      ]),
    );
    expect(full.match(/divide-y/g)).toHaveLength(1);
    expect(full).toContain('data-slot="directory-surface"');
    expect(full).not.toContain('data-slot="paper-list-empty"');
    const empty = renderToStaticMarkup(
      h(PaperList, { children: [], empty: h(Empty, null, "暂无内容") }),
    );
    expect(empty).toContain("暂无内容");
    expect(empty).toContain('data-slot="paper-list-empty"');
    expect(empty).not.toContain("divide-y");
  });

  it("links radio labels to native controls and preserves selected/disabled state", () => {
    const html = renderToStaticMarkup(
      h(
        RadioGroup,
        { defaultValue: "members", disabled: true },
        h(RadioOption, {
          id: "scope-members",
          value: "members",
          title: "成员",
          description: "仅成员可见",
        }),
      ),
    );
    expect(html).toContain('for="scope-members"');
    expect(html).toContain('id="scope-members"');
    expect(html).toContain('aria-checked="true"');
    expect(html).toContain('data-disabled=""');
    expect(html).toContain("仅成员可见");
  });

  it("keeps numbered collection directories and page offsets", () => {
    const html = renderToStaticMarkup(
      h(PaperList, { orderedStart: 13 }, h("li", { key: "poem" }, "第十三篇")),
    );
    expect(html).toContain('<ol start="13"');
    expect(html).toContain("list-decimal");
    expect(html).toContain("<li>第十三篇</li>");
  });

  it("preserves catalog heading levels and real links", () => {
    const html = renderToStaticMarkup(
      h(CatalogRow, {
        href: "/poems/example",
        title: "诗名",
        titleLevel: "h3",
        date: h("time", { dateTime: "2026-10-11" }, "日期"),
        metadata: "作者",
      }),
    );
    expect(html).toContain("<h3");
    expect(html).toContain('href="/poems/example"');
    expect(html).toContain('dateTime="2026-10-11"');
    expect(html).not.toContain("undefined");
  });

  it("keeps editor and management actions separate from presentation", () => {
    const editor = renderToStaticMarkup(
      h(
        EditorLayout,
        { settings: h("input", { name: "visibility" }) },
        h("textarea", { name: "body" }),
      ),
    );
    expect(editor.indexOf('name="body"')).toBeLessThan(
      editor.indexOf('name="visibility"'),
    );
    expect(editor).toContain("xl:sticky");
    const row = renderToStaticMarkup(
      h(ManagementRow, {
        actions: h("button", null, "编辑"),
        children: "作品",
      }),
    );
    expect(row.indexOf("作品")).toBeLessThan(row.indexOf("编辑"));
  });

  it("escapes poem content, preserves whitespace, and allows preview overrides", () => {
    const html = renderToStaticMarkup(
      h(
        PoemReading,
        { className: "text-body py-6 sm:py-6", "aria-label": "预览" },
        "<script>\n第一行\n\n第二行",
      ),
    );
    expect(html).toContain("&lt;script&gt;\n第一行\n\n第二行");
    expect(html).not.toContain("text-body-lg");
    expect(html).not.toContain("sm:py-12");
    const context = renderToStaticMarkup(
      h(
        ReadingContext,
        { titleId: "context", "aria-labelledby": "context" },
        "<背景>",
      ),
    );
    expect(context).toContain('id="context"');
    expect(context).toContain("&lt;背景&gt;");
  });
});
