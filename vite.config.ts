import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte()],
	server: {
		proxy: {
			"/sessionserver": {
				target: "https://sessionserver.mojang.com",
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/sessionserver/, ""),
			},
		},
	},
})
