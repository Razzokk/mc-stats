import {getPlayerProfile, type Profile} from "./minecraft-api";
import type {Statistic} from "./Stat";

const uuidToPlayerMapping: { [uuid: string]: Profile } = $state({});

export async function initMappings(players: string[], stats: Statistic[]) {
	for (let uuid of players) {
		uuidToPlayerMapping[uuid] = await getPlayerProfile(uuid);
	}

	// Populate
	for (let stat of stats) {
		for (let entry of stat.entries) {
			entry.player = uuidToPlayerMapping[entry.uuid].name;
		}
	}
}

export function playerName(uuid: string) {
	return uuidToPlayerMapping[uuid]?.name ?? uuid;
}

export function playerSkinUrl(uuid: string) {
	return uuidToPlayerMapping[uuid]?.textures.skinUrl ?? "";
}

export function playerCapeUrl(uuid: string) {
	return uuidToPlayerMapping[uuid]?.textures.capeUrl ?? "";
}
