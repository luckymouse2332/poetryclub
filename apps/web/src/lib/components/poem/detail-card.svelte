<script lang="ts">
  import { ShareDialog } from '$lib/components';
  import Tags from './tags.svelte';
  
  import MdiEye from 'virtual:icons/mdi/eye';
  import MdiCardsHeartOutline from 'virtual:icons/mdi/cards-heart-outline';
  import MdiCardsHeart from 'virtual:icons/mdi/cards-heart';

  export let poem: {
    id: string;
    title: string;
    author: string;
    content: string;
    tags: string[];
    likes: number;
    views: number;
    createdAt: string;
  };
  export let isLiked: boolean = false;
  export let onLikeToggle: () => void;
</script>

<!-- 诗歌详情卡片 -->
<div class="card bg-base-200 shadow-xl p-8 mb-8 rounded-xl border-2 border-base-300">
  <!-- 诗歌标题和作者 -->
  <div class="mb-6">
    <h1 class="text-3xl font-bold text-base-content mb-2 font-kai">
      {poem.title}
    </h1>
    <p class="text-lg text-base-content/80">
      <span class="font-medium">{poem.author}</span>
      <span class="mx-2">·</span>
      <span>{poem.createdAt}</span>
    </p>
  </div>

  <!-- 诗歌内容 -->
  <div class="mb-6">
    <div
      class="text-lg leading-relaxed text-base-content whitespace-pre-line poem-content"
    >
      {poem.content}
    </div>
  </div>

  <!-- 标签 -->
  <div class="mb-6">
    <Tags tags={poem.tags} />
  </div>

  <!-- 互动按钮 -->
  <div class="flex items-center gap-6 pt-4 border-t border-base-300">
    <button
      class="flex items-center gap-2 text-base-content/70 hover:text-red-600 transition-colors"
      onclick={onLikeToggle}
    >
      {#if isLiked}
        <MdiCardsHeart />
      {:else}
        <MdiCardsHeartOutline />
      {/if}
      <span>{poem.likes}</span>
    </button>
    <button
      class="flex items-center gap-2 text-base-content/70 hover:text-base-content transition-colors"
    >
      <MdiEye />
      <span>{poem.views}</span>
    </button>
    <ShareDialog poem={poem} />
  </div>
</div>