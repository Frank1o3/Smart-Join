const status = document.getElementById('status');
const serverListDiv = document.getElementById('serverList');
const refreshBtn = document.getElementById('refresh');

const weightFPS = document.getElementById('weightFPS');
const weightPing = document.getElementById('weightPing');
const weightPlayers = document.getElementById('weightPlayers');

function sendWeights() {
    const weights = {
        fps: parseFloat(weightFPS.value),
        ping: parseFloat(weightPing.value),
        players: parseFloat(weightPlayers.value)
    };

    // Save to Chrome storage
    chrome.storage.sync.set({ serverWeights: weights });

    // Send to background
    chrome.runtime.sendMessage({ action: 'setWeights', weights });
}

function fetchServers() {
    const urlParts = window.location.pathname.split('/');
    if (urlParts[1] !== 'games' || !urlParts[2]) {
        status.textContent = 'Go to a Roblox game page first!';
        serverListDiv.innerHTML = '';
        return;
    }

    const gameId = urlParts[2];
    status.textContent = 'Fetching top servers...';
    serverListDiv.innerHTML = '';

    sendWeights();

    chrome.runtime.sendMessage({ action: "getTopServers", gameId }, (servers) => {
        if (!servers || servers.length === 0) {
            status.textContent = 'No servers found.';
            return;
        }

        status.textContent = 'Select a server to join:';
        servers.forEach((server, index) => {
            const div = document.createElement('div');
            div.className = 'server-item';
            if (index === 0) div.classList.add('best');
            
            // Use spans for better styling and separation (to match the screenshot)
            div.innerHTML = `
                <span class="server-fps">FPS: ${server.fps}</span>
                <span class="server-ping">Ping: ${server.ping}</span>
                <span class="server-players">Players: ${server.playing}</span>
            `;

            div.addEventListener('click', () => {
                chrome.tabs.update({ url: `https://www.roblox.com/games/start?placeId=${gameId}&vipServerId=${server.id}` });
            });
            serverListDiv.appendChild(div);
        });
    });
}

// Load saved weights on popup open
chrome.storage.sync.get(['serverWeights'], (result) => {
    if (result.serverWeights) {
        weightFPS.value = result.serverWeights.fps;
        weightPing.value = result.serverWeights.ping;
        weightPlayers.value = result.serverWeights.players;
    }
    // Send the loaded weights to background
    sendWeights();
    // Fetch servers
    fetchServers();
});

// Event listeners
refreshBtn.addEventListener('click', fetchServers);
weightFPS.addEventListener('change', fetchServers);
weightPing.addEventListener('change', fetchServers);
weightPlayers.addEventListener('change', fetchServers);
