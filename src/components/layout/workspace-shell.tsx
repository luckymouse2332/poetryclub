/** 不是上游组件：公共的成员与管理桌面工作区骨架。 */

import { SecondaryNavigation } from "@/components/secondary-navigation";
import {
  WorkspaceNavigation,
  type WorkspaceNavigationItem,
} from "@/components/layout/workspace-navigation";

type WorkspaceShellProps = Readonly<{
  title: string;
  eyebrow: string;
  ariaLabel: string;
  items: ReadonlyArray<WorkspaceNavigationItem>;
  children: React.ReactNode;
}>;

export function WorkspaceShell({
  title,
  eyebrow,
  ariaLabel,
  items,
  children,
}: WorkspaceShellProps) {
  return (
    <div className="min-h-full">
      <SecondaryNavigation
        ariaLabel={ariaLabel}
        items={items}
        className="xl:hidden"
      />
      <div className="mx-auto w-full max-w-[80rem] xl:grid xl:grid-cols-[14rem_minmax(0,1fr)] xl:gap-10 xl:px-page">
        <aside className="hidden border-r border-border-subtle py-section pr-6 xl:block">
          <div className="sticky top-8">
            <p className="text-caption font-medium tracking-[0.16em] text-seal-foreground">
              {eyebrow}
            </p>
            <p className="mt-2 mb-8 font-serif text-section-title text-foreground">
              {title}
            </p>
            <WorkspaceNavigation ariaLabel={ariaLabel} items={items} />
          </div>
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
