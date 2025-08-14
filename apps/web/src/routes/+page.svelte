<script lang="ts">
  // Skeleton UI v3.0 doesn't have Card, Button, Input, Label components
  // Using native HTML elements with Tailwind styling instead
  import {
    PoemListCard,
    FeaturedPoems,
    Pagination,
    LoadingSpinner,
    PoemCardSkeleton,
  } from '$lib/components';
  import { onMount } from 'svelte';

  // 示例诗作数据
  let allPoems = [
    {
      id: '550e8400-e29b-41d4-a716-446655440001',
      title: '春江花月夜',
      author: '张若虚',
      dynasty: '唐',
      content: `春江潮水连海平，海上明月共潮生。
滟滟随波千万里，何处春江无月明！
江流宛转绕芳甸，月照花林皆似霰；
空里流霜不觉飞，汀上白沙看不见。
江天一色无纤尘，皎皎空中孤月轮。
江畔何人初见月？江月何年初照人？`,
      likes: 1247,
      comments: 89,
      tags: ['唐诗', '月夜', '江景', '哲思'],
      publishedAt: '2024-01-15',
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440002',
      title: '静夜思',
      author: '李白',
      dynasty: '唐',
      content: `床前明月光，疑是地上霜。
举头望明月，低头思故乡。`,
      likes: 2156,
      comments: 156,
      tags: ['唐诗', '思乡', '月夜'],
      publishedAt: '2024-01-14',
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440003',
      title: '登鹳雀楼',
      author: '王之涣',
      dynasty: '唐',
      content: `白日依山尽，黄河入海流。
欲穷千里目，更上一层楼。`,
      likes: 1834,
      comments: 98,
      tags: ['唐诗', '励志', '山水'],
      publishedAt: '2024-01-13',
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440004',
      title: '相思',
      author: '王维',
      dynasty: '唐',
      content: `红豆生南国，春来发几枝。
愿君多采撷，此物最相思。`,
      likes: 1567,
      comments: 78,
      tags: ['唐诗', '爱情', '相思'],
      publishedAt: '2024-01-12',
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440005',
      title: '望庐山瀑布',
      author: '李白',
      dynasty: '唐',
      content: `日照香炉生紫烟，遥看瀑布挂前川。
飞流直下三千尺，疑是银河落九天。`,
      likes: 1923,
      comments: 134,
      tags: ['唐诗', '山水', '瀑布'],
      publishedAt: '2024-01-11',
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440006',
      title: '赋得古原草送别',
      author: '白居易',
      dynasty: '唐',
      content: `离离原上草，一岁一枯荣。
野火烧不尽，春风吹又生。
远芳侵古道，晴翠接荒城。
又送王孙去，萋萋满别情。`,
      likes: 1456,
      comments: 87,
      tags: ['唐诗', '送别', '草原'],
      publishedAt: '2024-01-10',
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440007',
      title: '枫桥夜泊',
      author: '张继',
      dynasty: '唐',
      content: `月落乌啼霜满天，江枫渔火对愁眠。
姑苏城外寒山寺，夜半钟声到客船。`,
      likes: 1678,
      comments: 112,
      tags: ['唐诗', '夜景', '旅愁'],
      publishedAt: '2024-01-09',
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440008',
      title: '黄鹤楼',
      author: '崔颢',
      dynasty: '唐',
      content: `昔人已乘黄鹤去，此地空余黄鹤楼。
黄鹤一去不复返，白云千载空悠悠。
晴川历历汉阳树，芳草萋萋鹦鹉洲。
日暮乡关何处是？烟波江上使人愁。`,
      likes: 1789,
      comments: 145,
      tags: ['唐诗', '怀古', '思乡'],
      publishedAt: '2024-01-08',
    },
  ];

  // 推荐诗作（侧边栏）
  let featuredPoems = [
    {
      title: '静夜思',
      author: '李白',
      preview: '床前明月光，疑是地上霜...',
      likes: 2156,
      id: '550e8400-e29b-41d4-a716-446655440002',
    },
    {
      title: '登鹳雀楼',
      author: '王之涣',
      preview: '白日依山尽，黄河入海流...',
      likes: 1834,
      id: '550e8400-e29b-41d4-a716-446655440003',
    },
    {
      title: '相思',
      author: '王维',
      preview: '红豆生南国，春来发几枝...',
      likes: 1567,
      id: '550e8400-e29b-41d4-a716-446655440004',
    },
  ];

  // 加载状态
  let isLoading = true;
  let isPageChanging = false;

  // 分页相关
  let currentPage = 1;
  const poemsPerPage = 6;
  $: totalPages = Math.ceil(allPoems.length / poemsPerPage);
  $: currentPoems = allPoems.slice(
    (currentPage - 1) * poemsPerPage,
    currentPage * poemsPerPage
  );

  // 模拟初始数据加载
  onMount(async () => {
    // 模拟网络请求延迟
    await new Promise((resolve) => setTimeout(resolve, 1500));
    isLoading = false;
  });

  async function handlePageChange(page: number) {
    isPageChanging = true;
    // 模拟页面切换加载
    await new Promise((resolve) => setTimeout(resolve, 800));
    currentPage = page;
    isPageChanging = false;
    // 滚动到页面顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
</script>

<div class="container mx-auto px-4 py-8 max-w-7xl">
  <!-- 页面标题 -->
  <header class="text-center mb-12">
    <h1 class="text-4xl font-bold font-kai poetry-text-primary mb-4 theme-transition">
      推荐诗作
    </h1>
    <p class="text-lg poetry-text-secondary theme-transition">
      发现经典诗词之美，感受千年文化传承
    </p>
  </header>

  {#if isLoading}
    <!-- 初始加载状态 -->
    <div class="text-center">
      <LoadingSpinner size="w-12 h-12" text="正在加载诗作..." />
    </div>
  {:else}
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <!-- 主要内容区域 - 诗作列表 -->
      <div class="lg:col-span-3">
        <!-- 诗作网格 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {#if isPageChanging}
            <!-- 页面切换时显示骨架屏 -->
            {#each Array(poemsPerPage) as _, i}
              <PoemCardSkeleton />
            {/each}
          {:else}
            {#each currentPoems as poem (poem.id)}
              <PoemListCard {poem} />
            {/each}
          {/if}
        </div>

        <!-- 分页组件 -->
        <Pagination
          {currentPage}
          {totalPages}
          onPageChange={handlePageChange}
        />
      </div>

      <!-- 侧边栏 -->
      <div class="lg:col-span-1">
        <FeaturedPoems {featuredPoems} />
      </div>
    </div>
  {/if}
</div>
