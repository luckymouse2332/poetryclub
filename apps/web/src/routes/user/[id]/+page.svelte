<script lang="ts">
  import { page } from '$app/state';
  import PoemListCard from '../../components/PoemListCard.svelte';
import { LoadingSpinner } from '$lib/components';
  import { onMount } from 'svelte';

  // 获取用户ID
  let userId = $derived(page.params.id);

  // 模拟当前登录用户ID
  let currentUserId = '1';

  // 页面状态
  let loading = $state(true);
  let error = $state('');
  let activeTab = $state('poems'); // 'poems' | 'favorites'
  let isFollowing = $state(false);

  // 用户数据
  let userData = $state({
    id: '',
    username: '',
    avatar: '',
    bio: '',
    joinDate: '',
    followersCount: 0,
    followingCount: 0,
    poemsCount: 0,
    likesCount: 0,
    viewsCount: 0,
  });

  // 用户发布的诗歌
  let userPoems = $state<any[]>([]);

  // 用户收藏的诗歌
  let favoritePoems = $state<any[]>([]);

  // 模拟数据加载
  onMount(async () => {
    try {
      // 模拟API调用延迟
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // 模拟用户数据
      userData = {
        id: userId!,
        username:
          userId === '1'
            ? '诗韵墨客'
            : userId === '2'
              ? '古风雅士'
              : '文墨书生',
        avatar: `https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese%20poet%20avatar%20traditional%20style%20elegant%20portrait&image_size=square`,
        bio:
          userId === '1'
            ? '热爱古典诗词，致力于传承中华文化之美。诗如人生，人生如诗。'
            : userId === '2'
              ? '古风诗词爱好者，喜欢在文字中寻找心灵的宁静。'
              : '文学青年，用诗歌记录生活的点点滴滴。',
        joinDate: '2023年3月',
        followersCount: userId === '1' ? 1234 : userId === '2' ? 567 : 89,
        followingCount: userId === '1' ? 89 : userId === '2' ? 123 : 45,
        poemsCount: userId === '1' ? 45 : userId === '2' ? 23 : 12,
        likesCount: userId === '1' ? 2890 : userId === '2' ? 1456 : 234,
        viewsCount: userId === '1' ? 15678 : userId === '2' ? 8901 : 1234,
      };

      // 模拟用户发布的诗歌
      userPoems = [
        {
          id: '1',
          title: '春江花月夜',
          author: userData.username,
          dynasty: '现代',
          content:
            '春江潮水连海平，海上明月共潮生。\n滟滟随波千万里，何处春江无月明！\n江流宛转绕芳甸，月照花林皆似霰。\n空里流霜不觉飞，汀上白沙看不见。',
          likes: 156,
          comments: 23,
          tags: ['春天', '月夜', '江水'],
          publishedAt: '2024年1月15日',
        },
        {
          id: '2',
          title: '秋思',
          author: userData.username,
          dynasty: '现代',
          content:
            '枯藤老树昏鸦，小桥流水人家。\n古道西风瘦马，夕阳西下，\n断肠人在天涯。',
          likes: 89,
          comments: 12,
          tags: ['秋天', '思乡', '离别'],
          publishedAt: '2024年1月10日',
        },
        {
          id: '3',
          title: '山居秋暝',
          author: userData.username,
          dynasty: '现代',
          content:
            '空山新雨后，天气晚来秋。\n明月松间照，清泉石上流。\n竹喧归浣女，莲动下渔舟。\n随意春芳歇，王孙自可留。',
          likes: 234,
          comments: 45,
          tags: ['山水', '秋天', '宁静'],
          publishedAt: '2024年1月5日',
        },
      ];

      // 模拟用户收藏的诗歌
      favoritePoems = [
        {
          id: '4',
          title: '静夜思',
          author: '李白',
          dynasty: '唐',
          content: '床前明月光，疑是地上霜。\n举头望明月，低头思故乡。',
          likes: 1234,
          comments: 89,
          tags: ['思乡', '月夜', '经典'],
          publishedAt: '唐代',
        },
        {
          id: '5',
          title: '登鹳雀楼',
          author: '王之涣',
          dynasty: '唐',
          content: '白日依山尽，黄河入海流。\n欲穷千里目，更上一层楼。',
          likes: 987,
          comments: 67,
          tags: ['励志', '山水', '哲理'],
          publishedAt: '唐代',
        },
      ];

      // 模拟关注状态
      isFollowing = Math.random() > 0.5;

      loading = false;
    } catch (err) {
      error = '加载用户信息失败，请稍后重试';
      loading = false;
    }
  });

  // 关注/取消关注
  function toggleFollow() {
    isFollowing = !isFollowing;
    userData.followersCount += isFollowing ? 1 : -1;
  }

  // 编辑资料
  function editProfile() {
    alert('编辑资料功能开发中...');
  }

  // 切换标签页
  function switchTab(tab: string) {
    activeTab = tab;
  }
</script>

<svelte:head>
  <title>{userData.username} - 用户详情 | 诗韵社</title>
  <meta
    name="description"
    content="{userData.username}的个人主页，查看TA的诗歌作品和收藏"
  />
</svelte:head>

<div class="min-h-screen bg-base-100 theme-transition">
  {#if loading}
    <!-- 加载状态 -->
    <div class="flex justify-center items-center min-h-[60vh]">
      <LoadingSpinner />
    </div>
  {:else if error}
    <!-- 错误状态 -->
    <div class="container mx-auto px-4 py-8">
      <div class="text-center">
        <div class="text-6xl mb-4">😔</div>
        <h2 class="text-2xl font-bold text-base-content mb-2">加载失败</h2>
        <p class="text-base-content/70 mb-4">{error}</p>
        <button
          class="btn btn-primary"
          onclick={() => location.reload()}
        >
          重新加载
        </button>
      </div>
    </div>
  {:else}
    <!-- 用户详情内容 -->
    <div class="container mx-auto px-4 py-8 max-w-6xl">
      <!-- 用户基本信息 -->
      <div class="card bg-base-200 shadow-xl mb-8 overflow-hidden theme-transition">
        <div class="p-8">
          <div class="flex flex-col lg:flex-row gap-8">
            <!-- 头像和基本信息 -->
            <div
              class="flex flex-col sm:flex-row gap-6 lg:flex-col lg:items-center"
            >
              <div class="flex-shrink-0">
                <img
                  src={userData.avatar}
                  alt={userData.username}
                  class="w-32 h-32 rounded-full object-cover border-4 border-base-300 shadow-lg"
                />
              </div>
              <div class="text-center lg:text-center">
                <h1 class="text-3xl font-bold text-base-content mb-2">
                  {userData.username}
                </h1>
                <p class="text-base-content/70 mb-4">加入于 {userData.joinDate}</p>
                <!-- 操作按钮 -->
                <div class="flex gap-3 justify-center">
                  {#if userId !== currentUserId}
                    <button
                      class="btn {isFollowing ? 'btn-secondary' : 'btn-primary'} theme-transition hover:scale-105"
                      onclick={toggleFollow}
                    >
                      {isFollowing ? '已关注' : '关注'}
                    </button>
                  {:else}
                    <button
                      class="btn btn-primary theme-transition hover:scale-105"
                      onclick={editProfile}
                    >
                      编辑资料
                    </button>
                  {/if}
                </div>
              </div>
            </div>

            <!-- 用户简介和统计 -->
            <div class="flex-1">
              <!-- 简介 -->
              <div class="mb-6">
                <h3 class="text-lg font-semibold text-base-content mb-3">
                  个人简介
                </h3>
                <p class="text-base-content/80 leading-relaxed">
                  {userData.bio}
                </p>
              </div>

              <!-- 统计信息 -->
              <div class="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <div
                  class="text-center p-4 bg-base-300 rounded-lg theme-transition"
                >
                  <div class="text-2xl font-bold text-base-content">
                    {userData.poemsCount}
                  </div>
                  <div class="text-sm text-base-content/70">发布诗歌</div>
                </div>
                <div
                  class="text-center p-4 bg-base-300 rounded-lg theme-transition"
                >
                  <div class="text-2xl font-bold text-base-content">
                    {userData.likesCount}
                  </div>
                  <div class="text-sm text-base-content/70">获得点赞</div>
                </div>
                <div
                  class="text-center p-4 bg-base-300 rounded-lg theme-transition"
                >
                  <div class="text-2xl font-bold text-base-content">
                    {userData.viewsCount}
                  </div>
                  <div class="text-sm text-base-content/70">阅读量</div>
                </div>
                <div
                  class="text-center p-4 bg-base-300 rounded-lg theme-transition"
                >
                  <div class="text-2xl font-bold text-base-content">
                    {userData.followersCount}
                  </div>
                  <div class="text-sm text-base-content/70">粉丝</div>
                </div>
                <div
                  class="text-center p-4 bg-base-300 rounded-lg theme-transition"
                >
                  <div class="text-2xl font-bold text-base-content">
                    {userData.followingCount}
                  </div>
                  <div class="text-sm text-base-content/70">关注</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 标签页导航 -->
      <div class="mb-6">
        <div class="border-b border-base-300">
          <nav class="flex space-x-8">
            <button
              class="py-4 px-2 border-b-2 font-medium text-sm theme-transition {activeTab ===
              'poems'
                ? 'border-primary text-primary'
                : 'border-transparent text-base-content/70 hover:text-base-content'}"
              onclick={() => switchTab('poems')}
            >
              发布的诗歌 ({userPoems.length})
            </button>
            <button
              class="py-4 px-2 border-b-2 font-medium text-sm theme-transition {activeTab ===
              'favorites'
                ? 'border-primary text-primary'
                : 'border-transparent text-base-content/70 hover:text-base-content'}"
              onclick={() => switchTab('favorites')}
            >
              收藏的诗歌 ({favoritePoems.length})
            </button>
          </nav>
        </div>
      </div>

      <!-- 诗歌列表 -->
      <div class="space-y-6">
        {#if activeTab === 'poems'}
          {#if userPoems.length > 0}
            {#each userPoems as poem}
              <PoemListCard {poem} />
            {/each}
          {:else}
            <div class="card bg-base-200 shadow-xl">
              <div class="card-body text-center py-12">
                <div class="text-6xl mb-4">📝</div>
                <h3 class="card-title text-xl justify-center mb-2">
                  还没有发布诗歌
                </h3>
                <p class="text-base-content/70">期待TA的第一首作品</p>
              </div>
            </div>
          {/if}
        {:else if activeTab === 'favorites'}
          {#if favoritePoems.length > 0}
            {#each favoritePoems as poem}
              <PoemListCard {poem} />
            {/each}
          {:else}
            <div class="card bg-base-200 shadow-xl">
              <div class="card-body text-center py-12">
                <div class="text-6xl mb-4">❤️</div>
                <h3 class="card-title text-xl justify-center mb-2">
                  还没有收藏诗歌
                </h3>
                <p class="text-base-content/70">收藏喜欢的诗歌，随时回味</p>
              </div>
            </div>
          {/if}
        {/if}
      </div>
    </div>
  {/if}
</div>

<style>
  @reference '../../../app.css'

  /* 响应式调整 */
  @media (max-width: 640px) {
    .container {
      @apply px-2;
    }
  }
</style>
