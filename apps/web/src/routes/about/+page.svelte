<script lang="ts">
  import { onMount } from 'svelte';

  let mounted = false;

  onMount(() => {
    mounted = true;
  });
</script>

<svelte:head>
  <title>关于我们 - 回中诗社</title>
  <meta
    name="description"
    content="回中诗社 - 传承中华诗词文化，分享诗词之美"
  />
</svelte:head>

<div class="container mx-auto px-4 py-8 max-w-4xl">
  <!-- 页面标题 -->
  <div class="text-center mb-12">
    <h1
      class="text-4xl md:text-5xl font-bold poetry-text-primary mb-4 font-kai"
    >
      关于回中诗社
    </h1>
    <div
      class="w-24 h-1 bg-gradient-to-r from-amber-400 to-orange-500 mx-auto rounded-full"
    ></div>
  </div>

  <!-- 主要内容 -->
  <div class="space-y-12">
    <!-- 网站介绍 -->
    <section
      class="poetry-card p-8 rounded-xl border-2 poetry-border"
      class:animate-fade-in={mounted}
    >
      <h2
        class="text-2xl font-bold poetry-text-primary mb-6 font-kai flex items-center"
      >
        <span class="text-3xl mr-3">🏛️</span>
        网站简介
      </h2>
      <div
        class="prose prose-lg max-w-none poetry-text-primary font-kai leading-relaxed"
      >
        <p class="text-lg mb-4">
          回中诗社是一个专注于中华古典诗词文化传承与分享的在线平台。我们致力于为诗词爱好者提供一个优雅、纯净的交流空间，让千年诗韵在数字时代重新焕发光彩。
        </p>
        <p class="text-lg mb-4">
          在这里，您可以欣赏经典诗词，分享创作心得，与志同道合的朋友一起品味文字之美，感受中华文化的博大精深。
        </p>
      </div>
    </section>

    <!-- 功能特色 -->
    <section
      class="poetry-card p-8 rounded-xl border-2 poetry-border"
      class:animate-fade-in={mounted}
    >
      <h2
        class="text-2xl font-bold poetry-text-primary mb-6 font-kai flex items-center"
      >
        <span class="text-3xl mr-3">✨</span>
        功能特色
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="flex items-start space-x-4">
          <div class="text-2xl">📖</div>
          <div>
            <h3 class="font-bold poetry-text-primary mb-2">诗词欣赏</h3>
            <p class="poetry-text-secondary">
              精选古今诗词名篇，配以详细注释和赏析
            </p>
          </div>
        </div>
        <div class="flex items-start space-x-4">
          <div class="text-2xl">💬</div>
          <div>
            <h3 class="font-bold poetry-text-primary mb-2">互动交流</h3>
            <p class="poetry-text-secondary">与诗友分享感悟，交流创作心得</p>
          </div>
        </div>
        <div class="flex items-start space-x-4">
          <div class="text-2xl">🎨</div>
          <div>
            <h3 class="font-bold poetry-text-primary mb-2">优雅设计</h3>
            <p class="poetry-text-secondary">古典美学与现代设计的完美融合</p>
          </div>
        </div>
        <div class="flex items-start space-x-4">
          <div class="text-2xl">🌙</div>
          <div>
            <h3 class="font-bold poetry-text-primary mb-2">主题切换</h3>
            <p class="poetry-text-secondary">支持明暗主题，适应不同阅读习惯</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 文化使命 -->
    <section
      class="poetry-card p-8 rounded-xl border-2 poetry-border"
      class:animate-fade-in={mounted}
    >
      <h2
        class="text-2xl font-bold poetry-text-primary mb-6 font-kai flex items-center"
      >
        <span class="text-3xl mr-3">🌸</span>
        文化使命
      </h2>
      <div class="space-y-4 poetry-text-primary font-kai leading-relaxed">
        <blockquote class="border-l-4 border-amber-400 pl-6 italic text-lg">
          "诗言志，歌咏言。"
        </blockquote>
        <p class="text-lg">
          我们相信，诗词不仅是文学艺术的瑰宝，更是中华民族精神文化的重要载体。通过现代技术手段，我们希望让更多人能够接触、理解并爱上中华诗词文化。
        </p>
        <p class="text-lg">
          让古典诗词在新时代绽放新的光芒，让诗意生活成为现代人的精神追求，这是我们不懈的努力方向。
        </p>
      </div>
    </section>

    <!-- 技术架构 - 前后端分离展示 -->
    <section
      class="poetry-card p-8 rounded-xl border-2 poetry-border"
      class:animate-fade-in={mounted}
    >
      <h2
        class="text-2xl font-bold poetry-text-primary mb-6 font-kai flex items-center"
      >
        <span class="text-3xl mr-3">⚡</span>
        技术架构
      </h2>

      <!-- 前端技术 -->
      <div class="mb-8">
        <h3
          class="text-lg font-bold poetry-text-primary mb-4 font-kai flex items-center"
        >
          <span class="text-xl mr-2">🎨</span>
          前端技术
        </h3>
        <div class="flex flex-wrap justify-center gap-3 md:gap-4">
          <div
            class="flex items-center poetry-surface-200 px-4 py-3 rounded-lg min-w-0 flex-shrink-0"
          >
            <div class="text-xl mr-3">🚀</div>
            <div class="text-center">
              <div class="font-bold poetry-text-primary text-sm">SvelteKit</div>
              <div class="text-xs poetry-text-secondary">前端框架</div>
            </div>
          </div>
          <div
            class="flex items-center poetry-surface-200 px-4 py-3 rounded-lg min-w-0 flex-shrink-0"
          >
            <div class="text-xl mr-3">🎨</div>
            <div class="text-center">
              <div class="font-bold poetry-text-primary text-sm">
                Tailwind CSS
              </div>
              <div class="text-xs poetry-text-secondary">样式框架</div>
            </div>
          </div>
          <div
            class="flex items-center poetry-surface-200 px-4 py-3 rounded-lg min-w-0 flex-shrink-0"
          >
            <div class="text-xl mr-3">🛠️</div>
            <div class="text-center">
              <div class="font-bold poetry-text-primary text-sm">
                TypeScript
              </div>
              <div class="text-xs poetry-text-secondary">开发语言</div>
            </div>
          </div>
          <div
            class="flex items-center poetry-surface-200 px-4 py-3 rounded-lg min-w-0 flex-shrink-0"
          >
            <div class="text-xl mr-3">📱</div>
            <div class="text-center">
              <div class="font-bold poetry-text-primary text-sm">
                响应式设计
              </div>
              <div class="text-xs poetry-text-secondary">多端适配</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 分隔线 -->
      <div class="flex items-center my-6">
        <div
          class="flex-1 h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent"
        ></div>
        <div class="px-4 poetry-text-muted text-sm font-kai">技术栈</div>
        <div
          class="flex-1 h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent"
        ></div>
      </div>

      <!-- 后端技术 -->
      <div>
        <h3
          class="text-lg font-bold poetry-text-primary mb-4 font-kai flex items-center"
        >
          <span class="text-xl mr-2">⚙️</span>
          后端技术
        </h3>
        <div class="flex flex-wrap justify-center gap-3 md:gap-4">
          <div
            class="flex items-center poetry-surface-200 px-4 py-3 rounded-lg min-w-0 flex-shrink-0"
          >
            <div class="text-xl mr-3">🟢</div>
            <div class="text-center">
              <div class="font-bold poetry-text-primary text-sm">NestJS</div>
              <div class="text-xs poetry-text-secondary">后端框架</div>
            </div>
          </div>
          <div
            class="flex items-center poetry-surface-200 px-4 py-3 rounded-lg min-w-0 flex-shrink-0"
          >
            <div class="text-xl mr-3">🗄️</div>
            <div class="text-center">
              <div class="font-bold poetry-text-primary text-sm">Prisma</div>
              <div class="text-xs poetry-text-secondary">数据库ORM</div>
            </div>
          </div>
          <div
            class="flex items-center poetry-surface-200 px-4 py-3 rounded-lg min-w-0 flex-shrink-0"
          >
            <div class="text-xl mr-3">🐘</div>
            <div class="text-center">
              <div class="font-bold poetry-text-primary text-sm">
                PostgreSQL
              </div>
              <div class="text-xs poetry-text-secondary">数据库</div>
            </div>
          </div>
          <div
            class="flex items-center poetry-surface-200 px-4 py-3 rounded-lg min-w-0 flex-shrink-0"
          >
            <div class="text-xl mr-3">🐳</div>
            <div class="text-center">
              <div class="font-bold poetry-text-primary text-sm">Docker</div>
              <div class="text-xs poetry-text-secondary">容器化</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 版本更新记录 -->
    <section
      class="poetry-card p-8 rounded-xl border-2 poetry-border"
      class:animate-fade-in={mounted}
    >
      <h2
        class="text-2xl font-bold poetry-text-primary mb-6 font-kai flex items-center"
      >
        <span class="text-3xl mr-3">📋</span>
        版本更新记录
      </h2>

      <!-- 版本时间线 -->
      <div class="relative">
        <!-- 时间线主线 -->
        <div
          class="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-400 via-amber-400 to-green-600"
        ></div>

        <!-- 未来版本规划分隔线 -->
        <div class="relative flex items-center mb-8">
          <div
            class="absolute left-8 w-0.5 h-8 bg-gradient-to-b from-amber-400 to-amber-500"
          ></div>
          <div class="ml-20 flex-1 flex items-center">
            <div
              class="flex-1 h-px bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500"
            ></div>
            <div
              class="px-6 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-full text-sm font-kai font-bold shadow-lg"
            >
              🚀 未来规划
            </div>
            <div
              class="flex-1 h-px bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300"
            ></div>
          </div>
        </div>

        <!-- V4.0 未来版本 -->
        <div class="relative flex items-start mb-8">
          <div
            class="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-700 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg"
          >
            V4
          </div>
          <div class="ml-6 flex-1">
            <div
              class="poetry-surface p-6 rounded-lg border-l-4 border-purple-500 shadow-sm"
            >
              <div class="flex items-center justify-between mb-3">
                <h3
                  class="text-lg font-bold poetry-text-primary font-kai"
                >
                  V4.0 - AI智能时代
                </h3>
                <span
                  class="text-sm text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-800 px-3 py-1 rounded-full"
                  >规划中</span
                >
              </div>
              <p class="poetry-text-secondary mb-3 text-sm">
                预计2025年 - AI辅助创作，智能推荐
              </p>
              <div class="space-y-2">
                <div class="flex items-center text-sm">
                  <span class="text-amber-500 mr-2">🤖</span>
                  <span class="poetry-text-primary"
                    >AI辅助创作：自动生成诗题、下一句灵感</span
                  >
                </div>
                <div class="flex items-center text-sm">
                  <span class="text-amber-500 mr-2">✨</span>
                  <span class="poetry-text-primary"
                    >智能润色工具，评估语感、节奏建议</span
                  >
                </div>
                <div class="flex items-center text-sm">
                  <span class="text-amber-500 mr-2">🎨</span>
                  <span class="poetry-text-primary"
                    >海报生成与分享，一键生成精美图片</span
                  >
                </div>
                <div class="flex items-center text-sm">
                  <span class="text-amber-500 mr-2">🏆</span>
                  <span class="poetry-text-primary"
                    >活动系统：征文比赛、主题创作活动</span
                  >
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- V3.5 中期版本 -->
        <div class="relative flex items-start mb-8">
          <div
            class="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-700 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg"
          >
            V3.5
          </div>
          <div class="ml-6 flex-1">
            <div
              class="poetry-surface p-6 rounded-lg border-l-4 border-indigo-500 shadow-sm"
            >
              <div class="flex items-center justify-between mb-3">
                <h3
                  class="text-lg font-bold poetry-text-primary font-kai"
                >
                  V3.5 - 社区互动增强
                </h3>
                <span
                  class="text-sm text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-800 px-3 py-1 rounded-full"
                  >开发中</span
                >
              </div>
              <p class="poetry-text-secondary mb-3 text-sm">
                预计2024年底 - 完善社区功能，增强用户互动
              </p>
              <div class="space-y-2">
                <div class="flex items-center text-sm">
                  <span class="text-amber-500 mr-2">💬</span>
                  <span class="poetry-text-primary"
                    >点赞与评论系统，支持楼层结构回复</span
                  >
                </div>
                <div class="flex items-center text-sm">
                  <span class="text-amber-500 mr-2">🔔</span>
                  <span class="poetry-text-primary"
                    >消息与通知中心，实时互动提醒</span
                  >
                </div>
                <div class="flex items-center text-sm">
                  <span class="text-amber-500 mr-2">⭐</span>
                  <span class="poetry-text-primary"
                    >收藏与关注功能，建立诗友圈</span
                  >
                </div>
                <div class="flex items-center text-sm">
                  <span class="text-amber-500 mr-2">🚨</span>
                  <span class="poetry-text-primary"
                    >举报系统，维护社区环境</span
                  >
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- V3.2 近期版本 -->
        <div class="relative flex items-start mb-8">
          <div
            class="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-700 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg"
          >
            V3.2
          </div>
          <div class="ml-6 flex-1">
            <div
              class="poetry-surface p-6 rounded-lg border-l-4 border-teal-500 shadow-sm"
            >
              <div class="flex items-center justify-between mb-3">
                <h3
                  class="text-lg font-bold poetry-text-primary font-kai"
                >
                  V3.2 - 内容发现优化
                </h3>
                <span
                  class="text-sm text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-800 px-3 py-1 rounded-full"
                  >即将发布</span
                >
              </div>
              <p class="poetry-text-secondary mb-3 text-sm">
                预计2024年中 - 搜索分类，内容发现
              </p>
              <div class="space-y-2">
                <div class="flex items-center text-sm">
                  <span class="text-amber-500 mr-2">🔍</span>
                  <span class="poetry-text-primary"
                    >全文搜索功能，按标题、作者、内容搜索</span
                  >
                </div>
                <div class="flex items-center text-sm">
                  <span class="text-amber-500 mr-2">🏷️</span>
                  <span class="poetry-text-primary"
                    >分类与标签系统，主题化内容组织</span
                  >
                </div>
                <div class="flex items-center text-sm">
                  <span class="text-amber-500 mr-2">📊</span>
                  <span class="poetry-text-primary"
                    >热门榜单：每日/每周/每月优秀作品</span
                  >
                </div>
                <div class="flex items-center text-sm">
                  <span class="text-amber-500 mr-2">🎯</span>
                  <span class="poetry-text-primary"
                    >智能推荐算法，个性化内容推送</span
                  >
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 当前版本分隔线 -->
        <div class="relative flex items-center my-8">
          <div
            class="absolute left-8 w-0.5 h-8 bg-gradient-to-b from-teal-600 to-amber-400"
          ></div>
          <div class="ml-20 flex-1 flex items-center">
            <div
              class="flex-1 h-px bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500"
            ></div>
            <div
              class="px-6 py-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-full text-sm font-kai font-bold shadow-lg"
            >
              ✨ 当前版本
            </div>
            <div
              class="flex-1 h-px bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300"
            ></div>
          </div>
        </div>

        <!-- V3.0 当前版本 -->
        <div class="relative flex items-start mb-8">
          <div
            class="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-700 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg"
          >
            V3
          </div>
          <div class="ml-6 flex-1">
            <div
              class="poetry-surface p-6 rounded-lg border-l-4 border-amber-500 shadow-sm"
            >
              <div class="flex items-center justify-between mb-3">
                <h3
                  class="text-lg font-bold poetry-text-primary font-kai"
                >
                  V3.0 - 现代化重构
                </h3>
                <span
                  class="text-sm text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-800 px-3 py-1 rounded-full"
                  >当前版本</span
                >
              </div>
              <p class="poetry-text-secondary mb-3 text-sm">
                2024年 - 全面现代化，前后端分离架构
              </p>
              <div class="space-y-2">
                <div class="flex items-center text-sm">
                  <span class="text-amber-500 mr-2">🎨</span>
                  <span class="poetry-text-primary"
                    >全新UI设计，诗意美学界面</span
                  >
                </div>
                <div class="flex items-center text-sm">
                  <span class="text-amber-500 mr-2">🌙</span>
                  <span class="poetry-text-primary">深色模式支持</span>
                </div>
                <div class="flex items-center text-sm">
                  <span class="text-amber-500 mr-2">📝</span>
                  <span class="poetry-text-primary">富文本编辑器</span>
                </div>
                <div class="flex items-center text-sm">
                  <span class="text-amber-500 mr-2">👤</span>
                  <span class="poetry-text-primary">用户系统与个人主页</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 历史版本分隔线 -->
        <div class="relative flex items-center my-8">
          <div
            class="absolute left-8 w-0.5 h-8 bg-gradient-to-b from-amber-600 to-blue-400"
          ></div>
          <div class="ml-20 flex-1 flex items-center">
            <div
              class="flex-1 h-px bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500"
            ></div>
            <div
              class="px-6 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-full text-sm font-kai font-bold shadow-lg"
            >
              📚 历史版本
            </div>
            <div
              class="flex-1 h-px bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300"
            ></div>
          </div>
        </div>

        <!-- V2.0 -->
        <div class="relative flex items-start mb-8">
          <div
            class="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-700 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg"
          >
            V2
          </div>
          <div class="ml-6 flex-1">
            <div
              class="poetry-surface p-6 rounded-lg border-l-4 border-blue-500 shadow-sm"
            >
              <div class="flex items-center justify-between mb-3">
                <h3
                  class="text-lg font-bold poetry-text-primary font-kai"
                >
                  V2.0 - .NET时代
                </h3>
                <span
                  class="text-sm poetry-text-secondary poetry-surface-100 px-3 py-1 rounded-full"
                  >已停用</span
                >
              </div>
              <p class="poetry-text-secondary mb-3 text-sm">
                2023年 - 企业级框架，前后端一体化
              </p>
              <div class="space-y-2">
                <div class="flex items-center text-sm">
                  <span class="text-amber-500 mr-2">•</span>
                  <span class="poetry-text-primary"
                    >ASP.NET Core + Blazor Server</span
                  >
                </div>
                <div class="flex items-center text-sm">
                  <span class="text-amber-500 mr-2">•</span>
                  <span class="poetry-text-primary"
                    >前后端不分离，服务端渲染</span
                  >
                </div>
                <div class="flex items-center text-sm">
                  <span class="text-amber-500 mr-2">•</span>
                  <span class="poetry-text-primary"
                    >Entity Framework Core + PostgreSQL</span
                  >
                </div>
                <div class="flex items-center text-sm">
                  <span class="text-amber-500 mr-2">•</span>
                  <span class="poetry-text-primary"
                    >组件化开发，实时交互体验</span
                  >
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- V1.0 -->
        <div class="relative flex items-start">
          <div
            class="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-700 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg"
          >
            V1
          </div>
          <div class="ml-6 flex-1">
            <div
              class="poetry-surface p-6 rounded-lg border-l-4 border-green-500 shadow-sm"
            >
              <div class="flex items-center justify-between mb-3">
                <h3
                  class="text-lg font-bold poetry-text-primary font-kai"
                >
                  V1.0 - 初创版本
                </h3>
                <span
                  class="text-sm poetry-text-secondary poetry-surface-100 px-3 py-1 rounded-full"
                  >已停用</span
                >
              </div>
              <p class="poetry-text-secondary mb-3 text-sm">
                2022年 - 项目起步，传统Web开发
              </p>
              <div class="space-y-2">
                <div class="flex items-center text-sm">
                  <span class="text-amber-500 mr-2">•</span>
                  <span class="poetry-text-primary"
                    >Node.js + Express.js</span
                  >
                </div>
                <div class="flex items-center text-sm">
                  <span class="text-amber-500 mr-2">•</span>
                  <span class="poetry-text-primary"
                    >传统MVC架构，服务端渲染</span
                  >
                </div>
                <div class="flex items-center text-sm">
                  <span class="text-amber-500 mr-2">•</span>
                  <span class="poetry-text-primary"
                    >MongoDB数据库，简单CRUD</span
                  >
                </div>
                <div class="flex items-center text-sm">
                  <span class="text-amber-500 mr-2">•</span>
                  <span class="poetry-text-primary"
                    >基础功能实现，奠定项目基础</span
                  >
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 联系方式 -->
    <section
      class="poetry-card p-8 rounded-xl border-2 poetry-border text-center"
      class:animate-fade-in={mounted}
    >
      <h2
        class="text-2xl font-bold poetry-text-primary mb-6 font-kai flex items-center justify-center"
      >
        <span class="text-3xl mr-3">📮</span>
        联系我们
      </h2>
      <div class="space-y-4">
        <p class="text-lg poetry-text-primary font-kai">
          如果您有任何建议或想法，欢迎与我们交流
        </p>
        <div class="flex justify-center space-x-6">
          <a
            href="mailto:contact@poetryclub.com"
            class="poetry-btn-primary px-6 py-3 rounded-lg hover:scale-105 transition-transform"
          >
            📧 邮箱联系
          </a>
          <a
            href="https://github.com/luckymouse2332/poetryclub"
            class="poetry-btn-secondary px-6 py-3 rounded-lg hover:scale-105 transition-transform"
          >
            🐙 GitHub
          </a>
        </div>
      </div>
    </section>
  </div>

  <!-- 底部装饰 -->
  <div class="text-center mt-16 mb-8">
    <div class="inline-block poetry-surface-100 px-8 py-4 rounded-full">
      <p class="poetry-text-muted font-kai text-lg">
        "腹有诗书气自华，最是书香能致远"
      </p>
    </div>
  </div>
</div>

<style>
  .animate-fade-in {
    animation: fadeIn 0.8s ease-in-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .prose p {
    margin-bottom: 1rem;
  }
</style>
