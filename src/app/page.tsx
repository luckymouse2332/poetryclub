import Link from "next/link";

import { PageContainer } from "@/components/layout/page-container";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";

const websiteStatusItems: ReadonlyArray<{
  label: string;
  status: string;
  variant: NonNullable<BadgeProps["variant"]>;
}> = [
  { label: "账户与登录", status: "已开放", variant: "success" },
  { label: "诗作阅读", status: "准备中", variant: "warning" },
  { label: "诗作发布", status: "准备中", variant: "warning" },
  { label: "评论与收藏", status: "后续开放", variant: "neutral" },
];

/** 生成教学楼窗户网格的 SVG 矩形组。 */
function CoverWindowGrid({
  x,
  y,
  cols,
  rows,
  size,
  gap,
  className,
}: {
  x: number;
  y: number;
  cols: number;
  rows: number;
  size: number;
  gap: number;
  className: string;
}) {
  return (
    <g>
      {Array.from({ length: rows }).flatMap((_, row) =>
        Array.from({ length: cols }).map((_, col) => (
          <rect
            key={`${row}-${col}`}
            x={x + col * gap}
            y={y + row * gap}
            width={size}
            height={size}
            rx={2}
            className={className}
          />
        )),
      )}
    </g>
  );
}

/**
 * 首页首屏的校刊封面式校园视觉占位。
 * 仓库没有真实校园图片，因此用一组克制的 SVG 线稿表现教学楼、
 * 教室窗、树木与操场跑道；颜色只使用设计系统的语义 Tailwind 类。
 */
function HomeCover() {
  return (
    <div className="overflow-hidden rounded-lg border border-border-subtle bg-paper shadow-card">
      <svg
        viewBox="0 0 480 380"
        role="img"
        aria-labelledby="home-cover-title"
        className="block h-auto w-full"
      >
        <title id="home-cover-title">回中诗社校园视觉</title>
        <desc>以简洁线条表现的校园教学楼、教室窗户、树木与操场跑道。</desc>

        {/* 天空与操场地面 */}
        <rect className="fill-surface-muted" width="480" height="164" />
        <rect className="fill-paper-aged" y="164" width="480" height="216" />

        {/* 校刊式刊头 */}
        <text
          x="28"
          y="56"
          className="fill-primary font-serif text-3xl font-semibold tracking-widest"
        >
          回中诗社
        </text>
        <text
          x="30"
          y="80"
          className="fill-subtle font-serif text-label tracking-widest"
        >
          2021—2024级
        </text>
        <line
          x1="30"
          y1="94"
          x2="160"
          y2="94"
          className="stroke-border-strong"
          strokeWidth="1.5"
        />

        {/* 印章式品牌角标 */}
        <g>
          <rect
            x="412"
            y="24"
            width="44"
            height="44"
            rx="4"
            className="fill-seal-surface stroke-seal"
            strokeWidth="1.5"
          />
          <text
            x="434"
            y="56"
            textAnchor="middle"
            className="fill-seal font-serif text-2xl font-bold"
          >
            回
          </text>
        </g>

        {/* 主教学楼 */}
        <rect
          x="64"
          y="96"
          width="216"
          height="150"
          rx="4"
          className="fill-surface stroke-border"
          strokeWidth="1.5"
        />
        <line
          x1="64"
          y1="104"
          x2="280"
          y2="104"
          className="stroke-primary"
          strokeWidth="3"
        />
        <CoverWindowGrid
          x={82}
          y={118}
          cols={4}
          rows={3}
          size={22}
          gap={38}
          className="fill-border-strong"
        />
        <rect x="82" y="118" width="22" height="22" rx="2" className="fill-primary" />
        <rect
          x="196"
          y="154"
          width="22"
          height="22"
          rx="2"
          className="fill-primary"
        />
        <rect
          x="152"
          y="214"
          width="40"
          height="32"
          rx="2"
          className="fill-secondary stroke-border-subtle"
          strokeWidth="1.5"
        />

        {/* 右侧小楼 */}
        <rect
          x="304"
          y="120"
          width="84"
          height="126"
          rx="4"
          className="fill-surface stroke-border"
          strokeWidth="1.5"
        />
        <CoverWindowGrid
          x={316}
          y={138}
          cols={2}
          rows={3}
          size={20}
          gap={30}
          className="fill-border-strong"
        />
        <rect x="316" y="138" width="20" height="20" rx="2" className="fill-primary" />

        {/* 树木与矮灌丛 */}
        <rect x="430" y="196" width="8" height="36" className="fill-border-strong" />
        <circle
          cx="434"
          cy="176"
          r="28"
          className="fill-secondary stroke-border-subtle"
          strokeWidth="1.5"
        />
        <circle
          cx="44"
          cy="296"
          r="14"
          className="fill-secondary stroke-border-subtle"
          strokeWidth="1.5"
        />

        {/* 操场跑道 */}
        <ellipse
          cx="240"
          cy="330"
          rx="180"
          ry="36"
          className="fill-paper stroke-border-subtle"
          strokeWidth="1.5"
        />
        <ellipse
          cx="240"
          cy="330"
          rx="146"
          ry="22"
          className="fill-none stroke-border"
          strokeWidth="1"
        />
      </svg>
    </div>
  );
}

export default function HomePage() {
  return (
    <PageContainer className="py-0">
      {/* 首屏：移动端单栏，md 起 5:7 双栏，品牌介绍在左、校园视觉在右 */}
      <section
        aria-labelledby="home-title"
        className="grid gap-8 py-8 md:grid-cols-12 md:items-center md:gap-10 md:py-12"
      >
        <div className="md:col-span-5">
          <h1
            id="home-title"
            className="mt-3 font-serif text-5xl font-semibold tracking-tight text-foreground md:text-6xl"
          >
            回中诗社
          </h1>
          <p className="mt-3 font-serif text-body-lg text-subtle">2021—2024级</p>
          <p className="mt-4 max-w-reading text-body-lg text-subtle">
            初中时代的打油诗和班史。
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button asChild size="lg">
              <Link href="/login?next=/account">登录</Link>
            </Button>
            <Button asChild variant="ghost" size="lg">
              <Link href="#about">了解回中诗社</Link>
            </Button>
          </div>
        </div>

        <div className="md:col-span-7">
          <HomeCover />
        </div>
      </section>

      {/* 下半区：md 起 2:1 双栏，介绍在左、建设状态在右 */}
      <div
        id="about"
        className="border-t border-border-subtle py-8 md:py-12"
      >
        <div className="grid gap-8 md:grid-cols-3 md:gap-10">
          <section aria-labelledby="about-title" className="md:col-span-2">
            <h2
              id="about-title"
              className="font-serif text-section-title font-semibold text-foreground"
            >
              关于回中诗社
            </h2>
            <div className="mt-4 max-w-reading space-y-4 text-body text-subtle">
              <p>
                这里收录同学们写下的打油诗，也保存和这些诗有关的人、地点与往事。
              </p>
              <p>
                有些诗写得认真，有些只是课间的即兴。等作品功能正式开放后，同学可以在这里阅读、记录和补充共同的记忆。
              </p>
            </div>
          </section>

          <section aria-labelledby="building-title" className="md:col-span-1">
            <h2
              id="building-title"
              className="font-serif text-section-title font-semibold text-foreground"
            >
              网站正在建设
            </h2>
            <Surface variant="paper" padding="sm" className="mt-4">
              <dl className="divide-y divide-border-subtle">
                {websiteStatusItems.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between gap-4 py-3"
                  >
                    <dt className="text-body text-foreground">{item.label}</dt>
                    <dd>
                      <Badge variant={item.variant}>{item.status}</Badge>
                    </dd>
                  </div>
                ))}
              </dl>
            </Surface>
          </section>
        </div>
      </div>
    </PageContainer>
  );
}
