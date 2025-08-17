<script lang="ts">
	export let title: string;
	export let lastUpdated: string;
	export let effectiveDate: string;
</script>

<header class="text-center mb-8">
	<h1 class="text-4xl font-bold text-base-content font-kai mb-4">{title}</h1>
<p class="text-base-content/80 text-lg">最后更新时间：{lastUpdated}</p>
<p class="text-base-content/60 mt-2">生效时间：{effectiveDate}</p>
</header>