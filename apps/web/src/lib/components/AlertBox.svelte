<script lang="ts">
	export let type: 'warning' | 'info' | 'success' | 'error' = 'info';
	export let title: string = '';
	export let icon: string = '';

	// 根据类型设置样式 - 使用专门的突出主题变量
	$: colorClasses = {
		warning: {
			bg: 'poetry-alert-warning-bg',
			border: 'poetry-alert-warning-border',
			titleColor: 'poetry-alert-warning-text',
			textColor: 'poetry-alert-warning-text'
		},
		info: {
			bg: 'poetry-alert-info-bg',
			border: 'poetry-alert-info-border',
			titleColor: 'poetry-alert-info-text',
			textColor: 'poetry-alert-info-text'
		},
		success: {
			bg: 'poetry-alert-success-bg',
			border: 'poetry-alert-success-border',
			titleColor: 'poetry-alert-success-text',
			textColor: 'poetry-alert-success-text'
		},
		error: {
			bg: 'poetry-alert-error-bg',
			border: 'poetry-alert-error-border',
			titleColor: 'poetry-alert-error-text',
			textColor: 'poetry-alert-error-text'
		}
	}[type];
</script>

<div class="p-4 {colorClasses.bg} rounded-lg border {colorClasses.border}">
	{#if title}
		<h4 class="font-semibold {colorClasses.titleColor} mb-2">
			{#if icon}{icon} {/if}{title}
		</h4>
	{/if}
	<div class="text-sm {colorClasses.textColor}">
		<slot />
	</div>
</div>