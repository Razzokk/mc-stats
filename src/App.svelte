<script lang="ts">
	import "./app.css"
	import StatTable from "./lib/StatTable.svelte";
	import {getStats, type StatDescription, type Statistic} from "./lib/Stat";
	import {onMount} from "svelte";
	import Search from "./lib/Search.svelte";

	const statDescriptions: StatDescription[] = [
		{key: "blocks_mined", name: "Blocks Mined"},
		{key: "deaths", name: "Deaths", asc: true},
	]

	let stats: Statistic[] = $state([]);
	let searchPlayer: string = $state("");
	let searchStat: string = $state("");
	let filteredStats = $derived(stats.filter(stat => stat.name.toLowerCase().includes(searchStat)))

	onMount(async () => stats = await getStats(statDescriptions));
</script>

<h1>Player Statistics</h1>

<div>
	<Search name="Player" bind:value={searchPlayer} />
	<Search name="Statistic" bind:value={searchStat} />
</div>

{#each filteredStats as stat}
	<StatTable name={stat.name} stats={stat.entries} searchPlayer={searchPlayer}/>
{/each}
