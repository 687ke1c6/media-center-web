import { interval, from, switchMap, shareReplay, startWith, retry } from "rxjs";
import { WebSocketSubject } from 'rxjs/webSocket';
import { createContext } from "solid-js";
import { postTorrentGet } from "../services/api-service";
import { Session } from "../models/session.model";

const torrentsObservable = interval(4000)
    .pipe(
        startWith(0),
        switchMap(() => from(postTorrentGet())),
        shareReplay({ refCount: true }),
        retry({ delay: 10000 })
    )

const webSocket = new WebSocketSubject<Session>('/ws');
const ws = webSocket.pipe(retry({ delay: 1000 }))

const SocketContext = createContext({
    torrentsObservable,
    webSocket
});

export default SocketContext;