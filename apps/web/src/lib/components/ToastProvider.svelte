<script lang="ts">
	import { Toaster } from 'svelte-sonner';
	import { onMount } from 'svelte';
	import { getCurrentTheme } from '$lib/theme';

	// 获取当前主题
	let currentTheme = $state('light');

	onMount(() => {
		currentTheme = getCurrentTheme();
		
		// 监听主题变化
		const observer = new MutationObserver(() => {
			currentTheme = getCurrentTheme();
		});
		
		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['class']
		});
		
		return () => observer.disconnect();
	});
</script>

<!-- Sonner Toast Provider -->
<Toaster
	theme={currentTheme === 'dark' ? 'dark' : 'light'}
	position="top-right"
	richColors
	closeButton
	toastOptions={{
		style: 'font-family: system-ui, -apple-system, sans-serif;',
		class: 'poetry-toast',
		duration: 4000
	}}
/>