<script lang="ts">
	import { Toaster } from 'svelte-sonner';
	import { onMount } from 'svelte';

	// 获取当前主题
	let currentTheme = $state('light');

	// 检测当前DaisyUI主题
	function getCurrentTheme() {
		const theme = document.documentElement.getAttribute('data-theme');
		return theme === 'night' ? 'dark' : 'light';
	}

	onMount(() => {
		currentTheme = getCurrentTheme();
		
		// 监听主题变化
		const observer = new MutationObserver(() => {
			currentTheme = getCurrentTheme();
		});
		
		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['data-theme']
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
		class: 'toast toast-top toast-end',
		duration: 4000
	}}
/>