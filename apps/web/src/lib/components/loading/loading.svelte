<script lang="ts">
  const { text = '加载中...' } = $props<{
    text?: string;
  }>();
</script>

<div class="flex flex-col items-center justify-center space-y-4">
  <span class="loading loading-spinner size-14"></span>
  {#if text}
    <p class="text-sm text-gray-600">{text}</p>
  {/if}
</div>
