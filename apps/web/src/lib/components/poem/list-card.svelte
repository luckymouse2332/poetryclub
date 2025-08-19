<script lang="ts">
  import MdiMessageOutline from 'virtual:icons/mdi/message-outline';
  import MdiCardsHeartOutline from 'virtual:icons/mdi/cards-heart-outline';

  let {
    poem,
  }: {
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
  let contentPreview = $derived(
    poem.content.split('\n').slice(0, 2).join('\n')
  );
</script>

<!-- DaisyUI Card Component -->
<div
  class="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 border border-base-300"
>
  <div class="card-body">
    <!-- 诗词头部 -->
    <div class="space-y-2 mb-4">
      <h2
        class="card-title text-2xl font-bold"
        style="font-family: 'KaiTi', '楷体', serif;"
      >
        <a href="/poem/{poem.id}" class="hover:text-primary transition-colors">
          {poem.title}
        </a>
      </h2>
      <p
        class="text-lg opacity-80"
        style="font-family: 'KaiTi', '楷体', serif;"
      >
        {poem.dynasty} · {poem.author}
      </p>
      <p class="text-sm opacity-60">{poem.publishedAt}</p>
    </div>

    <!-- 诗词内容预览 -->
    <div class="space-y-2 mb-4 h-full">
      {#each contentPreview.split('\n') as line}
        <p
          class="text-lg opacity-90"
          style="font-family: 'KaiTi', '楷体', serif;"
        >
          {line}
        </p>
      {/each}
      {#if poem.content.split('\n').length > 2}
        <p class="text-sm opacity-60 italic">...</p>
      {/if}
    </div>

    <!-- 标签 -->
    <div class="flex flex-wrap gap-2 mb-4">
      {#each poem.tags.slice(0, 3) as tag}
        <div class="badge badge-outline badge-sm">{tag}</div>
      {/each}
      {#if poem.tags.length > 3}
        <div class="badge badge-ghost badge-sm">+{poem.tags.length - 3}</div>
      {/if}
    </div>

    <!-- 诗词底部操作 -->
    <div
      class="card-actions justify-end items-center pt-4 border-t border-base-300"
    >
      <div class="flex items-center gap-4 h-8">
        <div class="flex items-center gap-1 text-sm opacity-70 h-full">
          <MdiCardsHeartOutline class="w-4 h-4" />
          <span>{poem.likes}</span>
        </div>
        <div class="flex items-center gap-1 text-sm opacity-70 h-full">
          <MdiMessageOutline class="w-4 h-4" />
          <span>{poem.comments}</span>
        </div>
      </div>
      <a href="/poem/{poem.id}" class="btn btn-primary btn-sm"> 阅读全文 </a>
    </div>
  </div>
</div>
