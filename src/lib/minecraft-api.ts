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
		skinUrl?: string,
		capeUrl?: string,
	}
}

export async function getPlayerProfile(uuid: string): Promise<Profile> {
	const response = await fetch(`sessionserver/session/minecraft/profile/${uuid}`);
	const rawProfile = await response.json() as RawProfile;

	const profile: Profile = {
		id: rawProfile.id,
		name: rawProfile.name,
		textures: {}
	}

	const texturesEncoded = rawProfile.properties.find(p => p.name === "textures")?.value;
	if (texturesEncoded) {
		const textures = texturesEncoded ? JSON.parse(atob(texturesEncoded)) as ProfileTextures : null;
		if (textures?.textures?.SKIN?.url) profile.textures.skinUrl = textures?.textures?.SKIN?.url;
		if (textures?.textures?.CAPE?.url) profile.textures.capeUrl = textures?.textures?.CAPE?.url;
	}

	return profile;
}
