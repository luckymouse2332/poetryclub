<script lang="ts">
	import { createDialog, melt } from '@melt-ui/svelte';
	import { X, Share2, Copy, Twitter, Facebook, Link } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';

	interface Props {
		poem: {
			id: string;
			title: string;
			author: string;
			content: string;
		};
	}

	let { poem }: Props = $props();

	const {
		elements: { trigger, portalled, overlay, content, title, description, close },
		states: { open }
	} = createDialog();

	// 生成分享链接
	const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/poem/${poem.id}`;
	const shareText = `分享一首美丽的诗歌：《${poem.title}》- ${poem.author}`;

	// 复制链接到剪贴板
	async function copyToClipboard() {
		try {
			await navigator.clipboard.writeText(shareUrl);
			toast.success('链接已复制到剪贴板');
		} catch (err) {
			toast.error('复制失败，请手动复制链接');
		}
	}

	// 分享到社交媒体
	function shareToTwitter() {
		const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
		window.open(twitterUrl, '_blank');
	}

	function shareToFacebook() {
		const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
		window.open(facebookUrl, '_blank');
	}

	// 使用 Web Share API（如果支持）
	async function nativeShare() {
		if (navigator.share) {
			try {
				await navigator.share({
					title: poem.title,
					text: shareText,
					url: shareUrl
				});
			} catch (err) {
				// 用户取消分享或出错
				console.log('分享取消或失败:', err);
			}
		} else {
			// 降级到复制链接
			copyToClipboard();
		}
	}
</script>

<!-- 触发按钮 -->
<button
	use:melt={$trigger}
	class="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors"
>
	<Share2 class="w-5 h-5" />
	分享
</button>

<!-- 模态框 -->
{#if $open}
	<div use:melt={$portalled}>
		<!-- 遮罩层 -->
		<div
			use:melt={$overlay}
			class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
		></div>

		<!-- 对话框内容 -->
		<div
			use:melt={$content}
			class="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 transform rounded-lg bg-white p-6 shadow-xl"
		>
			<!-- 标题栏 -->
			<div class="flex items-center justify-between mb-4">
				<h2 use:melt={$title} class="text-xl font-semibold text-gray-900">
					分享诗歌
				</h2>
				<button
					use:melt={$close}
					class="rounded-full p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
				>
					<X class="w-5 h-5" />
				</button>
			</div>

			<!-- 描述 -->
			<p use:melt={$description} class="text-gray-600 mb-6">
				分享《{poem.title}》给更多人欣赏
			</p>

			<!-- 诗歌预览 -->
			<div class="bg-gray-50 rounded-lg p-4 mb-6">
				<h3 class="font-medium text-gray-900 mb-1">{poem.title}</h3>
				<p class="text-sm text-gray-600 mb-2">作者：{poem.author}</p>
				<p class="text-sm text-gray-700 line-clamp-3 whitespace-pre-line">
					{poem.content}
				</p>
			</div>

			<!-- 分享选项 -->
			<div class="space-y-3">
				<!-- 原生分享 -->
						{#if typeof navigator !== 'undefined' && 'share' in navigator}
							<button
						onclick={nativeShare}
						class="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
					>
						<Share2 class="w-5 h-5 text-blue-600" />
						<span class="text-gray-900">使用系统分享</span>
					</button>
				{/if}

				<!-- 复制链接 -->
				<button
					onclick={copyToClipboard}
					class="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
				>
					<Copy class="w-5 h-5 text-green-600" />
					<span class="text-gray-900">复制链接</span>
				</button>

				<!-- 社交媒体分享 -->
				<div class="grid grid-cols-2 gap-3">
					<button
						onclick={shareToTwitter}
						class="flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
					>
						<Twitter class="w-5 h-5 text-blue-400" />
						<span class="text-gray-900">Twitter</span>
					</button>

					<button
						onclick={shareToFacebook}
						class="flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
					>
						<Facebook class="w-5 h-5 text-blue-600" />
						<span class="text-gray-900">Facebook</span>
					</button>
				</div>

				<!-- 链接显示 -->
				<div class="bg-gray-50 rounded-lg p-3">
					<div class="flex items-center gap-2 text-sm text-gray-600">
						<Link class="w-4 h-4" />
						<span class="truncate">{shareUrl}</span>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	.line-clamp-3 {
		display: -webkit-box;
		-webkit-line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>