<script lang="ts">
	let { currentPage = 1, totalPages = 1, onPageChange = () => {} }: {
		currentPage?: number;
		totalPages?: number;
		onPageChange?: (page: number) => void;
	} = $props();
	
	// 生成页码数组
	let pageNumbers = $derived(generatePageNumbers(currentPage, totalPages));
	
	function generatePageNumbers(current: number, total: number): (number | string)[] {
		if (total <= 7) {
			return Array.from({ length: total }, (_, i) => i + 1);
		}
		
		const pages: (number | string)[] = [];
		
		// 总是显示第一页
		pages.push(1);
		
		if (current <= 4) {
			// 当前页在前面
			for (let i = 2; i <= Math.min(5, total - 1); i++) {
				pages.push(i);
			}
			if (total > 5) {
				pages.push('...');
			}
		} else if (current >= total - 3) {
			// 当前页在后面
			if (total > 5) {
				pages.push('...');
			}
			for (let i = Math.max(total - 4, 2); i <= total - 1; i++) {
				pages.push(i);
			}
		} else {
			// 当前页在中间
			pages.push('...');
			for (let i = current - 1; i <= current + 1; i++) {
				pages.push(i);
			}
			pages.push('...');
		}
		
		// 总是显示最后一页
		if (total > 1) {
			pages.push(total);
		}
		
		return pages;
	}
	
	function handlePageClick(page: number | string) {
		if (typeof page === 'number' && page !== currentPage) {
			onPageChange(page);
		}
	}
	
	function goToPrevious() {
		if (currentPage > 1) {
			onPageChange(currentPage - 1);
		}
	}
	
	function goToNext() {
		if (currentPage < totalPages) {
			onPageChange(currentPage + 1);
		}
	}
</script>

<nav class="flex justify-center items-center space-x-2 py-8" aria-label="分页导航">
	<!-- 上一页按钮 -->
	<button
		class="flex items-center px-4 py-2 rounded-lg border poetry-border poetry-surface hover:poetry-surface-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
		disabled={currentPage <= 1}
		onclick={goToPrevious}
		aria-label="上一页"
	>
		<span class="mr-2">←</span>
		<span class="hidden sm:inline">上一页</span>
	</button>
	
	<!-- 页码按钮 -->
	<div class="flex items-center space-x-1">
		{#each pageNumbers as page}
			{#if page === '...'}
				<span class="px-3 py-2 poetry-text-muted">...</span>
			{:else}
				<button
					class="w-10 h-10 rounded-lg border poetry-border transition-all duration-200 {currentPage === page
						? 'poetry-btn-primary poetry-text-primary-contrast font-semibold'
						: 'poetry-surface hover:poetry-surface-100 poetry-text-primary'}"
					onclick={() => handlePageClick(page)}
					aria-label="第 {page} 页"
					aria-current={currentPage === page ? 'page' : undefined}
				>
					{page}
				</button>
			{/if}
		{/each}
	</div>
	
	<!-- 下一页按钮 -->
	<button
		class="flex items-center px-4 py-2 rounded-lg border poetry-border poetry-surface hover:poetry-surface-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
		disabled={currentPage >= totalPages}
		onclick={goToNext}
		aria-label="下一页"
	>
		<span class="hidden sm:inline">下一页</span>
		<span class="ml-2">→</span>
	</button>
</nav>

<!-- 页面信息 -->
<div class="text-center poetry-text-muted text-sm">
	第 {currentPage} 页，共 {totalPages} 页
</div>