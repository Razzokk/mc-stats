import {getPlayerProfile, type Profile} from "./minecraft-api";
import type {Statistic} from "./stats";
import {IdleAnimation, SkinViewer} from "skinview3d";

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

export function playerSkin(uuid: string) {
	return uuidToPlayerMapping[uuid]?.textures.skin;
}

export function playerCape(uuid: string) {
	return uuidToPlayerMapping[uuid]?.textures.cape;
}

// Cache viewers because of performance issues
const availableViewers: SkinViewer[] = [];

export function getOrCreateSkinViewer() {
	let viewer = availableViewers.pop();

	if (!viewer) {
		viewer = new SkinViewer({
			width: 100,
			animation: new IdleAnimation(),
		});
		viewer.autoRotate = true;
	}

	viewer.resetSkin();
	viewer.resetCape();
	viewer.resetCameraPose();

	return viewer;
}

export function releaseSkinViewer(viewer: SkinViewer) {
	availableViewers.push(viewer);
}
