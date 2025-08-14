<script lang="ts">
  import { onMount } from 'svelte';
  import { themeLoading, themeReady, getCurrentTheme } from '$lib/theme';
  import LoadingSpinner from './LoadingSpinner.svelte';

  // 响应式订阅主题加载状态
  $: isLoading = $themeLoading;
  $: ready = $themeReady;

  // 获取当前主题模式用于样式适配
  let isDarkMode = false;

  onMount(() => {
    // 检测当前主题模式
    const currentTheme = getCurrentTheme();
    isDarkMode = currentTheme === 'dark';

    // 监听主题变化
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          isDarkMode = document.documentElement.classList.contains('dark');
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => {
      observer.disconnect();
    };
  });
</script>

<!-- 主题加载遮罩 -->
{#if isLoading}
  <div 
    id="theme-loading-overlay"
    class="theme-loading"
    class:dark={isDarkMode}
    role="status"
    aria-label="主题加载中"
  >
    <div class="flex flex-col items-center space-y-4">
      <LoadingSpinner text="" />
      <p class="text-sm opacity-80 font-kai">
        {isDarkMode ? '深色主题加载中...' : '浅色主题加载中...'}
      </p>
    </div>
  </div>
{/if}

<style>
  /* 确保加载遮罩在最顶层 */
  .theme-loading {
    z-index: 10000;
  }

  /* 加载文本样式 */
  .theme-loading p {
    font-family: var(--font-kai, 'KaiTi', '楷体', serif);
    letter-spacing: 0.05em;
  }

  /* 深色模式下的文本颜色调整 */
  .theme-loading.dark p {
    color: var(--poetry-text-secondary, rgb(203 213 225)); /* slate-300 */
  }

  /* 浅色模式下的文本颜色 */
  .theme-loading:not(.dark) p {
    color: var(--poetry-text-secondary, rgb(180 83 9)); /* amber-700 */
  }
</style>