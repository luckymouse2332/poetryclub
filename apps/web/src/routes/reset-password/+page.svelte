<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { toast } from 'svelte-sonner';
  import { authStore } from '$lib/stores/auth';
  
  import { Label, Button } from 'bits-ui';
  
  import MdiLockReset from 'virtual:icons/mdi/lock-reset';
  import MdiEyeOutline from 'virtual:icons/mdi/eye-outline';
  import MdiEyeOffOutline from 'virtual:icons/mdi/eye-off-outline';
  import MdiLoading from 'virtual:icons/mdi/loading';
  import MdiCheckCircle from 'virtual:icons/mdi/check-circle';
  import MdiAlertCircle from 'virtual:icons/mdi/alert-circle';

  // URL参数
  let token = '';
  let email = '';
  
  // 表单状态
  let password = '';
  let confirmPassword = '';
  let showPassword = false;
  let showConfirmPassword = false;
  let isLoading = false;
  let isTokenValid = false;
  let isTokenChecking = true;
  let isResetComplete = false;
  
  // 错误状态
  let passwordError = '';
  let confirmPasswordError = '';
  let generalError = '';
  
  // 密码强度
  let passwordStrength = 0;
  let passwordStrengthText = '';

  onMount(() => {
    // 获取URL参数
    token = $page.url.searchParams.get('token') || '';
    email = $page.url.searchParams.get('email') || '';
    
    if (!token) {
      generalError = '无效的重置链接';
      isTokenChecking = false;
      return;
    }
    
    // 验证token
    validateToken();
  });

  // 验证重置token
  async function validateToken() {
    try {
      // 模拟API调用验证token
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // TODO: 这里应该调用实际的token验证API
      // const response = await fetch('/api/auth/validate-reset-token', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ token })
      // });
      
      // 模拟验证成功
      isTokenValid = true;
    } catch (error) {
      generalError = '重置链接已失效或无效';
      console.error('Token验证失败:', error);
    } finally {
      isTokenChecking = false;
    }
  }

  // 计算密码强度
  function calculatePasswordStrength(pwd: string) {
    let strength = 0;
    let text = '';
    
    if (pwd.length >= 8) strength += 1;
    if (/[a-z]/.test(pwd)) strength += 1;
    if (/[A-Z]/.test(pwd)) strength += 1;
    if (/[0-9]/.test(pwd)) strength += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) strength += 1;
    
    switch (strength) {
      case 0:
      case 1:
        text = '弱';
        break;
      case 2:
      case 3:
        text = '中等';
        break;
      case 4:
      case 5:
        text = '强';
        break;
    }
    
    passwordStrength = strength;
    passwordStrengthText = text;
  }

  // 表单验证
  function validateForm(): boolean {
    let isValid = true;
    
    // 重置错误
    passwordError = '';
    confirmPasswordError = '';
    generalError = '';
    
    // 验证密码
    if (!password.trim()) {
      passwordError = '请输入新密码';
      isValid = false;
    } else if (password.length < 8) {
      passwordError = '密码至少需要8位字符';
      isValid = false;
    } else if (passwordStrength < 2) {
      passwordError = '密码强度太弱，请包含字母、数字或特殊字符';
      isValid = false;
    }
    
    // 验证确认密码
    if (!confirmPassword.trim()) {
      confirmPasswordError = '请确认新密码';
      isValid = false;
    } else if (password !== confirmPassword) {
      confirmPasswordError = '两次输入的密码不一致';
      isValid = false;
    }
    
    return isValid;
  }

  // 重置密码
  async function handleResetPassword() {
    if (!validateForm()) return;
    
    isLoading = true;
    generalError = '';
    
    try {
      // 模拟API调用
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      // TODO: 这里应该调用实际的重置密码API
      // const response = await fetch('/api/auth/reset-password', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ token, password })
      // });
      
      console.log('密码重置成功');
      
      isResetComplete = true;
      toast.success('密码重置成功');
      
      // 3秒后跳转到登录页
      setTimeout(() => {
        goto('/login');
      }, 3000);
    } catch (error) {
      generalError = '重置失败，请稍后重试';
      console.error('重置密码错误:', error);
    } finally {
      isLoading = false;
    }
  }

  // 监听密码输入
  function handlePasswordInput() {
    calculatePasswordStrength(password);
  }

  // 键盘事件处理
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && isTokenValid && !isResetComplete) {
      handleResetPassword();
    }
  }

  // 获取密码强度颜色
  function getStrengthColor() {
    if (passwordStrength <= 1) return 'text-error';
    if (passwordStrength <= 3) return 'text-warning';
    return 'text-success';
  }

  // 获取密码强度进度
  function getStrengthProgress() {
    return (passwordStrength / 5) * 100;
  }
</script>

<svelte:head>
  <title>重置密码 - 回中诗社</title>
  <meta name="description" content="重置您的回中诗社账户密码" />
</svelte:head>

<div class="min-h-screen bg-base-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
  <div class="max-w-md w-full space-y-8">
    <!-- 头部 -->
    <div class="text-center">
      <div class="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
        {#if isResetComplete}
          <MdiCheckCircle class="w-8 h-8 text-success" />
        {:else if !isTokenValid && !isTokenChecking}
          <MdiAlertCircle class="w-8 h-8 text-error" />
        {:else}
          <MdiLockReset class="w-8 h-8 text-primary" />
        {/if}
      </div>
      <h1 class="text-3xl font-bold text-base-content mb-2">
        {#if isResetComplete}
          重置成功
        {:else if !isTokenValid && !isTokenChecking}
          链接无效
        {:else}
          重置密码
        {/if}
      </h1>
      <p class="text-base-content/70">
        {#if isResetComplete}
          您的密码已成功重置，即将跳转到登录页
        {:else if !isTokenValid && !isTokenChecking}
          重置链接已失效或无效，请重新申请
        {:else if email}
          为账户 {email} 设置新密码
        {:else}
          请设置您的新密码
        {/if}
      </p>
    </div>

    <!-- 内容卡片 -->
    <div class="card bg-base-100 shadow-xl p-8">
      {#if isTokenChecking}
        <!-- 验证token状态 -->
        <div class="text-center py-8">
          <MdiLoading class="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p class="text-base-content/60">验证重置链接...</p>
        </div>
      {:else if !isTokenValid}
        <!-- Token无效状态 -->
        <div class="text-center space-y-4">
          <div class="bg-error/10 border border-error/20 rounded-lg p-4 text-sm text-error-content">
            <p class="mb-2">⚠️ 重置链接无效或已过期</p>
            <p>请重新申请密码重置</p>
          </div>
          
          <div class="space-y-3">
            <Button.Root
              onclick={() => goto('/forgot-password')}
              class="btn btn-primary w-full"
            >
              重新申请重置
            </Button.Root>
            
            <Button.Root
              onclick={() => goto('/login')}
              class="btn btn-outline w-full"
            >
              返回登录
            </Button.Root>
          </div>
        </div>
      {:else if isResetComplete}
        <!-- 重置完成状态 -->
        <div class="text-center space-y-6">
          <div class="mx-auto w-16 h-16 bg-success/10 rounded-full flex items-center justify-center">
            <MdiCheckCircle class="w-8 h-8 text-success" />
          </div>
          
          <div class="bg-success/10 border border-success/20 rounded-lg p-4 text-sm text-success-content">
            <p class="mb-2">🎉 密码重置成功！</p>
            <p>您现在可以使用新密码登录</p>
          </div>
          
          <Button.Root
            onclick={() => goto('/login')}
            class="btn btn-primary w-full"
          >
            立即登录
          </Button.Root>
        </div>
      {:else}
        <!-- 重置密码表单 -->
        {#if generalError}
          <div class="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {generalError}
          </div>
        {/if}

        <form onsubmit={handleResetPassword} class="space-y-6">
          <!-- 新密码输入 -->
          <div class="form-control">
            <Label.Root class="label" for="password">
              <span class="label-text font-medium">新密码</span>
            </Label.Root>
            <div class="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                bind:value={password}
                oninput={handlePasswordInput}
                onkeydown={handleKeydown}
                class="input input-bordered w-full pr-12"
                class:input-error={passwordError}
                placeholder="请输入新密码"
                disabled={isLoading}
                autocomplete="new-password"
              />
              <Button.Root
                type="button"
                onclick={() => (showPassword = !showPassword)}
                class="btn btn-ghost btn-sm absolute inset-y-0 right-0 rounded-l-none"
                disabled={isLoading}
              >
                {#if showPassword}
                  <MdiEyeOffOutline class="w-4 h-4" />
                {:else}
                  <MdiEyeOutline class="w-4 h-4" />
                {/if}
              </Button.Root>
            </div>
            
            <!-- 密码强度指示器 -->
            {#if password}
              <div class="mt-2">
                <div class="flex items-center justify-between text-xs mb-1">
                  <span class="text-base-content/60">密码强度</span>
                  <span class={getStrengthColor()}>{passwordStrengthText}</span>
                </div>
                <div class="w-full bg-base-300 rounded-full h-1.5">
                  <div 
                    class="h-1.5 rounded-full transition-all duration-300"
                    class:bg-error={passwordStrength <= 1}
                    class:bg-warning={passwordStrength > 1 && passwordStrength <= 3}
                    class:bg-success={passwordStrength > 3}
                    style="width: {getStrengthProgress()}%"
                  ></div>
                </div>
              </div>
            {/if}
            
            {#if passwordError}
              <Label.Root class="label" for="password">
                <span class="label-text-alt text-error">{passwordError}</span>
              </Label.Root>
            {/if}
          </div>

          <!-- 确认密码输入 -->
          <div class="form-control">
            <Label.Root class="label" for="confirm-password">
              <span class="label-text font-medium">确认新密码</span>
            </Label.Root>
            <div class="relative">
              <input
                id="confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                bind:value={confirmPassword}
                onkeydown={handleKeydown}
                class="input input-bordered w-full pr-12"
                class:input-error={confirmPasswordError}
                placeholder="请再次输入新密码"
                disabled={isLoading}
                autocomplete="new-password"
              />
              <Button.Root
                type="button"
                onclick={() => (showConfirmPassword = !showConfirmPassword)}
                class="btn btn-ghost btn-sm absolute inset-y-0 right-0 rounded-l-none"
                disabled={isLoading}
              >
                {#if showConfirmPassword}
                  <MdiEyeOffOutline class="w-4 h-4" />
                {:else}
                  <MdiEyeOutline class="w-4 h-4" />
                {/if}
              </Button.Root>
            </div>
            {#if confirmPasswordError}
              <Label.Root class="label" for="confirm-password">
                <span class="label-text-alt text-error">{confirmPasswordError}</span>
              </Label.Root>
            {/if}
          </div>

          <!-- 密码要求提示 -->
          <div class="bg-info/10 border border-info/20 rounded-lg p-4 text-sm text-info-content">
            <p class="font-medium mb-2">密码要求：</p>
            <ul class="space-y-1 text-xs">
              <li class="flex items-center gap-2">
                <span class="w-1 h-1 bg-current rounded-full"></span>
                至少8个字符
              </li>
              <li class="flex items-center gap-2">
                <span class="w-1 h-1 bg-current rounded-full"></span>
                包含字母、数字或特殊字符
              </li>
              <li class="flex items-center gap-2">
                <span class="w-1 h-1 bg-current rounded-full"></span>
                避免使用常见密码
              </li>
            </ul>
          </div>

          <!-- 重置按钮 -->
          <Button.Root
            type="submit"
            disabled={isLoading || !password.trim() || !confirmPassword.trim()}
            class="btn btn-primary w-full"
          >
            {#if isLoading}
              <MdiLoading class="w-4 h-4 animate-spin" />
              重置中...
            {:else}
              <MdiLockReset class="w-4 h-4" />
              重置密码
            {/if}
          </Button.Root>
        </form>
      {/if}
    </div>

    <!-- 底部链接 -->
    {#if !isResetComplete}
      <div class="text-center">
        <p class="text-base-content/70 text-sm">
          想起密码了？
          <a href="/login" class="link link-primary font-medium">
            立即登录
          </a>
        </p>
      </div>
    {/if}
  </div>
</div>