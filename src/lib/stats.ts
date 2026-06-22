export interface Stat {
	place: number;
	uuid: string;
	player: string;
	value: number;
}

export interface StatMetadata {
	key: string,
	name: string,
	asc?: boolean,
	formatter?: (value: number) => string
}

export interface Statistic {
	name: string,
	formatter?: (value: number) => string
	entries: Stat[],
}

type RawEntry = {
	uuid: string,
	stats: Record<string, number>
}

type RawStat = Omit<Stat, "place">

function calculatePlaces(rawStats: RawStat[], asc: boolean) {
	let place = 0;
	let lastValue: number | undefined = undefined;

	function compareStats(a: RawStat, b: RawStat) {
		let result = b.value - a.value;
		if (result == 0) result = a.player.localeCompare(b.player);
		else if (asc) result = -result;
		return result;
	}

	function calculatePlace(rawStat: RawStat, index: number): Stat {
		if (lastValue !== rawStat.value) {
			lastValue = rawStat.value;
			place = index + 1;
		}

		return {
			place: place,
			uuid: rawStat.uuid,
			player: rawStat.player,
			value: rawStat.value
		};
	}

	return rawStats.toSorted(compareStats).map(calculatePlace)
}

type Stats = {
	players: string[],
	stats: Statistic[]
}

export async function getStats(statMetadata: StatMetadata[]): Promise<Stats> {
	const response = await fetch("https://mc.razzokk.net/api/stats");
	const rawStats: RawEntry[] = await response.json();

	const players = rawStats.map(rawStat => rawStat.uuid);
	const stats: Statistic[] = [];

	for (let meta of statMetadata) {
		const key = meta.key;
		const asc = meta.asc ?? false;

		// Check if stat exists in any of the players stats
		if (!rawStats.some(rawStat => key in rawStat.stats)) {
			console.error(`ERROR: Could not find statistic '${key}'`);
			continue;
		}

		const entries: RawStat[] = rawStats.map(entry => ({
			uuid: entry.uuid,
			player: "Loading...", //TODO: maybe change
			value: entry.stats[key] ?? 0
		}));

		stats.push({
			name: meta.name,
			entries: calculatePlaces(entries, asc),
			formatter: meta.formatter
		});
	}

	return {stats, players};
}
