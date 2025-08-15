<script lang="ts">
	export let features: Array<{
		icon: string;
		title: string;
		description: string;
	}>;
	export let columns: string = 'grid-cols-1 md:grid-cols-2';
	export let bgColor: string = 'poetry-surface-100';
	export let borderColor: string = 'poetry-border';
	export let titleColor: string = 'poetry-text-primary';
	export let descColor: string = 'poetry-text-secondary';
</script>

<div class="grid {columns} gap-6">
	{#each features as feature}
		<div class="flex items-start space-x-4 p-4 {bgColor} rounded-lg {borderColor !== 'border-transparent' ? `border ${borderColor}` : ''}">
			<div class="text-2xl">{feature.icon}</div>
			<div>
				<h4 class="font-bold {titleColor} mb-2">
					{feature.title}
				</h4>
				<div class="text-sm {descColor}">
					{#each feature.description.split('\n') as line}
						<div>{line}</div>
					{/each}
				</div>
			</div>
		</div>
	{/each}
</div>