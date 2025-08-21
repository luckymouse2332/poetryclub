<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { toast } from 'svelte-sonner';
  import { isAuthenticated } from '$lib/stores/auth';
  import { api } from '$lib/utils/request';
  import { TiptapEditor } from '$lib/components/tiptap-editor';
  
  import MdiPencil from 'virtual:icons/mdi/pencil';
  import MdiContentSave from 'virtual:icons/mdi/content-save';
  import MdiPublish from 'virtual:icons/mdi/publish';
  import MdiLoading from 'virtual:icons/mdi/loading';
  import MdiEye from 'virtual:icons/mdi/eye';
  import MdiEyeOff from 'virtual:icons/mdi/eye-off';

  // 诗歌数据类型
  interface PoemData {
    id?: string;
    title: string;
    content: string;
    status: 'draft' | 'published';
  }

  // 状态管理
  let isLoading = $state(false);
  let isSaving = $state(false);
  let isPublishing = $state(false);
  let isPreviewMode = $state(false);
  let hasUnsavedChanges = $state(false);
  
  // 表单数据
  let poemData = $state<PoemData>({
    title: '',
    content: '',
    status: 'draft'
  });
  
  // 编辑器引用
  let titleInput = $state<HTMLInputElement>();
  let tiptapEditor = $state<TiptapEditor>();
  
  // 字数统计
  let wordCount = $state(0);
  let characterCount = $state(0);
  
  // 自动保存
  let autoSaveTimer: NodeJS.Timeout;
  let lastSavedAt = $state<Date | null>(null);
  
  // 检查是否为编辑模式
  const editId = $page.url.searchParams.get('id');
  const isEditMode = !!editId;
  
  // 检查认证状态
  onMount(() => {
    if (!$isAuthenticated) {
      goto('/login');
      return;
    }
    
    if (isEditMode) {
      loadPoem(editId!);
    }
    
    // 设置自动保存
    setupAutoSave();
    
    // 监听页面离开事件
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '您有未保存的更改，确定要离开吗？';
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
    };
  });
  
  // 加载诗歌数据（编辑模式）
  async function loadPoem(id: string) {
    isLoading = true;
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 模拟数据
      poemData = {
        id,
        title: '春江花月夜',
        content: '春江潮水连海平，海上明月共潮生。\n滟滟随波千万里，何处春江无月明！\n江流宛转绕芳甸，月照花林皆似霰。',
        status: 'draft'
      };
      
      updateWordCount();
    } catch (error) {
      console.error('加载诗歌失败:', error);
      toast.error('加载失败，请稍后重试');
    } finally {
      isLoading = false;
    }
  }
  
  // 设置自动保存
  function setupAutoSave() {
    const startAutoSave = () => {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
      
      autoSaveTimer = setTimeout(() => {
        if (hasUnsavedChanges && (poemData.title.trim() || poemData.content.trim())) {
          saveDraft(true); // 静默保存
        }
      }, 30000); // 30秒自动保存
    };
    
    startAutoSave();
  }
  
  // 更新字数统计
  function updateWordCount() {
    // 从HTML内容中提取纯文本
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = poemData.content;
    const text = tempDiv.textContent || tempDiv.innerText || '';
    
    const cleanText = text.replace(/\s+/g, '');
    characterCount = cleanText.length;
    wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  }
  
  // 监听内容变化
  function handleContentChange() {
    hasUnsavedChanges = true;
    updateWordCount();
    setupAutoSave(); // 重置自动保存计时器
  }
  
  // 处理编辑器内容更新
  function handleEditorUpdate(html: string) {
    poemData.content = html;
    handleContentChange();
  }
  
  // 保存草稿
  async function saveDraft(silent = false) {
    if (!poemData.title.trim() && !poemData.content.trim()) {
      if (!silent) {
        toast.error('请输入标题或内容');
      }
      return;
    }
    
    isSaving = true;
    
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 800));
      
      poemData.status = 'draft';
      hasUnsavedChanges = false;
      lastSavedAt = new Date();
      
      if (!silent) {
        toast.success('草稿保存成功');
      }
    } catch (error) {
      console.error('保存草稿失败:', error);
      if (!silent) {
        toast.error('保存失败，请稍后重试');
      }
    } finally {
      isSaving = false;
    }
  }
  
  // 发布诗歌
  async function publishPoem() {
    if (!poemData.title.trim()) {
      toast.error('请输入诗歌标题');
      titleInput?.focus();
      return;
    }
    
    if (!poemData.content.trim()) {
      toast.error('请输入诗歌内容');
      tiptapEditor?.focus();
      return;
    }
    
    isPublishing = true;
    
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      poemData.status = 'published';
      hasUnsavedChanges = false;
      lastSavedAt = new Date();
      
      toast.success('诗歌发布成功');
      
      // 跳转到诗歌详情页或我的诗歌页
      setTimeout(() => {
        goto('/my-poems');
      }, 1000);
    } catch (error) {
      console.error('发布诗歌失败:', error);
      toast.error('发布失败，请稍后重试');
    } finally {
      isPublishing = false;
    }
  }
  
  // 切换预览模式
  function togglePreview() {
    isPreviewMode = !isPreviewMode;
  }
  
  // 格式化最后保存时间
  function formatLastSaved() {
    if (!lastSavedAt) return '';
    
    const now = new Date();
    const diff = now.getTime() - lastSavedAt.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return '刚刚保存';
    if (minutes < 60) return `${minutes}分钟前保存`;
    
    return lastSavedAt.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    }) + ' 保存';
  }
</script>

<svelte:head>
  <title>{isEditMode ? '编辑诗歌' : '创作诗歌'} - 回中诗社</title>
</svelte:head>

<div class="container mx-auto px-4 py-8 max-w-5xl">
  <!-- 页面标题 -->
  <div class="flex items-center justify-between mb-8">
    <div class="flex items-center gap-3">
      <MdiPencil class="w-8 h-8 text-primary" />
      <h1 class="text-3xl font-bold text-base-content">
        {isEditMode ? '编辑诗歌' : '创作诗歌'}
      </h1>
    </div>
    
    <!-- 状态信息 -->
    <div class="text-sm text-base-content/60">
      {#if isSaving}
        <span class="flex items-center gap-2">
          <MdiLoading class="w-4 h-4 animate-spin" />
          保存中...
        </span>
      {:else if lastSavedAt}
        <span>{formatLastSaved()}</span>
      {:else if hasUnsavedChanges}
        <span class="text-warning">有未保存的更改</span>
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
  {:else}
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <!-- 编辑区域 -->
      <div class="lg:col-span-3">
        <div class="card bg-base-100 shadow-lg">
          <div class="card-body">
            <!-- 标题输入 -->
            <div class="form-control mb-6">
              <label class="label" for="poem-title">
                <span class="label-text font-medium">诗歌标题</span>
                <span class="label-text-alt text-error">*</span>
              </label>
              <input 
                id="poem-title"
                type="text" 
                class="input input-bordered input-lg text-xl font-medium"
                placeholder="请输入诗歌标题..."
                bind:value={poemData.title}
 bind:this={titleInput}
                oninput={handleContentChange}
                maxlength="100"
              />
            </div>
            
            {#if !isPreviewMode}
              <!-- Tiptap 富文本编辑器 -->
              <TiptapEditor 
                bind:this={tiptapEditor}
                content={poemData.content}
                placeholder="开始创作你的诗歌..."
                onUpdate={handleEditorUpdate}
                minHeight="400px"
              />
            {:else}
              <!-- 预览模式 -->
              <div class="border border-base-300 rounded-lg p-6 min-h-[400px] bg-base-50">
                <div class="prose prose-lg max-w-none">
                  <h2 class="text-2xl font-bold mb-4">{poemData.title || '未命名诗歌'}</h2>
                  <div class="whitespace-pre-line text-base-content/80">
                    {poemData.content || '暂无内容'}
                  </div>
                </div>
              </div>
            {/if}
            
            <!-- 操作按钮 -->
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-6">
              <div class="flex items-center gap-4">
                <!-- 预览切换 -->
                <button 
                  class="btn btn-ghost btn-sm"
                  onclick={togglePreview}
                >
                  {#if isPreviewMode}
                    <MdiEyeOff class="w-4 h-4" />
                    编辑模式
                  {:else}
                    <MdiEye class="w-4 h-4" />
                    预览模式
                  {/if}
                </button>
                
                <!-- 字数统计 -->
                <div class="text-sm text-base-content/60">
                  字数：{characterCount} | 词数：{wordCount}
                </div>
              </div>
              
              <div class="flex items-center gap-3">
                <!-- 保存草稿 -->
                <button 
                  class="btn btn-outline"
                  onclick={() => saveDraft()}
                  disabled={isSaving || isPublishing}
                >
                  {#if isSaving}
                    <MdiLoading class="w-4 h-4 animate-spin" />
                    保存中...
                  {:else}
                    <MdiContentSave class="w-4 h-4" />
                    保存草稿
                  {/if}
                </button>
                
                <!-- 发布 -->
                <button 
                  class="btn btn-primary"
                  onclick={publishPoem}
                  disabled={isSaving || isPublishing || !poemData.title.trim() || !poemData.content.trim()}
                >
                  {#if isPublishing}
                    <MdiLoading class="w-4 h-4 animate-spin" />
                    发布中...
                  {:else}
                    <MdiPublish class="w-4 h-4" />
                    发布诗歌
                  {/if}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 侧边栏 -->
      <div class="lg:col-span-1">
        <div class="space-y-6">
          <!-- 创作提示 -->
          <div class="card bg-base-100 shadow-lg">
            <div class="card-body">
              <h3 class="card-title text-lg mb-4">创作提示</h3>
              <div class="space-y-3 text-sm text-base-content/70">
                <div class="flex items-start gap-2">
                  <span class="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  <span>用心感受，真诚表达</span>
                </div>
                <div class="flex items-start gap-2">
                  <span class="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  <span>注意韵律和节奏</span>
                </div>
                <div class="flex items-start gap-2">
                  <span class="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  <span>善用意象和比喻</span>
                </div>
                <div class="flex items-start gap-2">
                  <span class="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  <span>保持语言的简洁美</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 快捷键 -->
          <div class="card bg-base-100 shadow-lg">
            <div class="card-body">
              <h3 class="card-title text-lg mb-4">快捷键</h3>
              <div class="space-y-2 text-sm text-base-content/70">
                <div class="flex justify-between">
                  <span>保存草稿</span>
                  <kbd class="kbd kbd-xs">Ctrl+S</kbd>
                </div>
                <div class="flex justify-between">
                  <span>加粗</span>
                  <kbd class="kbd kbd-xs">Ctrl+B</kbd>
                </div>
                <div class="flex justify-between">
                  <span>斜体</span>
                  <kbd class="kbd kbd-xs">Ctrl+I</kbd>
                </div>
                <div class="flex justify-between">
                  <span>撤销</span>
                  <kbd class="kbd kbd-xs">Ctrl+Z</kbd>
                </div>
                <div class="flex justify-between">
                  <span>重做</span>
                  <kbd class="kbd kbd-xs">Ctrl+Y</kbd>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  /* 页面样式 */
</style>