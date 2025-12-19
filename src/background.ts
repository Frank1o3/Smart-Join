import type {
    ServerMetrics, Weights, Message
} from "./types";

// Default weights for performance metrics
let weights: Weights = { fps: 1, ping: 1, players: 1 };

chrome.runtime.onMessage.addListener((msg: Message, sender, sendResponse) => {
    const gameId = msg.gameId;
    if (!gameId) {
        sendResponse({ error: "gameId is required" });
        return;
    }
    if (msg.action === "getTopServers") {
        fetchTopServers(gameId).then(servers => sendResponse(servers.data || []));
        return true;
    }

    if (msg.action === "getBestServer") {
        fetchTopServers(gameId).then(servers => sendResponse(servers.data[0] || null));
        return true;
    }

    if (msg.action === "setWeights" && msg.weights) {
        weights = msg.weights;
    }
});

async function fetchTopServers(gameId: number): Promise<ServerMetrics> {
    try {
        const res = await fetch(`https://games.roblox.com/v1/games/${gameId}/servers/Public?sortOrder=Asc&limit=100`);
        const data: ServerMetrics = await res.json();
        if (!data.data || data.data.length === 0) {
            return { previousPageCursor: null, nextPageCursor: null, data: [] };
        }
        const scored = data.data.map(server => {
            const pingQuality = 1000 - (server.ping || 999); // higher value = better
            const score = (parseFloat(server.fps || "0") || 0) * weights.fps
                + pingQuality * weights.ping
                + (server.playing || 0) * weights.players;
            return { ...server, score };
        });
        scored.sort((a, b) => b.score - a.score);
        data.data = scored.slice(0, 20).map(({ score, ...server }) => ({ ...server }));
        return data;
    } catch (error) {
        console.error("Error fetching servers:", error);
        return { previousPageCursor: null, nextPageCursor: null, data: [] };
    }
} 