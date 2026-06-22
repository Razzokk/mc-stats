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

export async function getPlayerProfile(uuid: string): Promise<Profile> {
	const response = await fetch(`sessionserver/session/minecraft/profile/${uuid}`);

	try {
		const rawProfile = await response.json() as RawProfile;

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
