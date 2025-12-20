import { Server } from './types';

const status = document.getElementById('status') as HTMLElement;
const serverListDiv = document.getElementById('serverList') as HTMLElement;
const refreshBtn = document.getElementById('refresh') as HTMLElement;

const weightFPS = document.getElementById('weightFPS') as HTMLInputElement;
const weightPing = document.getElementById('weightPing') as HTMLInputElement;
const weightPlayers = document.getElementById('weightPlayers') as HTMLInputElement;

let currentGameId: number | null = null;
let autoRefreshInterval: number | null = null;

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

function fetchServers(gameId: number | null) {
    if (gameId === null) {
        status.textContent = 'Go to a Roblox game page first!';
        serverListDiv.innerHTML = '';
        stopAutoRefresh();
        return;
    }

    status.textContent = 'Fetching top servers...';
    serverListDiv.innerHTML = '';

    sendWeights();

    chrome.runtime.sendMessage({ action: "getTopServers", gameId }, (servers: Server[] | null) => {
        if (!servers || servers.length === 0) {
            status.textContent = 'No available servers found.';
            return;
        }

        status.textContent = `Found ${servers.length} available servers:`;
        servers.forEach((server, index) => {
            const div = document.createElement('div');
            div.className = 'server-item';
            if (index === 0) div.classList.add('best');

            const maxPlayers = server.maxPlayers || 0;
            const playing = server.playing || 0;
            const spotsLeft = maxPlayers - playing;

            // Using spans for better styling and separation
            div.innerHTML = `
                <span class="server-fps">FPS: ${server.fps ?? 'N/A'}</span>
                <span class="server-ping">Ping: ${server.ping ?? 'N/A'}ms</span>
                <span class="server-players">Players: ${playing}/${maxPlayers}</span>
                <span class="server-spots">(${spotsLeft} spots)</span>
            `;

            div.addEventListener('click', () => {
                // Open in new tab instead of changing current tab URL
                chrome.tabs.create({ 
                    url: `https://www.roblox.com/games/start?placeId=${gameId}&launchData=${server.id}`,
                    active: true
                });
            });
            serverListDiv.appendChild(div);
        });
    });
}

function getGameIdAndFetch() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];
        const url = activeTab?.url ?? '';

        const match = url.match(/https:\/\/www\.roblox\.com\/games\/(\d+)\//);

        let gameId: number | null = null;
        if (match) {
            gameId = Number(match[1]);
        }

        currentGameId = gameId;
        fetchServers(gameId);
    });
}

// Auto-refresh functionality
function startAutoRefresh() {
    stopAutoRefresh(); // Clear any existing interval
    autoRefreshInterval = window.setInterval(() => {
        if (currentGameId !== null) {
            fetchServers(currentGameId);
        }
    }, 10000); // Refresh every 10 seconds
}

function stopAutoRefresh() {
    if (autoRefreshInterval !== null) {
        clearInterval(autoRefreshInterval);
        autoRefreshInterval = null;
    }
}

// Load saved weights on popup open
chrome.storage.sync.get(['serverWeights'], (result: any) => {
    const saved = result.serverWeights;
    if (saved) {
        weightFPS.value = String(saved.fps ?? weightFPS.value);
        weightPing.value = String(saved.ping ?? weightPing.value);
        weightPlayers.value = String(saved.players ?? weightPlayers.value);
    }
    sendWeights();
    getGameIdAndFetch();
    startAutoRefresh(); // Start auto-refresh when popup opens
});

// Event listeners
refreshBtn.addEventListener('click', getGameIdAndFetch);
weightFPS.addEventListener('change', getGameIdAndFetch);
weightPing.addEventListener('change', getGameIdAndFetch);
weightPlayers.addEventListener('change', getGameIdAndFetch);

// Stop auto-refresh when popup closes
window.addEventListener('beforeunload', stopAutoRefresh);