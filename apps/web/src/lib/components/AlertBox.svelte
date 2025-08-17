<script lang="ts">
	export let type: 'warning' | 'info' | 'success' | 'error' = 'info';
	export let title: string = '';
	export let icon: string = '';

	// 根据类型设置DaisyUI alert样式
	$: alertClass = {
		warning: 'alert-warning',
		info: 'alert-info',
		success: 'alert-success',
		error: 'alert-error'
	}[type];
</script>

<div class="alert {alertClass}">
	<div>
		{#if title}
			<h4 class="font-semibold mb-2">
				{#if icon}{icon} {/if}{title}
			</h4>
		{/if}
		<div class="text-sm">
			<slot />
		</div>
	</div>
</div>