<script lang="ts">
  import { Pagination } from 'bits-ui';
  import MdiArrowRight from 'virtual:icons/mdi/arrow-right';
  import MdiArrowLeft from 'virtual:icons/mdi/arrow-left';

  let {
    perPage,
    count,
    onPageChange = () => {},
    currentPage,
  }: {
    perPage: number;
    count: number;
    onPageChange: (page: number) => void;
    currentPage: number;
  } = $props();
</script>

<Pagination.Root
  {count}
  {perPage}
  bind:page={currentPage}
  {onPageChange}
  class="flex justify-center py-8 gap-2"
  aria-label="分页导航"
>
  {#snippet children({ pages }: { pages: Array<{ key: string; type: string; value: number }> })}
    <!-- 上一页 -->
    <Pagination.PrevButton class="btn btn-outline" aria-label="上一页">
      <MdiArrowLeft class="mr-2" />
      <span class="hidden sm:inline">上一页</span>
    </Pagination.PrevButton>
    <!-- 页码按钮 -->
    {#each pages as page (page.key)}
      {#if page.type === 'ellipsis'}
        <div class="btn btn-disabled">...</div>
      {:else}
        <Pagination.Page {page} class="btn data-selected:btn-active">
          {page.value}
        </Pagination.Page>
      {/if}
    {/each}

    <!-- 下一页 -->
    <Pagination.NextButton class="btn btn-outline" aria-label="下一页">
      <span class="hidden sm:inline">下一页</span>
      <MdiArrowRight class="ml-2" />
    </Pagination.NextButton>
  {/snippet}
</Pagination.Root>

<!-- 页面信息 -->
<div class="text-center text-base-content/70 text-sm">
  第 {currentPage} 页，共 {Math.ceil(count / perPage)} 页
</div>
