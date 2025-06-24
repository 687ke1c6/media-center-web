import { createContext, ParentProps, useContext } from "solid-js";
import { useSocketContext } from "./socket.provider";
import { map, Observable, of } from "rxjs";

type TorrentInfo = {
    downloads: number, seeding: number, total: number
}

const TorrentStreamsInfoContext = createContext<Observable<TorrentInfo>>(of({ downloads: 0, seeding: 0, total: 0 }));

export const TorrentsStreamInfoProvider = (props: ParentProps) => {
    const socketContext = useSocketContext();
    return (
        <TorrentStreamsInfoContext.Provider value={ socketContext.webSocket.pipe(map(session => ({
            downloads: session.arguments.torrents.filter(t => t.status === 'Downloading').length,
            seeding: session.arguments.torrents.filter(t => t.status === 'Seeding').length,
            total: session.arguments.torrents.length
        })))}> 
            {props.children}
        </TorrentStreamsInfoContext.Provider>
    );
}

export const useTorrentsStreamInfoContext = () => {
    const context = useContext(TorrentStreamsInfoContext);
    if (!context) {
        throw new Error("useTorrentsStreamInfoContext must be used within a TorrentsStreamInfoProvider");
    }
    return context;
}