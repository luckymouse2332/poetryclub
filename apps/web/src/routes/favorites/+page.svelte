<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { toast } from 'svelte-sonner';
  import { isAuthenticated } from '$lib/stores/auth';
  import { api } from '$lib/utils/request';
  
  import MdiHeart from 'virtual:icons/mdi/heart';
  import MdiHeartOutline from 'virtual:icons/mdi/heart-outline';
  import MdiAccount from 'virtual:icons/mdi/account';
  import MdiTag from 'virtual:icons/mdi/tag';
  import MdiViewGrid from 'virtual:icons/mdi/view-grid';
  import MdiViewList from 'virtual:icons/mdi/view-list';
  import MdiLoading from 'virtual:icons/mdi/loading';
  import MdiEmoticonSad from 'virtual:icons/mdi/emoticon-sad';
  import MdiCalendar from 'virtual:icons/mdi/calendar';
  import MdiEye from 'virtual:icons/mdi/eye';

  // 收藏诗歌类型定义
  interface FavoritePoem {
    id: string;
    title: string;
    content: string;
    author: {
      id: string;
      name: string;
      avatar?: string;
    };
    tags: string[];
    createdAt: string;
    favoriteAt: string;
    viewCount: number;
    likeCount: number;
  }

  // 分类类型
  type ViewType = 'all' | 'author' | 'tag';
  type DisplayMode = 'grid' | 'list';

  // 状态管理
  let isLoading = $state(true);
  let favorites = $state<FavoritePoem[]>([]);
  let viewType = $state<ViewType>('all');
  let displayMode = $state<DisplayMode>('grid');
  let selectedAuthor = $state<string>('');
  let selectedTag = $state<string>('');
  
  // 取消收藏状态
  let unfavoritingIds = $state<Set<string>>(new Set());
  
  // 模拟数据
  const mockFavorites: FavoritePoem[] = [
    {
      id: '1',
      title: '春江花月夜',
      content: '春江潮水连海平，海上明月共潮生。\n滟滟随波千万里，何处春江无月明！\n江流宛转绕芳甸，月照花林皆似霰。',
      author: {
        id: 'author1',
        name: '张若虚',
        avatar: 'https://ui-avatars.com/api/?name=张若虚&background=10b981&color=fff&size=64'
      },
      tags: ['唐诗', '月夜', '江景'],
      createdAt: '2024-01-15T10:30:00Z',
      favoriteAt: '2024-01-16T14:20:00Z',
      viewCount: 1280,
      likeCount: 234
    },
    {
      id: '2',
      title: '静夜思',
      content: '床前明月光，疑是地上霜。\n举头望明月，低头思故乡。',
      author: {
        id: 'author2',
        name: '李白',
        avatar: 'https://ui-avatars.com/api/?name=李白&background=3b82f6&color=fff&size=64'
      },
      tags: ['唐诗', '思乡', '月夜'],
      createdAt: '2024-01-10T14:20:00Z',
      favoriteAt: '2024-01-18T09:15:00Z',
      viewCount: 890,
      likeCount: 156
    },
    {
      id: '3',
      title: '登鹳雀楼',
      content: '白日依山尽，黄河入海流。\n欲穷千里目，更上一层楼。',
      author: {
        id: 'author3',
        name: '王之涣',
        avatar: 'https://ui-avatars.com/api/?name=王之涣&background=f59e0b&color=fff&size=64'
      },
      tags: ['唐诗', '励志', '山水'],
      createdAt: '2024-01-08T16:45:00Z',
      favoriteAt: '2024-01-19T11:30:00Z',
      viewCount: 567,
      likeCount: 89
    },
    {
      id: '4',
      title: '将进酒',
      content: '君不见，黄河之水天上来，奔流到海不复回。\n君不见，高堂明镜悲白发，朝如青丝暮成雪。',
      author: {
        id: 'author2',
        name: '李白',
        avatar: 'https://ui-avatars.com/api/?name=李白&background=3b82f6&color=fff&size=64'
      },
      tags: ['唐诗', '豪放', '人生'],
      createdAt: '2024-01-05T12:00:00Z',
      favoriteAt: '2024-01-20T15:45:00Z',
      viewCount: 1456,
      likeCount: 298
    }
  ];
  
  // 检查认证状态
  onMount(() => {
    if (!$isAuthenticated) {
      goto('/login');
      return;
    }
    loadFavorites();
  });
  
  // 加载收藏列表
  async function loadFavorites() {
    isLoading = true;
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 800));
      favorites = [...mockFavorites];
    } catch (error) {
      console.error('加载收藏失败:', error);
      toast.error('加载失败，请稍后重试');
    } finally {
      isLoading = false;
    }
  }
  
  // 获取所有作者
  function getAuthors() {
    const authorMap = new Map();
    favorites.forEach(poem => {
      if (!authorMap.has(poem.author.id)) {
        authorMap.set(poem.author.id, poem.author);
      }
    });
    return Array.from(authorMap.values());
  }
  
  // 获取所有标签
  function getTags() {
    const tagSet = new Set<string>();
    favorites.forEach(poem => {
      poem.tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }
  
  // 获取过滤后的诗歌
  function getFilteredPoems() {
    let filtered = [...favorites];
    
    if (viewType === 'author' && selectedAuthor) {
      filtered = filtered.filter(poem => poem.author.id === selectedAuthor);
    } else if (viewType === 'tag' && selectedTag) {
      filtered = filtered.filter(poem => poem.tags.includes(selectedTag));
    }
    
    return filtered.sort((a, b) => new Date(b.favoriteAt).getTime() - new Date(a.favoriteAt).getTime());
  }
  
  // 切换视图类型
  function setViewType(type: ViewType) {
    viewType = type;
    selectedAuthor = '';
    selectedTag = '';
  }
  
  // 取消收藏
  async function unfavoritePoem(poemId: string) {
    unfavoritingIds.add(poemId);
    unfavoritingIds = new Set(unfavoritingIds);
    
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500));
      
      favorites = favorites.filter(poem => poem.id !== poemId);
      toast.success('已取消收藏');
    } catch (error) {
      console.error('取消收藏失败:', error);
      toast.error('操作失败，请稍后重试');
    } finally {
      unfavoritingIds.delete(poemId);
      unfavoritingIds = new Set(unfavoritingIds);
    }
  }
  
  // 查看诗歌
  function viewPoem(poem: FavoritePoem) {
    goto(`/poem/${poem.id}`);
  }
  
  // 格式化日期
  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }
  
  // 截取内容
  function truncateContent(content: string, maxLength: number = 100) {
    return content.length > maxLength ? content.substring(0, maxLength) + '...' : content;
  }
</script>

<svelte:head>
  <title>我的收藏 - 回中诗社</title>
</svelte:head>

<div class="container mx-auto px-4 py-8 max-w-7xl">
  <!-- 页面标题 -->
  <div class="flex items-center gap-3 mb-8">
    <MdiHeart class="w-8 h-8 text-primary" />
    <h1 class="text-3xl font-bold text-base-content">我的收藏</h1>
  </div>
  
  {#if isLoading}
    <!-- 加载状态 -->
    <div class="flex items-center justify-center py-20">
      <div class="text-center">
        <MdiLoading class="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
        <p class="text-base-content/60">加载中...</p>
      </div>
    </div>
  {:else if favorites.length === 0}
    <!-- 空状态 -->
    <div class="card bg-base-100 shadow-lg">
      <div class="card-body text-center py-20">
        <MdiEmoticonSad class="w-16 h-16 mx-auto mb-4 text-base-content/40" />
        <h3 class="text-xl font-semibold mb-2 text-base-content/60">还没有收藏任何诗歌</h3>
        <p class="text-base-content/50 mb-6">去发现一些优美的诗歌并收藏它们吧</p>
        <button 
          class="btn btn-primary"
          onclick={() => goto('/')}
        >
          <MdiHeart class="w-5 h-5" />
          去发现诗歌
        </button>
      </div>
    </div>
  {:else}
    <!-- 控制栏 -->
    <div class="card bg-base-100 shadow-lg mb-6">
      <div class="card-body py-4">
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <!-- 分类选择 -->
          <div class="flex flex-wrap items-center gap-2">
            <span class="text-sm font-medium text-base-content/70">分类：</span>
            <div class="join">
              <button 
                class="join-item btn btn-sm {viewType === 'all' ? 'btn-active' : 'btn-outline'}"
                onclick={() => setViewType('all')}
              >
                全部 ({favorites.length})
              </button>
              <button 
                class="join-item btn btn-sm {viewType === 'author' ? 'btn-active' : 'btn-outline'}"
                onclick={() => setViewType('author')}
              >
                <MdiAccount class="w-4 h-4" />
                按作者
              </button>
              <button 
                class="join-item btn btn-sm {viewType === 'tag' ? 'btn-active' : 'btn-outline'}"
                onclick={() => setViewType('tag')}
              >
                <MdiTag class="w-4 h-4" />
                按标签
              </button>
            </div>
          </div>
          
          <!-- 显示模式切换 -->
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium text-base-content/70">显示：</span>
            <div class="join">
              <button 
                class="join-item btn btn-sm {displayMode === 'grid' ? 'btn-active' : 'btn-outline'}"
                onclick={() => displayMode = 'grid'}
              >
                <MdiViewGrid class="w-4 h-4" />
              </button>
              <button 
                class="join-item btn btn-sm {displayMode === 'list' ? 'btn-active' : 'btn-outline'}"
                onclick={() => displayMode = 'list'}
              >
                <MdiViewList class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        
        <!-- 子分类选择 -->
        {#if viewType === 'author'}
          <div class="flex flex-wrap gap-2 mt-4">
            <span class="text-sm font-medium text-base-content/70 self-center">作者：</span>
            {#each getAuthors() as author}
              <button 
                class="btn btn-sm {selectedAuthor === author.id ? 'btn-primary' : 'btn-outline'}"
                onclick={() => selectedAuthor = selectedAuthor === author.id ? '' : author.id}
              >
                <img 
                  src={author.avatar}
                  alt={author.name}
                  class="w-4 h-4 rounded-full"
                />
                {author.name}
              </button>
            {/each}
          </div>
        {:else if viewType === 'tag'}
          <div class="flex flex-wrap gap-2 mt-4">
            <span class="text-sm font-medium text-base-content/70 self-center">标签：</span>
            {#each getTags() as tag}
              <button 
                class="btn btn-sm {selectedTag === tag ? 'btn-primary' : 'btn-outline'}"
                onclick={() => selectedTag = selectedTag === tag ? '' : tag}
              >
                <MdiTag class="w-4 h-4" />
                {tag}
              </button>
            {/each}
          </div>
        {/if}
      </div>
    </div>
    
    <!-- 诗歌列表 -->
    {#if displayMode === 'grid'}
      <!-- 网格视图 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each getFilteredPoems() as poem}
          <div class="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
            <div class="card-body">
              <!-- 诗歌标题和作者 -->
              <div class="flex items-start justify-between mb-3">
                <div class="flex-1">
                  <h3 class="card-title text-lg mb-2">{poem.title}</h3>
                  <div class="flex items-center gap-2 text-sm text-base-content/60">
                    <img 
                      src={poem.author.avatar}
                      alt={poem.author.name}
                      class="w-5 h-5 rounded-full"
                    />
                    <span>{poem.author.name}</span>
                  </div>
                </div>
                
                <!-- 取消收藏按钮 -->
                <button 
                  class="btn btn-ghost btn-sm text-error"
                  onclick={() => unfavoritePoem(poem.id)}
                  disabled={unfavoritingIds.has(poem.id)}
                  title="取消收藏"
                >
                  {#if unfavoritingIds.has(poem.id)}
                    <MdiLoading class="w-4 h-4 animate-spin" />
                  {:else}
                    <MdiHeart class="w-4 h-4" />
                  {/if}
                </button>
              </div>
              
              <!-- 诗歌内容预览 -->
              <p class="text-sm text-base-content/80 mb-4 line-clamp-3">
                {truncateContent(poem.content, 80)}
              </p>
              
              <!-- 标签 -->
              <div class="flex flex-wrap gap-1 mb-4">
                {#each poem.tags.slice(0, 3) as tag}
                  <span class="badge badge-outline badge-sm">{tag}</span>
                {/each}
                {#if poem.tags.length > 3}
                  <span class="badge badge-ghost badge-sm">+{poem.tags.length - 3}</span>
                {/if}
              </div>
              
              <!-- 统计信息 -->
              <div class="flex items-center justify-between text-xs text-base-content/60 mb-4">
                <div class="flex items-center gap-3">
                  <span class="flex items-center gap-1">
                    <MdiEye class="w-3 h-3" />
                    {poem.viewCount}
                  </span>
                  <span class="flex items-center gap-1">
                    <MdiHeartOutline class="w-3 h-3" />
                    {poem.likeCount}
                  </span>
                </div>
                <span class="flex items-center gap-1">
                  <MdiCalendar class="w-3 h-3" />
                  {formatDate(poem.favoriteAt)}
                </span>
              </div>
              
              <!-- 操作按钮 -->
              <div class="card-actions">
                <button 
                  class="btn btn-primary btn-sm flex-1"
                  onclick={() => viewPoem(poem)}
                >
                  <MdiEye class="w-4 h-4" />
                  阅读全文
                </button>
              </div>
            </div>
          </div>
        {/each}
      </div>
    {:else}
      <!-- 列表视图 -->
      <div class="card bg-base-100 shadow-lg">
        <div class="card-body p-0">
          <div class="space-y-0">
            {#each getFilteredPoems() as poem, index}
              <div class="flex items-center gap-4 p-4 {index > 0 ? 'border-t border-base-300' : ''} hover:bg-base-200/50 transition-colors">
                <!-- 作者头像 -->
                <div class="avatar">
                  <div class="w-12 h-12 rounded-full">
                    <img 
                      src={poem.author.avatar}
                      alt={poem.author.name}
                    />
                  </div>
                </div>
                
                <!-- 诗歌信息 -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-start justify-between mb-2">
                    <div>
                      <h3 class="font-semibold text-base-content mb-1">{poem.title}</h3>
                      <p class="text-sm text-base-content/60">作者：{poem.author.name}</p>
                    </div>
                    <div class="text-xs text-base-content/60">
                      收藏于 {formatDate(poem.favoriteAt)}
                    </div>
                  </div>
                  
                  <p class="text-sm text-base-content/80 mb-2 line-clamp-2">
                    {truncateContent(poem.content, 120)}
                  </p>
                  
                  <div class="flex items-center justify-between">
                    <div class="flex flex-wrap gap-1">
                      {#each poem.tags.slice(0, 4) as tag}
                        <span class="badge badge-outline badge-xs">{tag}</span>
                      {/each}
                    </div>
                    
                    <div class="flex items-center gap-4 text-xs text-base-content/60">
                      <span class="flex items-center gap-1">
                        <MdiEye class="w-3 h-3" />
                        {poem.viewCount}
                      </span>
                      <span class="flex items-center gap-1">
                        <MdiHeartOutline class="w-3 h-3" />
                        {poem.likeCount}
                      </span>
                    </div>
                  </div>
                </div>
                
                <!-- 操作按钮 -->
                <div class="flex items-center gap-2">
                  <button 
                    class="btn btn-primary btn-sm"
                    onclick={() => viewPoem(poem)}
                  >
                    <MdiEye class="w-4 h-4" />
                    阅读
                  </button>
                  <button 
                    class="btn btn-ghost btn-sm text-error"
                    onclick={() => unfavoritePoem(poem.id)}
                    disabled={unfavoritingIds.has(poem.id)}
                    title="取消收藏"
                  >
                    {#if unfavoritingIds.has(poem.id)}
                      <MdiLoading class="w-4 h-4 animate-spin" />
                    {:else}
                      <MdiHeart class="w-4 h-4" />
                    {/if}
                  </button>
                </div>
              </div>
            {/each}
          </div>
        </div>
      </div>
    {/if}
    
    <!-- 统计信息 -->
    <div class="text-center mt-8 text-sm text-base-content/60">
      {#if viewType === 'all'}
        共收藏了 {favorites.length} 首诗歌
      {:else}
        当前分类下有 {getFilteredPoems().length} 首诗歌
      {/if}
    </div>
  {/if}
</div>

<style>
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>