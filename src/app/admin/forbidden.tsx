import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";

/**
 * /admin 段级的 403 边界（任务规格允许新增，不改动全局 forbidden）。
 * admin/layout 捕获 AccessControlError 后调用 forbidden()，由本文件渲染；
 * 此时布局本身不会渲染，因此不包含管理导航。
 */
export default function AdminForbidden() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <p className="text-label font-medium text-danger">403</p>
      <h1 className="mt-2 text-page-title font-semibold tracking-tight text-foreground">
        无权访问管理后台
      </h1>
      <p className="mt-2 max-w-reading text-body text-subtle">
        你没有访问管理后台的权限。普通账号无法执行管理操作，被禁用的管理员也会立即失去管理能力。
      </p>
      <Link href="/" className={buttonVariants({ className: "mt-6" })}>
        返回首页
      </Link>
    </div>
  );
}
