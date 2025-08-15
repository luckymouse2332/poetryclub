<script lang="ts">
  import type { Component } from 'svelte';

  export let handler: () => void;
  export let icon: Component;
  export let label: string;
</script>

<button
  onclick={handler}
  class="w-full flex items-center gap-3 px-3 py-2 text-sm poetry-btn-primary rounded-md transition-colors"
>
  <svelte:component this={icon} class="w-4 h-4" />
  <span>{label}</span>
</button>
