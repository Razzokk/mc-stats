package mcstats;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.mojang.logging.LogUtils;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import net.fabricmc.api.DedicatedServerModInitializer;
import net.fabricmc.fabric.api.entity.event.v1.ServerPlayerEvents;
import net.fabricmc.fabric.api.event.lifecycle.v1.ServerLifecycleEvents;
import net.minecraft.server.MinecraftServer;
import net.minecraft.stats.ServerStatsCounter;
import net.minecraft.world.level.storage.LevelResource;
import org.slf4j.Logger;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.ProxySelector;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class MinecraftStatsMod implements DedicatedServerModInitializer {
	public static final Logger LOGGER = LogUtils.getLogger();
	private static final int PORT = 8081;
	private MinecraftServer server;
	private HttpClient client;
	private HttpServer httpServer;
	private Path statsFolder;

	// These are ALL player UUIDs (including offline)
	private Set<UUID> playerUUIDs;

	@Override
	public void onInitializeServer() {
		client = HttpClient
				.newBuilder()
				.proxy(ProxySelector.getDefault())
				.build();

		ServerLifecycleEvents.SERVER_STARTING.register(server -> {
			this.server = server;
			statsFolder = server.getWorldPath(LevelResource.PLAYER_STATS_DIR);
			loadPlayerUUIDs(server);
			startHttpServer();
		});

		ServerLifecycleEvents.SERVER_STOPPING.register(_ -> {
			this.server = null;
			if (httpServer != null) {
				httpServer.stop(0);
				LOGGER.info("Stats Web Server stopped.");
			}
		});

		ServerPlayerEvents.JOIN.register(player -> playerUUIDs.add(player.getUUID()));
	}

	private ServerStatsCounter getStatsForUUID(UUID uuid) {
		var player = server.getPlayerList().getPlayer(uuid);
		if (player != null) return player.getStats();

		// Else get offline stats
		var uuidStatsFile = statsFolder.resolve(uuid + ".json");
		if (!Files.exists(uuidStatsFile)) return null;
		return new ServerStatsCounter(server, uuidStatsFile);
	}

	private JsonObject convertStatsToJson(ServerStatsCounter stats) {
		var json = new JsonObject();
		var mined = 0;
		var picked_up = 0;
		var crafted = 0;
		var dropped = 0;
		var broken = 0;
		var used = 0;
		var killed = 0;
		var killed_by = 0;

		for (var entry : stats.stats.object2IntEntrySet()) {
			var name = entry.getKey().getName().replace("minecraft.", "");
			name = name.replace("custom:", "");

			if (name.startsWith("mined")) mined += entry.getIntValue();
			else if (name.startsWith("picked_up")) picked_up += entry.getIntValue();
			else if (name.startsWith("crafted")) crafted += entry.getIntValue();
			else if (name.startsWith("dropped")) dropped += entry.getIntValue();
			else if (name.startsWith("broken")) broken += entry.getIntValue();
			else if (name.startsWith("used")) used += entry.getIntValue();
			else if (name.startsWith("killed")) killed += entry.getIntValue();
			else if (name.startsWith("killed_by")) killed_by += entry.getIntValue();
			else json.addProperty(name, entry.getIntValue());
		}

		if (mined > 0) json.addProperty("mined", mined);
		if (picked_up > 0) json.addProperty("picked_up", picked_up);
		if (crafted > 0) json.addProperty("crafted", crafted);
		if (dropped > 0) json.addProperty("dropped", dropped);
		if (broken > 0) json.addProperty("broken", broken);
		if (used > 0) json.addProperty("used", used);
		if (killed > 0) json.addProperty("killed", killed);
		if (killed_by > 0) json.addProperty("killed_by", killed_by);

		return json;
	}

	private JsonArray getJsonStats() {
		var json = new JsonArray();

		for (var uuid : playerUUIDs) {
			var stats = getStatsForUUID(uuid);
			if (stats == null) continue;

			var playerJson = new JsonObject();
			playerJson.addProperty("uuid", uuid.toString());
			playerJson.add("stats", convertStatsToJson(stats));
			json.add(playerJson);
		}

		return json;
	}

	private void handleRequest(HttpExchange exchange) throws IOException {
		if (!"GET".equalsIgnoreCase(exchange.getRequestMethod())) {
			exchange.sendResponseHeaders(405, -1);
			return;
		}

		var jsonResponse = getJsonStats().toString();
		var responseBytes = jsonResponse.getBytes(StandardCharsets.UTF_8);

		exchange.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");
		exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
		exchange.sendResponseHeaders(200, responseBytes.length);

		try (var os = exchange.getResponseBody()) {
			os.write(responseBytes);
		}
	}

	private void handlePlayers(HttpExchange exchange) {
		var uuid = exchange.getRequestURI().getQuery().substring(5);
		var request = HttpRequest.newBuilder()
				.uri(URI.create("https://sessionserver.mojang.com/session/minecraft/profile/" + uuid))
				.build();
		try
		{
			var response = client.send(request, HttpResponse.BodyHandlers.ofByteArray());

			exchange.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");
			exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
			exchange.sendResponseHeaders(200, response.body().length);

			try (var os = exchange.getResponseBody()) {
				os.write(response.body());
			}
		} catch (IOException | InterruptedException e) {
			LOGGER.trace("Error while fetching player", e);
		}
	}

	private void startHttpServer() {
		try {
			httpServer = HttpServer.create(new InetSocketAddress(PORT), 0);
			httpServer.createContext("/stats", this::handleRequest);
			httpServer.createContext("/player", this::handlePlayers);
			httpServer.setExecutor(null);
			httpServer.start();
			LOGGER.info("Stats Web Server running on port {}!", PORT);
		} catch (IOException e) {
			LOGGER.trace("Error while starting web server", e);
		}
	}

	private void loadPlayerUUIDs(MinecraftServer server) {
		var playerDataDir = server.getWorldPath(LevelResource.PLAYER_DATA_DIR);

		try (Stream<Path> files = Files.list(playerDataDir))
		{
			playerUUIDs = files
					.filter(path -> path.toString().endsWith(".dat"))
					.map(path ->
					{
						var filename = path.getFileName().toString();
						return UUID.fromString(filename.substring(0, filename.length() - 4)
						);
					})
					.collect(Collectors.toSet());
		}
		catch (IOException e) {
			LOGGER.error("Could not load player UUIDs");
		}
	}
}
