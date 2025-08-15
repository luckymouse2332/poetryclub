<script lang="ts">
  import PoemTags from './PoemTags.svelte';
  import MdiEye from 'virtual:icons/mdi/eye';
  import MdiCardsHeartOutline from 'virtual:icons/mdi/cards-heart-outline';
  import MdiCardsHeart from 'virtual:icons/mdi/cards-heart';
  import { ShareDialog } from '$lib/components';
  
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
<div class="poetry-card p-8 mb-8 rounded-xl border-2 poetry-border">
  <!-- 诗歌标题和作者 -->
  <div class="mb-6">
    <h1 class="text-3xl font-bold poetry-text-primary mb-2 font-kai">
      {poem.title}
    </h1>
    <p class="text-lg poetry-text-secondary">
      <span class="font-medium">{poem.author}</span>
      <span class="mx-2">·</span>
      <span>{poem.createdAt}</span>
    </p>
  </div>

  <!-- 诗歌内容 -->
  <div class="mb-6">
    <div
      class="text-lg leading-relaxed poetry-text-primary whitespace-pre-line poem-content"
    >
      {poem.content}
    </div>
  </div>

  <!-- 标签 -->
  <div class="mb-6">
    <PoemTags tags={poem.tags} />
  </div>

  <!-- 互动按钮 -->
  <div class="flex items-center gap-6 pt-4 border-t poetry-border">
    <button
      class="flex items-center gap-2 poetry-text-secondary hover:text-red-600 transition-colors"
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
      class="flex items-center gap-2 poetry-text-secondary hover:poetry-text-primary transition-colors"
    >
      <MdiEye />
      <span>{poem.views}</span>
    </button>
    <ShareDialog poem={poem} />
  </div>
</div>