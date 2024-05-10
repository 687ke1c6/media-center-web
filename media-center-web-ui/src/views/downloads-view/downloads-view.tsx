import _ from 'lodash';
import { For, Match, Switch, onCleanup, onMount, useContext } from "solid-js";
import { createStore, reconcile } from "solid-js/store";
import { Session, Torrent } from "../../models/session.model";
import SocketContext from "../../contexts/socket-context";
import DownloadItem from "../../components/download-item/download-item";
import { spaceY } from '../../utils/tailwind.utils';
import { postTorrentInfo } from '../../services/api-service';

const DownloadsView = () => {
    const [torrents, setTorrents] = createStore<Session['arguments']>({ torrents: [] });
    const socketContext = useContext(SocketContext);

    onMount(() => {
        const sub = socketContext.torrentsObservable.subscribe(session => 
            setTorrents('torrents', reconcile(session.arguments.torrents)));
        onCleanup(() => sub.unsubscribe());
    });

    const onTorrentClick = (torrent: Torrent) => {
        postTorrentInfo({id: torrent.id})
        .then(value => {
            console.log(value);
        })
    }

    return <div>
        <Switch fallback={<div class="flex justify-center items-center"><p>No downloads...</p></div>}>
            <Match when={torrents.torrents.length}>
                <div class={`divide-y divide-dashed mx-2 ${spaceY}`}>
                    <For each={torrents.torrents}>
                        {torrent =>
                            <DownloadItem torrent={torrent} onInfoClick={onTorrentClick} />
                        }
                    </For>
                </div>
            </Match>
        </Switch>
    </div>
}

export default DownloadsView;