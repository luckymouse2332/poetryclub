import { SiteNavLink } from "@/components/site-nav-link";

type SiteHeaderProps = Readonly<{
  /**
   * 右侧导航插槽：承载认证导航等由外部注入的列表项（<li> 片段）。
   * 该组件是纯 UI 边界，不读取会话、不依赖任何 feature 模块。
   */
  navigation?: React.ReactNode;
}>;

export function SiteHeader({ navigation }: SiteHeaderProps) {
  return (
    <header className="border-b border-border-subtle bg-surface">
      <nav
        aria-label="主导航"
        className="mx-auto flex w-full max-w-content flex-col px-page py-4 lg:min-h-24 lg:flex-row lg:items-center lg:justify-between lg:gap-x-8 lg:py-0"
      >
        <SiteNavLink
          href="/#top"
          variant="brand"
          className="inline-flex min-h-control min-w-0 self-start items-center font-serif text-page-title font-medium tracking-[0.18em] text-foreground no-underline lg:self-auto"
        >
          回中诗社
        </SiteNavLink>
        <ul className="mt-3 grid w-full grid-cols-3 items-center gap-y-1 border-t border-border-subtle pt-2 sm:grid-flow-col sm:auto-cols-fr sm:grid-cols-none lg:mt-0 lg:flex lg:w-auto lg:flex-wrap lg:justify-end lg:gap-x-4 lg:border-0 lg:pt-0">
          <li>
            <SiteNavLink
              href="/poems"
              match="prefix"
              className="inline-flex min-h-control items-center justify-center whitespace-nowrap px-2 font-serif text-body text-foreground no-underline transition-colors hover:text-seal"
            >
              诗作
            </SiteNavLink>
          </li>
          <li>
            <SiteNavLink
              href="/#about"
              match="none"
              className="inline-flex min-h-control items-center justify-center whitespace-nowrap px-2 font-serif text-body text-foreground no-underline transition-colors hover:text-seal"
            >
              关于
            </SiteNavLink>
          </li>
          {navigation}
        </ul>
      </nav>
    </header>
  );
}
