// Default weights
let weights = { fps: 1, ping: 1, players: 1 };

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === "getTopServers") {
        const gameId = msg.gameId;
        fetchTopServers(gameId).then(servers => sendResponse(servers));
        return true;
    }

    if (msg.action === "getBestServer") {
        const gameId = msg.gameId;
        fetchTopServers(gameId).then(servers => sendResponse(servers[0] || null));
        return true;
    }

    if (msg.action === "setWeights") {
        weights = msg.weights;
    }
});

async function fetchTopServers(gameId) {
    try {
        const res = await fetch(`https://games.roblox.com/v1/games/${gameId}/servers/Public?sortOrder=Asc&limit=100`);
        const json = await res.json();
        if (!json.data || json.data.length === 0) return [];

        const scored = json.data.map(server => {
            const score = (server.fps || 0) * weights.fps
                        - (server.ping || 999) * weights.ping
                        + (server.playing || 0) * weights.players;
            return { ...server, score };
        });

        scored.sort((a, b) => b.score - a.score);

        return scored.slice(0, 3);
    } catch (err) {
        console.error('Failed to fetch servers', err);
        return [];
    }
}
