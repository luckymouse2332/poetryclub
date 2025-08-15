<script lang="ts">
	export let title: string;
	export let borderColor: string = 'poetry-border';
	export let textColor: string = 'poetry-text-primary';
</script>

<section class="mb-8">
	<h2 class="text-2xl font-semibold mb-4 font-kai border-b-2 {borderColor} pb-2">
		{title}
	</h2>
	<div class="space-y-6 {textColor}">
		<slot />
	</div>
</section>