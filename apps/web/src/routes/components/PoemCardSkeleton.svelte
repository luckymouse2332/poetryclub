<script lang="ts">
  // 诗歌卡片骨架屏组件
</script>

<div class="poetry-card p-6 rounded-xl border-2 poetry-border animate-pulse">
  <!-- 标题骨架 -->
  <div class="h-6 bg-gray-300 dark:bg-gray-600 rounded mb-4 w-3/4"></div>
  
  <!-- 作者信息骨架 -->
  <div class="flex items-center mb-4 space-x-2">
    <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
    <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-8"></div>
    <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-12"></div>
  </div>
  
  <!-- 内容骨架 -->
  <div class="space-y-2 mb-6">
    <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
    <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-5/6"></div>
    <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-4/5"></div>
    <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
  </div>
  
  <!-- 标签骨架 -->
  <div class="flex flex-wrap gap-2 mb-4">
    <div class="h-6 bg-gray-300 dark:bg-gray-600 rounded-full w-12"></div>
    <div class="h-6 bg-gray-300 dark:bg-gray-600 rounded-full w-16"></div>
    <div class="h-6 bg-gray-300 dark:bg-gray-600 rounded-full w-14"></div>
  </div>
  
  <!-- 底部操作栏骨架 -->
  <div class="flex items-center justify-between pt-4 border-t poetry-border">
    <div class="flex items-center space-x-4">
      <div class="h-8 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
      <div class="h-8 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
    </div>
    <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
  </div>
</div>