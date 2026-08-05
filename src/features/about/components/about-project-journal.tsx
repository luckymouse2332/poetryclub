import {
  CURRENT_VERSION_GROUPS,
  FUTURE_PLANS,
  PROJECT_ERAS,
  UPDATE_ENTRIES,
} from "@/features/about/about-data";

import styles from "./about-project-journal.module.css";

export function AboutProjectJournal() {
  return (
    <article className={styles.page}>
      <header className={styles.hero}>
        <div className={styles.heroHeading}>
          <p className={styles.folio}>项目档案 · 2022—2026</p>
          <h1>回中诗社</h1>
          <p className={styles.heroSummary}>
            一本初中时期留下来的杂诗集，后来被整理成网站，经历了几次几乎从头开始的重写。
          </p>
        </div>

        <div className={styles.heroRecord}>
          <div className={styles.introduction}>
            <p>
              回中诗社最早来自 2021—2024
              级同学在初中时写下的诗。里面既有认真写的作品，也有打油诗、随手记下的句子和班里发生过的小事。
            </p>
            <p>
              2022
              年，我开始把这些内容放进网页。最初只是几个需要手动更新的静态页面，后来为了登录、投稿和数据管理，又一次次换技术重写。
            </p>
            <p>
              现在，我把杂诗集的来源、几次重写和仍在维护的版本放进同一份记录里。
            </p>
          </div>

          <dl className={styles.archiveFacts}>
            <div>
              <dt>内容来源</dt>
              <dd>初中时期同学们写下的杂诗</dd>
            </div>
            <div>
              <dt>网站起点</dt>
              <dd>2022 年的 HTML 静态页面</dd>
            </div>
            <div>
              <dt>当前版本</dt>
              <dd>2026 年开始维护的 Next.js 版本</dd>
            </div>
          </dl>
        </div>

        <p className={styles.heroNote}>
          最早的公开仓库提交于 2022 年 8 月 28 日。
        </p>
      </header>

      <div className={styles.journal}>
        <section
          aria-labelledby="maintenance-title"
          className={styles.journalSection}
        >
          <div className={styles.sectionMarker} aria-hidden="true">
            01
          </div>
          <div className={styles.sectionContent}>
            <div className={styles.sectionHeading}>
              <p>继续维护</p>
              <h2 id="maintenance-title">几年以后，为什么还在做</h2>
            </div>
            <div className={styles.maintenanceRecord}>
              <p className={styles.sectionLead}>
                初中毕业以后，诗社没有一直按原来的方式活动，网站也停过很长时间。
              </p>
              <div className={styles.readingCopy}>
                <p>
                  但每次整理电脑、翻到旧仓库，还是会看到当时写下的文字、写坏的样式和没有做完的功能。它们和那几年真实发生过的事情混在一起，删掉以后很难再补回来。
                </p>
                <p>
                  所以我打算重新制作，把版本历史写清楚，把已经不能使用的部分重新做一遍。我把它当作自己的旧项目继续维护。
                </p>
                <p>以后同学偶然想起来时，这个地址还能打开看看，就够了。</p>
              </div>
            </div>
          </div>
        </section>

        <section
          aria-labelledby="history-title"
          className={styles.journalSection}
        >
          <div className={styles.sectionMarker} aria-hidden="true">
            02
          </div>
          <div className={styles.sectionContent}>
            <div className={styles.sectionHeading}>
              <p>网站发展历程</p>
              <h2 id="history-title">四次重做</h2>
            </div>
            <p className={styles.sectionTransition}>
              网站并没有按一开始想好的路线发展。每次重写，通常只是因为上一版已经装不下当时想加的东西，或者旧代码没有办法再继续维护。
            </p>

            <ol className={styles.eraList}>
              {PROJECT_ERAS.map((era) => (
                <li key={era.year} className={styles.era}>
                  <div className={styles.eraMeta}>
                    <time>{era.year}</time>
                    <span>{era.stage}</span>
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
          aria-labelledby="current-version-title"
          className={styles.journalSection}
        >
          <div className={styles.sectionMarker} aria-hidden="true">
            03
          </div>
          <div className={styles.sectionContent}>
            <div className={styles.sectionHeading}>
              <p>当前版本</p>
              <h2 id="current-version-title">现在访问到的网站</h2>
            </div>
            <p className={styles.sectionTransition}>
              时间轴最后的 Next.js
              版本就是目前长期维护的版本。页面、账号数据和部署仍集中在一个项目里，所用技术按实际职责分成下面三组。
            </p>

            <div className={styles.currentVersionGrid}>
              {CURRENT_VERSION_GROUPS.map((group) => (
                <section key={group.label} className={styles.currentVersionGroup}>
                  <h3>{group.label}</h3>
                  <p>{group.description}</p>
                  <ul>
                    {group.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </div>
        </section>

        <section
          aria-labelledby="updates-title"
          className={styles.journalSection}
        >
          <div className={styles.sectionMarker} aria-hidden="true">
            04
          </div>
          <div className={styles.sectionContent}>
            <div className={styles.sectionHeading}>
              <p>更新记录</p>
              <h2 id="updates-title">当前版本是怎样补回来的</h2>
            </div>
            <p className={styles.sectionTransition}>
              2026 年的重写分成了几个阶段。这里不列每次小修，只保留从工程基线到管理功能的四次主要更新。
            </p>

            <ol className={styles.updateList}>
              {UPDATE_ENTRIES.map((entry) => (
                <li key={entry.milestone}>
                  <div className={styles.updateMeta}>
                    <span>{entry.milestone}</span>
                    <time>{entry.date}</time>
                  </div>
                  <div className={styles.updateBody}>
                    <h3>{entry.title}</h3>
                    <p>{entry.summary}</p>
                    <ul>
                      {entry.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section
          aria-labelledby="future-title"
          className={styles.futureSection}
        >
          <div className={styles.sectionMarker} aria-hidden="true">
            05
          </div>
          <div className={styles.sectionContent}>
            <div className={styles.sectionHeading}>
              <p>未来计划</p>
              <h2 id="future-title">接下来准备继续整理的内容</h2>
            </div>
            <ul className={styles.futureList}>
              {FUTURE_PLANS.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      <footer className={styles.colophon}>
        <p className={styles.colophonTitle}>回中诗社</p>
        <p>项目档案 · 2022—2026</p>
        <p>Created by Kevin, maintained by luckymouse2332</p>
      </footer>
    </article>
  );
}
