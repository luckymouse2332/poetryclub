<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import MdiEyeOutline from 'virtual:icons/mdi/eye-outline';
  import MdiEyeOffOutline from 'virtual:icons/mdi/eye-off-outline';

  // 表单数据
  let email = '';
  let password = '';
  let rememberMe = false;
  let showPassword = false;
  let isLoading = false;

  // 错误状态
  let emailError = '';
  let passwordError = '';
  let generalError = '';

  // 表单验证
  function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  function validateForm(): boolean {
    let isValid = true;

    // 重置错误
    emailError = '';
    passwordError = '';
    generalError = '';

    // 验证邮箱
    if (!email.trim()) {
      emailError = '请输入邮箱地址';
      isValid = false;
    } else if (!validateEmail(email)) {
      emailError = '请输入有效的邮箱地址';
      isValid = false;
    }

    // 验证密码
    if (!password.trim()) {
      passwordError = '请输入密码';
      isValid = false;
    } else if (password.length < 6) {
      passwordError = '密码至少需要6位字符';
      isValid = false;
    }

    return isValid;
  }

  // 登录处理
  async function handleLogin() {
    if (!validateForm()) return;

    isLoading = true;
    generalError = '';

    try {
      // 模拟API调用
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // TODO:这里应该调用实际的登录API
      // const response = await fetch('/api/auth/login', {
      //     method: 'POST',
      //     headers: { 'Content-Type': 'application/json' },
      //     body: JSON.stringify({ email, password, rememberMe })
      // });

      // 模拟登录成功
      console.log('登录成功:', { email, rememberMe });

      // 保存登录状态
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      }

      // 跳转到首页
      goto('/');
    } catch (error) {
      generalError = '登录失败，请检查您的邮箱和密码';
      console.error('登录错误:', error);
    } finally {
      isLoading = false;
    }
  }

  // 第三方登录
  async function handleThirdPartyLogin(provider: string) {
    console.log(`使用 ${provider} 登录`);
    // 这里实现第三方登录逻辑
  }

  // 忘记密码
  function handleForgotPassword() {
    goto('/forgot-password');
  }

  // 键盘事件处理
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      handleLogin();
    }
  }

  // 处理记住我复选框变化
  function handleRememberMeChange(event: { checked: boolean }) {
    console.log('记住我状态:', rememberMe);
  }

  onMount(() => {
    const remembered = localStorage.getItem('rememberMe');
    if (remembered) {
      rememberMe = true;
    }
  });
</script>

<svelte:head>
  <title>登录 - 回中诗社</title>
  <meta name="description" content="登录回中诗社，与诗友共赏千古佳作" />
</svelte:head>

<div
  class="min-h-screen bg-base-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
>
  <div class="max-w-md w-full space-y-8">
    <!-- 头部 -->
    <div class="text-center">
      <h1
        class="text-4xl font-bold mb-2"
        style="font-family: 'KaiTi', '楷体', serif;"
      >
        回中诗社
      </h1>
      <h2 class="text-2xl font-semibold mb-6">欢迎回到诗社</h2>
      <p class="opacity-70">登录您的账户，继续诗词之旅</p>
    </div>

    <!-- 登录表单 -->
    <div class="card bg-base-100 shadow-xl p-8">
      {#if generalError}
        <div
          class="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
        >
          {generalError}
        </div>
      {/if}

      <form onsubmit={handleLogin} class="space-y-6">
        <!-- 邮箱输入 -->
        <div class="form-control">
          <label class="label" for="email">
            <span class="label-text font-medium">邮箱地址</span>
          </label>
          <input
            id="email"
            type="email"
            bind:value={email}
            onkeydown={handleKeydown}
            class="input input-bordered w-full"
            class:input-error={emailError}
            placeholder="请输入您的邮箱"
            disabled={isLoading}
          />
          {#if emailError}
            <label class="label" for="email">
              <span class="label-text-alt text-error">{emailError}</span>
            </label>
          {/if}
        </div>

        <!-- 密码输入 -->
        <div class="form-control">
          <label class="label" for="password">
            <span class="label-text font-medium">密码</span>
          </label>
          <div class="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              bind:value={password}
              onkeydown={handleKeydown}
              class="input input-bordered w-full pr-12"
              class:input-error={passwordError}
              placeholder="请输入您的密码"
              disabled={isLoading}
            />
            <button
              type="button"
              onclick={() => (showPassword = !showPassword)}
              class="btn btn-ghost btn-sm absolute inset-y-0 right-0 rounded-l-none"
              disabled={isLoading}
            >
              {#if showPassword}
                <MdiEyeOffOutline />
              {:else}
                <MdiEyeOutline />
              {/if}
            </button>
          </div>
          {#if passwordError}
            <label class="label" for="password">
              <span class="label-text-alt text-error">{passwordError}</span>
            </label>
          {/if}
        </div>

        <!-- 记住我和忘记密码 -->
        <div class="flex items-center justify-between">
          <label class="label cursor-pointer">
            <input
              type="checkbox"
              bind:checked={rememberMe}
              disabled={isLoading}
              class="checkbox checkbox-primary checkbox-sm mr-2"
            />
            <span class="label-text">记住我</span>
          </label>
          <button
            type="button"
            onclick={handleForgotPassword}
            class="link link-primary text-sm"
            disabled={isLoading}
          >
            忘记密码？
          </button>
        </div>

        <!-- 登录按钮 -->
        <button
          type="submit"
          disabled={isLoading}
          class="btn btn-primary w-full"
        >
          {#if isLoading}
            <span class="loading loading-spinner loading-sm"></span>
            登录中...
          {:else}
            登录
          {/if}
        </button>

        <!-- 分割线 -->
        <div class="divider">或者</div>

        <!-- 第三方登录 -->
        <div class="space-y-3">
          <button
            type="button"
            onclick={() => handleThirdPartyLogin('GitHub')}
            disabled={isLoading}
            class="btn btn-outline w-full"
          >
            <span class="mr-2">🐙</span>
            使用 GitHub 登录
          </button>
          <button
            type="button"
            onclick={() => handleThirdPartyLogin('微信')}
            disabled={isLoading}
            class="btn btn-outline w-full"
          >
            <span class="mr-2">💬</span>
            使用微信登录
          </button>
        </div>
      </form>
    </div>

    <!-- 注册链接 -->
    <div class="text-center mt-6">
      <p class="text-base-content/70">
        还没有账号？
        <a href="/register" class="link link-primary font-medium"> 立即注册 </a>
      </p>
    </div>

    <!-- 用户协议 -->
    <div class="text-center mt-4">
      <p class="text-xs text-base-content/60">
        登录即表示您同意我们的
        <a href="/terms" class="link link-primary"> 用户协议 </a>
        和
        <a href="/privacy" class="link link-primary"> 隐私政策 </a>
      </p>
    </div>
  </div>
</div>
