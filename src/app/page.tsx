import { buttonVariants } from "@/components/ui/button";

const features = [
  {
    title: "作品广场",
    description: "浏览同学发布的原创诗歌，按时间与热度发现好作品。",
  },
  {
    title: "发布作品",
    description: "用纯文本或受限 Markdown 记录你的原创诗歌。",
  },
  {
    title: "评论与点赞",
    description: "对作品表达感受，和同好交流创作心得。",
  },
];

export default function HomePage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-16">
      <section className="text-center">
        <p className="text-sm font-medium text-primary">回中校园诗歌兴趣社区</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">回中诗社</h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          一个属于校园的诗意角落。分享原创诗歌，遇见同好，记录青春。
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <a className={buttonVariants()} href="#features">
            开始探索
          </a>
        </div>
      </section>

      <section id="features" className="mt-24">
        <h2 className="text-center text-2xl font-semibold tracking-tight">
          即将到来
        </h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm"
            >
              <h3 className="font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
        <p className="mt-12 text-center text-sm text-muted-foreground">
          工程基线（M0）搭建中，社区功能将在后续迭代逐步开放。
        </p>
      </section>
    </div>
  );
}
