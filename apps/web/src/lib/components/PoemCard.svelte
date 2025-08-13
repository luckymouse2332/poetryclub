<script lang="ts">
	let { poem, isLiked = false }: {
		poem: {
			title: string;
			author: string;
			dynasty: string;
			content: string;
			likes: number;
			comments: number;
			tags: string[];
		};
		isLiked?: boolean;
	} = $props();
	
	function toggleLike() {
		if (isLiked) {
			poem.likes -= 1;
		} else {
			poem.likes += 1;
		}
		isLiked = !isLiked;
	}
</script>

<article class="poetry-card card-enhanced overflow-hidden border poetry-border">
	<!-- 诗词头部 -->
	<header class="poetry-header p-8">
		<div class="text-center space-y-3">
			<h1 class="text-4xl font-bold font-kai">{poem.title}</h1>
			<p class="text-xl opacity-90 font-kai">{poem.dynasty} · {poem.author}</p>
		</div>
	</header>
	
	<!-- 诗词内容 -->
	<section class="p-8 poetry-surface-100">
		<div class="text-center space-y-6 mb-8">
			{#each poem.content.split('\n') as line}
				<p class="text-xl poem-content poetry-text-primary">{line}</p>
			{/each}
		</div>
		
		<!-- 标签 -->
		<div class="flex flex-wrap gap-3 justify-center mb-6">
			{#each poem.tags as tag}
				<span class="poetry-btn-secondary px-4 py-2 rounded-full text-sm font-medium">{tag}</span>
			{/each}
		</div>
	</section>
	
	<!-- 诗词底部操作 -->
	<footer class="border-t poetry-border p-6 poetry-surface">
		<div class="flex justify-between items-center">
			<div class="flex items-center space-x-4">
				<button 
					class="flex items-center space-x-2 p-2 rounded-lg hover:poetry-surface-200 transition-all duration-300 hover:scale-105"
					onclick={toggleLike}
				>
					<span class="text-2xl transition-all duration-300">{isLiked ? '❤️' : '🤍'}</span>
					<span class="font-medium poetry-text-secondary">{poem.likes}</span>
				</button>
				<span class="poetry-text-muted flex items-center space-x-1">
					<span>💬</span>
					<span>{poem.comments} 条评论</span>
				</span>
			</div>
			<div class="flex space-x-3">
				<button class="poetry-btn-secondary px-4 py-2 rounded-lg">
					<span>📤</span>
					<span class="hidden sm:inline ml-1">分享</span>
				</button>
				<button class="poetry-btn-secondary px-4 py-2 rounded-lg">
					<span>⭐</span>
					<span class="hidden sm:inline ml-1">收藏</span>
				</button>
			</div>
		</div>
	</footer>
</article>