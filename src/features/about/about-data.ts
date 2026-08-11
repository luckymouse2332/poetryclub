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
    reason:
      "最早就是几个 HTML 页面，功能基本没有，能把诗放上去就算成功。当时也没想过以后真会继续做。",
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
    reason:
      "后来嫌静态页面太难改，又重写了一遍。这次开始有了后端，不过做得还是很随意，很多东西后来也没留下来。",
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
    reason:
      "又换成了 Blazor。主要是当时正好在学 .NET，就拿这个网站试手。现在回头看，这一版其实也没活多久。",
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
    reason:
      "到高中以后又把这个项目捡了起来，这次直接重新做成了现在的版本。账号、投稿、权限、通知这些东西也是这一版才真正补起来的。",
    record: [
      "这一次重新完成了登录、诗作草稿与发布、管理员审核。此外，还增加了邀请注册、邮箱验证、密码重置等之前没做过的新功能",
      "当前版本又补上了持久化站内通知、系统公告和成员公告阅读。它就是现在访问到的回中诗社网站。",
    ],
    technology: ["Next.js", "TypeScript", "PostgreSQL", "Drizzle ORM"],
  },
];

export const PRESENT_ROLES: readonly PresentRole[] = [
  {
    label: "留下诗作",
    title: "让散在同学手里的诗作还能被找到",
    description:
      "这里继续收录初中时期写下的诗、打油诗和随手记下的句子，让它们不只留在旧文件和聊天记录里。",
  },
  {
    label: "写清来路",
    title: "把几次重写的经历也记下来",
    description:
      "公开仓库、技术变化和已经删除的源码都属于这份沿革。能找回来的就补回来，顺便说说几次改版是怎么回事。",
  },
  {
    label: "保持开放",
    title: "给偶然想起它的人留一个仍能打开的地址",
    description:
      "网站现在还在更新。投稿、账号、通知这些先做完整，评论、点赞、诗集之类的功能后面再看大家是不是真用得上。",
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
    summary: "诗作可以从草稿整理到公开发布，首页和作品目录也开始读取真实内容。",
    items: [
      "支持草稿创建、编辑、发布、撤回和删除",
      "完成公开诗作列表、详情与首页最近诗作",
    ],
  },
  {
    milestone: "M3",
    date: "2026.08.03",
    title: "邀请与管理功能",
    summary: "当前版本具备邀请成员、管理内容和保留管理记录所需的基本能力。",
    items: [
      "完成邀请码注册与成员、管理员权限边界",
      "加入诗作、用户封禁以及角色管理与审计记录",
    ],
  },
  {
    milestone: "M4",
    date: "2026.08.08",
    title: "访问控制与安全",
    summary: "进一步完善了安全机制和权限系统",
    items: [
      "添加了找回密码和邮箱验证功能",
      "在保留旧作品公开可读的基础上，作者可以控制作品公开与仅成员可见两种访问权限。",
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
  {
    milestone: "M6",
    date: "2026.08.11",
    title: "界面与用户体验优化",
    summary:
      "优化了桌面端的屏幕利用效率，简化了移动端导航栏设计",
    items: [
      "桌面端实现了多栏布局，减少了屏幕空白，增强了信息密度",
      "移动端引入了抽屉导航和简易头像，没有引入头像图片",
      "优化了下拉菜单的切换动画",
    ],
  },
] as const satisfies readonly UpdateEntry[];

export const ROADMAP_ENTRIES: readonly RoadmapEntry[] = [
  {
    status: "计划中",
    title: "作品互动",
    summary:
      "在阅读作品的同时保留轻量的回应方式，逐步补充点赞、评论回复、收藏和分享。",
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
