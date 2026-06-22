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
	let filteredStats = $derived(stats.filter(stat => stat.name.toLowerCase().includes(searchStat)))

	onMount(async () => {
		const result = await getStats(statDescriptions);
		stats = result.stats;
		await initMappings(result.players, stats);
	});
</script>

<h1>Player Statistics</h1>

<div>
	<Search name="Player" bind:value={searchPlayer} />
	<Search name="Statistic" bind:value={searchStat} />
</div>

{#each filteredStats as stat}
<StatTable name={stat.name} stats={stat.entries} searchPlayer={searchPlayer} formatter={stat.formatter}/>
{/each}
