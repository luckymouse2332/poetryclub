<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { toast } from 'svelte-sonner';
  import { isAuthenticated } from '$lib/stores/auth';
  import { api } from '$lib/utils/request';

  import MdiBook from 'virtual:icons/mdi/book';
  import MdiPlus from 'virtual:icons/mdi/plus';
  import MdiPencil from 'virtual:icons/mdi/pencil';
  import MdiDelete from 'virtual:icons/mdi/delete';
  import MdiEye from 'virtual:icons/mdi/eye';
  import MdiMagnify from 'virtual:icons/mdi/magnify';
  import MdiChevronLeft from 'virtual:icons/mdi/chevron-left';
  import MdiChevronRight from 'virtual:icons/mdi/chevron-right';
  import MdiLoading from 'virtual:icons/mdi/loading';
  import MdiCalendar from 'virtual:icons/mdi/calendar';
  import MdiEmoticonSad from 'virtual:icons/mdi/emoticon-sad';

  // 诗歌类型定义
  interface Poem {
    id: string;
    title: string;
    content: string;
    status: 'draft' | 'published';
    createdAt: string;
    updatedAt: string;
    viewCount: number;
    likeCount: number;
  }

  // 状态管理
  let isLoading = $state(true);
  let poems = $state<Poem[]>([]);
  let filteredPoems = $state<Poem[]>([]);

  // 搜索和分页
  let searchQuery = $state('');
  let currentPage = $state(1);
  let pageSize = 10;
  let totalPages = $state(1);

  // 删除确认对话框
  let showDeleteDialog = $state(false);
  let poemToDelete: Poem | null = $state(null);
  let isDeleting = $state(false);

  // 模拟数据
  const mockPoems: Poem[] = [
    {
      id: '1',
      title: '春江花月夜',
      content:
        '春江潮水连海平，海上明月共潮生。\n滟滟随波千万里，何处春江无月明！',
      status: 'published',
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T10:30:00Z',
      viewCount: 128,
      likeCount: 23,
    },
    {
      id: '2',
      title: '静夜思',
      content: '床前明月光，疑是地上霜。\n举头望明月，低头思故乡。',
      status: 'published',
      createdAt: '2024-01-10T14:20:00Z',
      updatedAt: '2024-01-10T14:20:00Z',
      viewCount: 89,
      likeCount: 15,
    },
    {
      id: '3',
      title: '未完成的诗',
      content: '这是一首还在创作中的诗歌...',
      status: 'draft',
      createdAt: '2024-01-20T09:15:00Z',
      updatedAt: '2024-01-20T09:15:00Z',
      viewCount: 0,
      likeCount: 0,
    },
  ];

  // 检查认证状态
  onMount(() => {
    if (!$isAuthenticated) {
      goto('/login');
      return;
    }
    loadPoems();
  });

  // 加载诗歌列表
  async function loadPoems() {
    isLoading = true;
    try {
      // 模拟API调用
      await new Promise((resolve) => setTimeout(resolve, 800));
      poems = [...mockPoems];
      filterPoems();
    } catch (error) {
      console.error('加载诗歌失败:', error);
      toast.error('加载失败，请稍后重试');
    } finally {
      isLoading = false;
    }
  }

  // 搜索过滤
  function filterPoems() {
    if (!searchQuery.trim()) {
      filteredPoems = [...poems];
    } else {
      const query = searchQuery.toLowerCase();
      filteredPoems = poems.filter(
        (poem) =>
          poem.title.toLowerCase().includes(query) ||
          poem.content.toLowerCase().includes(query)
      );
    }

    // 重新计算分页
    totalPages = Math.ceil(filteredPoems.length / pageSize);
    if (currentPage > totalPages) {
      currentPage = 1;
    }
  }

  // 获取当前页诗歌
  function getCurrentPagePoems() {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredPoems.slice(startIndex, endIndex);
  }

  // 搜索处理
  function handleSearch() {
    currentPage = 1;
    filterPoems();
  }

  // 清空搜索
  function clearSearch() {
    searchQuery = '';
    handleSearch();
  }

  // 分页处理
  function goToPage(page: number) {
    if (page >= 1 && page <= totalPages) {
      currentPage = page;
    }
  }

  // 查看诗歌
  function viewPoem(poem: Poem) {
    goto(`/poem/${poem.id}`);
  }

  // 编辑诗歌
  function editPoem(poem: Poem) {
    goto(`/write?id=${poem.id}`);
  }

  // 删除诗歌
  function confirmDelete(poem: Poem) {
    poemToDelete = poem;
    showDeleteDialog = true;
  }

  async function deletePoem() {
    if (!poemToDelete) return;

    isDeleting = true;
    try {
      // 模拟API调用
      await new Promise((resolve) => setTimeout(resolve, 500));

      poems = poems.filter((p) => p.id !== poemToDelete!.id);
      filterPoems();

      toast.success('诗歌删除成功');
      showDeleteDialog = false;
      poemToDelete = null;
    } catch (error) {
      console.error('删除诗歌失败:', error);
      toast.error('删除失败，请稍后重试');
    } finally {
      isDeleting = false;
    }
  }

  function cancelDelete() {
    showDeleteDialog = false;
    poemToDelete = null;
  }

  // 格式化日期
  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  }

  // 获取状态标签样式
  function getStatusBadge(status: string) {
    return status === 'published'
      ? 'badge badge-success badge-sm'
      : 'badge badge-warning badge-sm';
  }

  // 获取状态文本
  function getStatusText(status: string) {
    return status === 'published' ? '已发布' : '草稿';
  }

  // 响应式搜索
  $effect(() => {
    if (searchQuery !== undefined) {
      handleSearch();
    }
  });
</script>

<svelte:head>
  <title>我的诗歌 - 回中诗社</title>
</svelte:head>

<div class="container mx-auto px-4 py-8 max-w-7xl">
  <!-- 页面标题和操作 -->
  <div
    class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
  >
    <div class="flex items-center gap-3">
      <MdiBook class="w-8 h-8 text-primary" />
      <h1 class="text-3xl font-bold text-base-content">我的诗歌</h1>
    </div>

    <button class="btn btn-primary" onclick={() => goto('/write')}>
      <MdiPlus class="w-5 h-5" />
      创作新诗
    </button>
  </div>

  <!-- 搜索栏 -->
  <div class="card bg-base-100 shadow-lg mb-6">
    <div class="card-body py-4">
      <div class="flex flex-col sm:flex-row gap-4">
        <div class="form-control flex-1">
          <div class="input-group">
            <input
              type="text"
              placeholder="搜索诗歌标题或内容..."
              class="input input-bordered flex-1"
              bind:value={searchQuery}
            />
            <button class="btn btn-square btn-primary" onclick={handleSearch}>
              <MdiMagnify class="w-5 h-5" />
            </button>
          </div>
        </div>

        {#if searchQuery}
          <button class="btn btn-ghost btn-sm" onclick={clearSearch}>
            清空搜索
          </button>
        {/if}
      </div>

      {#if searchQuery}
        <div class="text-sm text-base-content/60 mt-2">
          找到 {filteredPoems.length} 首诗歌
        </div>
      {/if}
    </div>
  </div>

  {#if isLoading}
    <!-- 加载状态 -->
    <div class="flex items-center justify-center py-20">
      <div class="text-center">
        <MdiLoading class="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
        <p class="text-base-content/60">加载中...</p>
      </div>
    </div>
  {:else if filteredPoems.length === 0}
    <!-- 空状态 -->
    <div class="card bg-base-100 shadow-lg">
      <div class="card-body text-center py-20">
        <MdiEmoticonSad class="w-16 h-16 mx-auto mb-4 text-base-content/40" />
        <h3 class="text-xl font-semibold mb-2 text-base-content/60">
          {searchQuery ? '没有找到相关诗歌' : '还没有创作任何诗歌'}
        </h3>
        <p class="text-base-content/50 mb-6">
          {searchQuery ? '试试其他关键词' : '开始你的第一首诗歌创作吧'}
        </p>
        {#if !searchQuery}
          <button class="btn btn-primary" onclick={() => goto('/write')}>
            <MdiPlus class="w-5 h-5" />
            创作新诗
          </button>
        {/if}
      </div>
    </div>
  {:else}
    <!-- 诗歌列表 -->
    <div class="card bg-base-100 shadow-lg">
      <div class="card-body p-0">
        <!-- 表格 -->
        <div class="overflow-x-auto">
          <table class="table table-zebra">
            <thead>
              <tr>
                <th class="w-12">#</th>
                <th>标题</th>
                <th class="hidden sm:table-cell">状态</th>
                <th class="hidden md:table-cell">创作时间</th>
                <th class="hidden lg:table-cell">阅读/点赞</th>
                <th class="w-32">操作</th>
              </tr>
            </thead>
            <tbody>
              {#each getCurrentPagePoems() as poem, index}
                <tr class="hover">
                  <td class="font-mono text-sm">
                    {(currentPage - 1) * pageSize + index + 1}
                  </td>
                  <td>
                    <div class="flex flex-col">
                      <div class="font-medium text-base-content">
                        {poem.title}
                      </div>
                      <div
                        class="text-sm text-base-content/60 line-clamp-2 sm:hidden"
                      >
                        {poem.content.substring(0, 50)}...
                      </div>
                      <div class="sm:hidden mt-1">
                        <span class={getStatusBadge(poem.status)}>
                          {getStatusText(poem.status)}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td class="hidden sm:table-cell">
                    <span class={getStatusBadge(poem.status)}>
                      {getStatusText(poem.status)}
                    </span>
                  </td>
                  <td class="hidden md:table-cell text-sm text-base-content/60">
                    <div class="flex items-center gap-1">
                      <MdiCalendar class="w-4 h-4" />
                      {formatDate(poem.createdAt)}
                    </div>
                  </td>
                  <td class="hidden lg:table-cell text-sm text-base-content/60">
                    {poem.viewCount} / {poem.likeCount}
                  </td>
                  <td>
                    <div class="flex items-center gap-1">
                      <button
                        class="btn btn-ghost btn-xs"
                        onclick={() => viewPoem(poem)}
                        title="查看"
                      >
                        <MdiEye class="w-4 h-4" />
                      </button>
                      <button
                        class="btn btn-ghost btn-xs"
                        onclick={() => editPoem(poem)}
                        title="编辑"
                      >
                        <MdiPencil class="w-4 h-4" />
                      </button>
                      <button
                        class="btn btn-ghost btn-xs text-error"
                        onclick={() => confirmDelete(poem)}
                        title="删除"
                      >
                        <MdiDelete class="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>

        <!-- 分页 -->
        {#if totalPages > 1}
          <div
            class="flex items-center justify-between p-4 border-t border-base-300"
          >
            <div class="text-sm text-base-content/60">
              第 {currentPage} 页，共 {totalPages} 页，总计 {filteredPoems.length}
              首诗歌
            </div>

            <div class="join">
              <button
                class="join-item btn btn-sm"
                onclick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <MdiChevronLeft class="w-4 h-4" />
              </button>

              {#each Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const start = Math.max(1, currentPage - 2);
                const end = Math.min(totalPages, start + 4);
                return start + i;
              }).filter((page) => page <= totalPages) as page}
                <button
                  class="join-item btn btn-sm {currentPage === page
                    ? 'btn-active'
                    : ''}"
                  onclick={() => goToPage(page)}
                >
                  {page}
                </button>
              {/each}

              <button
                class="join-item btn btn-sm"
                onclick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <MdiChevronRight class="w-4 h-4" />
              </button>
            </div>
          </div>
        {/if}
      </div>
    </div>
  {/if}
</div>

<!-- 删除确认对话框 -->
{#if showDeleteDialog && poemToDelete}
  <div class="modal modal-open">
    <div class="modal-box">
      <h3 class="font-bold text-lg mb-4">确认删除</h3>
      <p class="mb-6">
        确定要删除诗歌《{poemToDelete.title}》吗？此操作无法撤销。
      </p>

      <div class="modal-action">
        <button
          class="btn btn-ghost"
          onclick={cancelDelete}
          disabled={isDeleting}
        >
          取消
        </button>
        <button
          class="btn btn-error"
          onclick={deletePoem}
          disabled={isDeleting}
        >
          {#if isDeleting}
            <MdiLoading class="w-4 h-4 animate-spin" />
            删除中...
          {:else}
            <MdiDelete class="w-4 h-4" />
            确认删除
          {/if}
        </button>
      </div>
    </div>
    <div
      class="modal-backdrop"
      onclick={cancelDelete}
      onkeydown={(e) => e.key === 'Escape' && cancelDelete()}
      role="button"
      tabindex="0"
      aria-label="关闭对话框"
    ></div>
  </div>
{/if}

<style>
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>
