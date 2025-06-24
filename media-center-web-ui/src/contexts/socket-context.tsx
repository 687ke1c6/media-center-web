import { retry, shareReplay } from "rxjs";
import { webSocket as createWebSocket } from 'rxjs/webSocket';
import { Accessor, createContext, createSignal, ParentProps, useContext } from "solid-js";
import { Session } from "../models/session.model";

const [connected, setConnected] = createSignal<boolean>(true);

const webSocket = createWebSocket<Session>({
    url: '/ws',
    openObserver: {
        next: () => setConnected(true)
    },
    closeObserver: {
        next: () => setConnected(false)
    },
})
    .pipe(
        shareReplay(1),
        retry({ delay: 1000 }),
    );

const defaultSocketContext = {
    webSocket
}

export const SocketContext = createContext(defaultSocketContext);
export const SocketConnectedContext = createContext<{ connected: Accessor<boolean> }>({ connected });

export const SocketProvider = ({ children }: ParentProps) =>
    <SocketContext.Provider value={SocketContext.defaultValue}>
        <SocketConnectedContext.Provider value={SocketConnectedContext.defaultValue}>
            {children}
        </SocketConnectedContext.Provider>
    </SocketContext.Provider>;

export const useSocketContext = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error("useSocketContext must be used within a SocketProvider");
    }
    return context;
}

export const useSocketConnectedContext = () => {
    const context = useContext(SocketConnectedContext);
    if (!context) {
        throw new Error("useSocketConnectedContext must be used within a SocketProvider");
    }
    return context;
}