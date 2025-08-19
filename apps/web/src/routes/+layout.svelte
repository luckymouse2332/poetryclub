<script lang="ts">
  import '../app.css';

  import { UserMenu, ToastProvider, Footer } from '$lib/components';
  import { SITE_NAME } from '$lib/constants';
  import { onMount } from 'svelte';

  import MdiWhiteBalanceSunny from 'virtual:icons/mdi/white-balance-sunny';
  import MdiMoonWaningCrescent from 'virtual:icons/mdi/moon-waning-crescent';
  import MdiMenu from 'virtual:icons/mdi/menu';

  let { children } = $props();

  let isMobileMenuOpen = $state(false);
  let themeController: HTMLInputElement;

  // 模拟用户状态（实际项目中应该从认证服务获取）
  let isLoggedIn = $state(false);
  let currentUser = $state({
    id: '1',
    name: '诗词爱好者',
    email: 'poet@example.com',
  });

  // 初始化主题状态
  onMount(() => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    if (themeController) {
      themeController.checked = currentTheme === 'night';
    }
  });
</script>

<!-- 使用语义化 HTML 和 Tailwind CSS 创建布局 -->

<div class="min-h-screen flex flex-col theme-transition">
  <!-- DaisyUI Drawer for Mobile Navigation -->
  <div class="drawer">
    <input
      id="mobile-drawer"
      type="checkbox"
      class="drawer-toggle"
      bind:checked={isMobileMenuOpen}
    />

    <!-- Page content -->
    <div class="drawer-content flex flex-col">
      <!-- DaisyUI Navbar -->
      <div class="navbar bg-base-100 shadow-lg border-b border-base-300">
        <!-- Mobile menu button -->
        <div class="navbar-start">
          <label
            for="mobile-drawer"
            class="btn btn-square btn-ghost drawer-button lg:hidden"
          >
            <MdiMenu class="w-6 h-6" />
          </label>

          <!-- Logo/Brand -->
          <a
            href="/"
            class="btn btn-ghost text-xl font-bold"
            style="font-family: 'KaiTi', '楷体', serif;"
          >
            {SITE_NAME}
          </a>
        </div>

        <!-- Desktop Navigation -->
        <div class="navbar-center hidden lg:flex">
          <ul class="menu menu-horizontal px-1">
            <li><a href="/" class="text-base font-medium">首页</a></li>
            <li><a href="/about" class="text-base font-medium">关于</a></li>
          </ul>
        </div>

        <!-- Theme Toggle & User Menu -->
        <div class="navbar-end">
          <!-- Theme Toggle Button -->
          <label class="swap swap-rotate">
            <!-- this hidden checkbox controls the state -->
            <input
              type="checkbox"
              class="theme-controller"
              value="night"
              bind:this={themeController}
            />
            <!-- sun icon -->
            <MdiWhiteBalanceSunny class="w-5 h-5 swap-off fill-current" />
            <!-- moon icon -->
            <MdiMoonWaningCrescent class="w-5 h-5 swap-on fill-current" />
          </label>

          <!-- User Menu -->
          <UserMenu user={isLoggedIn ? currentUser : undefined} {isLoggedIn} />
        </div>
      </div>

      <!-- Main Content Area -->
      <main class="flex-1 bg-base-100">
        {@render children()}
      </main>

      <!-- Footer -->
      <Footer siteName={SITE_NAME} icpNumber="京ICP备2022016960号-1" />
    </div>

    <!-- DaisyUI Drawer Side -->
    <div class="drawer-side">
      <label for="mobile-drawer" class="drawer-overlay"></label>
      <aside class="min-h-full w-80 bg-base-200">
        <!-- Drawer Header -->
        <div class="p-4 border-b border-base-300">
          <h2
            class="text-xl font-bold"
            style="font-family: 'KaiTi', '楷体', serif;"
          >
            {SITE_NAME}
          </h2>
        </div>

        <!-- Drawer Menu -->
        <ul class="menu p-4 w-full">
          <li><a href="/" class="text-base font-medium">首页</a></li>
          <li><a href="/about" class="text-base font-medium">关于</a></li>

          <div class="divider"></div>

          {#if isLoggedIn}
            <li>
              <a href="/user/profile" class="text-base font-medium">个人中心</a>
            </li>
            <li>
              <a href="/user/poems" class="text-base font-medium">我的诗作</a>
            </li>
          {:else}
            <li>
              <a href="/login" class="btn btn-outline btn-primary mb-2">登录</a>
            </li>
            <li><a href="/register" class="btn btn-primary">注册</a></li>
          {/if}
        </ul>
      </aside>
    </div>
  </div>
</div>

<!-- Toast Provider -->
<ToastProvider />
