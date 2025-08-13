<script lang="ts">
  // 使用简单的 SVG 加载动画替代 ProgressRadial
  import loadingSpinnerSvg from '$lib/assets/icons/loading-spinner.svg';
  
  const { size = 'w-8 h-8', text = '加载中...' } = $props<{
    size?: string;
    text?: string;
  }>();
</script>

<div class="flex flex-col items-center justify-center space-y-4">
	<img src={loadingSpinnerSvg} alt="Loading..." class="{size} animate-spin text-primary-500" />
	{#if text}
		<p class="text-sm text-gray-600">{text}</p>
	{/if}
</div>