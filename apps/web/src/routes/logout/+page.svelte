<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { toast } from 'svelte-sonner';
  import { authStore, currentUser, isAuthenticated } from '$lib/stores/auth';
  
  import MdiLogout from 'virtual:icons/mdi/logout';
  import MdiAccount from 'virtual:icons/mdi/account';
  import MdiLoading from 'virtual:icons/mdi/loading';
  import MdiCheck from 'virtual:icons/mdi/check';
  import MdiClose from 'virtual:icons/mdi/close';
  import MdiAlertCircle from 'virtual:icons/mdi/alert-circle';

  // 状态管理
  let isLoggingOut = $state(false);
  let showConfirmDialog = $state(true);
  let countdown = $state(3);
  let countdownTimer: NodeJS.Timeout;
  
  // 检查认证状态
  onMount(() => {
    if (!$isAuthenticated) {
      // 如果用户未登录，直接跳转到登录页
      goto('/login');
      return;
    }
  });
  
  // 确认退出登录
  async function confirmLogout() {
    isLoggingOut = true;
    showConfirmDialog = false;
    
    try {
      // 调用认证store的logout方法
      await authStore.logout();
      
      toast.success('退出登录成功');
      
      // 开始倒计时跳转
      startCountdown();
    } catch (error) {
      console.error('退出登录失败:', error);
      toast.error('退出失败，请稍后重试');
      isLoggingOut = false;
      showConfirmDialog = true;
    }
  }
  
  // 取消退出
  function cancelLogout() {
    goto('/'); // 返回首页
  }
  
  // 开始倒计时
  function startCountdown() {
    countdownTimer = setInterval(() => {
      countdown--;
      if (countdown <= 0) {
        clearInterval(countdownTimer);
        goto('/login');
      }
    }, 1000);
  }
  
  // 立即跳转
  function goToLogin() {
    if (countdownTimer) {
      clearInterval(countdownTimer);
    }
    goto('/login');
  }
  
  // 清理定时器
  onMount(() => {
    return () => {
      if (countdownTimer) {
        clearInterval(countdownTimer);
      }
    };
  });
</script>

<svelte:head>
  <title>退出登录 - 回中诗社</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-base-200 px-4">
  <div class="max-w-md w-full">
    {#if showConfirmDialog}
      <!-- 确认退出对话框 -->
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body text-center">
          <!-- 图标 -->
          <div class="flex justify-center mb-4">
            <div class="w-16 h-16 bg-warning/20 rounded-full flex items-center justify-center">
              <MdiAlertCircle class="w-8 h-8 text-warning" />
            </div>
          </div>
          
          <!-- 标题 -->
          <h2 class="card-title justify-center text-xl mb-2">确认退出登录</h2>
          
          <!-- 用户信息 -->
          {#if $currentUser}
            <div class="flex items-center justify-center gap-3 mb-4 p-3 bg-base-200 rounded-lg">
              <div class="avatar">
                <div class="w-10 h-10 rounded-full">
                  <img 
                    src={$currentUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent($currentUser.name)}&background=10b981&color=fff&size=40`}
                    alt={$currentUser.name}
                  />
                </div>
              </div>
              <div class="text-left">
                <div class="font-medium text-base-content">{$currentUser.name}</div>
                <div class="text-sm text-base-content/60">{$currentUser.email}</div>
              </div>
            </div>
          {/if}
          
          <!-- 提示信息 -->
          <p class="text-base-content/70 mb-6">
            您确定要退出登录吗？退出后您需要重新登录才能访问个人功能。
          </p>
          
          <!-- 操作按钮 -->
          <div class="card-actions justify-center gap-4">
            <button 
              class="btn btn-ghost"
              onclick={cancelLogout}
              disabled={isLoggingOut}
            >
              <MdiClose class="w-4 h-4" />
              取消
            </button>
            <button 
              class="btn btn-error"
              onclick={confirmLogout}
              disabled={isLoggingOut}
            >
              {#if isLoggingOut}
                <MdiLoading class="w-4 h-4 animate-spin" />
                退出中...
              {:else}
                <MdiLogout class="w-4 h-4" />
                确认退出
              {/if}
            </button>
          </div>
        </div>
      </div>
    {:else}
      <!-- 退出成功页面 -->
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body text-center">
          <!-- 成功图标 -->
          <div class="flex justify-center mb-4">
            <div class="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center">
              <MdiCheck class="w-8 h-8 text-success" />
            </div>
          </div>
          
          <!-- 标题 -->
          <h2 class="card-title justify-center text-xl mb-2">退出登录成功</h2>
          
          <!-- 提示信息 -->
          <p class="text-base-content/70 mb-6">
            您已成功退出登录。感谢您使用回中诗社，期待您的再次访问！
          </p>
          
          <!-- 倒计时提示 -->
          <div class="alert alert-info mb-6">
            <MdiAccount class="w-5 h-5" />
            <span>
              {countdown} 秒后自动跳转到登录页面
            </span>
          </div>
          
          <!-- 操作按钮 -->
          <div class="card-actions justify-center gap-4">
            <button 
              class="btn btn-ghost"
              onclick={() => goto('/')}
            >
              返回首页
            </button>
            <button 
              class="btn btn-primary"
              onclick={goToLogin}
            >
              <MdiAccount class="w-4 h-4" />
              立即登录
            </button>
          </div>
        </div>
      </div>
    {/if}
    
    <!-- 底部链接 -->
    <div class="text-center mt-6">
      <div class="flex items-center justify-center gap-4 text-sm text-base-content/60">
        <a href="/" class="link link-hover">返回首页</a>
        <span>•</span>
        <a href="/about" class="link link-hover">关于我们</a>
        <span>•</span>
        <a href="/register" class="link link-hover">注册账号</a>
      </div>
    </div>
  </div>
</div>

<!-- 页面样式 -->
<style>
  /* 确保页面占满全屏 */
  :global(body) {
    min-height: 100vh;
  }
</style>