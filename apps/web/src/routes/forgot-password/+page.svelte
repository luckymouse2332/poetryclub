<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { toast } from 'svelte-sonner';
  
  import { Label, Button } from 'bits-ui';
  
  import MdiEmailOutline from 'virtual:icons/mdi/email-outline';
  import MdiArrowLeft from 'virtual:icons/mdi/arrow-left';
  import MdiLoading from 'virtual:icons/mdi/loading';
  import MdiCheckCircle from 'virtual:icons/mdi/check-circle';

  // 表单状态
  let email = '';
  let isLoading = false;
  let isEmailSent = false;
  let emailError = '';
  let generalError = '';

  // 表单验证
  function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  function validateForm(): boolean {
    emailError = '';
    generalError = '';

    if (!email.trim()) {
      emailError = '请输入邮箱地址';
      return false;
    }

    if (!validateEmail(email)) {
      emailError = '请输入有效的邮箱地址';
      return false;
    }

    return true;
  }

  // 发送重置邮件
  async function handleSendResetEmail() {
    if (!validateForm()) return;

    isLoading = true;
    generalError = '';

    try {
      // 模拟API调用
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // TODO: 这里应该调用实际的重置密码API
      // const response = await fetch('/api/auth/forgot-password', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email })
      // });

      console.log('发送重置邮件到:', email);
      
      isEmailSent = true;
      toast.success('重置邮件已发送');
    } catch (error) {
      generalError = '发送失败，请稍后重试';
      console.error('发送重置邮件错误:', error);
    } finally {
      isLoading = false;
    }
  }

  // 重新发送邮件
  async function handleResendEmail() {
    await handleSendResetEmail();
  }

  // 返回登录页
  function goBackToLogin() {
    goto('/login');
  }

  // 键盘事件处理
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !isEmailSent) {
      handleSendResetEmail();
    }
  }
</script>

<svelte:head>
  <title>忘记密码 - 回中诗社</title>
  <meta name="description" content="重置您的回中诗社账户密码" />
</svelte:head>

<div class="min-h-screen bg-base-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
  <div class="max-w-md w-full space-y-8">
    <!-- 返回按钮 -->
    <div class="flex items-center">
      <Button.Root
        onclick={goBackToLogin}
        class="btn btn-ghost btn-sm"
      >
        <MdiArrowLeft class="w-4 h-4" />
        返回登录
      </Button.Root>
    </div>

    <!-- 头部 -->
    <div class="text-center">
      <div class="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
        <MdiEmailOutline class="w-8 h-8 text-primary" />
      </div>
      <h1 class="text-3xl font-bold text-base-content mb-2">
        {isEmailSent ? '邮件已发送' : '忘记密码'}
      </h1>
      <p class="text-base-content/70">
        {isEmailSent 
          ? '我们已向您的邮箱发送了重置密码的链接' 
          : '输入您的邮箱地址，我们将发送重置密码的链接'}
      </p>
    </div>

    <!-- 表单卡片 -->
    <div class="card bg-base-100 shadow-xl p-8">
      {#if !isEmailSent}
        <!-- 邮箱输入表单 -->
        {#if generalError}
          <div class="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {generalError}
          </div>
        {/if}

        <form onsubmit={handleSendResetEmail} class="space-y-6">
          <!-- 邮箱输入 -->
          <div class="form-control">
            <Label.Root class="label" for="email">
              <span class="label-text font-medium">邮箱地址</span>
            </Label.Root>
            <input
              id="email"
              type="email"
              bind:value={email}
              onkeydown={handleKeydown}
              class="input input-bordered w-full"
              class:input-error={emailError}
              placeholder="请输入您的邮箱地址"
              disabled={isLoading}
              autocomplete="email"
            />
            {#if emailError}
              <Label.Root class="label" for="email">
                <span class="label-text-alt text-error">{emailError}</span>
              </Label.Root>
            {/if}
          </div>

          <!-- 发送按钮 -->
          <Button.Root
            type="submit"
            disabled={isLoading || !email.trim()}
            class="btn btn-primary w-full"
          >
            {#if isLoading}
              <MdiLoading class="w-4 h-4 animate-spin" />
              发送中...
            {:else}
              <MdiEmailOutline class="w-4 h-4" />
              发送重置邮件
            {/if}
          </Button.Root>
        </form>
      {:else}
        <!-- 邮件发送成功状态 -->
        <div class="text-center space-y-6">
          <div class="mx-auto w-16 h-16 bg-success/10 rounded-full flex items-center justify-center">
            <MdiCheckCircle class="w-8 h-8 text-success" />
          </div>
          
          <div class="space-y-2">
            <p class="text-base-content/80">
              重置邮件已发送到：
            </p>
            <p class="font-medium text-primary">{email}</p>
          </div>

          <div class="bg-info/10 border border-info/20 rounded-lg p-4 text-sm text-info-content">
            <p class="mb-2">📧 请检查您的邮箱（包括垃圾邮件文件夹）</p>
            <p class="mb-2">🔗 点击邮件中的链接重置密码</p>
            <p>⏰ 链接将在24小时后失效</p>
          </div>

          <!-- 重新发送 -->
          <div class="space-y-3">
            <p class="text-sm text-base-content/60">
              没有收到邮件？
            </p>
            <Button.Root
              onclick={handleResendEmail}
              disabled={isLoading}
              class="btn btn-outline w-full"
            >
              {#if isLoading}
                <MdiLoading class="w-4 h-4 animate-spin" />
                重新发送中...
              {:else}
                重新发送邮件
              {/if}
            </Button.Root>
          </div>
        </div>
      {/if}
    </div>

    <!-- 底部链接 -->
    <div class="text-center">
      <p class="text-base-content/70 text-sm">
        想起密码了？
        <a href="/login" class="link link-primary font-medium">
          立即登录
        </a>
      </p>
    </div>
  </div>
</div>