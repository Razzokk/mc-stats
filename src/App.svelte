<script lang="ts">
	import "./app.css"
	import StatTable from "./lib/StatTable.svelte";
	import {type Stat} from "./lib/Stat";
	import {onMount} from "svelte";

	let stats: Stat[] = [];

	onMount(async () => {
		const response = await fetch("dummy_data.json");
		stats = (await response.json())["blocks_mined"];
	});
</script>

<h1>Player Statistics</h1>

<StatTable name="Blocks Mined" {stats} />
