"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

import styles from "./site-nav-link.module.css";

type SiteNavLinkProps = Readonly<{
  href: string;
  children: React.ReactNode;
  className?: string;
  match?: "exact" | "prefix" | "none";
  variant?: "brand" | "navigation";
}>;

export function SiteNavLink({
  href,
  children,
  className,
  match = "exact",
  variant = "navigation",
}: SiteNavLinkProps) {
  const pathname = usePathname();
  const targetPath = href.split("#", 1)[0] || "/";
  const isActive =
    match === "exact"
      ? pathname === targetPath
      : match === "prefix"
        ? pathname === targetPath || pathname.startsWith(`${targetPath}/`)
        : false;

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    const hashIndex = href.indexOf("#");
    if (
      hashIndex < 0 ||
      pathname !== targetPath ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    const hash = href.slice(hashIndex + 1);
    const target = document.getElementById(decodeURIComponent(hash));
    if (!target) return;

    event.preventDefault();
    const nextHash = `#${hash}`;
    if (window.location.hash !== nextHash) {
      window.history.pushState(null, "", nextHash);
    }

    target.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
      block: "start",
    });
  };

  return (
    <Link
      href={href}
      onClick={handleClick}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        styles.link,
        variant === "brand" ? styles.brandLink : styles.navigationLink,
        className,
      )}
    >
      {children}
    </Link>
  );
}
