<script lang="ts">
	import {type Stat} from "./Stat";

	interface Props {
		name: string;
		stats: Stat[];
		asc?: boolean;
	}

	function compareStats(a: Stat, b: Stat) {
		let result = b.value - a.value;
		if (result == 0) result = a.player.localeCompare(b.player);
		else if (asc) result = -result;
		return result;
	}

	let {name, stats, asc}: Props = $props();

	let sortedStats = $derived(stats.sort(compareStats));
	let place = 0;
	let lastValue: number | undefined = undefined;

	function getPlace(index: number, value: number) {
		if (lastValue === value) return place;
		lastValue = value;
		place = index + 1;
		return place;
	}
</script>

<table>
	<thead>
	<tr>
		<th>Place</th>
		<th>Player</th>
		<th>{name}</th>
	</tr>
	</thead>
	<tbody>
	{#each sortedStats as stat, i}
	{const place = getPlace(i, stat.value)}
	<tr>
		<td>
			{#if place === 1}
				<i class="nf nf-fa-crown"></i>
			{:else}
				{place}
			{/if}
		</td>
		<td>{stat.player}</td>
		<td>{stat.value}</td>
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

	tr :first-child, :last-child {
		text-align: center;
	}
</style>
