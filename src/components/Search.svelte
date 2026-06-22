<script lang="ts">
	import {onMount} from "svelte";

	interface Props {
		name: string,
		value: string
	}

	let { name, value = $bindable() }: Props = $props();
	let rawValue: string;

	onMount(() => rawValue = value);
</script>

<label>
	{name}
	<input
		type="text"
		placeholder="Search for {name}..."
		bind:value={
			() => rawValue,
			(v) => {
				rawValue = v;
				value = v.toLowerCase()
			}
		}>
</label>
