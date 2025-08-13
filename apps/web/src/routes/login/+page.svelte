<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { CustomCheckbox } from '$lib/components';
	import eyeSvg from '$lib/assets/icons/eye.svg';
	import eyeOffSvg from '$lib/assets/icons/eye-off.svg';
	import loadingSpinnerSvg from '$lib/assets/icons/loading-spinner.svg';
	// Skeleton UI v3.0 doesn't have Card, Button, Input, Label components
	// Using native HTML elements with Tailwind styling instead

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
			await new Promise(resolve => setTimeout(resolve, 1500));
			
			// 这里应该调用实际的登录API
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
		rememberMe = event.checked;
		console.log('记住我状态:', rememberMe);
	}

	onMount(() => {
		// 检查是否有记住的登录信息
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

<div class="min-h-screen poetry-surface flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
	<div class="max-w-md w-full space-y-8">
		<!-- 头部 -->
		<div class="text-center">
			<h1 class="text-4xl font-bold poetry-text-primary font-kai mb-2">
				回中诗社
			</h1>
			<h2 class="text-2xl font-semibold poetry-text-secondary mb-6">
				欢迎回到诗社
			</h2>
			<p class="poetry-text-muted">
				登录您的账户，继续诗词之旅
			</p>
		</div>

		<!-- 登录表单 -->
		<div class="poetry-card p-8 rounded-xl shadow-lg">
			{#if generalError}
				<div class="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
					{generalError}
				</div>
			{/if}

			<form onsubmit={handleLogin} class="space-y-6">
				<!-- 邮箱输入 -->
				<div>
					<label for="email" class="block text-sm font-medium poetry-text-primary mb-2">
					邮箱地址
				</label>
					<input
						id="email"
						type="email"
						bind:value={email}
						onkeydown={handleKeydown}
						class="w-full px-4 py-3 poetry-input-bg border poetry-border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 poetry-text-primary"
						class:border-red-500={emailError}
						placeholder="请输入您的邮箱"
						disabled={isLoading}
					/>
					{#if emailError}
						<p class="mt-1 text-sm text-red-600">{emailError}</p>
					{/if}
				</div>

				<!-- 密码输入 -->
				<div>
					<label for="password" class="block text-sm font-medium poetry-text-primary mb-2">
					密码
				</label>
					<div class="relative">
						<input
							id="password"
							type={showPassword ? 'text' : 'password'}
							bind:value={password}
							onkeydown={handleKeydown}
							class="w-full px-4 py-3 pr-12 poetry-input-bg border poetry-border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 poetry-text-primary"
							class:border-red-500={passwordError}
							placeholder="请输入您的密码"
							disabled={isLoading}
						/>
						<button
							type="button"
							onclick={() => showPassword = !showPassword}
							class="absolute inset-y-0 right-0 pr-3 flex items-center poetry-text-muted hover:poetry-text-secondary transition-colors"
							disabled={isLoading}
						>
							{#if showPassword}
							<img src={eyeOffSvg} alt="Hide password" class="h-5 w-5" />
						{:else}
							<img src={eyeSvg} alt="Show password" class="h-5 w-5" />
						{/if}
						</button>
					</div>
					{#if passwordError}
						<p class="mt-1 text-sm text-red-600">{passwordError}</p>
					{/if}
				</div>

				<!-- 记住我和忘记密码 -->
				<div class="flex items-center justify-between">
					<CustomCheckbox
						bind:checked={rememberMe}
						disabled={isLoading}
						label="记住我"
						id="remember-me"
						onchange={handleRememberMeChange}
					/>
					<button
						type="button"
						onclick={handleForgotPassword}
						class="text-sm poetry-text-primary hover:poetry-text-secondary transition-colors"
						disabled={isLoading}
					>
						忘记密码？
					</button>
				</div>

				<!-- 登录按钮 -->
				<button
					type="submit"
					disabled={isLoading}
					class="w-full py-3 px-4 poetry-btn-primary text-white font-medium rounded-lg hover:poetry-btn-primary-hover focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{#if isLoading}
					<span class="flex items-center justify-center">
						<img src={loadingSpinnerSvg} alt="Loading..." class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
						登录中...
					</span>
				{:else}
					登录
				{/if}
				</button>

				<!-- 分割线 -->
				<div class="relative my-6">
					<div class="absolute inset-0 flex items-center">
						<div class="w-full border-t poetry-border"></div>
					</div>
					<div class="relative flex justify-center text-sm">
						<span class="px-2 poetry-surface poetry-text-muted">或者</span>
					</div>
				</div>

				<!-- 第三方登录 -->
				<div class="space-y-3">
					<button
					type="button"
					onclick={() => handleThirdPartyLogin('GitHub')}
					disabled={isLoading}
					class="w-full flex justify-center items-center px-4 py-3 border poetry-border rounded-lg poetry-btn-secondary hover:poetry-btn-secondary-hover transition-all duration-200 disabled:opacity-50"
				>
					<span class="mr-2">🐙</span>
					使用 GitHub 登录
				</button>
					<button
					type="button"
					onclick={() => handleThirdPartyLogin('微信')}
					disabled={isLoading}
					class="w-full flex justify-center items-center px-4 py-3 border poetry-border rounded-lg poetry-btn-secondary hover:poetry-btn-secondary-hover transition-all duration-200 disabled:opacity-50"
				>
					<span class="mr-2">💬</span>
					使用微信登录
				</button>
				</div>
			</form>
		</div>

		<!-- 注册链接 -->
		<div class="text-center">
			<p class="poetry-text-secondary">
				还没有账户？
				<a href="/register" class="font-medium poetry-text-primary hover:poetry-text-secondary transition-colors">
					立即注册
				</a>
			</p>
		</div>

		<!-- 底部提示 -->
		<div class="text-center">
			<p class="text-xs poetry-text-muted">
				登录即表示您同意我们的
				<a href="/terms" class="poetry-text-primary hover:poetry-text-secondary transition-colors">用户协议</a>
				和
				<a href="/privacy" class="poetry-text-primary hover:poetry-text-secondary transition-colors">隐私政策</a>
			</p>
		</div>
	</div>
</div>