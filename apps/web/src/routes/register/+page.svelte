<script lang="ts">
  let formData = {
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  };
  let acceptTerms = false;
  let isLoading = false;
  let passwordStrength = 0;

  // 密码强度检测
  $: {
    let strength = 0;
    if (formData.password.length >= 8) strength++;
    if (/[A-Z]/.test(formData.password)) strength++;
    if (/[a-z]/.test(formData.password)) strength++;
    if (/[0-9]/.test(formData.password)) strength++;
    if (/[^A-Za-z0-9]/.test(formData.password)) strength++;
    passwordStrength = strength;
  }

  // 密码匹配检查
  $: passwordsMatch =
    formData.password === formData.confirmPassword &&
    formData.confirmPassword !== '';

  function handleRegister() {
    if (!acceptTerms) {
      alert('请先同意用户协议和隐私政策');
      return;
    }

    if (!passwordsMatch) {
      alert('两次输入的密码不一致');
      return;
    }

    isLoading = true;
    // 这里将来会实现实际的注册逻辑
    console.log('注册信息:', formData);

    // 模拟注册过程
    setTimeout(() => {
      isLoading = false;
      // 注册成功后的处理
    }, 1000);
  }

  function getPasswordStrengthText() {
    switch (passwordStrength) {
      case 0:
      case 1:
        return '弱';
      case 2:
      case 3:
        return '中等';
      case 4:
      case 5:
        return '强';
      default:
        return '';
    }
  }
</script>

<svelte:head>
  <title>注册 - 回中诗社</title>
  <meta name="description" content="注册回中诗社，开启您的诗词创作之旅" />
</svelte:head>

<div
  class="min-h-screen bg-base-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
>
  <div class="max-w-md w-full space-y-8">
    <!-- 头部 -->
    <div class="text-center">
      <h1 class="text-4xl font-bold text-primary font-kai mb-2">回中诗社</h1>
      <h2 class="text-2xl font-semibold text-base-content mb-6">创建新账户</h2>
      <p class="text-base-content/70">加入我们，开启您的诗词创作之旅</p>
    </div>

    <!-- 注册表单 -->
    <div class="card bg-base-200 shadow-xl">
      <div class="card-body">
        <form onsubmit={handleRegister} class="space-y-6">
          <!-- 用户名输入 -->
          <div class="form-control">
            <label class="label" for="username">
              <span class="label-text">用户名</span>
            </label>
            <input
              id="username"
              type="text"
              bind:value={formData.username}
              required
              class="input input-bordered w-full"
              placeholder="请输入用户名"
            />
            <label class="label" for="username">
              <span class="label-text-alt text-base-content/60">
                用户名将作为您的诗词署名显示
              </span>
            </label>
          </div>

          <!-- 邮箱输入 -->
          <div class="form-control">
            <label class="label" for="email">
              <span class="label-text">邮箱地址</span>
            </label>
            <input
              id="email"
              type="email"
              bind:value={formData.email}
              required
              class="input input-bordered w-full"
              placeholder="请输入您的邮箱"
            />
          </div>

          <!-- 密码输入 -->
          <div class="form-control">
            <label class="label" for="password">
              <span class="label-text">密码</span>
            </label>
            <input
              id="password"
              type="password"
              bind:value={formData.password}
              required
              class="input input-bordered w-full"
              placeholder="请输入密码"
            />
            {#if formData.password}
              <div class="mt-2 flex items-center space-x-2">
                <progress
                  class="progress {passwordStrength <= 1
                    ? 'progress-error'
                    : passwordStrength <= 3
                      ? 'progress-warning'
                      : 'progress-success'} flex-1"
                  value={passwordStrength}
                  max="5"
                ></progress>
                <span
                  class="text-xs {passwordStrength <= 1
                    ? 'text-error'
                    : passwordStrength <= 3
                      ? 'text-warning'
                      : 'text-success'}"
                >
                  {getPasswordStrengthText()}
                </span>
              </div>
            {/if}
          </div>

          <!-- 确认密码输入 -->
          <div class="form-control">
            <label class="label" for="confirmPassword">
              <span class="label-text">确认密码</span>
            </label>
            <input
              id="confirmPassword"
              type="password"
              bind:value={formData.confirmPassword}
              required
              class="input input-bordered w-full"
              placeholder="请再次输入密码"
            />
            {#if formData.confirmPassword && !passwordsMatch}
              <label class="label" for="confirmPassword">
                <span class="label-text-alt text-error"
                  >两次输入的密码不一致</span
                >
              </label>
            {:else if formData.confirmPassword && passwordsMatch}
              <label class="label" for="confirmPassword">
                <span class="label-text-alt text-success">密码匹配 ✓</span>
              </label>
            {/if}
          </div>

          <!-- 用户协议 -->
          <div class="form-control">
            <label class="label cursor-pointer justify-start">
              <input
                type="checkbox"
                bind:checked={acceptTerms}
                disabled={isLoading}
                class="checkbox checkbox-primary checkbox-sm mr-3"
              />
              <span class="label-text">
                我已阅读并同意
                <a href="/terms" class="link link-primary">用户协议</a>
                和
                <a href="/privacy" class="link link-primary">隐私政策</a>
              </span>
            </label>
          </div>

          <!-- 注册按钮 -->
          <button
            type="submit"
            disabled={isLoading || !acceptTerms || !passwordsMatch}
            class="btn btn-primary w-full"
          >
            {#if isLoading}
              <span class="loading loading-spinner loading-sm"></span>
              注册中...
            {:else}
              创建账户
            {/if}
          </button>

          <!-- 分割线 -->
          <div class="divider">或者</div>

          <!-- 第三方注册 -->
          <div class="space-y-3">
            <button type="button" class="btn btn-outline w-full">
              <span class="mr-2">🐙</span>
              使用 GitHub 注册
            </button>
            <button type="button" class="btn btn-outline w-full">
              <span class="mr-2">📱</span>
              使用微信注册
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 登录链接 -->
    <div class="text-center">
      <p class="text-base-content/70">
        已有账户？
        <a href="/login" class="link link-primary font-medium"> 立即登录 </a>
      </p>
    </div>
  </div>
</div>
