/** 不是上游组件：公共的成员与管理桌面工作区骨架。 */

import {
  SecondaryNavigation,
  type SecondaryNavigationItem,
} from "@/components/secondary-navigation";
import { WorkspaceNavigation } from "@/components/layout/workspace-navigation";

type WorkspaceShellHeadingProps =
  | Readonly<{ title: string; eyebrow: string }>
  | Readonly<{ title?: never; eyebrow?: never }>;

type WorkspaceShellProps = Readonly<{
  ariaLabel: string;
  items: ReadonlyArray<SecondaryNavigationItem>;
  showMobileNavigation?: boolean;
  children: React.ReactNode;
}> &
  WorkspaceShellHeadingProps;

export function WorkspaceShell({
  title,
  eyebrow,
  ariaLabel,
  items,
  showMobileNavigation = true,
  children,
}: WorkspaceShellProps) {
  return (
    <div className="min-h-full bg-background">
      {showMobileNavigation ? (
        <SecondaryNavigation
          ariaLabel={ariaLabel}
          items={items}
          className="hidden lg:block xl:hidden"
        />
      ) : null}
      <div className="mx-auto w-full max-w-[88rem] xl:grid xl:grid-cols-[14rem_minmax(0,1fr)] xl:gap-8 xl:px-page">
        <aside className="hidden py-section xl:block">
          <div className="sticky top-8 border-t border-border pt-6">
            {title && eyebrow ? (
              <>
                <p className="text-caption tracking-widest text-subtle">
                  {eyebrow}
                </p>
                <p className="mt-2 mb-6 font-serif text-body-lg font-medium text-foreground">
                  {title}
                </p>
              </>
            ) : null}
            <WorkspaceNavigation ariaLabel={ariaLabel} items={items} />
          </div>
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
