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

<div class="join flex justify-center py-8" aria-label="分页导航">
	<!-- 上一页按钮 -->
	<button
		class="join-item btn btn-outline"
		disabled={currentPage <= 1}
		onclick={goToPrevious}
		aria-label="上一页"
	>
		<span class="mr-2">←</span>
		<span class="hidden sm:inline">上一页</span>
	</button>
	
	<!-- 页码按钮 -->
	{#each pageNumbers as page}
		{#if page === '...'}
			<button class="join-item btn btn-disabled">...</button>
		{:else}
			<button
				class="join-item btn {currentPage === page ? 'btn-active' : 'btn-outline'}"
				onclick={() => handlePageClick(page)}
				aria-label="第 {page} 页"
				aria-current={currentPage === page ? 'page' : undefined}
			>
				{page}
			</button>
		{/if}
	{/each}
	
	<!-- 下一页按钮 -->
	<button
		class="join-item btn btn-outline"
		disabled={currentPage >= totalPages}
		onclick={goToNext}
		aria-label="下一页"
	>
		<span class="hidden sm:inline">下一页</span>
		<span class="ml-2">→</span>
	</button>
</div>

<!-- 页面信息 -->
<div class="text-center text-base-content/70 text-sm">
	第 {currentPage} 页，共 {totalPages} 页
</div>