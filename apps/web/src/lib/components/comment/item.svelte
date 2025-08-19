<script lang="ts">
  import MdiCardsHeartOutline from 'virtual:icons/mdi/cards-heart-outline';
  import MdiCardsHeart from 'virtual:icons/mdi/cards-heart';

  let {
    comment,
  }: {
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

<div class="flex space-x-4 p-4 border-b border-base-300">
  <div
    class="w-10 h-10 rounded-full bg-base-200 flex items-center justify-center text-base-content font-bold text-sm"
  >
    {comment.author.charAt(0).toUpperCase()}
  </div>
  <div class="flex-1">
    <div class="flex items-center space-x-2 mb-1">
      <span class="font-semibold text-base-content font-kai"
        >{comment.author}</span
      >
      <span class="text-xs text-base-content/60">{comment.time}</span>
    </div>
    <p class="text-base-content mb-3 font-kai leading-relaxed">
      {comment.content}
    </p>
    <div class="flex items-center space-x-4">
      <button
        onclick={toggleLike}
        class="flex items-center space-x-1 text-sm text-base-content/70 hover:text-base-content transition-colors duration-200"
      >
        <span class="text-base">
          {#if isLiked}
            <MdiCardsHeart />
          {:else}
            <MdiCardsHeartOutline />
          {/if}
        </span>
        <span>{comment.likes}</span>
      </button>
      <button
        class="text-sm text-base-content/70 hover:text-base-content transition-colors duration-200"
      >
        回复
      </button>
    </div>
  </div>
</div>