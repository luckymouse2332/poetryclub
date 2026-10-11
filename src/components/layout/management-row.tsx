import type { ReactNode } from "react";

/** 不是上游组件：个人与治理目录的正文/操作布局，不接收业务实体。 */
export function ManagementRow({
  children,
  actions,
}: {
  children: ReactNode;
  actions: ReactNode;
}) {
  return (
    <article className="grid min-w-0 gap-4 bg-transparent px-0 py-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:gap-6">
      <div className="min-w-0">{children}</div>
      <div className="flex shrink-0 items-center gap-2 md:justify-end">
        {actions}
      </div>
    </article>
  );
}
