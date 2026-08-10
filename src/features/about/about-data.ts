export type ProjectEra = Readonly<{
  year: string;
  stage: string;
  title: string;
  reason: string;
  record: readonly string[];
  technology: readonly string[];
  source?: Readonly<{
    href: string;
    label: string;
  }>;
  sourceNote?: string;
}>;

export type PresentRole = Readonly<{
  label: string;
  title: string;
  description: string;
}>;

export type UpdateEntry = Readonly<{
  milestone: string;
  date: string;
  title: string;
  summary: string;
  items: readonly string[];
}>;

export type RoadmapEntry = Readonly<{
  status: "已完成" | "计划中" | "后续补充";
  title: string;
  summary: string;
  items: readonly string[];
}>;

export const PROJECT_ERAS: readonly ProjectEra[] = [
  {
    year: "2022",
    stage: "最初的网页",
    title: "HTML 静态页面",
    reason: "先给散在同学手里的诗作做一个能打开、能翻找的网上目录。",
    record: [
      "第一版有首页、成员页、作品目录和更新日志，共留下 6 个 HTML 文件和 3 个 CSS 文件。诗作目录与页面链接都要逐项手动填写，不少位置当时还只是预留地址。",
      "首页直接放了一张 1900×1000 的图片，源码注释里还留着“图片太大，移动端显示不了”。它很粗糙，却是回中诗社第一次真正出现在网页上。",
    ],
    technology: ["HTML", "CSS"],
    source: {
      href: "https://github.com/luckymouse2332/HuiZhongShiShe-HTML",
      label: "查看保留下来的 HTML 版本",
    },
  },
  {
    year: "2023",
    stage: "第一次加入后台",
    title: "Node.js 版本",
    reason: "静态页面已经装不下登录、投稿和数据管理，于是第一次给网站补上服务端。",
    record: [
      "这一版开始准备用户登录、个人信息、修改密码和投稿功能，作品与账号数据也计划放进 MySQL。页面仍然沿用 HTML、CSS 和 jQuery。",
      "仓库只留下了一次提交，能看到不少没有接完的部分，例如投稿路由已经写好，却还没有接入主应用。它更像一次从静态站走向完整网站的试验。",
    ],
    technology: ["Node.js", "Express", "MySQL", "jQuery", "JWT"],
    source: {
      href: "https://github.com/luckymouse2332/HuiZhongShiShe-NodeJS",
      label: "查看保留下来的 Node.js 版本",
    },
  },
  {
    year: "2024",
    stage: "一次完整重写",
    title: "Blazor 版本",
    reason: "前一版留下了太多半成品，我想用当时更熟悉的 C# 从头整理一次。",
    record: [
      "这次使用 Blazor 和 .NET 重写，完成度比前两版高，也是记忆里第一个比较成熟的版本。",
      "后来整理项目时，我因为不满意代码而失手删掉了源码。现在没有公开仓库可以回看，页面与功能细节也只能按照记忆留下一笔。",
    ],
    technology: ["C#", "Blazor", ".NET"],
    sourceNote: "源码已经删除，这一阶段只保留文字记录。",
  },
  {
    year: "2026",
    stage: "当前长期维护版",
    title: "Next.js 版本",
    reason: "旧版本已经中断，诗作和项目历史仍需要一个能够继续整理、部署和维护的落点。",
    record: [
      "这一次重新完成了邀请注册、登录、诗作草稿与发布、管理员审核和生产部署，也把项目历史与现有功能重新整理到同一个仓库。",
      "当前版本又补上了持久化站内通知、系统公告和成员公告阅读，公开页面、服务端逻辑和数据库访问仍放在一个 Next.js 应用中维护。它就是现在访问到的回中诗社网站。",
    ],
    technology: ["Next.js", "TypeScript", "PostgreSQL", "Drizzle ORM"],
  },
];

export const PRESENT_ROLES: readonly PresentRole[] = [
  {
    label: "留下诗作",
    title: "让散在同学手里的文字还能被找到",
    description:
      "这里继续收录初中时期写下的诗、打油诗和随手记下的句子，让它们不只留在旧文件和聊天记录里。",
  },
  {
    label: "写清来路",
    title: "把几次重写和失去的部分一并记下来",
    description:
      "公开仓库、技术变化和已经删除的源码都属于这份沿革。留下结果，也留下它为什么会变成今天这样。",
  },
  {
    label: "保持开放",
    title: "给偶然想起它的人留一个仍能打开的地址",
    description:
      "当前版本继续维护阅读、投稿、账号和通知。以后同学偶然想起来时，还能回来翻一翻，就够了。",
  },
];

export const UPDATE_ENTRIES = [
  {
    milestone: "M0",
    date: "2026.08.01",
    title: "把项目重新搭起来",
    summary:
      "先确定当前版本的目录、数据和部署方式，让后面的功能不再建立在临时页面上。",
    items: [
      "完成 Next.js 与 TypeScript 工程基线",
      "建立 PostgreSQL、版本化 migration、测试和容器部署流程",
    ],
  },
  {
    milestone: "M1",
    date: "2026.08.01",
    title: "成员入口",
    summary:
      "网站重新有了可使用的登录与账户页面，成员身份也能由服务端可靠确认。",
    items: ["完成登录、会话读取与登出", "建立受保护的账户页面"],
  },
  {
    milestone: "M2",
    date: "2026.08.02",
    title: "让诗作重新进入网站",
    summary:
      "诗作可以从草稿整理到公开发布，首页和作品目录也开始读取真实内容。",
    items: [
      "支持草稿创建、编辑、发布、撤回和删除",
      "完成公开诗作列表、详情与首页最近诗作",
    ],
  },
  {
    milestone: "M3",
    date: "2026.08.03",
    title: "邀请与管理功能",
    summary:
      "当前版本具备邀请成员、管理内容和保留管理记录所需的基本能力。",
    items: [
      "完成邀请码注册与成员、管理员权限边界",
      "加入诗作、用户封禁以及角色管理与审计记录",
    ],
  },
  {
    milestone: "M4",
    date: "2026.08.08",
    title: "访问控制与安全",
    summary:
      "进一步完善了安全机制和权限系统",
    items: [
      "添加了找回密码和邮箱验证功能",
      "在保留旧作品公开可读的基础上，作者可以控制作品公开与仅成员可见两种访问权限。"
    ],
  },
  {
    milestone: "M5",
    date: "2026.08.10",
    title: "站内通知与系统公告",
    summary:
      "站内通知已经形成从治理结果发现、系统公告发布到成员阅读的完整链路，通知记录持久保存，在线用户获得实时唤醒。",
    items: [
      "完成作品治理、账号状态和角色变更通知与分页通知中心",
      "完成系统公告草稿、受众快照、发布审计与成员详情阅读",
      "完成桌面通知预览、移动端通知入口和 Redis/SSE 实时唤醒",
    ],
  },
] as const satisfies readonly UpdateEntry[];

export const ROADMAP_ENTRIES: readonly RoadmapEntry[] = [
  {
    status: "计划中",
    title: "互动事件通知",
    summary: "在通用通知核心上继续接入点赞、评论、回复和收藏事件。",
    items: ["点赞提醒", "评论与回复提醒", "收藏提醒"],
  },
  {
    status: "计划中",
    title: "作品互动",
    summary: "在阅读作品的同时保留轻量的回应方式，逐步补充点赞、评论回复、收藏和分享。",
    items: ["点赞", "评论回复", "收藏", "分享"],
  },
  {
    status: "计划中",
    title: "诗集与特辑",
    summary: "把相关诗作和文章组织成可以连续阅读的一组内容，例如《回中史记》。",
    items: ["诗集", "特辑", "相关作品编排"],
  },
  {
    status: "计划中",
    title: "班史时间轴",
    summary: "按时间整理班级事件，并在事件旁关联相关诗作、文章和照片。",
    items: ["班级事件", "诗作与文章关联", "照片记录"],
  },
  {
    status: "计划中",
    title: "共同创作",
    summary: "支持多人一起完成一篇作品或一个特辑。",
    items: ["多人共同完成作品", "多人共同整理特辑"],
  },
  {
    status: "计划中",
    title: "xian歌",
    summary: "为神秘歌曲留下上传入口。",
    items: ["语音上传", "歌曲上传"],
  },
  {
    status: "后续补充",
    title: "其他功能",
    summary: "标签、头像、随机旧事、个人主页等内容会根据后续实际需求逐步补充。",
    items: ["标签", "头像", "随机旧事", "个人主页"],
  },
];
