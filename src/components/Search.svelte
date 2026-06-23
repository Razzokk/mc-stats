<script lang="ts">
	interface Props {
		name: string,
		value: string
	}

	let { name, value = $bindable() }: Props = $props();

	function reset() {
		value = "";
	}
</script>

<div class="search-wrapper">
	<label for="search">{name}:</label>
	<span>
		<input name="search" type="text" placeholder="Search for {name}..." bind:value>
		<!-- svelte-ignore a11y_consider_explicit_label -->
		<button onclick={reset}><i class="nf nf-cod-close"></i></button>
	</span>
</div>

<style>
	.search-wrapper {
		display: flex;
		justify-content: space-between;
		font-size: larger;
		height: 40px;
		background: var(--bg-bright);
	}

	.nf {
		font-size: 16px;
		font-weight: bold;
	}

	span {
		display: flex;
	}

	label {
		display: flex;
		align-items: center;
		margin-left: var(--space-m);
		max-width: 100px;
	}

	input {
		font-size: medium;
		border: none;
		outline: none;
	}

	button {
		background: var(--bg-red);
		cursor: pointer;
		border: none;
		aspect-ratio: 1;

		&:hover {
			background: var(--bg-red-highlight);
		}

		&:active {
			background: var(--bg-red-active);
		}
	}
</style>
