<script lang="ts">
  import { page } from '$app/state';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';
  import { Poem, Loading, Comment } from '$lib/components';

  // UUID 校验函数
  function isValidUUID(uuid: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  // 获取诗歌ID
  const poemId = page.params.id;

  // 加载状态
  let isLoading = true;
  let poem = writable({
    id: '',
    title: '',
    author: '',
    content: '',
    tags: [''],
    likes: 0,
    views: 0,
    createdAt: '',
    isLiked: false,
  });

  // 验证UUID格式
  if (!poemId || !isValidUUID(poemId)) {
    goto('/404');
  }

  // 模拟数据加载
  onMount(async () => {
    // 模拟网络请求延迟
    await new Promise((resolve) => setTimeout(resolve, 1200));

    // 加载诗歌数据
    poem.set({
      id: poemId!,
      title: '望庐山瀑布',
      author: '李白',
      content:
        '日照香炉生紫烟，\n遥看瀑布挂前川。\n飞流直下三千尺，\n疑是银河落九天。',
      tags: ['唐诗', '山水', '瀑布'],
      likes: 1234,
      views: 5678,
      createdAt: '2024-01-15',
      isLiked: false,
    });

    isLoading = false;
  });

  let featuredPoems = [
    {
      title: '静夜思',
      author: '李白',
      preview: '床前明月光，疑是地上霜...',
      likes: 2156,
    },
    {
      title: '登鹳雀楼',
      author: '王之涣',
      preview: '白日依山尽，黄河入海流...',
      likes: 1834,
    },
    {
      title: '相思',
      author: '王维',
      preview: '红豆生南国，春来发几枝...',
      likes: 1567,
    },
    {
      title: '春江花月夜',
      author: '张若虚',
      preview: '春江潮水连海平，海上明月共潮生...',
      likes: 1247,
    },
  ];

  let comments = [
    {
      id: 1,
      author: '山水诗爱好者',
      avatar: '🏔️',
      content: "李白的这首诗气势磅礴，'飞流直下三千尺'写得太壮观了！",
      time: '1小时前',
      likes: 31,
    },
    {
      id: 2,
      author: '古典文学研究者',
      avatar: '🎓',
      content:
        "这首诗体现了李白豪放的诗风，想象奇特，比喻新颖。'疑是银河落九天'堪称神来之笔。",
      time: '3小时前',
      likes: 28,
    },
    {
      id: 3,
      author: '诗词朗诵者',
      avatar: '🎤',
      content: '每次朗诵这首诗都能感受到瀑布的壮美，李白真不愧是诗仙！',
      time: '6小时前',
      likes: 19,
    },
    {
      id: 4,
      author: '文学爱好者',
      avatar: '📖',
      content:
        '短短四句诗，却描绘出了如此壮丽的景象，古人的文字功底真是令人敬佩。',
      time: '1天前',
      likes: 42,
    },
  ];

  let newComment = '';
  let isLiked = false;

  function addComment() {
    if (newComment.trim()) {
      comments = [
        {
          id: Date.now(),
          author: '当前用户',
          avatar: '👤',
          content: newComment,
          time: '刚刚',
          likes: 0,
        },
        ...comments,
      ];
      newComment = '';
      // TODO:发送一个请求给服务器
      // poem.comments += 1; // 暂时注释掉，因为模拟数据中没有 comments 字段
    }
  }

  function changeLiked() {
    isLiked = !isLiked;
    // TODO:发送一个请求给服务器
    // 实现响应式效果
    poem.update((p) => ({ ...p, likes: ($poem.likes += isLiked ? 1 : -1) }));
  }
</script>

<svelte:head>
  <title>{$poem?.title || '诗歌详情'} - {$poem?.author || ''} | 回中诗社</title>
  <meta
    name="description"
    content="{$poem?.title || ''} - {$poem?.author || ''}"
  />
</svelte:head>

<div class="container mx-auto px-4 py-8">
  {#if isLoading}
    <!-- 加载状态 -->
    <div class="text-center">
      <Loading text="正在加载诗歌详情..." />
    </div>
  {:else if poem}
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <!-- 主要内容区域 -->
      <div class="lg:col-span-3">
        <!-- 诗歌详情卡片 -->
        <Poem.DetailCard poem={$poem} {isLiked} onLikeToggle={changeLiked} />

        <!-- 评论区域 -->
        <Comment.Section {comments} handleAddComment={addComment} />
      </div>

      <!-- 侧边栏 -->
      <div class="lg:col-span-1">
        <Poem.FeaturedList {featuredPoems} />
      </div>
    </div>
  {:else}
    <!-- 错误状态 -->
    <div class="card bg-base-200 shadow-xl">
      <div class="card-body text-center">
        <div class="text-6xl mb-4">📖</div>
        <h3 class="card-title text-xl justify-center mb-2">诗歌未找到</h3>
        <p class="text-base-content/70">抱歉，您访问的诗歌不存在或已被删除</p>
      </div>
    </div>
  {/if}
</div>
