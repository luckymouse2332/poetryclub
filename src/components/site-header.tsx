import Link from "next/link";

const navLinks = [
  { href: "/", label: "首页" },
  { href: "/login", label: "登录" },
];

export function SiteHeader() {
  return (
    <header className="border-b bg-background">
      <nav className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4">
        <Link href="/" className="font-semibold tracking-tight">
          回中诗社
        </Link>
        <ul className="flex items-center gap-4 text-sm">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
