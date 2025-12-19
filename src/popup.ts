import { Server } from './types';

const status = document.getElementById('status') as HTMLElement;
const serverListDiv = document.getElementById('serverList') as HTMLElement;
const refreshBtn = document.getElementById('refresh') as HTMLElement;

const weightFPS = document.getElementById('weightFPS') as HTMLInputElement;
const weightPing = document.getElementById('weightPing') as HTMLInputElement;
const weightPlayers = document.getElementById('weightPlayers') as HTMLInputElement;

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
        return;
    }

    status.textContent = 'Fetching top servers...';
    serverListDiv.innerHTML = '';

    sendWeights();

    chrome.runtime.sendMessage({ action: "getTopServers", gameId }, (servers: Server[] | null) => {
        if (!servers || servers.length === 0) {
            status.textContent = 'No servers found.';
            return;
        }

        // The previous popup.js code for innerHTML generation (using spans) goes here.
        status.textContent = 'Select a server to join:';
        servers.forEach((server, index) => {
            const div = document.createElement('div');
            div.className = 'server-item';
            if (index === 0) div.classList.add('best');

            // Using spans for better styling and separation
            div.innerHTML = `
                <span class="server-fps">FPS: ${server.fps ?? 'N/A'}</span>
                <span class="server-ping">Ping: ${server.ping ?? 'N/A'}</span>
                <span class="server-players">Players: ${server.playing ?? 'N/A'}</span>
            `;

            div.addEventListener('click', () => {
                // Use the detected gameId for joining
                chrome.tabs.update({ url: `https://www.roblox.com/games/start?placeId=${gameId}&vipServerId=${server.id}` });
            });
            serverListDiv.appendChild(div);
        });
    });
}

function getGameIdAndFetch() {
    // 1. Get the active tab's information
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];
        const url = activeTab?.url ?? '';

        // 2. Check if the URL is a Roblox game page
        const match = url.match(/https:\/\/www\.roblox\.com\/games\/(\d+)\//);

        let gameId: number | null = null;
        if (match) {
            gameId = Number(match[1]); // The first captured group is the Game ID
        }

        // 3. Call fetchServers with the Game ID (or null if not found)
        fetchServers(gameId);
    });
}


// Load saved weights on popup open
chrome.storage.sync.get(['serverWeights'], (result: any) => {
    const saved = result.serverWeights;
    if (saved) {
        weightFPS.value = String(saved.fps ?? weightFPS.value);
        weightPing.value = String(saved.ping ?? weightPing.value);
        weightPlayers.value = String(saved.players ?? weightPlayers.value);
    }
    // Send the loaded weights to background
    sendWeights();
    // Fetch servers using the new logic
    getGameIdAndFetch();
});

// Event listeners
refreshBtn.addEventListener('click', getGameIdAndFetch); // Updated to use new function
weightFPS.addEventListener('change', getGameIdAndFetch); // Updated to use new function
weightPing.addEventListener('change', getGameIdAndFetch); // Updated to use new function
weightPlayers.addEventListener('change', getGameIdAndFetch); // Updated to use new function