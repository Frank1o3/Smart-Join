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
            
            // --- UPDATED SCORING LOGIC ---
            // 1. Calculate an inverse Ping value so that lower Ping results in a HIGHER score.
            //    Using 1000 as a large enough base for a standard Ping (e.g. Ping 50 -> Quality 950).
            const pingQuality = 1000 - (server.ping || 999); 

            // 2. Score is the sum of weighted 'good' metrics.
            //    FPS and PingQuality are maximized, Players is maximized.
            const score = (server.fps || 0) * weights.fps
                        + pingQuality * weights.ping
                        + (server.playing || 0) * weights.players;
            
            return { ...server, score };
        });

        // Sort by highest score first
        scored.sort((a, b) => b.score - a.score);

        return scored.slice(0, 3);
    } catch (err) {
        console.error('Failed to fetch servers', err);
        return [];
    }
}