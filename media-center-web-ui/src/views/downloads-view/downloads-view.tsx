import _ from 'lodash';
import { For, Match, Switch, onCleanup, onMount, useContext } from "solid-js";
import { createStore, reconcile } from "solid-js/store";
import { Session, Torrent } from "../../models/session.model";
import DownloadItem from "../../components/download-item/download-item";
import { spaceY } from '../../utils/tailwind.utils';
import { postTorrentInfo } from '../../services/api-service';
import { SocketContext } from '../../contexts/socket-context';

const DownloadsView = () => {
    const [torrents, setTorrents] = createStore<Session['arguments']>({ torrents: [] });
    const { webSocket } = useContext(SocketContext);

    onMount(() => {
        const sub = webSocket.subscribe(session =>
            setTorrents('torrents', reconcile(session.arguments.torrents)));
        onCleanup(() => sub.unsubscribe());
    });

    const onTorrentClick = (torrent: Torrent) => {
        postTorrentInfo({ id: torrent.id })
            .then(value => {
                console.log(value);
            })
    }

    return <div>
        <Switch fallback={<div class="flex justify-center items-center"><p>...no downloads [ yet! ]...</p></div>}>
            <Match when={torrents.torrents.length}>
                <div class={`divide-y divide-dashed divide-gray-300 dark:divide-gray-500 mx-2 ${spaceY}`}>
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