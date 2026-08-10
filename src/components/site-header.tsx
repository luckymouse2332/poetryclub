import { SiteNavLink } from "@/components/site-nav-link";

type SiteHeaderProps = Readonly<{
  /** 桌面认证导航列表项（<li> 片段）。 */
  desktopNavigation?: React.ReactNode;
  /** 移动端左侧全站菜单触发器。 */
  mobileMenu?: React.ReactNode;
  /** 移动端右侧登录或账户入口。 */
  mobileAccount?: React.ReactNode;
}>;

/** 不是上游组件：全站刊头的移动三段式与桌面编辑式导航骨架。 */
export function SiteHeader({
  desktopNavigation,
  mobileMenu,
  mobileAccount,
}: SiteHeaderProps) {
  return (
    <header className="border-b border-border-subtle bg-background">
      <nav aria-label="主导航" className="lg:hidden">
        <div className="grid h-16 grid-cols-[3rem_minmax(0,1fr)_3rem] items-center px-3">
          <div className="flex size-12 items-center justify-center">
            {mobileMenu}
          </div>
          <SiteNavLink
            href="/#top"
            match="none"
            variant="brand"
            className="min-w-0 justify-self-center whitespace-nowrap font-serif text-[1.25rem] font-normal tracking-[0.16em] text-foreground no-underline"
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
        className="mx-auto hidden min-h-24 w-full max-w-content items-center justify-between gap-x-10 px-page lg:flex"
      >
        <SiteNavLink
          href="/#top"
          variant="brand"
          className="inline-flex min-h-control min-w-0 items-center font-serif text-foreground no-underline"
        >
          <span className="flex flex-col">
            <span className="text-[1.9rem] font-normal leading-tight tracking-[0.18em]">
              回中诗社
            </span>
            <span className="mt-1 text-caption font-normal tracking-[0.08em] text-subtle">
              2021—2024级
            </span>
          </span>
        </SiteNavLink>
        <ul className="flex w-auto flex-wrap items-center justify-end gap-x-5">
          <li>
            <SiteNavLink
              href="/poems"
              match="prefix"
              className="inline-flex min-h-control items-center justify-center whitespace-nowrap px-2 font-serif text-label tracking-[0.14em] text-foreground no-underline transition-colors hover:text-seal"
            >
              诗作
            </SiteNavLink>
          </li>
          <li>
            <SiteNavLink
              href="/about"
              match="exact"
              className="inline-flex min-h-control items-center justify-center whitespace-nowrap px-2 font-serif text-label tracking-[0.14em] text-foreground no-underline transition-colors hover:text-seal"
            >
              关于
            </SiteNavLink>
          </li>
          {desktopNavigation}
        </ul>
      </nav>
    </header>
  );
}
