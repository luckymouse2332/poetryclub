<script lang="ts">
  import { createCheckbox, melt } from '@melt-ui/svelte';
  import checkSvg from '$lib/assets/icons/check.svg';
  
  export let checked = false;
  export let disabled = false;
  export let label = '';
  export let id = '';
  export let size: 'sm' | 'md' | 'lg' = 'md';
  export let onchange: ((event: { checked: boolean }) => void) | undefined =
    undefined;
    
  // 创建 melt checkbox
  const {
    elements: { root, input },
    states: { checked: meltChecked },
  } = createCheckbox({
    defaultChecked: checked,
    disabled,
  });
  
  // 同步 checked 状态
  $: meltChecked.set(checked);
  
  // 同步 melt 状态到组件状态
  $: if ($meltChecked !== checked) {
    checked = $meltChecked === true;
    onchange?.({ checked });
  }

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
  use:melt={$root}
>
  <div class="relative">
    <input
      {id}
      type="checkbox"
      class="sr-only"
      use:melt={$input}
    />
    <div
      class="border-2 rounded-md transition-all duration-200 flex items-center justify-center {currentSize.box}
				{$meltChecked
        ? 'bg-amber-500 border-amber-500 shadow-sm'
        : 'border-gray-300 bg-white hover:border-amber-400 group-hover:bg-amber-50'}
				{disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
			"
    >
      {#if $meltChecked}
        <img
          src={checkSvg}
          alt="Checked"
          class="{currentSize.icon} text-white"
        />
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
  /* 确保在深色模式下也能正常显示 */
  .group:hover .bg-white {
    background-color: rgb(255 251 235); /* amber-50 */
  }
</style>
