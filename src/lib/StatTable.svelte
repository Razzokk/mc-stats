<script lang="ts">
	import {type Stat} from "./Stat";
	import {getOrCreateSkinViewer, playerCapeUrl, playerSkinUrl, releaseSkinViewer} from "./global.svelte";
	import {onDestroy, onMount} from "svelte";

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

	let skinViewer = getOrCreateSkinViewer();
	let container: HTMLDivElement;

	function setPlayerForViewer() {
		const uuid = stats[currentFirstPlaceIndex].uuid;
		const skinUrl = playerSkinUrl(uuid);
		const capeUrl = playerCapeUrl(uuid);
		if (skinUrl) skinViewer.loadSkin(skinUrl); else skinViewer.resetSkin();
		if (capeUrl) skinViewer.loadCape(capeUrl); else skinViewer.resetCape();
	}

	onMount(() => {
		container.appendChild(skinViewer.canvas);
		setPlayerForViewer();
	});

	let currentFirstPlaceIndex = 0;
	let intervalId: number;
	const interval = 2500; // 2.5 seconds

	$effect(() => {
		intervalId = setInterval(() => {
			currentFirstPlaceIndex++;
			if (stats[currentFirstPlaceIndex].place != 1) {
				currentFirstPlaceIndex = 0;
			}
			setPlayerForViewer();
		}, interval);
	});

	onDestroy(() => {
		releaseSkinViewer(skinViewer);
		clearInterval(intervalId);
	});
</script>

<div>
	<h3>{name}</h3>

	<div class="table-container" bind:this={container}>
		<!-- @formatter:off -->
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
		<!-- @formatter:on -->
	</div>
</div>

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

	.table-container {
		display: flex;
		align-items: center;
	}

	h3 {
		width: 100%;
		text-align: center;
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
