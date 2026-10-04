import { notFound } from "next/navigation";

import { ComponentShowcase } from "@/components/dev/component-showcase";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";

/** 浏览器测试夹具：普通运行不可访问，不加入产品导航。 */
export default function ComponentPreviewPage() {
  if (process.env.POETRYCLUB_E2E !== "1") notFound();

  return (
    <PageContainer>
      <PageHeader eyebrow="测试环境" title="纸刊组件状态" description="基础组件的造型、分区与交互状态检查。" />
      <ComponentShowcase />
    </PageContainer>
  );
}
