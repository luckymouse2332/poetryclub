import Link from "next/link";

type SiteHeaderProps = Readonly<{
  /**
   * 右侧导航插槽：承载认证导航等由外部注入的列表项（<li> 片段）。
   * 该组件是纯 UI 边界，不读取会话、不依赖任何 feature 模块。
   */
  navigation?: React.ReactNode;
}>;

export function SiteHeader({ navigation }: SiteHeaderProps) {
  return (
    <header className="border-b bg-background">
      <nav className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4">
        <Link href="/" className="font-semibold tracking-tight">
          回中诗社
        </Link>
        <ul className="flex items-center gap-4 text-sm">
          <li>
            <Link
              href="/"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              首页
            </Link>
          </li>
          {navigation}
        </ul>
      </nav>
    </header>
  );
}
