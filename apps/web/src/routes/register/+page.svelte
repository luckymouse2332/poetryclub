<script lang="ts">
	import { CustomCheckbox } from '$lib/components';
	import loadingSpinnerSvg from '$lib/assets/icons/loading-spinner.svg';

	let formData = {
		username: '',
		email: '',
		password: '',
		confirmPassword: ''
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
	$: passwordsMatch = formData.password === formData.confirmPassword && formData.confirmPassword !== '';
	
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
			case 1: return '弱';
			case 2:
			case 3: return '中等';
			case 4:
			case 5: return '强';
			default: return '';
		}
	}
	
	function getPasswordStrengthColor() {
		switch (passwordStrength) {
			case 0:
			case 1: return 'text-red-500';
			case 2:
			case 3: return 'text-yellow-500';
			case 4:
			case 5: return 'text-green-500';
			default: return '';
		}
	}

	// 处理用户协议复选框变化
	function handleTermsChange(event: { checked: boolean }) {
		acceptTerms = event.checked;
		console.log('用户协议同意状态:', acceptTerms);
	}
</script>

<svelte:head>
	<title>注册 - 回中诗社</title>
	<meta name="description" content="注册回中诗社，开启您的诗词创作之旅" />
</svelte:head>

<div class="min-h-screen poetry-surface flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
	<div class="max-w-md w-full space-y-8">
		<!-- 头部 -->
		<div class="text-center">
			<h1 class="text-4xl font-bold poetry-text-primary font-kai mb-2">
				回中诗社
			</h1>
			<h2 class="text-2xl font-semibold poetry-text-secondary mb-6">
				创建新账户
			</h2>
			<p class="poetry-text-muted">
				加入我们，开启您的诗词创作之旅
			</p>
		</div>

		<!-- 注册表单 -->
		<div class="poetry-card p-8 rounded-xl shadow-lg">
			<form onsubmit={handleRegister} class="space-y-6">
				<!-- 用户名输入 -->
				<div>
					<label for="username" class="block text-sm font-medium poetry-text-primary mb-2">
						用户名
					</label>
					<input
						id="username"
						type="text"
						bind:value={formData.username}
						required
						class="w-full px-4 py-3 poetry-input-bg border poetry-border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 poetry-text-primary"
						placeholder="请输入用户名"
					/>
					<p class="mt-1 text-xs poetry-text-muted">
						用户名将作为您的诗词署名显示
					</p>
				</div>

				<!-- 邮箱输入 -->
				<div>
					<label for="email" class="block text-sm font-medium poetry-text-primary mb-2">
						邮箱地址
					</label>
					<input
						id="email"
						type="email"
						bind:value={formData.email}
						required
						class="w-full px-4 py-3 poetry-input-bg border poetry-border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 poetry-text-primary"
						placeholder="请输入您的邮箱"
					/>
				</div>

				<!-- 密码输入 -->
				<div>
					<label for="password" class="block text-sm font-medium poetry-text-primary mb-2">
						密码
					</label>
					<input
						id="password"
						type="password"
						bind:value={formData.password}
						required
						class="w-full px-4 py-3 poetry-input-bg border poetry-border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 poetry-text-primary"
						placeholder="请输入密码"
					/>
					{#if formData.password}
						<div class="mt-2 flex items-center space-x-2">
							<div class="flex-1 bg-gray-200 rounded-full h-2">
								<div 
									class="h-2 rounded-full transition-all duration-300 {passwordStrength <= 1 ? 'bg-red-500' : passwordStrength <= 3 ? 'bg-yellow-500' : 'bg-green-500'}"
									style="width: {(passwordStrength / 5) * 100}%"
								></div>
							</div>
							<span class="text-xs {getPasswordStrengthColor()}">
								{getPasswordStrengthText()}
							</span>
						</div>
					{/if}
				</div>

				<!-- 确认密码输入 -->
				<div>
					<label for="confirmPassword" class="block text-sm font-medium poetry-text-primary mb-2">
						确认密码
					</label>
					<input
						id="confirmPassword"
						type="password"
						bind:value={formData.confirmPassword}
						required
						class="w-full px-4 py-3 poetry-input-bg border poetry-border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 poetry-text-primary"
						placeholder="请再次输入密码"
					/>
					{#if formData.confirmPassword && !passwordsMatch}
						<p class="mt-1 text-xs text-red-500">
							两次输入的密码不一致
						</p>
					{:else if formData.confirmPassword && passwordsMatch}
						<p class="mt-1 text-xs text-green-500">
							密码匹配 ✓
						</p>
					{/if}
				</div>

				<!-- 用户协议 -->
				<div class="flex items-start">
					<CustomCheckbox
						bind:checked={acceptTerms}
						disabled={isLoading}
						id="accept-terms"
						onchange={handleTermsChange}
					>
						我已阅读并同意
						<a href="/terms" class="poetry-text-primary hover:poetry-text-secondary transition-colors">用户协议</a>
						和
						<a href="/privacy" class="poetry-text-primary hover:poetry-text-secondary transition-colors">隐私政策</a>
					</CustomCheckbox>
				</div>

				<!-- 注册按钮 -->
				<button
					type="submit"
					disabled={isLoading || !acceptTerms || !passwordsMatch}
					class="w-full py-3 px-4 poetry-btn-primary text-white font-medium rounded-lg hover:poetry-btn-primary-hover focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{#if isLoading}
						<span class="flex items-center justify-center">
							<img src={loadingSpinnerSvg} alt="Loading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
							注册中...
						</span>
					{:else}
						创建账户
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

				<!-- 第三方注册 -->
				<div class="space-y-3">
					<button
						type="button"
						class="w-full flex justify-center items-center px-4 py-3 border poetry-border rounded-lg poetry-btn-secondary hover:poetry-btn-secondary-hover transition-all duration-200"
					>
						<span class="mr-2">🐙</span>
						使用 GitHub 注册
					</button>
					<button
						type="button"
						class="w-full flex justify-center items-center px-4 py-3 border poetry-border rounded-lg poetry-btn-secondary hover:poetry-btn-secondary-hover transition-all duration-200"
					>
						<span class="mr-2">📱</span>
						使用微信注册
					</button>
				</div>
			</form>
		</div>

		<!-- 登录链接 -->
		<div class="text-center">
			<p class="poetry-text-secondary">
				已有账户？
				<a href="/login" class="font-medium poetry-text-primary hover:poetry-text-secondary transition-colors">
					立即登录
				</a>
			</p>
		</div>
	</div>
</div>