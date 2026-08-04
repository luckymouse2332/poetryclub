import Image from "next/image";
import Link from "next/link";

import poetryCollectionPhoto from "../../public/poetry-collection.jpg";

import { PageContainer } from "@/components/layout/page-container";
import { formatPoemIndexDate } from "@/features/posts/formatters";
import { cn } from "@/lib/utils";
import { listRecentPublishedPoems } from "@/server/services/poems";

import styles from "./home.module.css";

export default async function HomePage() {
  const recentPoems = await listRecentPublishedPoems(3);

  return (
    <>
      <section id="top" aria-labelledby="home-title" className={styles.hero}>
        <div className={styles.introduction}>
          <div className={styles.introductionContent}>
            <h1
              id="home-title"
              className="font-serif text-display font-medium tracking-[0.08em] text-foreground"
            >
              回中诗社
            </h1>
            <p className="mt-5 font-serif text-body-lg tracking-widest text-subtle">
              2021—2024级
            </p>
            <p className="mt-10 max-w-narrow font-serif text-body-lg leading-loose text-foreground">
              三年里随手写下来的诗，
              <br />
              以及一些只有我们还记得的事情。
            </p>
            <Link
              href="/poems"
              className={cn(
                styles.animatedTextLink,
                "mt-12 inline-flex min-h-control items-center gap-3 border-b border-seal font-serif text-body text-seal no-underline transition-colors hover:border-seal-foreground hover:text-seal-foreground",
              )}
            >
              随便翻翻
              <span aria-hidden="true" className={styles.linkArrow}>
                →
              </span>
            </Link>
          </div>
        </div>

        <div className={styles.archive}>
          <div className={styles.archiveWindow}>
            <Image
              src={poetryCollectionPhoto}
              alt="深色桌面上并列摆放着磨损的《杂诗集》封面和翻开的两页手写诗稿"
              fill
              preload
              sizes="(max-width: 1023px) calc(100vw - 32px), (max-width: 1119px) 66vw, calc(50vw + 11rem)"
              className={styles.archiveImage}
            />
          </div>
        </div>
      </section>

      <PageContainer className={styles.homeContainer}>
        <div className={styles.indexAndAbout}>
          <section
            aria-labelledby="recent-poems-title"
            className={styles.index}
          >
            <div className="flex items-start justify-between gap-4">
              <h2
                id="recent-poems-title"
                className={`${styles.indexTitle} font-serif text-section-title font-medium tracking-widest text-foreground`}
              >
                最新诗作
              </h2>
              <Link
                href="/poems"
                className={cn(
                  styles.animatedTextLink,
                  "mt-1 inline-flex min-h-control shrink-0 items-center gap-2 text-label text-seal underline decoration-transparent transition-colors hover:decoration-current",
                )}
              >
                查看全部
                <span aria-hidden="true" className={styles.linkArrow}>
                  →
                </span>
              </Link>
            </div>

            {recentPoems.length > 0 ? (
              <ol className="mt-5 border-t border-border-strong">
                {recentPoems.map((poem) => (
                  <li key={poem.id} className={styles.poemIndexRow}>
                    <time
                      dateTime={poem.publishedAt.toISOString()}
                      className={styles.poemDate}
                    >
                      {formatPoemIndexDate(poem.publishedAt)}
                    </time>
                    <h3 className={styles.poemTitle}>
                      <Link
                        href={`/poems/${poem.id}`}
                        className={styles.poemLink}
                      >
                        《{poem.title}》
                      </Link>
                    </h3>
                    <p className={styles.poemAuthor}>{poem.authorName}</p>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-5 border-y border-border-subtle py-5 font-serif text-body text-subtle">
                暂时还没有公开诗作。
              </p>
            )}
          </section>

          <section
            id="about"
            aria-labelledby="about-title"
            className={styles.about}
          >
            <h2
              id="about-title"
              className={`${styles.indexTitle} font-serif text-section-title font-medium tracking-widest text-foreground`}
            >
              关于回中诗社
            </h2>
            <div className="mt-5 max-w-reading space-y-4 font-serif text-body leading-loose text-foreground">
              <p>
                回中诗社源自社长Kevin自己的创作，记录了回中三班同学2021—2024年三年的初中生活，包括同学们随手写的打油诗和记录各种有趣事件的班史。我们不做质量筛选，只要你觉得有意思，就可以往上投。本站由同学在业余时间维护，功能会一点点加，之前的诗也会一首首补，请不要着急。
              </p>
              <h3 className="font-serif text-section-title font-medium tracking-widest text-foreground">
                收录标准
              </h3>
              <ol className="list-decimal list-inside pl-4 space-y-2">
                <li>是你自己写的。</li>
                <li>押韵随意。</li>
                <li>一句话也算。</li>
                <li>写具体同学时，请稍微收敛一点。</li>
              </ol>
            </div>
          </section>
        </div>
      </PageContainer>
    </>
  );
}
