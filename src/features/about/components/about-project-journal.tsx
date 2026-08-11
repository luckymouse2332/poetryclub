import {
  PRESENT_ROLES,
  PROJECT_ERAS,
  ROADMAP_ENTRIES,
  UPDATE_ENTRIES,
} from "@/features/about/about-data";

import styles from "./about-project-journal.module.css";

const RECENT_UPDATE_ENTRIES = UPDATE_ENTRIES.slice(-5).reverse();

export function AboutProjectJournal() {
  return (
    <article className={styles.page}>
      <header className={styles.intro}>
        <div className={styles.introFrame}>
          <p className={styles.folio}>诗社沿革 · 2021—2026</p>
          <div className={styles.introHeading}>
            <h1>关于回中诗社</h1>
            <p>
              一本初中时写出来的杂诗集，后来被我做成了网站。前前后后重写了好几次，现在又捡起来继续做。
            </p>
          </div>

          <div className={styles.prologue}>
            <div className={styles.prologueLabel}>
              <p>起因</p>
              <p>这网站哪来的</p>
            </div>
            <div className={styles.prologueCopy}>
              <p>
                回中诗社最早就是我们 2021—2024
                级3班几个同学初中时写诗留下来的东西。正经写的诗有，打油诗更多，此外还有班里的梗和当时发生的一些事。
              </p>
              <p>
                2022
                年，我第一次把这些东西做成网页。最开始就是几个静态页面，改内容都得直接改文件。后来想加登录、投稿和数据管理，就只能继续重写，技术也跟着换了好几套。
              </p>
              <p>
                初中毕业以后，诗社基本停了，网站也搁置过很长时间。不过旧仓库、电脑里的文件和原来的诗册都还在。后来再翻这些东西，才发现有些内容根本没有第二份：有的只在旧网页里，有的只在纸上，还有些只剩聊天记录。
              </p>
              <p>
                所以现在又把这个项目捡了起来。以前留下来的内容能找回多少就放回来，几个旧版本也顺便整理清楚，原来没做完或者已经不能用的功能重新做。现在这个网站还在更新，大概就是这么回事。
              </p>
            </div>
          </div>

          <p className={styles.originNote}>
            最早的公开仓库提交于 2022 年 8 月 28 日。
          </p>
        </div>
      </header>

      <section
        aria-labelledby="history-title"
        className={styles.historySection}
      >
        <div className={styles.sectionFrame}>
          <header className={styles.historyHeading}>
            <p className={styles.sectionLabel}>过去 · 01</p>
            <h2 id="history-title">重写记录</h2>
            <p>
              网站并没有按一开始想好的路线发展。每次重写，通常只是因为上一版已经装不下当时想加的东西，或者旧代码没有办法再继续维护。
            </p>
          </header>

          <ol className={styles.eraList}>
            {PROJECT_ERAS.map((era, index) => (
              <li key={era.year} className={styles.era}>
                <div className={styles.eraMeta}>
                  <time dateTime={era.year}>{era.year}</time>
                  <span>
                    {String(index + 1).padStart(2, "0")} / {era.stage}
                  </span>
                </div>
                <div className={styles.eraBody}>
                  <h3>{era.title}</h3>
                  <p className={styles.eraReason}>{era.reason}</p>
                  <div className={styles.eraRecord}>
                    {era.record.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                  <div className={styles.eraFooter}>
                    <p className={styles.stackLine}>
                      <span>当时使用</span>
                      {era.technology.join(" · ")}
                    </p>
                    {era.source ? (
                      <a
                        href={era.source.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.sourceLink}
                        aria-label={`${era.source.label}（新窗口打开）`}
                      >
                        {era.source.label}
                        <span aria-hidden="true">↗</span>
                      </a>
                    ) : null}
                    {era.sourceNote ? (
                      <p className={styles.sourceNote}>{era.sourceNote}</p>
                    ) : null}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section
        aria-labelledby="present-title"
        className={styles.presentSection}
      >
        <div className={styles.sectionFrame}>
          <header className={styles.presentHeading}>
            <div>
              <p className={styles.sectionLabel}>现在 · 02</p>
              <h2 id="present-title">当前状态</h2>
            </div>
            <p>
              把以前写过的诗整理下来，继续收新写的东西，也把这个网站本身留下来。
            </p>
          </header>

          <div className={styles.presentGrid}>
            {PRESENT_ROLES.map((role) => (
              <section key={role.label} className={styles.presentRole}>
                <p>{role.label}</p>
                <h3>{role.title}</h3>
                <p>{role.description}</p>
              </section>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="future-title" className={styles.futureSection}>
        <div className={styles.sectionFrame}>
          <header className={styles.futureHeading}>
            <p className={styles.sectionLabel}>未来 · 03</p>
            <h2 id="future-title">未来展望</h2>
            <p>
              M5
              完成后，路线会继续围绕站内阅读、作品整理和班级记忆展开。下面记录当前已经确定的方向，具体范围会在每个任务开始前再次确认。
            </p>
          </header>

          <ul className={styles.roadmapList}>
            {ROADMAP_ENTRIES.map((entry) => (
              <li key={entry.title} className={styles.roadmapItem}>
                <p className={styles.roadmapStatus}>{entry.status}</p>
                <h3>{entry.title}</h3>
                <p>{entry.summary}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        aria-labelledby="updates-title"
        className={styles.updatesSection}
      >
        <div className={styles.updatesFrame}>
          <header className={styles.updatesHeading}>
            <div>
              <p className={styles.sectionLabel}>附录</p>
              <h2 id="updates-title">更新记录</h2>
            </div>
            <p>
              这里只保留最近五次值得记下的阶段，不展开每一次技术调整。当前记录更新到
              M5 站内通知与系统公告。
            </p>
          </header>

          <ol className={styles.updateList}>
            {RECENT_UPDATE_ENTRIES.map((entry) => (
              <li key={entry.milestone}>
                <div className={styles.updateMeta}>
                  <span>{entry.milestone}</span>
                  <time dateTime={entry.date.replaceAll(".", "-")}>
                    {entry.date}
                  </time>
                </div>
                <div className={styles.updateBody}>
                  <h3>{entry.title}</h3>
                  <p>{entry.summary}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <footer className={styles.colophon}>
        <p className={styles.colophonTitle}>回中诗社</p>
        <p>诗社沿革 · 2021—2026</p>
        <p>Created by Kevin, maintained by luckymouse2332</p>
      </footer>
    </article>
  );
}
