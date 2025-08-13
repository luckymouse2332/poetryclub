<script lang="ts">
	let { comment }: {
		comment: {
			id: number;
			author: string;
			time: string;
			content: string;
			likes: number;
			avatar: string;
		};
	} = $props();

	let isLiked = $state(false);

	function toggleLike() {
		if (isLiked) {
			comment.likes -= 1;
		} else {
			comment.likes += 1;
		}
		isLiked = !isLiked;
	}
</script>

<div class="flex space-x-4 p-4 border-b poetry-border">
	<div class="w-10 h-10 rounded-full poetry-surface-200 flex items-center justify-center poetry-text-primary font-bold text-sm">
		{comment.author.charAt(0).toUpperCase()}
	</div>
	<div class="flex-1">
		<div class="flex items-center space-x-2 mb-1">
			<span class="font-semibold poetry-text-primary font-kai">{comment.author}</span>
			<span class="text-xs poetry-text-muted">{comment.time}</span>
		</div>
		<p class="poetry-text-primary mb-3 font-kai leading-relaxed">{comment.content}</p>
		<div class="flex items-center space-x-4">
			<button 
				onclick={toggleLike}
				class="flex items-center space-x-1 text-sm poetry-text-secondary hover:poetry-text-primary transition-colors duration-200"
			>
				<span class="text-base">{isLiked ? '❤️' : '🤍'}</span>
				<span>{comment.likes}</span>
			</button>
			<button class="text-sm poetry-text-secondary hover:poetry-text-primary transition-colors duration-200">
				回复
			</button>
		</div>
	</div>
</div>