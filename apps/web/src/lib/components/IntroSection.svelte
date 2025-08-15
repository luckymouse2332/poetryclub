<script lang="ts">
	export let title: string;
	export let titleColor: string = 'poetry-intro-title';
	export let textColor: string = 'poetry-intro-text';
	export let bgGradient: string = 'poetry-intro-bg';
	export let borderColor: string = 'poetry-intro-border';
	export let accentColor: string = 'poetry-intro-accent';
</script>

<section class="mb-8 p-6 {bgGradient} rounded-lg border-2 {borderColor} shadow-lg hover:shadow-xl transition-all duration-300">
	<h2 class="text-2xl font-bold mb-4 font-kai {titleColor} relative">
		<span class="inline-block w-1 h-6 {accentColor} bg-current mr-3 rounded"></span>
		{title}
	</h2>
	<div class="leading-relaxed text-lg {textColor} font-medium">
		<slot />
	</div>
</section>