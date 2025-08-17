<script lang="ts">
  import { toast } from 'svelte-sonner';
  import MdiShareOutline from 'virtual:icons/mdi/share-outline';
  import MdiContentCopy from 'virtual:icons/mdi/content-copy';
  import MdiFacebook from 'virtual:icons/mdi/facebook';
  import MdiTwitter from 'virtual:icons/mdi/twitter';
  import MdiLink from 'virtual:icons/mdi/link';
  import MdiClose from 'virtual:icons/mdi/close';

  interface Props {
    poem: {
      id: string;
      title: string;
      author: string;
      content: string;
    };
  }

  let { poem }: Props = $props();

  // DaisyUI modal state
  let isOpen = $state(false);

  function openModal() {
    isOpen = true;
  }

  function closeModal() {
    isOpen = false;
  }

  // 生成分享链接
  const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/poem/${poem.id}`;
  const shareText = `分享一首美丽的诗歌：《${poem.title}》- ${poem.author}`;

  // 复制链接到剪贴板
  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('链接已复制到剪贴板');
    } catch (err) {
      toast.error('复制失败，请手动复制链接');
    }
  }

  // 分享到社交媒体
  function shareToTwitter() {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, '_blank');
  }

  function shareToFacebook() {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(facebookUrl, '_blank');
  }

  // 使用 Web Share API（如果支持）
  async function nativeShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: poem.title,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        // 用户取消分享或出错
        console.log('分享取消或失败:', err);
      }
    } else {
      // 降级到复制链接
      copyToClipboard();
    }
  }
</script>

<!-- 触发按钮 -->
<button
  onclick={openModal}
  class="flex items-center gap-2 text-base-content/70 hover:text-primary transition-colors"
>
  <MdiShareOutline />
  分享
</button>

<!-- DaisyUI Modal -->
<input type="checkbox" id="share-modal-{poem.id}" class="modal-toggle" bind:checked={isOpen} />
<div class="modal" role="dialog">
  <div class="modal-box">
    <!-- 标题栏 -->
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-xl font-bold text-base-content">
        分享诗歌
      </h3>
      <button
        onclick={closeModal}
        class="btn btn-sm btn-circle btn-ghost"
      >
        <MdiClose class="w-5 h-5" />
      </button>
    </div>

    <!-- 描述 -->
    <p class="text-base-content/70 mb-6">
      分享《{poem.title}》给更多人欣赏
    </p>

    <!-- 诗歌预览 -->
    <div class="card bg-base-200 p-4 mb-6">
      <h4 class="font-medium text-base-content mb-1">{poem.title}</h4>
      <p class="text-sm text-base-content/70 mb-2">作者：{poem.author}</p>
      <p class="text-sm text-base-content/80 line-clamp-3 whitespace-pre-line">
        {poem.content}
      </p>
    </div>

    <!-- 分享选项 -->
    <div class="space-y-3">
      <!-- 原生分享 -->
      {#if typeof navigator !== 'undefined' && 'share' in navigator}
        <button
          onclick={nativeShare}
          class="btn btn-outline w-full justify-start gap-3"
        >
          <MdiShareOutline class="w-5 h-5" />
          <span>使用系统分享</span>
        </button>
      {/if}

      <!-- 复制链接 -->
      <button
        onclick={copyToClipboard}
        class="btn btn-outline w-full justify-start gap-3"
      >
        <MdiContentCopy class="w-5 h-5" />
        <span>复制链接</span>
      </button>

      <!-- 社交媒体分享 -->
      <div class="grid grid-cols-2 gap-3">
        <button
          onclick={shareToTwitter}
          class="btn btn-outline justify-start gap-2"
        >
          <MdiTwitter class="w-5 h-5" />
          <span>Twitter</span>
        </button>

        <button
          onclick={shareToFacebook}
          class="btn btn-outline justify-start gap-2"
        >
          <MdiFacebook class="w-5 h-5" />
          <span>Facebook</span>
        </button>
      </div>

      <!-- 链接显示 -->
      <div class="card bg-base-200 p-3">
        <div class="flex items-center gap-2 text-sm text-base-content/70">
          <MdiLink class="w-4 h-4" />
          <span class="truncate">{shareUrl}</span>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Modal backdrop -->
  <label class="modal-backdrop" for="share-modal-{poem.id}">
    <button onclick={closeModal}>Close</button>
  </label>
</div>

<style>
  .line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>
