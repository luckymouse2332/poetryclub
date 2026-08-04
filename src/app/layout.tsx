import type { Metadata } from "next";
import { Noto_Sans_SC, Noto_Serif_SC } from "next/font/google";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { AuthNavigation } from "@/features/auth/components/auth-navigation";
import { cn } from "@/lib/utils";

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
      data-scroll-behavior="smooth"
      className={cn(
        notoSans.variable,
        notoSerif.variable,
        "h-full antialiased",
      )}
    >
      <body className="flex min-h-full flex-col">
        <SiteHeader navigation={<AuthNavigation />} />
        <main className="flex flex-1 flex-col">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
