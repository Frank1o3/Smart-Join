export interface Weights {
    fps: number;
    ping: number;
    players: number;
}

export interface ServerMetrics {
    previousPageCursor: string | null;
    nextPageCursor: string | null;
    data: Server[];
}

export interface Server {
    id: string;
    maxPlayers?: number;
    playing?: number;
    playerTokens?: string[];
    players?: any[];
    fps?: string; // FPS is provided as a string in the API
    ping?: number;
}

export interface Message {
    action: "getTopServers" | "getBestServer" | "setWeights" | "openServerInNewTab";
    gameId?: number;
    serverId?: string;
    weights?: Weights;
}