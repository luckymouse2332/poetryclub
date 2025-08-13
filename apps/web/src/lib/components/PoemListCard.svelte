<script lang="ts">
	// Skeleton UI v3.0 doesn't have Card component
	// Using native div element with Tailwind styling instead
	
	let { poem }: {
		poem: {
			id: string;
			title: string;
			author: string;
			dynasty: string;
			content: string;
			likes: number;
			comments: number;
			tags: string[];
			publishedAt: string;
		};
	} = $props();
	
	// 截取内容预览（前两行）
	let contentPreview = $derived(poem.content.split('\n').slice(0, 2).join('\n'));
</script>

<div class="poetry-card card-enhanced overflow-hidden border poetry-border hover:shadow-lg transition-all duration-300 flex flex-col">
	<!-- 诗词主要内容区域 -->
	<div class="flex-1">
		<!-- 诗词头部 -->
		<header class="poetry-header p-6">
			<div class="space-y-2">
				<h2 class="text-2xl font-bold font-kai poetry-text-primary">
					<a href="/poem/{poem.id}" class="hover:opacity-80 transition-opacity">
						{poem.title}
					</a>
				</h2>
				<p class="text-lg opacity-90 font-kai poetry-text-secondary">{poem.dynasty} · {poem.author}</p>
				<p class="text-sm poetry-text-muted">{poem.publishedAt}</p>
			</div>
		</header>
		
		<!-- 诗词内容预览 -->
		<section class="px-6 pb-4">
			<div class="space-y-2">
				{#each contentPreview.split('\n') as line}
					<p class="text-lg poem-content poetry-text-primary opacity-90">{line}</p>
				{/each}
				{#if poem.content.split('\n').length > 2}
					<p class="text-sm poetry-text-muted italic">...</p>
				{/if}
			</div>
		</section>
		
		<!-- 标签 -->
		<section class="px-6 pb-4">
			<div class="flex flex-wrap gap-2">
				{#each poem.tags.slice(0, 3) as tag}
					<span class="poetry-btn-secondary px-3 py-1 rounded-full text-xs font-medium">{tag}</span>
				{/each}
				{#if poem.tags.length > 3}
					<span class="poetry-text-muted text-xs px-3 py-1">+{poem.tags.length - 3}</span>
				{/if}
			</div>
		</section>
	</div>
	
	<!-- 诗词底部操作 -->
	<footer class="border-t poetry-border p-4 poetry-surface">
		<div class="flex justify-between items-center">
			<div class="flex items-center space-x-4">
				<span class="poetry-text-muted flex items-center space-x-1 text-sm">
					<span>❤️</span>
					<span>{poem.likes}</span>
				</span>
				<span class="poetry-text-muted flex items-center space-x-1 text-sm">
					<span>💬</span>
					<span>{poem.comments}</span>
				</span>
			</div>
			<a 
				href="/poem/{poem.id}" 
				class="poetry-btn-primary px-4 py-2 rounded-lg text-sm hover:scale-105 transition-transform"
			>
				阅读全文
			</a>
		</div>
	</footer>
</div>