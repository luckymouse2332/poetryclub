<script lang="ts">
	import { createPopover, melt } from '@melt-ui/svelte';
	import { goto } from '$app/navigation';
	import MdiUser from 'virtual:icons/mdi/user';
	import MdiBook from 'virtual:icons/mdi/book';
	import MdiHeart from 'virtual:icons/mdi/heart';
	import MdiPencil from 'virtual:icons/mdi/pencil';
	import MdiLogout from 'virtual:icons/mdi/logout';
	import MdiSettingsOutline from 'virtual:icons/mdi/settings-outline';

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
		elements: { trigger, content, arrow, close },
		states: { open }
	} = createPopover({
		forceVisible: true,
		positioning: {
			placement: 'bottom-end'
		}
	});

	// 菜单项点击处理
	function handleMenuClick(action: string) {
		switch (action) {
			case 'profile':
				goto('/profile');
				break;
			case 'my-poems':
				goto('/my-poems');
				break;
			case 'favorites':
				goto('/favorites');
				break;
			case 'write':
				goto('/write');
				break;
			case 'settings':
				goto('/settings');
				break;
			case 'logout':
				// 处理登出逻辑
				console.log('用户登出');
				goto('/login');
				break;
			case 'login':
				goto('/login');
				break;
			case 'register':
				goto('/register');
				break;
		}
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
	class="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
>
	{#if isLoggedIn && user}
		<!-- 已登录用户头像 -->
		<img
			src={getUserAvatar()}
			alt={user.name}
			class="w-8 h-8 rounded-full object-cover"
		/>
		<span class="text-sm font-medium text-gray-700 hidden md:block">{user.name}</span>
	{:else}
		<!-- 未登录用户图标 -->
		<MdiUser class="w-6 h-6 text-gray-600" />
		<span class="text-sm font-medium text-gray-700 hidden md:block">登录</span>
	{/if}
</button>

<!-- 弹出菜单 -->
{#if $open}
	<div
		use:melt={$content}
		class="z-50 min-w-[200px] rounded-lg border border-gray-200 bg-white p-2 shadow-lg"
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
				<button
					onclick={() => handleMenuClick('profile')}
					class="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
				>
					<MdiUser class="w-4 h-4" />
					个人资料
				</button>

				<button
					onclick={() => handleMenuClick('my-poems')}
					class="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
				>
					<MdiBook class="w-4 h-4" />
					我的诗歌
				</button>

				<button
					onclick={() => handleMenuClick('favorites')}
					class="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
				>
					<MdiHeart class="w-4 h-4" />
					我的收藏
				</button>

				<button
					onclick={() => handleMenuClick('write')}
					class="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
				>
					<MdiPencil class="w-4 h-4" />
					创作诗歌
				</button>

				<hr class="my-2 border-gray-100" />

				<button
					onclick={() => handleMenuClick('settings')}
					class="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
				>
					<MdiSettingsOutline class="w-4 h-4" />
					设置
				</button>

				<button
					onclick={() => handleMenuClick('logout')}
					class="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
				>
					<MdiLogout class="w-4 h-4" />
					退出登录
				</button>
			</div>
		{:else}
			<!-- 未登录用户菜单 -->
			<div class="space-y-1">
				<button
					onclick={() => handleMenuClick('login')}
					class="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
				>
					<MdiUser class="w-4 h-4" />
					登录
				</button>

				<button
					onclick={() => handleMenuClick('register')}
					class="w-full flex items-center gap-3 px-3 py-2 text-sm text-green-600 hover:bg-green-50 rounded-md transition-colors"
				>
					<MdiPencil class="w-4 h-4" />
					注册
				</button>
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