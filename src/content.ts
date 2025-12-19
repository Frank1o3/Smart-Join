import { Message, Server } from "./types";

(function () {
    const waitForPlayButton = () => {
        const playBtn = document.querySelector('.btn-common-play-game-lg.btn-primary-md.btn-full-width') as HTMLElement | null;
        if (playBtn) {
            playBtn.addEventListener('click', (e) => overridePlay(e as MouseEvent), true);
        } else {
            setTimeout(waitForPlayButton, 500);
        }
    };



    function overridePlay(event: MouseEvent): void {
        event.preventDefault();
        event.stopPropagation();

        const gameId = Number(window.location.pathname.split('/')[2]);

        chrome.runtime.sendMessage({ action: "getBestServer", gameId } as Message, (server: Server | null) => {
            if (server) {
                window.location.href = `https://www.roblox.com/games/start?placeId=${gameId}&vipServerId=${server.id}`;
            } else {
                (event.target as HTMLElement).click();
            }
        });
    }

    waitForPlayButton();
})();
