<script lang="ts">
  import { onMount } from 'svelte';
  import { SITE_NAME } from '$lib/constants';

  $: description = `${SITE_NAME} - 传承中华诗词文化，分享诗词之美`;

  let mounted = false;

  onMount(() => {
    mounted = true;
  });
</script>

<svelte:head>
  <title>关于我们 - {SITE_NAME}</title>
  <meta name="description" content={description} />
</svelte:head>

<div class="container mx-auto px-4 py-8 max-w-4xl">
  <!-- 页面标题 -->
  <div class="text-center mb-12">
    <h1 class="text-4xl md:text-5xl font-bold text-base-content mb-4 font-kai">
      关于{SITE_NAME}
    </h1>
    <div
      class="w-24 h-1 bg-gradient-to-r from-amber-400 to-orange-500 mx-auto rounded-full"
    ></div>
  </div>

  <!-- 主要内容 -->
  <div class="space-y-12">
    <!-- 网站介绍 -->
    <section
      class="card bg-base-200 shadow-xl p-8 rounded-xl border-2 border-base-300"
      class:animate-fade-in={mounted}
    >
      <h2
        class="text-2xl font-bold text-base-content mb-6 font-kai flex items-center"
      >
        <span class="text-3xl mr-3">🏛️</span>
        网站简介
      </h2>
      <div
        class="prose prose-lg max-w-none text-base-content font-kai leading-relaxed"
      >
        <p class="text-lg mb-4">
          {SITE_NAME}是一个专注于中华古典诗词文化传承与分享的在线平台。我们致力于为诗词爱好者提供一个优雅、纯净的交流空间，让千年诗韵在数字时代重新焕发光彩。
        </p>
        <p class="text-lg mb-4">
          在这里，您可以欣赏经典诗词，分享创作心得，与志同道合的朋友一起品味文字之美，感受中华文化的博大精深。
        </p>
      </div>
    </section>

    <!-- 技术架构 -->
    <section class="card bg-base-200 shadow-xl" class:animate-fade-in={mounted}>
      <div class="card-body">
        <h2 class="card-title text-2xl font-kai mb-6 flex items-center">
          <span class="text-3xl mr-3">⚡</span>
          技术架构
        </h2>

        <!-- 前端技术 -->
        <div class="mb-8">
          <h3 class="text-lg font-bold mb-4 font-kai flex items-center">
            <span class="text-xl mr-2">🎨</span>
            前端技术
          </h3>
          <div class="flex flex-wrap justify-center gap-3 md:gap-4">
            <div
              class="card bg-base-100 shadow-sm px-4 py-3 min-w-0 flex-shrink-0"
            >
              <div class="flex items-center">
                <div class="text-xl mr-3">🚀</div>
                <div class="text-center">
                  <div class="font-bold text-sm">SvelteKit</div>
                  <div class="text-xs text-base-content/70">前端框架</div>
                </div>
              </div>
            </div>
            <div
              class="card bg-base-100 shadow-sm px-4 py-3 min-w-0 flex-shrink-0"
            >
              <div class="flex items-center">
                <div class="text-xl mr-3">🎨</div>
                <div class="text-center">
                  <div class="font-bold text-sm">Tailwind CSS</div>
                  <div class="text-xs text-base-content/70">样式框架</div>
                </div>
              </div>
            </div>
            <div
              class="card bg-base-100 shadow-sm px-4 py-3 min-w-0 flex-shrink-0"
            >
              <div class="flex items-center">
                <div class="text-xl mr-3">🛠️</div>
                <div class="text-center">
                  <div class="font-bold text-sm">TypeScript</div>
                  <div class="text-xs text-base-content/70">开发语言</div>
                </div>
              </div>
            </div>
            <div
              class="card bg-base-100 shadow-sm px-4 py-3 min-w-0 flex-shrink-0"
            >
              <div class="flex items-center">
                <div class="text-xl mr-3">📱</div>
                <div class="text-center">
                  <div class="font-bold text-sm">响应式设计</div>
                  <div class="text-xs text-base-content/70">多端适配</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 分隔线 -->
        <div class="divider">
          <span class="text-sm font-kai text-base-content/60">技术栈</span>
        </div>

        <!-- 后端技术 -->
        <div>
          <h3 class="text-lg font-bold mb-4 font-kai flex items-center">
            <span class="text-xl mr-2">⚙️</span>
            后端技术
          </h3>
          <div class="flex flex-wrap justify-center gap-3 md:gap-4">
            <div
              class="card bg-base-100 shadow-sm px-4 py-3 min-w-0 flex-shrink-0"
            >
              <div class="flex items-center">
                <div class="text-xl mr-3">🟢</div>
                <div class="text-center">
                  <div class="font-bold text-sm">NestJS</div>
                  <div class="text-xs text-base-content/70">后端框架</div>
                </div>
              </div>
            </div>
            <div
              class="card bg-base-100 shadow-sm px-4 py-3 min-w-0 flex-shrink-0"
            >
              <div class="flex items-center">
                <div class="text-xl mr-3">🗄️</div>
                <div class="text-center">
                  <div class="font-bold text-sm">Prisma</div>
                  <div class="text-xs text-base-content/70">数据库ORM</div>
                </div>
              </div>
            </div>
            <div
              class="card bg-base-100 shadow-sm px-4 py-3 min-w-0 flex-shrink-0"
            >
              <div class="flex items-center">
                <div class="text-xl mr-3">🐘</div>
                <div class="text-center">
                  <div class="font-bold text-sm">PostgreSQL</div>
                  <div class="text-xs text-base-content/70">数据库</div>
                </div>
              </div>
            </div>
            <div
              class="card bg-base-100 shadow-sm px-4 py-3 min-w-0 flex-shrink-0"
            >
              <div class="flex items-center">
                <div class="text-xl mr-3">🐳</div>
                <div class="text-center">
                  <div class="font-bold text-sm">Docker</div>
                  <div class="text-xs text-base-content/70">容器化</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 版本更新记录 -->
    <section class="card bg-base-200 shadow-xl" class:animate-fade-in={mounted}>
      <div class="card-body">
        <h2 class="card-title text-2xl font-kai mb-6 flex items-center">
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
              class="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg"
            >
              V4
            </div>
            <div class="ml-6 flex-1">
              <div
                class="bg-base-300 p-6 rounded-lg border-l-4 border-base-300 shadow-sm"
              >
                <div class="flex items-center justify-between mb-3">
                  <h3 class="text-lg font-bold text-base-content font-kai">
                    V4.0 - AI与创作增强
                  </h3>
                  <span
                    class="text-sm text-base-content/80 bg-base-200 px-3 py-1 rounded-full"
                    >规划中</span
                  >
                </div>
                <p class="text-base-content/80 mb-3 text-sm">
                  未来版本 - AI辅助创作，海报生成，活动系统
                </p>
                <div class="space-y-2">
                  <div class="flex items-center text-sm">
                    <span class="text-primary mr-2">🤖</span>
                    <span class="text-base-content"
                      >AI辅助创作：诗题生成、灵感联想、润色建议</span
                    >
                  </div>
                  <div class="flex items-center text-sm">
                    <span class="text-primary mr-2">🎨</span>
                    <span class="text-base-content"
                      >海报生成与分享：精美图片，社交平台分享</span
                    >
                  </div>
                  <div class="flex items-center text-sm">
                    <span class="text-primary mr-2">🏆</span>
                    <span class="text-base-content"
                      >活动系统：征文比赛，主题创作活动</span
                    >
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- V3.0 搜索与发现 -->
          <div class="relative flex items-start mb-8">
            <div
              class="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-700 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg"
            >
              V3
            </div>
            <div class="ml-6 flex-1">
              <div
                class="bg-base-300 p-6 rounded-lg border-l-4 border-base-300 shadow-sm"
              >
                <div class="flex items-center justify-between mb-3">
                  <h3 class="text-lg font-bold text-base-content font-kai">
                    V3.0 - 搜索与内容发现
                  </h3>
                  <span
                    class="text-sm text-base-content/80 bg-base-200 px-3 py-1 rounded-full"
                    >计划中</span
                  >
                </div>
                <p class="text-base-content/80 mb-3 text-sm">
                  第三阶段 - 搜索分类，标签榜单
                </p>
                <div class="space-y-2">
                  <div class="flex items-center text-sm">
                    <span class="text-primary mr-2">🔍</span>
                    <span class="text-base-content"
                      >全文搜索功能，按标题、作者、内容搜索</span
                    >
                  </div>
                  <div class="flex items-center text-sm">
                    <span class="text-primary mr-2">🏷️</span>
                    <span class="text-base-content"
                      >分类与标签系统，主题化内容组织</span
                    >
                  </div>
                  <div class="flex items-center text-sm">
                    <span class="text-primary mr-2">📊</span>
                    <span class="text-base-content"
                      >热门榜单：每日/每周/每月优秀作品</span
                    >
                  </div>
                  <div class="flex items-center text-sm">
                    <span class="text-primary mr-2">🎯</span>
                    <span class="text-base-content"
                      >智能推荐算法，个性化内容推送</span
                    >
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- V2.0 社区互动 -->
          <div class="relative flex items-start mb-8">
            <div
              class="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg"
            >
              V2
            </div>
            <div class="ml-6 flex-1">
              <div
                class="bg-base-300 p-6 rounded-lg border-l-4 border-base-300 shadow-sm"
              >
                <div class="flex items-center justify-between mb-3">
                  <h3 class="text-lg font-bold text-base-content font-kai">
                    V2.0 - 社区互动扩展
                  </h3>
                  <span
                    class="text-sm text-base-content/80 bg-base-200 px-3 py-1 rounded-full"
                    >计划中</span
                  >
                </div>
                <p class="text-base-content/80 mb-3 text-sm">
                  第二阶段 - 点赞评论，消息用户互动
                </p>
                <div class="space-y-2">
                  <div class="flex items-center text-sm">
                    <span class="text-primary mr-2">❤️</span>
                    <span class="text-base-content"
                      >点赞与评论系统，支持楼层结构回复</span
                    >
                  </div>
                  <div class="flex items-center text-sm">
                    <span class="text-primary mr-2">🔔</span>
                    <span class="text-base-content"
                      >消息与通知中心，实时互动提醒</span
                    >
                  </div>
                  <div class="flex items-center text-sm">
                    <span class="text-primary mr-2">👥</span>
                    <span class="text-base-content"
                      >收藏与关注功能，建立诗友圈</span
                    >
                  </div>
                  <div class="flex items-center text-sm">
                    <span class="text-primary mr-2">📱</span>
                    <span class="text-base-content">关注流与个性化推荐</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 开发中版本分隔线 -->
          <div class="relative flex items-center my-8">
            <div class="ml-20 flex-1 flex items-center">
              <div
                class="flex-1 h-px bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500"
              ></div>
              <div
                class="px-6 py-2 bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-full text-sm font-kai font-bold shadow-lg"
              >
                🚧 开发中版本
              </div>
              <div
                class="flex-1 h-px bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300"
              ></div>
            </div>
          </div>

          <!-- MVP V1.0 当前开发版本 -->
          <div class="relative flex items-start mb-8">
            <div
              class="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-700 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg"
            >
              MVP
            </div>
            <div class="ml-6 flex-1">
              <div
                class="bg-base-300 p-6 rounded-lg border-l-4 border-base-300 shadow-sm"
              >
                <div class="flex items-center justify-between mb-3">
                  <h3 class="text-lg font-bold text-base-content font-kai">
                    MVP V1.0 - 现代化重构版
                  </h3>
                  <span
                    class="text-sm text-base-content/80 bg-base-200 px-3 py-1 rounded-full"
                    >开发中</span
                  >
                </div>
                <p class="text-base-content/80 mb-3 text-sm">
                  2025年8月14日 - 现代化重构版开发中，尚未上线
                </p>
                <div class="space-y-2">
                  <div class="flex items-center text-sm">
                    <span class="text-primary mr-2">🔐</span>
                    <span class="text-base-content"
                      >用户注册与登录系统，权限管理</span
                    >
                  </div>
                  <div class="flex items-center text-sm">
                    <span class="text-primary mr-2">📝</span>
                    <span class="text-base-content"
                      >诗歌创作与编辑，富文本支持</span
                    >
                  </div>
                  <div class="flex items-center text-sm">
                    <span class="text-primary mr-2">📖</span>
                    <span class="text-base-content"
                      >诗作浏览与阅读，分页展示</span
                    >
                  </div>
                  <div class="flex items-center text-sm">
                    <span class="text-primary mr-2">✅</span>
                    <span class="text-base-content"
                      >内容审核系统，管理员功能</span
                    >
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 历史版本分隔线 -->
          <div class="relative flex items-center my-8">
            <div class="ml-20 flex-1 flex items-center">
              <div
                class="flex-1 h-px bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500"
              ></div>
              <div
                class="px-6 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-full text-sm font-kai font-bold shadow-lg"
              >
                📚 历史版本
              </div>
              <div
                class="flex-1 h-px bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300"
              ></div>
            </div>
          </div>

          <!-- V2.0 历史版本 -->
          <div class="relative flex items-start mb-8">
            <div
              class="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-gray-500 to-gray-700 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg"
            >
              V2
            </div>
            <div class="ml-6 flex-1">
              <div
                class="bg-base-300 p-6 rounded-lg border-l-4 border-base-300 shadow-sm"
              >
                <div class="flex items-center justify-between mb-3">
                  <h3 class="text-lg font-bold text-base-content font-kai">
                    V2.0 - .NET时代
                  </h3>
                  <span
                    class="text-sm text-base-content/80 bg-base-100 px-3 py-1 rounded-full"
                    >已停用</span
                  >
                </div>
                <p class="text-base-content/80 mb-3 text-sm">
                  2023年 - 企业级框架，前后端一体化
                </p>
                <div class="space-y-2">
                  <div class="flex items-center text-sm">
                    <span class="text-primary mr-2">•</span>
                    <span class="text-base-content"
                      >ASP.NET Core + Blazor Server</span
                    >
                  </div>
                  <div class="flex items-center text-sm">
                    <span class="text-primary mr-2">•</span>
                    <span class="text-base-content"
                      >前后端不分离，服务端渲染</span
                    >
                  </div>
                  <div class="flex items-center text-sm">
                    <span class="text-primary mr-2">•</span>
                    <span class="text-base-content"
                      >Entity Framework Core + PostgreSQL</span
                    >
                  </div>
                  <div class="flex items-center text-sm">
                    <span class="text-primary mr-2">•</span>
                    <span class="text-base-content"
                      >组件化开发，实时交互体验</span
                    >
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- V1.0 历史版本 -->
          <div class="relative flex items-start">
            <div
              class="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-gray-500 to-gray-700 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg"
            >
              V1
            </div>
            <div class="ml-6 flex-1">
              <div
                class="bg-base-300 p-6 rounded-lg border-l-4 border-base-300 shadow-sm"
              >
                <div class="flex items-center justify-between mb-3">
                  <h3 class="text-lg font-bold text-base-content font-kai">
                    V1.0 - 初创版本
                  </h3>
                  <span
                    class="text-sm text-base-content/80 bg-base-100 px-3 py-1 rounded-full"
                    >已停用</span
                  >
                </div>
                <p class="text-base-content/80 mb-3 text-sm">
                  2022年 - 项目起步，传统Web开发
                </p>
                <div class="space-y-2">
                  <div class="flex items-center text-sm">
                    <span class="text-primary mr-2">•</span>
                    <span class="text-base-content">Node.js + Express.js</span>
                  </div>
                  <div class="flex items-center text-sm">
                    <span class="text-primary mr-2">•</span>
                    <span class="text-base-content"
                      >传统MVC架构，服务端渲染</span
                    >
                  </div>
                  <div class="flex items-center text-sm">
                    <span class="text-primary mr-2">•</span>
                    <span class="text-base-content"
                      >MongoDB数据库，简单CRUD</span
                    >
                  </div>
                  <div class="flex items-center text-sm">
                    <span class="text-primary mr-2">•</span>
                    <span class="text-base-content"
                      >基础功能实现，奠定项目基础</span
                    >
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 联系方式 -->
    <section
      class="card bg-base-200 shadow-xl p-8 rounded-xl border-2 border-base-300 text-center"
      class:animate-fade-in={mounted}
    >
      <h2
        class="text-2xl font-bold text-base-content mb-6 font-kai flex items-center justify-center"
      >
        <span class="text-3xl mr-3">📮</span>
        联系我们
      </h2>
      <div class="space-y-4">
        <p class="text-lg text-base-content font-kai">
          如果您有任何建议或想法，欢迎与我们交流
        </p>
        <div class="flex justify-center space-x-6">
          <a
            href="mailto:contact@poetryclub.com"
            class="btn btn-primary hover:scale-105 transition-transform"
          >
            📧 邮箱联系
          </a>
          <a
            href="https://github.com/luckymouse2332/poetryclub"
            class="btn btn-secondary hover:scale-105 transition-transform"
          >
            🐙 GitHub
          </a>
        </div>
      </div>
    </section>
  </div>

  <!-- 底部装饰 -->
  <div class="text-center mt-16 mb-8">
    <div class="card bg-base-200 shadow-lg inline-block">
      <div class="card-body px-8 py-4">
        <p class="text-base-content/70 font-kai text-lg">
          "腹有诗书气自华，最是书香能致远"
        </p>
      </div>
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
