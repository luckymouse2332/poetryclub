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
              一本初中时期留下来的杂诗集，后来被整理成网站，也因此有了几次几乎从头开始的重写。
            </p>
          </div>

          <div className={styles.prologue}>
            <div className={styles.prologueLabel}>
              <p>序言</p>
              <p>这里为什么还在</p>
            </div>
            <div className={styles.prologueCopy}>
              <p>
                回中诗社最早来自 2021—2024
                级同学在初中时写下的诗。里面既有认真写的作品，也有打油诗、随手记下的句子和班里发生过的小事。
              </p>
              <p>
                2022
                年，我开始把这些内容放进网页。最初只是几个需要手动更新的静态页面，后来为了登录、投稿和数据管理，又一次次换技术重写。
              </p>
              <p>
                初中毕业以后，诗社没有一直按原来的方式活动，网站也停过很长时间。但每次整理电脑、翻到旧仓库，还是会看到当时写下的文字、写坏的样式和没有做完的功能。它们和那几年真实发生过的事情混在一起，删掉以后很难再补回来。
              </p>
              <p>
                所以我打算重新制作，把版本历史写清楚，把已经不能使用的部分重新做一遍。我把它当作自己的旧项目继续维护。
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
            <h2 id="history-title">四次迁徙</h2>
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
              <h2 id="present-title">现在它向时间敞开</h2>
            </div>
            <p>
              现在，我把杂诗集的来源、几次重写和仍在维护的版本放进同一份记录里。它今天承担的事情，可以归到下面三个方向。
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
            <h2 id="future-title">接下来准备做什么</h2>
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

      <section aria-labelledby="updates-title" className={styles.updatesSection}>
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
