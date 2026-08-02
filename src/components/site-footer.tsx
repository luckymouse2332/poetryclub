import Link from "next/link";

/**
 * 站点页脚：纯静态信息，不读取会话。
 * 包含“隐私政策”“使用条款”两个真实路由链接；与 SiteHeader 一样是纯 UI 边界，
 * 不依赖任何 feature 模块，也不新增 nav landmark。
 */
export function SiteFooter() {
  return (
    <footer className="border-t border-border-subtle bg-surface">
      <div className="mx-auto flex w-full max-w-content flex-col items-center gap-2 px-page py-6 text-center lg:grid lg:grid-cols-3 lg:text-left">
        <p className="text-label font-medium tracking-widest text-foreground lg:justify-self-start">
          回中诗社
        </p>
        <div className="text-caption text-subtle lg:justify-self-center lg:text-center">
          <a
            href="https://beian.miit.gov.cn/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="京ICP备2022016960号-1（新窗口打开）"
            className="inline-flex min-h-control items-center rounded-md px-2 text-caption text-subtle underline hover:text-primary"
          >
            京ICP备2022016960号-1
          </a>
        </div>
        <div className="flex flex-col items-center lg:justify-self-end lg:items-end">
          <ul className="flex items-center justify-center gap-1 lg:justify-end">
            <li>
              <FooterLink href="/privacy">隐私政策</FooterLink>
            </li>
            <li>
              <FooterLink href="/terms">使用条款</FooterLink>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({
  href,
  children,
}: Readonly<{ href: string; children: string }>) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-control items-center rounded-md px-2 text-label text-primary underline hover:text-primary-hover"
    >
      {children}
    </Link>
  );
}
