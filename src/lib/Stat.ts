export interface Stat {
	place: number;
	uuid: string;
	player: string;
	value: number;
}

export interface StatDescription {
	key: string,
	name: string,
	asc?: boolean
}

export interface Statistic {
	name: string,
	entries: Stat[],
}

type RawEntry = {
	uuid: string,
	stats: {
		[key: string]: number
	}
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

export async function getStats(statDescriptions: StatDescription[]): Promise<Stats> {
	const response = await fetch("dummy_data.json");
	const rawStats: RawEntry[] = await response.json();

	const players = rawStats.map(rawStat => rawStat.uuid);
	const stats: Statistic[] = [];

	for (let statDescription of statDescriptions) {
		const key = statDescription.key;
		const name = statDescription.name;
		const asc = statDescription.asc ?? false;

		// Check if stat exists in any of the players stat
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
			name: name,
			entries: calculatePlaces(entries, asc)
		});
	}

	return {stats, players};
}
