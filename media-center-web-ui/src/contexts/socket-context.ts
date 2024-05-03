import { interval, from, switchMap, shareReplay, startWith } from "rxjs";
import { createContext } from "solid-js";
import { postTorrentGet } from "../services/api-service";

const torrentsObservable = interval(4000)
    .pipe(startWith(0), switchMap(() => from(postTorrentGet())), shareReplay({refCount: true}))

const SocketContext = createContext({
    torrentsObservable
});

export default SocketContext;