<script lang="ts">
  export let tags: string[];
</script>

<!-- 标签 -->
<div class="flex flex-wrap gap-2">
  {#each tags as tag}
    <span class="badge badge-outline badge-sm">
      {tag}
    </span>
  {/each}
</div>
