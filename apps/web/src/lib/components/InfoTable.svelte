<script lang="ts">
	export let headers: string[];
	export let rows: string[][];
</script>

<div class="overflow-x-auto">
	<table class="w-full border-collapse border poetry-border text-sm">
		<thead>
			<tr class="poetry-surface-200">
				{#each headers as header}
					<th class="border poetry-border px-4 py-2 text-left poetry-text-primary">{header}</th>
				{/each}
			</tr>
		</thead>
		<tbody>
			{#each rows as row, index}
				<tr>
					{#each row as cell}
						<td class="border poetry-border px-4 py-2 poetry-text-secondary">{cell}</td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
</div>