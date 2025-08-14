<script lang="ts">
  import { createCheckbox } from '@melt-ui/svelte';
  import MdiCheckBold from 'virtual:icons/mdi/check-bold';

  export let checked = false;
  export let disabled = false;
  export let label = '';
  export let id = '';
  export let size: 'sm' | 'md' | 'lg' = 'md';

  // 创建 melt checkbox
  const {
    elements: { root, input }
  } = createCheckbox({
    defaultChecked: checked,
    disabled,
  });

  // 尺寸配置
  const sizeClasses = {
    sm: {
      box: 'w-4 h-4',
      icon: 'w-2.5 h-2.5',
      text: 'text-xs',
    },
    md: {
      box: 'w-5 h-5',
      icon: 'w-3 h-3',
      text: 'text-sm',
    },
    lg: {
      box: 'w-6 h-6',
      icon: 'w-4 h-4',
      text: 'text-base',
    },
  };

  $: currentSize = sizeClasses[size];
</script>

<label
  class="flex items-center group {disabled
    ? 'opacity-50 cursor-not-allowed'
    : ''}"
  use:root
>
  <div class="relative">
    <input {id} type="checkbox" class="sr-only" use:input bind:checked />
    <div
      class="border-2 rounded-md transition-all duration-200 flex items-center justify-center {currentSize.box}
        {checked
        ? 'bg-amber-500 border-amber-500 shadow-sm'
        : 'border-gray-300 bg-white hover:border-amber-400 group-hover:bg-amber-50'}
        {disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      "
    >
      {#if checked}
        <MdiCheckBold class="{currentSize.icon} text-white" />
      {/if}
    </div>
  </div>
  {#if label}
    <span
      id="{id}-label"
      class="ml-3 {currentSize.text} poetry-text-secondary group-hover:poetry-text-primary transition-colors select-none"
    >
      {label}
    </span>
  {/if}
  {#if $$slots.default}
    <span
      class="ml-3 {currentSize.text} poetry-text-secondary group-hover:poetry-text-primary transition-colors select-none"
    >
      <slot />
    </span>
  {/if}
</label>

<style>
  /* 深色模式 hover 效果 */
  .group:hover .bg-white {
    background-color: var(--poetry-surface, rgb(255 251 235)); /* amber-50 */
  }
</style>
