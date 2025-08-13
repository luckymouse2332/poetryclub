<script lang="ts">
  import { page } from '$app/state';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { CommentSection, FeaturedPoems, PoemCard, LoadingSpinner, ShareDialog } from "$lib/components";
  import heartSvg from '$lib/assets/icons/heart.svg';
  import eyeViewSvg from '$lib/assets/icons/eye-view.svg';

  // UUID 校验函数
  function isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  // 获取诗歌ID
  const poemId = page.params.id;

  // 加载状态
  let isLoading = true;
  let poem: any = null;

  // 验证UUID格式
  if (!poemId || !isValidUUID(poemId)) {
    goto('/404');
  }

  // 模拟数据加载
	onMount(async () => {
		// 模拟网络请求延迟
		await new Promise(resolve => setTimeout(resolve, 1200));
		
		// 加载诗歌数据
		poem = {
			id: poemId,
			title: "望庐山瀑布",
			author: "李白",
			content: "日照香炉生紫烟，\n遥看瀑布挂前川。\n飞流直下三千尺，\n疑是银河落九天。",
			tags: ["唐诗", "山水", "瀑布"],
			likes: 1234,
			views: 5678,
			createdAt: "2024-01-15",
			isLiked: false
		};
		
		isLoading = false;
	});
  
  let featuredPoems = [
    { title: "静夜思", author: "李白", preview: "床前明月光，疑是地上霜...", likes: 2156 },
    { title: "登鹳雀楼", author: "王之涣", preview: "白日依山尽，黄河入海流...", likes: 1834 },
    { title: "相思", author: "王维", preview: "红豆生南国，春来发几枝...", likes: 1567 },
    { title: "春江花月夜", author: "张若虚", preview: "春江潮水连海平，海上明月共潮生...", likes: 1247 }
  ];
  
  let comments = [
    { id: 1, author: "山水诗爱好者", avatar: "🏔️", content: "李白的这首诗气势磅礴，'飞流直下三千尺'写得太壮观了！", time: "1小时前", likes: 31 },
    { id: 2, author: "古典文学研究者", avatar: "🎓", content: "这首诗体现了李白豪放的诗风，想象奇特，比喻新颖。'疑是银河落九天'堪称神来之笔。", time: "3小时前", likes: 28 },
    { id: 3, author: "诗词朗诵者", avatar: "🎤", content: "每次朗诵这首诗都能感受到瀑布的壮美，李白真不愧是诗仙！", time: "6小时前", likes: 19 },
    { id: 4, author: "文学爱好者", avatar: "📖", content: "短短四句诗，却描绘出了如此壮丽的景象，古人的文字功底真是令人敬佩。", time: "1天前", likes: 42 }
  ];
  
  let newComment = '';
  let isLiked = false;
  
  function addComment() {
    if (newComment.trim()) {
      comments = [
        { 
          id: Date.now(), 
          author: "当前用户", 
          avatar: "👤",
          content: newComment, 
          time: "刚刚",
          likes: 0
        },
        ...comments
      ];
      newComment = '';
      // poem.comments += 1; // 暂时注释掉，因为模拟数据中没有 comments 字段
    }
  }
</script>

<svelte:head>
  <title>{poem?.title || '诗歌详情'} - {poem?.author || ''} | 回中诗社</title>
  <meta name="description" content="{poem?.title || ''} - {poem?.author || ''}" />
</svelte:head>

<div class="container mx-auto px-4 py-8">
	{#if isLoading}
		<!-- 加载状态 -->
		<div class="text-center">
			<LoadingSpinner size="w-12 h-12" text="正在加载诗歌详情..." />
		</div>
	{:else if poem}
		<div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
			<!-- 主要内容区域 -->
			<div class="lg:col-span-3">
				<!-- 诗歌详情卡片 -->
				<div class="bg-white rounded-lg shadow-lg p-8 mb-8">
					<!-- 诗歌标题和作者 -->
					<div class="mb-6">
						<h1 class="text-3xl font-bold text-gray-900 mb-2">{poem.title}</h1>
						<p class="text-lg text-gray-600">
							<span class="font-medium">{poem.author}</span>
							<span class="mx-2">·</span>
							<span>{poem.createdAt}</span>
						</p>
					</div>

					<!-- 诗歌内容 -->
					<div class="mb-6">
						<div class="text-lg leading-relaxed text-gray-800 whitespace-pre-line font-serif">
							{poem.content}
						</div>
					</div>

					<!-- 标签 -->
					<div class="mb-6">
						<div class="flex flex-wrap gap-2">
							{#each poem.tags as tag}
								<span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
									{tag}
								</span>
							{/each}
						</div>
					</div>

					<!-- 互动按钮 -->
					<div class="flex items-center gap-6 pt-4 border-t border-gray-200">
						<button class="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors">
							<img src={heartSvg} alt="Like" class="w-5 h-5" />
							<span>{poem.likes}</span>
						</button>
						<button class="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
							<img src={eyeViewSvg} alt="Views" class="w-5 h-5" />
							<span>{poem.views}</span>
						</button>
						<ShareDialog {poem} />
					</div>
				</div>

				<!-- 评论区域 -->
				<CommentSection {comments} handleAddComment={addComment} />
			</div>

			<!-- 侧边栏 -->
			<div class="lg:col-span-1">
				<FeaturedPoems {featuredPoems} />
			</div>
		</div>
	{:else}
		<!-- 错误状态 -->
		<div class="text-center">
			<p class="text-gray-600">诗歌未找到</p>
		</div>
	{/if}
</div>