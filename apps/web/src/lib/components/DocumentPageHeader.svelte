<script lang="ts">
	export let title: string;
	export let lastUpdated: string;
	export let effectiveDate: string;
</script>

<header class="text-center mb-8">
	<h1 class="text-4xl font-bold poetry-text-primary font-kai mb-4">{title}</h1>
	<p class="poetry-text-secondary text-lg">最后更新时间：{lastUpdated}</p>
	<p class="poetry-text-muted mt-2">生效时间：{effectiveDate}</p>
</header>