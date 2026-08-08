import Image from "next/image";
import Link from "next/link";

import homepagePoetryCollection from "../../public/homepage-poetry-collection.png";

import {
  formatPoemIndexDate,
  POEM_VISIBILITY_LABELS,
} from "@/features/posts/formatters";
import { getContentReaderScope } from "@/server/policies/access";
import { listRecentPublishedPoems } from "@/server/services/poems";

import styles from "./home.module.css";

export default async function HomePage() {
  const readerScope = await getContentReaderScope();
  const recentPoems = await listRecentPublishedPoems(3, readerScope);

  return (
    <>
      <section id="top" aria-labelledby="home-title" className={styles.hero}>
        <Image
          src={homepagePoetryCollection}
          alt="暖色光影下，磨损的《杂诗集》与一本翻开的诗稿摆在深色桌面上"
          fill
          preload
          sizes="100vw"
          className={styles.heroImage}
        />
        <div aria-hidden="true" className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <h1 id="home-title" className={styles.heroTitle}>
            初中三年留下的一些诗。
          </h1>
          <span aria-hidden="true" className={styles.heroRule} />
          <Link href="/poems" className={styles.editorialLink}>
            随便翻翻
            <span aria-hidden="true" className={styles.linkArrow}>
              →
            </span>
          </Link>
        </div>
      </section>

      <div className={styles.contentRegion}>
        <div className={styles.contentGrid}>
          <section
            aria-labelledby="recent-poems-title"
            className={styles.index}
          >
            <h2 id="recent-poems-title" className={styles.sectionTitle}>
              最新诗作
            </h2>

            {recentPoems.length > 0 ? (
              <ol className={styles.poemList}>
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
                    <p className={styles.poemAuthor}>
                      <span className={styles.poemAuthorName}>{poem.authorName}</span>
                      {poem.visibility === "members_only"
                        ? (
                            <>
                              <span
                                aria-hidden="true"
                                className={styles.poemVisibilitySeparator}
                              >
                                ·
                              </span>
                              <span className={styles.poemVisibilityLabel}>
                                {POEM_VISIBILITY_LABELS.members_only}
                              </span>
                            </>
                          )
                        : null}
                    </p>
                  </li>
                ))}
              </ol>
            ) : (
              <p className={styles.emptyState}>暂时还没有公开诗作。</p>
            )}

            <Link href="/poems" className={styles.editorialLink}>
              查看全部诗作
              <span aria-hidden="true" className={styles.linkArrow}>
                →
              </span>
            </Link>
          </section>

          <section
            id="about"
            aria-labelledby="about-title"
            className={styles.about}
          >
            <h2 id="about-title" className={styles.sectionTitle}>
              关于回中诗社
            </h2>
            <div className={styles.aboutCopy}>
              <p>
                诗社源自社长 Kevin 的创作，记录回中三班 2021—2024
                年的初中生活。这里收录同学随手写下的打油诗和班级趣事，不做严格的质量筛选，由同学利用业余时间维护。
              </p>

              <div>
                <h3 className={styles.criteriaTitle}>收录标准</h3>
                <ol className={styles.criteriaList}>
                  <li>最好是自己写的。</li>
                  <li>押韵随意。</li>
                  <li>一句话也算。</li>
                  <li>写具体同学时，请稍微收敛一点。</li>
                </ol>
              </div>

              <p className={styles.constructionNote}>
                网站还没修完，不过诗已经能看，也能写了。
              </p>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
