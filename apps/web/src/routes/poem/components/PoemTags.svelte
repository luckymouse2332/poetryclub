<script lang="ts">
  export let tags: string[];
</script>

<!-- 标签 -->
<div class="flex flex-wrap gap-2">
  {#each tags as tag}
    <span
      class="px-3 py-1 bg-base-200 text-base-content rounded-full text-sm font-medium transition-all duration-300 hover:scale-105"
    >
      {tag}
    </span>
  {/each}
</div>