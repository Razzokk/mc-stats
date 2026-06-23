# MC Stats

**Website available at**: https://mc.razzokk.net/stats

## What is MC Stats?

MC Stats is a very simple frontend that fetches a stats from a Minecraft server and displays them nicely.
You can see various stats of all the players that have been on the server.
The best ones are even highlighted with by showing off there player model.
If you see too many players or too many stats, you have the option to search for specific ones.

## How does it work?

### Frontend

The client specifies which stats it wants to have (stat metadata).
Part of that is `key` and `name` (optionally `asc` if the order of the stats in the table shall be ascending) of the stat that we want to show.
We only need to define an array of stat metadata and the frontend automatically tries to generate all the tables using these descriptions.

We can also provide a custom formatter for stats.
For example the play time stats is given in ticks (i.e. a 20th of a second).
We want to show hours and minutes, with this option we can provide a custom formatter to accomplish this.

The best player for each stat is shown on the right side of the table.
If there is more than one player on the first place, the player view cycles between them every 2.5 seconds.

### Backend and Server

I also built a mod for a Minecraft Server that uses Fabric as a modloader and acts as a backend.
This mod exposes an API endpoint that we can use to fetch stats data from the server.

On the server I set up a nginx config that exposes the port of the Minecraft mod to the `/api/stats` path.
So if the frontend fetches `https://mc.razzokk.net/api/stats`, nginx redirects it to `http://localhost:8081`.

## Deployment

There is an automated deployment to my server at https://mc.razzokk.net using GitHub actions.
For each push to the repository, the code will be built.
If in addition there is a tag that start with `v` the built frontend will also automatically be deployed.

## Challenges

- Data layout
- Lazy loading
- Reactivity
- Showing results while other data is still loading (e.g. Minecraft profile)
- Server (mod) backend (don't lag the server)
- Efficient data transfer
- Proper WebSocket handling
- Getting familiar with a new framework ([Svelte](https://svelte.dev/))
  - Re-usable components
  - Compiles to HTML, CSS and JavaScript
  - Very performant (better than React)
  - Easy state management with runes
- SkinViewer creating webgl context errored and lagged => cache created instances
- Don't load data multiple times, unnecessary data loads
- Styling, it might seem simple, but it takes me **a lot of time**
- Setup nginx configuration
- Stupid hack to get around the fact that Mojang has CORS, and we cannot fetch player data (CORS error)
  - => The mod also has a second endpoint that simply re-routes to Mojang and then hands it back to us with CORS allowed

## To-Do

- [ ] World stats
	- [ ] Time => display sun or moon
	- [ ] Weather => display rain if raining
- [ ] Setup CI and deploy to server when tag is used
- [ ] Try using websockets to live update data
  - Could use to only stream current players online, day and weather status
- [x] Cache more stuff such as names and textures for faster loading

## Credits

- Framework: [Svelte](https://svelte.dev/)
- SkinViewer: [skinview3d](https://github.com/bs-community/skinview3d)
- Font: [Roboto](https://fonts.google.com/specimen/Roboto)
- Icons: [Nerd Fonts](https://www.nerdfonts.com/)
