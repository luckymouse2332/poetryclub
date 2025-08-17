<script lang="ts">
  import { goto } from '$app/navigation';

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

  // 菜单项点击处理
  function handleMenuClick(url: string) {
    goto(url);
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

<!-- DaisyUI Dropdown -->
<div class="dropdown dropdown-end">
  <!-- Dropdown trigger -->
  <div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar">
    {#if isLoggedIn && user}
      <!-- 已登录用户头像 -->
      <div class="w-8 rounded-full">
        <img
          src={getUserAvatar()}
          alt={user.name}
          class="rounded-full"
        />
      </div>
    {:else}
      <!-- 未登录用户图标 -->
      <MdiUser class="w-5 h-5" />
    {/if}
  </div>
  
  <!-- Dropdown content -->
  <ul class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
    {#if isLoggedIn && user}
      <!-- 已登录用户菜单 -->
      <!-- 用户信息 -->
      <li class="menu-title">
        <div class="flex items-center gap-3 px-2 py-2">
          <img
            src={getUserAvatar()}
            alt={user.name}
            class="w-8 h-8 rounded-full object-cover"
          />
          <div class="flex flex-col">
            <span class="font-medium text-sm">{user.name}</span>
            <span class="text-xs opacity-60">{user.email}</span>
          </div>
        </div>
      </li>
      
      <div class="divider my-1"></div>
      
      <!-- 菜单项 -->
      <li>
        <button onclick={() => handleMenuClick('/profile')} class="flex items-center gap-2">
          <MdiUser class="w-4 h-4" />
          个人资料
        </button>
      </li>
      <li>
        <button onclick={() => handleMenuClick('/my-poems')} class="flex items-center gap-2">
          <MdiBook class="w-4 h-4" />
          我的诗歌
        </button>
      </li>
      <li>
        <button onclick={() => handleMenuClick('/favorites')} class="flex items-center gap-2">
          <MdiHeart class="w-4 h-4" />
          我的收藏
        </button>
      </li>
      <li>
        <button onclick={() => handleMenuClick('/write')} class="flex items-center gap-2">
          <MdiPencil class="w-4 h-4" />
          创作诗歌
        </button>
      </li>
      <li>
        <button onclick={() => handleMenuClick('/settings')} class="flex items-center gap-2">
          <MdiSettingsOutline class="w-4 h-4" />
          设置
        </button>
      </li>
      
      <div class="divider my-1"></div>
      
      <li>
        <button onclick={() => handleMenuClick('/logout')} class="flex items-center gap-2 text-error">
          <MdiLogout class="w-4 h-4" />
          退出登录
        </button>
      </li>
    {:else}
      <!-- 未登录用户菜单 -->
      <li>
        <button onclick={() => handleMenuClick('/login')} class="flex items-center gap-2">
          <MdiLogin class="w-4 h-4" />
          登录
        </button>
      </li>
      <li>
        <button onclick={() => handleMenuClick('/register')} class="flex items-center gap-2">
          <MdiAccountPlus class="w-4 h-4" />
          注册
        </button>
      </li>
    {/if}
  </ul>
</div>

<!-- No custom styles needed - using DaisyUI classes -->
