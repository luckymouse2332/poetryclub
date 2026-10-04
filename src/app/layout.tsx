import type { Metadata } from "next";
import { Noto_Sans_SC, Noto_Serif_SC } from "next/font/google";

import { SiteFooter } from "@/components/site-footer";
import { AuthNavigation } from "@/features/auth/components/auth-navigation";
import { cn } from "@/lib/utils";
import { ThemeInitialization } from "@/components/theme-toggle";

import "./globals.css";

const notoSans = Noto_Sans_SC({
  variable: "--font-sans",
  weight: "variable",
  display: "swap",
  preload: false,
});

const notoSerif = Noto_Serif_SC({
  variable: "--font-serif",
  weight: "variable",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: {
    default: "回中诗社",
    template: "%s | 回中诗社",
  },
  description: "回中校园诗歌兴趣社区",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={cn(
        notoSans.variable,
        notoSerif.variable,
        "h-full antialiased",
      )}
    >
      <head>
        <ThemeInitialization />
      </head>
      <body className="flex min-h-full flex-col">
        <a href="#main-content" className="sr-only z-sheet rounded-md bg-primary px-4 py-3 text-primary-foreground focus:not-sr-only focus:fixed focus:top-2 focus:left-2">
          跳转到主要内容
        </a>
        <AuthNavigation />
        <main id="main-content" tabIndex={-1} className="flex flex-1 flex-col">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
