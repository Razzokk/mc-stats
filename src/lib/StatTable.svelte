<script lang="ts">
	import {type Stat} from "./Stat";

	interface Props {
		name: string;
		stats: Stat[];
		searchPlayer: string;
		formatter?: (value: number) => string;
	}

	let {name, stats, searchPlayer, formatter}: Props = $props();
	let filteredStats = $derived(stats.filter(stat =>
		stat.player.toLowerCase().includes(searchPlayer)
	));

	function format(value: number) {
		if (!formatter) return value;
		return formatter(value);
	}
</script>

<table>
	<thead>
	<tr>
		<th class="centered">Place</th>
		<th>Player</th>
		<th class="centered">{name}</th>
	</tr>
	</thead>
	<tbody>
	{#each filteredStats as stat}
	<tr>
		<td class="centered">
			{#if stat.place === 1}
				<i class="nf nf-fa-crown"></i>
			{:else}
				{stat.place}.
			{/if}
		</td>
		<td class="player">{stat.player}</td>
		<td class="centered">{format(stat.value)}</td>
	</tr>
	{/each}
	</tbody>
</table>

<style>
	.nf-fa-crown {
		background: var(--crown);
		background-clip: text;
		-webkit-text-fill-color: transparent;
	}

	.centered {
		text-align: center;
	}

	.player {
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}

	table {
		table-layout: fixed;
		width: 600px;
		text-align: left;
		border-collapse: collapse;

		tr {
			height: 30px;
		}

		tbody tr:hover {
			background-color: var(--highlight);
		}

		th, td {
			padding: 2px 5px
		}
	}
</style>
