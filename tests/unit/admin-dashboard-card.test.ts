import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import { AdminDashboardCard } from "@/features/moderation/components/admin-dashboard-card";

describe("AdminDashboardCard", () => {
  for (const tone of ["paper", "muted", "plain"] as const) {
    test(`${tone} 样式保持管理场景无边框`, () => {
      const rendered = renderToStaticMarkup(
        h(AdminDashboardCard, {
          href: "/admin/poems",
          title: "诗作治理",
          description: "查看治理状态。",
          tone,
        }),
      );

      expect(rendered).toContain('data-slot="admin-dashboard-card"');
      expect(rendered).toContain(`data-tone="${tone}"`);
      expect(rendered).toContain('data-slot="card"');
      expect(rendered).toContain("border-0");
      expect(rendered).toContain('href="/admin/poems"');
    });
  }
});
