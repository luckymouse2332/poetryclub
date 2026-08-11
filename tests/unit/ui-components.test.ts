/**
 * UI 组件渲染快照。
 *
 * 用途：shadcn 迁移把 `src/components/ui` 换成 shadcn/ui 结构后，用逐变体的
 * 静态 DOM + class 快照锁定渲染结果，保证后续改动不会静默改变样式或无障碍属性。
 * 快照变化必须人工确认是有意的设计调整，再用 `pnpm test -u` 更新。
 *
 * 只做静态渲染（`renderToStaticMarkup`），不涉及浏览器行为；交互与视口回归仍由
 * `tests/e2e` 覆盖。
 */
import { createElement as h, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, test } from "vitest";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Section } from "@/components/layout/section";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field";
import {
  FormField,
  type FormFieldControlProps,
} from "@/components/ui/form-field";
import { IconButton } from "@/components/ui/icon-button";
import { Input } from "@/components/ui/input";
import { PaginationNavigation } from "@/components/pagination-navigation";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { Surface } from "@/components/ui/surface";
import { Textarea } from "@/components/ui/textarea";

const BUTTON_VARIANTS = ["primary", "secondary", "ghost", "danger"] as const;
const BUTTON_SIZES = ["default", "sm", "lg", "icon"] as const;
const BADGE_VARIANTS = [
  "neutral",
  "primary",
  "seal",
  "success",
  "warning",
  "danger",
] as const;
const SURFACE_VARIANTS = ["default", "paper", "muted"] as const;
const SURFACE_PADDINGS = ["none", "sm", "md", "lg"] as const;

function markup(node: ReactNode): string {
  return renderToStaticMarkup(node);
}

test("Button 覆盖全部变体与尺寸", () => {
  const rendered = BUTTON_VARIANTS.flatMap((variant) =>
    BUTTON_SIZES.map(
      (size) =>
        `${variant}:${size}\n${markup(h(Button, { variant, size }, "按钮"))}`,
    ),
  );

  expect(rendered.join("\n\n")).toMatchSnapshot();
});

test("Button 的 loading、disabled 与自定义 className", () => {
  expect(markup(h(Button, { loading: true }, "处理中…"))).toMatchSnapshot(
    "loading",
  );
  expect(markup(h(Button, { disabled: true }, "按钮"))).toMatchSnapshot(
    "disabled",
  );
  expect(
    markup(h(Button, { className: "w-full", type: "submit" }, "登录")),
  ).toMatchSnapshot("className");
  expect(
    markup(
      h(
        Button,
        {
          type: "button",
          variant: "ghost",
          role: "tab",
          "aria-selected": true,
          "aria-controls": "auth-form-panel",
          className:
            "w-full aria-selected:bg-paper aria-selected:text-foreground aria-selected:shadow-card",
        },
        "登录",
      ),
    ),
  ).toMatchSnapshot("tab");
});

test("Button asChild 通过 Radix Slot 保留链接语义与尺寸", () => {
  expect(
    markup(
      h(Button, { asChild: true, size: "lg" }, h("a", { href: "/login" }, "登录")),
    ),
  ).toMatchSnapshot("lg");
  expect(
    markup(
      h(
        Button,
        { asChild: true, variant: "ghost", size: "sm" },
        h("a", { href: "/" }, "首页"),
      ),
    ),
  ).toMatchSnapshot("ghost-sm");
});

test("IconButton 保留可访问名称，loading 时只显示加载图标", () => {
  expect(
    markup(
      h(IconButton, { "aria-label": "关闭" }, h("svg", { viewBox: "0 0 24 24" })),
    ),
  ).toMatchSnapshot("default");
  expect(
    markup(
      h(
        IconButton,
        { "aria-label": "关闭", loading: true },
        h("svg", { viewBox: "0 0 24 24" }),
      ),
    ),
  ).toMatchSnapshot("loading");
});

test("Badge 覆盖全部语义变体", () => {
  const rendered = BADGE_VARIANTS.map(
    (variant) => `${variant}\n${markup(h(Badge, { variant }, "状态"))}`,
  );

  expect(rendered.join("\n\n")).toMatchSnapshot();
  expect(markup(h(Badge, null, "状态"))).toBe(
    markup(h(Badge, { variant: "neutral" }, "状态")),
  );
});

test("Sheet 触发器保留按钮语义与 data-slot", () => {
  const rendered = markup(
    h(
      Sheet,
      null,
      h(
        SheetTrigger,
        { asChild: true },
        h("button", { type: "button", "aria-label": "打开全站导航" }, "菜单"),
      ),
    ),
  );

  expect(rendered).toContain('data-slot="sheet-trigger"');
  expect(rendered).toContain('aria-label="打开全站导航"');
});

test("Alert 状态变体使用固定图标与单一 live role", () => {
  const success = markup(
    h(
      Alert,
      { variant: "success", role: "status" },
      h(AlertDescription, null, "保存成功"),
    ),
  );
  const warning = markup(
    h(Alert, { variant: "warning" }, h(AlertDescription, null, "静态说明")),
  );
  const danger = markup(
    h(
      Alert,
      { variant: "danger", role: "alert" },
      h(AlertDescription, null, "保存失败"),
    ),
  );

  expect(success).toContain('data-variant="success"');
  expect(success).toContain('role="status"');
  expect(success).not.toContain("aria-live");
  expect(warning).toContain('data-variant="warning"');
  expect(warning).not.toContain("role=");
  expect(danger).toContain('data-variant="danger"');
  expect(danger).toContain('role="alert"');
  expect([success, warning, danger].every((value) => value.includes("<svg"))).toBe(true);
});

test("PaginationNavigation 在边界页只生成有效方向 href", () => {
  const first = markup(
    h(PaginationNavigation, {
      page: 1,
      pageCount: 3,
      previousHref: null,
      nextHref: "/poems?page=2",
      ariaLabel: "分页",
    }),
  );
  const middle = markup(
    h(PaginationNavigation, {
      page: 2,
      pageCount: 3,
      previousHref: "/poems",
      nextHref: "/poems?page=3",
      ariaLabel: "分页",
    }),
  );
  const last = markup(
    h(PaginationNavigation, {
      page: 3,
      pageCount: 3,
      previousHref: "/poems?page=2",
      nextHref: null,
      ariaLabel: "分页",
    }),
  );

  expect(first).not.toContain('href="/poems"');
  expect(first).toContain('href="/poems?page=2"');
  expect(middle).toContain('href="/poems"');
  expect(middle).toContain('href="/poems?page=3"');
  expect(last).toContain('href="/poems?page=2"');
  expect(last).not.toContain('href="/poems?page=4"');
});

test("调用方字号覆盖会移除组件默认字号", () => {
  const rendered = markup(
    h(CardDescription, { className: "text-body" }, "说明"),
  );

  expect(rendered).toContain("text-body");
  expect(rendered).not.toContain("text-label");
});

test("Input 与 Textarea 的默认、禁用与错误态", () => {
  expect(markup(h(Input, { id: "a", name: "a" }))).toMatchSnapshot("input");
  expect(
    markup(h(Input, { id: "b", type: "email", name: "b" })),
  ).toMatchSnapshot("input:email");
  expect(markup(h(Input, { id: "c", disabled: true }))).toMatchSnapshot(
    "input:disabled",
  );
  expect(markup(h(Input, { id: "d", "aria-invalid": true }))).toMatchSnapshot(
    "input:invalid",
  );
  expect(markup(h(Textarea, { id: "e" }))).toMatchSnapshot("textarea");
  expect(
    markup(h(Textarea, { id: "f", className: "min-h-40" })),
  ).toMatchSnapshot("textarea:className");
});

test("FormField 生成 label、说明、错误与 aria-describedby 关联", () => {
  expect(
    markup(
      h(FormField, {
        id: "email",
        label: "邮箱",
        required: true,
        children: (props: FormFieldControlProps) =>
          h(Input, { ...props, name: "email", type: "email" }),
      }),
    ),
  ).toMatchSnapshot("basic");
  expect(
    markup(
      h(FormField, {
        id: "password",
        label: "密码",
        description: "请使用至少 8 个字符。",
        error: "密码不正确",
        required: true,
        disabled: true,
        className: "mt-2",
        children: (props: FormFieldControlProps) =>
          h(Input, { ...props, name: "password", type: "password" }),
      }),
    ),
  ).toMatchSnapshot("full");
});

test("Surface 覆盖承载层级与内边距", () => {
  const rendered = SURFACE_VARIANTS.flatMap((variant) =>
    SURFACE_PADDINGS.map(
      (padding) =>
        `${variant}:${padding}\n${markup(h(Surface, { variant, padding }, "内容"))}`,
    ),
  );

  expect(rendered.join("\n\n")).toMatchSnapshot();
  expect(
    markup(
      h(
        Surface,
        { className: "w-full", "aria-label": "认证表单" },
        h("p", null, "内容"),
      ),
    ),
  ).toMatchSnapshot("auth");
});

test("Card 保持 shadcn 上游的子组件组合", () => {
  expect(
    markup(
      h(
        Card,
        null,
        h(
          CardHeader,
          null,
          h(CardTitle, null, "标题"),
          h(CardDescription, null, "描述"),
          h(CardAction, null, h(Button, { size: "sm" }, "操作")),
        ),
        h(CardContent, null, h("p", null, "内容")),
        h(CardFooter, null, h("p", null, "页脚")),
      ),
    ),
  ).toMatchSnapshot();
});

test("Field 家族覆盖上游全部导出", () => {
  expect(
    markup(
      h(
        FieldSet,
        null,
        h(FieldLegend, null, "账号"),
        h(
          FieldGroup,
          null,
          h(
            Field,
            { orientation: "horizontal" },
            h(
              FieldContent,
              null,
              h(FieldTitle, null, "接收通知"),
              h(FieldDescription, null, "有新回复时提醒我。"),
            ),
          ),
          h(FieldSeparator, null, "或"),
          h(
            Field,
            null,
            h(FieldLabel, { htmlFor: "nickname" }, "昵称"),
            h(Input, { id: "nickname" }),
            h(FieldError, null, "昵称已被使用"),
          ),
        ),
      ),
    ),
  ).toMatchSnapshot("composition");
  expect(
    markup(
      h(FieldError, {
        errors: [{ message: "太短" }, { message: "含非法字符" }, undefined],
      }),
    ),
  ).toMatchSnapshot("errors:multiple");
  expect(markup(h(FieldError, { errors: [] }))).toBe("");
  expect(markup(h(Separator, null))).toMatchSnapshot("separator");
});

test("Empty 使用语义标题并支持媒体与操作", () => {
  expect(
    markup(h(Empty, null, h(EmptyHeader, null, h(EmptyTitle, null, "还没有内容")))),
  ).toMatchSnapshot("title");
  expect(
    markup(
      h(
        Empty,
        { className: "mt-4" },
        h(
          EmptyHeader,
          null,
          h(EmptyMedia, null, h("svg", { viewBox: "0 0 24 24" })),
          h(EmptyTitle, null, "还没有内容"),
          h(EmptyDescription, null, "稍后再来看看。"),
        ),
        h(EmptyContent, null, h(Button, null, "去写一首")),
      ),
    ),
  ).toMatchSnapshot("full");
});

test("页面骨架保持既有布局契约", () => {
  expect(
    markup(h(PageContainer, { children: h("p", null, "内容") })),
  ).toMatchSnapshot("container:content");
  expect(
    markup(
      h(PageContainer, {
        width: "narrow",
        as: "section",
        className: "py-12",
        children: h("p", null, "内容"),
      }),
    ),
  ).toMatchSnapshot("container:narrow");
  expect(
    markup(
      h(PageHeader, {
        eyebrow: "个人档案",
        title: "账户",
        description: "查看当前登录身份。",
        align: "center",
        actions: h(Button, null, "操作"),
      }),
    ),
  ).toMatchSnapshot("pageheader");
  expect(
    markup(
      h(Section, {
        title: "基本信息",
        description: "说明",
        actions: h(Button, null, "操作"),
        children: h("p", null, "内容"),
      }),
    ),
  ).toMatchSnapshot("section");
  expect(
    markup(h(Section, { children: h("p", null, "内容") })),
  ).toMatchSnapshot("section:plain");
});
