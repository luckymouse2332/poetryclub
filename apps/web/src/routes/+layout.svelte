<script lang="ts">
  import '../app.css';
  import { onMount } from 'svelte';
  import {
    initTheme,
    toggleTheme as switchTheme,
    getCurrentTheme,
    themeReady,
    type ThemeMode,
  } from '$lib/theme';
  import { createMenubar, melt } from '@melt-ui/svelte';
  import { createToggle } from '@melt-ui/svelte';
  import { createCollapsible } from '@melt-ui/svelte';
  import { UserMenu, ToastProvider, ThemeLoader } from '$lib/components';
  import MdiWhiteBalanceSunny from 'virtual:icons/mdi/white-balance-sunny';
  import MdiMoonWaningCrescent from 'virtual:icons/mdi/moon-waning-crescent';
  import MdiMenu from 'virtual:icons/mdi/menu';

  let { children } = $props();

  let currentTheme = $state<ThemeMode>('light');
  let isMobileMenuOpen = $state(false);

  // 模拟用户状态（实际项目中应该从认证服务获取）
  let isLoggedIn = $state(false);
  let currentUser = $state({
    id: '1',
    name: '诗词爱好者',
    email: 'poet@example.com',
  });

  // 创建 melt-ui 组件
  const {
    elements: { menubar },
  } = createMenubar();

  const {
    elements: { root: themeToggle },
    states: { pressed: themePressed },
  } = createToggle({
    defaultPressed: false,
  });

  const {
    elements: {
      root: mobileMenuRoot,
      content: mobileMenuContent,
      trigger: mobileMenuTrigger,
    },
    states: { open: mobileMenuState },
  } = createCollapsible({
    defaultOpen: false,
  });

  // 初始化主题 - 使用异步版本以支持加载状态
  onMount(async () => {
    // 获取保存的主题或系统偏好
    const savedTheme = getCurrentTheme();
    currentTheme = savedTheme;

    // 异步应用主题到DOM
    await initTheme();

    // 同步 melt-ui toggle 状态
    themePressed.set(currentTheme === 'dark');
  });

  // 切换主题
  function toggleTheme() {
    currentTheme = switchTheme();
    // 同步 melt-ui toggle 状态
    themePressed.set(currentTheme === 'dark');
  }

  // 切换移动端菜单
  function toggleMobileMenu() {
    isMobileMenuOpen = !isMobileMenuOpen;
    // 同步 melt-ui collapsible 状态
    mobileMenuState.set(isMobileMenuOpen);
  }

  // 监听主题变化，单向同步到 melt-ui 状态
  // 移除双向绑定，避免自动回滚问题
  $effect(() => {
    // 只同步主题状态到 melt-ui，不反向触发主题切换
    themePressed.set(currentTheme === 'dark');
  });

  $effect(() => {
    if ($mobileMenuState !== isMobileMenuOpen) {
      isMobileMenuOpen = $mobileMenuState;
    }
  });

  // 计算是否为深色模式
  let isDarkMode = $derived(currentTheme === 'dark');
</script>

<!-- 使用语义化 HTML 和 Tailwind CSS 创建布局 -->

<div class="min-h-screen flex flex-col theme-transition">
  <!-- Header Navigation -->
  <header
    class="poetry-navbar shadow-lg border-b poetry-border theme-transition"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-18">
        <!-- Logo/Brand -->
        <div class="flex items-center">
          <a
            href="/"
            class="text-3xl font-bold poetry-text-primary transition-all duration-200 hover:scale-105"
            style="font-family: 'KaiTi', '楷体', serif;"
          >
            回中诗社
          </a>
        </div>

        <!-- Desktop Navigation -->
        <nav class="hidden md:block" use:melt={$menubar}>
          <div class="ml-10 flex items-baseline space-x-6">
            <a
              href="/"
              class="poetry-text-secondary px-4 py-2 rounded-lg text-base font-medium transition-all duration-200 hover:poetry-text-primary hover:scale-105"
            >
              首页
            </a>
            <a
              href="/about"
              class="poetry-text-secondary px-4 py-2 rounded-lg text-base font-medium transition-all duration-200 hover:poetry-text-primary hover:scale-105"
            >
              关于
            </a>
          </div>
        </nav>

        <!-- Theme Toggle & User Menu -->
        <div class="hidden md:flex items-center space-x-4">
          <!-- Theme Toggle Button -->
          <button
            use:melt={$themeToggle}
            onclick={toggleTheme}
            class="p-2 rounded-lg poetry-btn-secondary poetry-text-primary theme-transition"
            title={isDarkMode ? '切换到浅色模式' : '切换到深色模式'}
          >
            {#if isDarkMode}
              <!-- Sun Icon -->
              <MdiWhiteBalanceSunny />
            {:else}
              <!-- Moon Icon -->
              <MdiMoonWaningCrescent />
            {/if}
          </button>

          <!-- User Menu -->
          <UserMenu user={isLoggedIn ? currentUser : undefined} {isLoggedIn} />
        </div>

        <!-- Mobile menu button -->
        <div class="md:hidden flex items-center space-x-2">
          <!-- Mobile Theme Toggle -->
          <button
            use:melt={$themeToggle}
            onclick={toggleTheme}
            class="p-2 rounded-lg poetry-btn-secondary poetry-text-primary theme-transition"
          >
            {#if isDarkMode}
              <MdiWhiteBalanceSunny />
            {:else}
              <MdiMoonWaningCrescent />
            {/if}
          </button>

          <button
            use:melt={$mobileMenuTrigger}
            type="button"
            class="p-2 rounded-lg poetry-btn-secondary poetry-text-primary theme-transition"
            aria-controls="mobile-menu"
            aria-expanded={isMobileMenuOpen}
          >
            <span class="sr-only">打开主菜单</span>
            <!-- Menu icon -->
            <MdiMenu />
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile menu -->
    {#if $mobileMenuState}
      <div class="md:hidden" id="mobile-menu" use:melt={$mobileMenuContent}>
        <div
          class="px-4 pt-2 pb-3 space-y-2 poetry-surface-100 border-t poetry-border theme-transition"
        >
          <a
            href="/"
            class="poetry-text-secondary block px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 hover:poetry-text-primary hover:poetry-surface-200"
            >首页</a
          >
          <a
            href="/about"
            class="poetry-text-secondary block px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 hover:poetry-text-primary hover:poetry-surface-200"
            >关于</a
          >
          <div class="pt-4 pb-3 border-t poetry-border">
            <div class="flex flex-col space-y-3 px-4">
              <a
                class="poetry-btn-secondary poetry-text-primary px-6 py-3 rounded-lg font-medium border poetry-border theme-transition"
                href="/login"
              >
                登录
              </a>
              <a
                class="poetry-btn-primary text-white px-6 py-3 rounded-lg font-medium theme-transition"
                href="/register"
              >
                注册
              </a>
            </div>
          </div>
        </div>
      </div>
    {/if}
  </header>

  <!-- Main Content Area -->
  <main class="poetry-surface flex-1 theme-transition">
    {@render children()}
  </main>

  <!-- Footer -->
  <footer class="poetry-surface-100 border-t poetry-border theme-transition">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- 主要页脚内容 -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
        <!-- 网站信息 -->
        <div class="text-center md:text-left">
          <h3 class="text-lg font-bold poetry-text-primary mb-3 font-kai">
            回中诗社
          </h3>
          <p class="poetry-text-secondary text-sm leading-relaxed">
            传承中华诗词文化<br />
            分享诗词之美
          </p>
        </div>
        <!-- 快速链接 -->
        <div class="text-center">
          <h3 class="text-lg font-bold poetry-text-primary mb-3 font-kai">
            快速链接
          </h3>
          <div class="space-y-2">
            <a
              href="/"
              class="block poetry-text-secondary hover:poetry-text-primary text-sm transition-colors"
              >首页</a
            >
            <a
              href="/about"
              class="block poetry-text-secondary hover:poetry-text-primary text-sm transition-colors"
              >关于我们</a
            >
            <a
              href="/privacy"
              class="block poetry-text-secondary hover:poetry-text-primary text-sm transition-colors"
              >隐私政策</a
            >
            <a
              href="/terms"
              class="block poetry-text-secondary hover:poetry-text-primary text-sm transition-colors"
              >使用条款</a
            >
          </div>
        </div>

        <!-- 联系信息 -->
        <div class="text-center md:text-right">
          <h3 class="text-lg font-bold poetry-text-primary mb-3 font-kai">
            联系我们
          </h3>
          <div class="space-y-2 text-sm poetry-text-secondary">
            <p>📧 contact@poetryclub.com</p>
            <p>🐙 GitHub: poetryclub</p>
            <p>📱 微信公众号: 回中诗社</p>
          </div>
        </div>
      </div>

      <!-- 分隔线 -->
      <div class="border-t poetry-border pt-6">
        <!-- 底部信息 -->
        <div
          class="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0"
        >
          <!-- 著作权信息 -->
          <div class="text-center md:text-left">
            <p class="text-sm poetry-text-muted">
              © 2024 回中诗社. 保留所有权利.
            </p>
            <p class="text-xs poetry-text-muted mt-1">
              本站内容遵循
              <a
                href="https://creativecommons.org/licenses/by-nc-sa/4.0/"
                class="hover:poetry-text-primary transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                CC BY-NC-SA 4.0
              </a>
              协议
            </p>
          </div>

          <!-- ICP备案信息 -->
          <div class="text-center md:text-right">
            <p class="text-sm poetry-text-muted">
              <a
                href="https://beian.miit.gov.cn/"
                class="hover:poetry-text-primary transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                京ICP备2024000001号-1
              </a>
            </p>
            <p class="text-xs poetry-text-muted mt-1">
              <a
                href="http://www.beian.gov.cn/"
                class="hover:poetry-text-primary transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                京公网安备 11010802000001号
              </a>
            </p>
          </div>
        </div>

        <!-- 诗词装饰 -->
        <div class="text-center mt-6 pt-4 border-t poetry-border">
          <p class="text-sm poetry-text-muted font-kai italic">
            "诗言志，歌咏言，声依永，律和声"
          </p>
        </div>
      </div>
    </div>
    ``` ````
  </footer>
</div>

<!-- Toast Provider -->

<ToastProvider />

<!-- 主题加载组件 -->

<ThemeLoader />
