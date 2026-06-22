<script lang="ts">
	import "./app.css"
	import StatTable from "./components/StatTable.svelte";
	import {getStats, type StatMetadata, type Statistic} from "./lib/stats";
	import {onMount} from "svelte";
	import Search from "./components/Search.svelte";
	import {initMappings} from "./lib/global.svelte";
	import {ticksToTime} from "./lib/utils";

	const statDescriptions: StatMetadata[] = [
		{key: "mined", name: "Blocks Mined"},
		{key: "picked_up", name: "Items Picked Up"},
		{key: "deaths", name: "Deaths", asc: true},
		{key: "crafted", name: "Items Crafted"},
		{key: "play_time", name: "Play Time", formatter: ticksToTime},
		{key: "bell_ring", name: "Bells Ringed"},
		{key: "used", name: "Items Used"},
		{key: "broken", name: "Items Broken"},
		{key: "jump", name: "Jumped"},
		{key: "play_record", name: "Records Played"},
		{key: "animals_bred", name: "Animals Bred"},
		{key: "time_since_death", name: "Time Since Death", formatter: ticksToTime},
		{key: "time_since_rest", name: "Time Since Rest", formatter: ticksToTime},
	]

	let stats: Statistic[] = $state([]);
	let searchPlayer: string = $state("");
	let searchStat: string = $state("");
	let filteredStats = $derived(stats.filter(stat => stat.name.toLowerCase().includes(searchStat.toLowerCase())))

	onMount(async () => {
		const result = await getStats(statDescriptions);
		stats = result.stats;
		await initMappings(result.players, stats);
	});
</script>

<h1>Player Statistics</h1>

<div class="search-bar">
	<h2>Search Options</h2>
	<div class="search-wrapper">
		<Search name="Player" bind:value={searchPlayer} />
		<Search name="Statistic" bind:value={searchStat} />
	</div>
</div>

{#each filteredStats as stat}
<StatTable name={stat.name} stats={stat.entries} searchPlayer={searchPlayer} formatter={stat.formatter}/>
{/each}

<style>
	h1 {
		text-align: center;
		padding: 0.5em 0;
	}

	h2 {
		text-align: center;
		margin: 0.25em 0;
	}

	.search-bar {
		width: 100%;
		border: var(--border);
	}

	.search-wrapper {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: var(--space-s);
		margin: var(--space-s) 0;
	}
</style>
