/** 不是上游组件：公共的成员与管理桌面工作区骨架。 */

import {
  SecondaryNavigation,
  type SecondaryNavigationItem,
} from "@/components/secondary-navigation";

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
  ariaLabel,
  items,
  showMobileNavigation = true,
  children,
}: WorkspaceShellProps) {
  return (
    <div className="min-h-full">
      {showMobileNavigation ? (
        <SecondaryNavigation
          ariaLabel={ariaLabel}
          items={items}
          className="hidden lg:block"
        />
      ) : null}
      <div className="min-w-0">{children}</div>
    </div>
  );
}
