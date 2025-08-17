<script lang="ts">
	export let steps: Array<{
		icon: string;
		title: string;
		description: string;
	}>;
	export let columns: string = 'grid-cols-1 md:grid-cols-4';
	export let titleColor: string = 'text-base-content';
export let descColor: string = 'text-base-content/80';
</script>

<div class="grid {columns} gap-4 text-center">
	{#each steps as step}
		<div>
			<div class="text-2xl mb-2">{step.icon}</div>
			<h5 class="font-semibold mb-1 {titleColor}">{step.title}</h5>
			<p class="text-xs {descColor}">{step.description}</p>
		</div>
	{/each}
</div>