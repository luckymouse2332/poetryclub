<script lang="ts">
	export let headers: string[];
	export let rows: string[][];
</script>

<div class="overflow-x-auto">
	<table class="w-full border-collapse border border-base-300 text-sm">
		<thead>
			<tr class="bg-base-200">
				{#each headers as header}
					<th class="border border-base-300 px-4 py-2 text-left text-base-content">{header}</th>
				{/each}
			</tr>
		</thead>
		<tbody>
			{#each rows as row, index}
				<tr>
					{#each row as cell}
						<td class="border border-base-300 px-4 py-2 text-base-content/80">{cell}</td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
</div>