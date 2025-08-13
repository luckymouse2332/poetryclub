<script lang="ts">
	let { featuredPoems }: {
		featuredPoems: Array<{
			title: string;
			author: string;
			preview: string;
			likes: number;
		}>;
	} = $props();
</script>

<aside class="space-y-6">
	<div class="poetry-card card-enhanced p-6 border poetry-border">
		<h3 class="text-2xl font-bold mb-6 poetry-text-primary font-kai">今日推荐</h3>
		<div class="space-y-4">
			{#each featuredPoems as poem}
				<div class="poetry-card p-4 cursor-pointer border poetry-border rounded-lg">
					<h4 class="font-semibold poetry-text-primary font-kai text-lg">{poem.title}</h4>
					<p class="text-sm poetry-text-secondary mb-2 font-kai">{poem.author}</p>
					<p class="text-sm poetry-text-primary mb-3 font-kai">{poem.preview}</p>
					<div class="flex items-center justify-between">
						<span class="text-xs poetry-text-muted flex items-center space-x-1">
							<span>❤️</span>
							<span>{poem.likes}</span>
						</span>
						<button class="poetry-btn-secondary px-3 py-1 rounded text-sm">阅读</button>
					</div>
				</div>
			{/each}
		</div>
	</div>
</aside>