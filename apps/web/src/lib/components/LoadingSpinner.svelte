<script lang="ts">
  import { ProgressRing } from '@skeletonlabs/skeleton-svelte';

  const { size = 'w-8 h-8', text = '加载中...' } = $props<{
    size?: string;
    text?: string;
  }>();
</script>

<div class="flex flex-col items-center justify-center space-y-4">
  <ProgressRing
    value={null}
    size="size-14"
    meterStroke="stroke-tertiary-600-400"
    trackStroke="stroke-tertiary-50-950"
  />
  {#if text}
    <p class="text-sm text-gray-600">{text}</p>
  {/if}
</div>
