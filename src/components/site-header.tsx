import Link from "next/link";
import { Button } from "./ui/button";

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
        className="mx-auto flex w-full max-w-content flex-wrap items-center justify-between gap-x-4 px-page py-3 sm:min-h-20 sm:flex-nowrap sm:py-0"
      >
        <Link
          href="/"
          className="flex min-h-control min-w-0 items-center gap-3 rounded-md no-underline"
        >
          <span
            aria-hidden="true"
            className="flex size-9 shrink-0 items-center justify-center rounded-sm border border-seal bg-seal-surface font-serif text-lg font-bold text-seal"
          >
            回
          </span>
          <span className="min-w-0 leading-tight">
            <span className="block font-semibold tracking-widest text-foreground">
              回中诗社
            </span>
            <span className="mt-1 block font-serif text-caption tracking-widest text-subtle">
              2021—2024级
            </span>
          </span>
        </Link>
        <ul className="flex w-full items-center justify-end gap-1 border-t border-border-subtle pt-2 sm:w-auto sm:border-0 sm:pt-0">
          <li>
            <Button asChild variant="ghost" size="sm">
              <Link href="/">首页</Link>
            </Button>
          </li>
          {navigation}
        </ul>
      </nav>
    </header>
  );
}
