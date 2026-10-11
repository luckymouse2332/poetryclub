import { SiteNavLink } from "@/components/site-nav-link";
import { ThemeToggle } from "@/components/theme-toggle";

type SiteHeaderProps = Readonly<{
  /** 桌面认证导航列表项（<li> 片段）。 */
  desktopNavigation?: React.ReactNode;
  /** 移动端左侧全站菜单触发器。 */
  mobileMenu?: React.ReactNode;
  /** 移动端右侧登录或账户入口。 */
  mobileAccount?: React.ReactNode;
}>;

/** 不是上游组件：校园诗刊刊头，保留移动三段式与既有认证插槽。 */
export function SiteHeader({
  desktopNavigation,
  mobileMenu,
  mobileAccount,
}: SiteHeaderProps) {
  return (
    <header className="bg-background lg:border-b lg:border-border-subtle">
      <nav
        aria-label="主导航"
        className="relative z-header h-[var(--mobile-header-height)] border-b border-border-subtle bg-background lg:hidden"
      >
        <div className="grid h-full grid-cols-[6rem_minmax(0,1fr)_6rem] items-center px-3">
          <div className="flex items-center">
            {mobileMenu}
            <ThemeToggle />
          </div>
          <SiteNavLink
            href="/#top"
            match="none"
            variant="brand"
            className="min-w-0 justify-self-center font-serif text-body-lg font-semibold tracking-widest whitespace-nowrap text-foreground no-underline"
          >
            回中诗社
          </SiteNavLink>
          <div className="flex size-12 items-center justify-center justify-self-end">
            {mobileAccount}
          </div>
        </div>
      </nav>

      <nav
        aria-label="主导航"
        className="mx-auto hidden min-h-24 w-full max-w-content items-center justify-between gap-x-8 px-page lg:flex"
      >
        <SiteNavLink
          href="/#top"
          variant="brand"
          className="inline-flex min-h-control min-w-0 items-center gap-3 text-foreground no-underline"
        >
          <span className="flex flex-col">
            <span className="font-serif text-section-title leading-heading font-semibold tracking-widest">
              回中诗社
            </span>
            <span className="mt-1 text-caption font-normal text-subtle">
              2021—2024级
            </span>
          </span>
        </SiteNavLink>
        <ul className="flex w-auto flex-wrap items-center justify-end gap-x-2">
          <li>
            <SiteNavLink href="/poems" match="prefix">
              诗作
            </SiteNavLink>
          </li>
          <li>
            <SiteNavLink href="/collections" match="prefix">
              特辑
            </SiteNavLink>
          </li>
          <li>
            <SiteNavLink href="/about" match="exact">
              关于
            </SiteNavLink>
          </li>
          {desktopNavigation}
          <li>
            <ThemeToggle />
          </li>
        </ul>
      </nav>
    </header>
  );
}
