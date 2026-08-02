import Link from "next/link";

const POLICY_LINKS = [
  { href: "/privacy", label: "隐私政策" },
  { href: "/terms", label: "使用条款" },
] as const;

/**
 * 站点页脚：纯静态信息，不读取会话。
 * ≥1024px 为等宽三栏单行：左侧品牌与年级短说明、中间版权与 ICP 备案号、右侧政策链接；
 * 三组内容在同一行内垂直居中对齐，中间栏因等宽栅格而始终位于页面水平中心，
 * 满足备案号“页面底部居中展示并链接工信部”的要求。
 * 更窄视口改为居中纵向堆叠，避免三栏挤压导致换行。
 * 包含“隐私政策”“使用条款”两个真实路由链接；与 SiteHeader 一样是纯 UI 边界，
 * 不依赖任何 feature 模块，也不新增 nav landmark。
 */
export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border-subtle bg-surface">
      <div className="mx-auto flex w-full max-w-content flex-col items-center gap-2 px-page py-6 text-center lg:grid lg:grid-cols-3 lg:items-center lg:gap-4 lg:text-left">
        <div className="min-w-0 lg:justify-self-start">
          <p className="text-label font-medium tracking-widest text-foreground">
            回中诗社
          </p>
          <p className="mt-1 text-caption text-subtle">
            2021—2024级
          </p>
        </div>
        <div className="flex min-h-control flex-wrap items-center justify-center gap-x-2 text-caption text-subtle lg:justify-self-center">
          <span>© {year} 回中诗社</span>
          <span aria-hidden="true">·</span>
          <a
            href="https://beian.miit.gov.cn/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="京ICP备2022016960号-1（新窗口打开）"
            className="inline-flex min-h-control items-center rounded-md underline hover:text-primary"
          >
            京ICP备2022016960号-1
          </a>
        </div>
        <ul className="-mx-2 flex min-h-control flex-wrap items-center justify-center gap-x-2 lg:justify-self-end">
          {POLICY_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="inline-flex min-h-control items-center rounded-md px-2 text-label text-primary underline hover:text-primary-hover"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
