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

<div class="card bg-base-200 shadow-xl p-6 border border-base-300">
	<h3 class="text-2xl font-bold mb-6 text-base-content font-kai">诗友评论</h3>
	
	<!-- 评论输入框 -->
	<div class="mb-6">
		<textarea 
			bind:value={newComment}
			placeholder="分享你的感悟..."
			class="textarea textarea-bordered w-full h-24 resize-none font-kai"
		></textarea>
		<div class="flex justify-end mt-3">
			<button 
				onclick={addComment}
				class="btn btn-primary font-kai"
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