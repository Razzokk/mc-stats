<script lang="ts">
	import {type Stat} from "../lib/stats";
	import {getOrCreateSkinViewer, playerCape, playerSkin, releaseSkinViewer} from "../lib/global.svelte.js";
	import {onMount} from "svelte";

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

	const skinViewer = getOrCreateSkinViewer();
	let container: HTMLDivElement;
	let currentFirstPlaceIndex = $state(0);
	const intervalMS = 2500; // 2.5 seconds

	onMount(() => {
		container.appendChild(skinViewer.canvas);
		return () => releaseSkinViewer(skinViewer);
	});

	$effect(() => {
		const player = stats[currentFirstPlaceIndex];
		if (!player) return;

		const skin = playerSkin(player.uuid);
		const cape = playerCape(player.uuid);

		if (skin) skinViewer.loadSkin(skin);
		else skinViewer.resetSkin();

		if (cape) skinViewer.loadCape(cape);
		else skinViewer.resetCape();
	});

	// Cycle player skins if there are multiple 1st places
	$effect(() => {
		if (stats.length <= 1 || stats[0].value !== stats[1].value) return;

		let intervalId = setInterval(() => {
			currentFirstPlaceIndex++;
			if (stats[currentFirstPlaceIndex].place != 1) {
				currentFirstPlaceIndex = 0;
			}
		}, intervalMS);
		return () => clearInterval(intervalId);
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
		<tr class:error={!stat.player}>
		<td class="centered" data-place={stat.place}>
			{#if stat.place <= 3}
				<i class="nf nf-fa-trophy"></i>
			{:else}
				{stat.place}.
			{/if}
		</td>
			<td class="player">
			{#if !stat.player}
				unknown
			{:else}
				{stat.player}
			{/if}</td>
			<td class="centered">{format(stat.value)}</td>
		</tr>
		{/each}
		</tbody>
		</table>
		<!-- @formatter:on -->
	</div>
</div>

<style>
	.nf-fa-trophy {
		background: var(--place-color, var(--default));
		background-clip: text;
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
	}

	[data-place="1"] .nf-fa-trophy {
		--place-color: var(--color-first);
	}

	[data-place="2"] .nf-fa-trophy {
		--place-color: var(--color-second);
	}

	[data-place="3"] .nf-fa-trophy {
		--place-color: var(--color-third);
	}

	.centered {
		text-align: center;
	}

	.player {
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}

	.error {
		.player {
			color: #f39d9d;
		}
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
