type RawProfile = {
	id: string,
	name: string,
	properties: { name: string, value: string }[]
	legacy?: boolean,
}

type ProfileTextures = {
	timestamp: number,
	profileId: string,
	profileName: string,
	textures?: {
		SKIN?: {
			url: string
			metadata?: {
				model?: string
			}
		},
		CAPE?: {
			url: string
		}
	},
}

export type Profile = {
	id: string,
	name: string,
	textures: {
		skin?: ImageBitmap,
		cape?: ImageBitmap,
	}
}

async function fetchTexture(url?: string) {
	if (!url) return undefined;
	const response = await fetch(url);
	const blob = await response.blob();
	return await createImageBitmap(blob);
}

// Hacky workaround for CORS cache as much as possible
// Use stats mod to return player profile json with cors allowed
async function getRawProfileCached(uuid: string) {
	// See if it was already cached
	const cached = localStorage.getItem(uuid);
	if (cached) return JSON.parse(cached);

	// Cache fetched data
	const data = await fetch(`https://mc.razzokk.net/api/player?uuid=${uuid}`)
		.then(response => response.json());
	if (!data) return undefined;
	localStorage.setItem(uuid, JSON.stringify(data));

	return data;
}

export async function getPlayerProfile(uuid: string): Promise<Profile> {
	try {
		const rawProfile = await getRawProfileCached(uuid) as RawProfile;

		const profile: Profile = {
			id: rawProfile.id,
			name: rawProfile.name,
			textures: {}
		}

		const texturesEncoded = rawProfile.properties.find(p => p.name === "textures")?.value;

		if (texturesEncoded) {
			const textures = texturesEncoded ? JSON.parse(atob(texturesEncoded)) as ProfileTextures : null;
			profile.textures.skin = await fetchTexture(textures?.textures?.SKIN?.url);
			profile.textures.cape = await fetchTexture(textures?.textures?.CAPE?.url);
		}

		return profile;
	} catch (e) {
		console.log(`Tried fetching for player '${uuid}' but failed.`);
	}

	return {
		id: uuid,
		name: "",
		textures: {}
	}
}
