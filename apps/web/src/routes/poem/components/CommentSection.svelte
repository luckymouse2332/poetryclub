<script lang="ts">
	import CommentItem from './CommentItem.svelte';
	
	let { comments, handleAddComment }: {
		comments: Array<{
			id: number;
			author: string;
			avatar: string;
			content: string;
			time: string;
			likes: number;
		}>;
		handleAddComment: (content: string) => void;
	} = $props();
	
	let newComment = $state('');
	
	function addComment() {
		if (newComment.trim()) {
			handleAddComment(newComment);
			newComment = '';
		}
	}
</script>

<div class="poetry-card card-enhanced p-6 border poetry-border">
	<h3 class="text-2xl font-bold mb-6 poetry-text-primary font-kai">诗友评论</h3>
	
	<!-- 评论输入框 -->
	<div class="mb-6">
		<textarea 
			bind:value={newComment}
			placeholder="分享你的感悟..."
			class="textarea poetry-input-bg border poetry-border text-amber-900 dark:text-slate-100 w-full h-24 resize-none font-kai focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
		></textarea>
		<div class="flex justify-end mt-3">
			<button 
				onclick={addComment}
				class="poetry-btn-primary px-6 py-2 rounded-lg font-medium font-kai transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg"
			>
				发表评论
			</button>
		</div>
	</div>
	
	<!-- 评论列表 -->
	<div class="space-y-4">
		{#each comments as comment}
			<CommentItem {comment} />
		{/each}
	</div>
</div>