(function() {
    const waitForPlayButton = () => {
        const playBtn = document.querySelector('.btn-common-play-game-lg.btn-primary-md.btn-full-width');
        if (playBtn) {
            playBtn.addEventListener('click', overridePlay, true);
        } else {
            setTimeout(waitForPlayButton, 500);
        }
    };

    function overridePlay(event) {
        event.preventDefault();
        event.stopPropagation();

        const gameId = window.location.pathname.split('/')[2];

        chrome.runtime.sendMessage({ action: "getBestServer", gameId }, (server) => {
            if (server) {
                window.location.href = `https://www.roblox.com/games/start?placeId=${gameId}&vipServerId=${server.id}`;
            } else {
                // fallback: click default Play button
                event.target.click();
            }
        });
    }

    waitForPlayButton();
})();
