<script lang="ts">
  import { createPopover, melt } from '@melt-ui/svelte';
  import { goto } from '$app/navigation';

  import UserMenuButton from './UserMenuButton.svelte';

  import MdiUser from 'virtual:icons/mdi/user';
  import MdiBook from 'virtual:icons/mdi/book';
  import MdiHeart from 'virtual:icons/mdi/heart';
  import MdiPencil from 'virtual:icons/mdi/pencil';
  import MdiLogout from 'virtual:icons/mdi/logout';
  import MdiSettingsOutline from 'virtual:icons/mdi/settings-outline';
  import MdiLogin from 'virtual:icons/mdi/login';
  import MdiAccountPlus from 'virtual:icons/mdi/account-plus';

  interface Props {
    user?: {
      id: string;
      name: string;
      avatar?: string;
      email: string;
    };
    isLoggedIn?: boolean;
  }

  let { user, isLoggedIn = false }: Props = $props();

  const {
    elements: { trigger, content, arrow },
    states: { open },
  } = createPopover({
    forceVisible: true,
    positioning: {
      placement: 'bottom-end',
    },
  });

  // 菜单项点击处理
  function handleMenuClick(url: string) {
    goto(url);
    // 关闭菜单
    $open = false;
  }

  // 获取用户头像
  function getUserAvatar() {
    if (user?.avatar) {
      return user.avatar;
    }
    // 默认头像
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=10b981&color=fff&size=40`;
  }
</script>

<!-- 触发按钮 -->
<button
  use:melt={$trigger}
  class="flex items-center gap-2 p-2 rounded-lg poetry-btn-secondary poetry-text-primary transition-colors"
>
  {#if isLoggedIn && user}
    <!-- 已登录用户头像 -->
    <img
      src={getUserAvatar()}
      alt={user.name}
      class="w-8 h-8 rounded-full object-cover"
    />
    <span class="text-sm font-medium poetry-text-primary hidden md:block"
      >{user.name}</span
    >
  {:else}
    <!-- 未登录用户图标 -->
    <MdiUser class="w-6 h-6 poetry-text-primary" />
    <span class="text-sm font-medium poetry-text-primary hidden md:block"
      >登录</span
    >
  {/if}
</button>

<!-- 弹出菜单 -->
{#if $open}
  <div
    use:melt={$content}
    class="z-50 min-w-[200px] rounded-lg border border-poetry-border poetry-surface-100 p-2 shadow-lg"
  >
    <!-- 箭头 -->
    <div use:melt={$arrow} class="arrow"></div>

    {#if isLoggedIn && user}
      <!-- 已登录用户菜单 -->
      <!-- 用户信息 -->
      <div class="px-3 py-2 border-b border-gray-100 mb-2">
        <div class="flex items-center gap-3">
          <img
            src={getUserAvatar()}
            alt={user.name}
            class="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <p class="font-medium text-gray-900">{user.name}</p>
            <p class="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>
      </div>

      <!-- 菜单项 -->
      <div class="space-y-1">
        <UserMenuButton
          handler={() => handleMenuClick('/profile')}
          icon={MdiUser}
          label="个人资料"
        />
        <UserMenuButton
          handler={() => handleMenuClick('/my-poems')}
          icon={MdiBook}
          label="我的诗歌"
        />

        <UserMenuButton
          handler={() => handleMenuClick('/favorites')}
          icon={MdiHeart}
          label="我的收藏"
        />
        <UserMenuButton
          handler={() => handleMenuClick('/write')}
          icon={MdiPencil}
          label="创作诗歌"
        />

        <UserMenuButton
          handler={() => handleMenuClick('/settings')}
          icon={MdiSettingsOutline}
          label="设置"
        />
        <hr class="my-2 border-gray-100" />

        <UserMenuButton
          handler={() => handleMenuClick('/logout')}
          icon={MdiLogout}
          label="退出登录"
        />
      </div>
    {:else}
      <!-- 未登录用户菜单 -->
      <div class="space-y-1">
        <UserMenuButton
          handler={() => handleMenuClick('/login')}
          icon={MdiLogin}
          label="登录"
        />
        <UserMenuButton
          handler={() => handleMenuClick('/register')}
          icon={MdiAccountPlus}
          label="注册"
        />
      </div>
    {/if}
  </div>
{/if}

<style>
  @reference '../../app.css';

  .arrow {
    @apply absolute bg-white border-l border-t border-gray-200;
    width: 10px;
    height: 10px;
    transform: rotate(45deg);
    top: -5px;
    right: 20px;
  }
</style>
