import _ from 'lodash';
import { For, Match, Switch, createSignal, onCleanup, onMount, useContext } from "solid-js";
import { createStore, reconcile } from "solid-js/store";
import { Session, Torrent } from "../../models/session.model";
import DownloadItem from "../../components/download-item/download-item";
import { spaceY } from '../../utils/tailwind.utils';
import { postTorrentInfo, postTorrentRemove } from '../../services/api-service';
import { SocketContext } from '../../providers/socket.provider';
import Divider from '../../components/divider/divider';
import LinkButton from '../../components/button/link-button';

const DownloadsView = () => {
    const [torrents, setTorrents] = createStore<Session['arguments']>({ torrents: [] });
    const [seeding, setSeeding] = createSignal<string[]>([]);
    const { webSocket } = useContext(SocketContext);

    onMount(() => {
        const sub = webSocket.subscribe(session => {
            const seedingIds = session.arguments.torrents.filter(t => t.status === 'Seeding').map(t => t.id);
            setSeeding(seedingIds);
            setTorrents('torrents', reconcile(session.arguments.torrents));
        });
        onCleanup(() => sub.unsubscribe());
    });

    const onTorrentClick = (torrent: Torrent) => {
        postTorrentInfo({ id: torrent.id })
            .then();
    }

    const onDeleteCompleteTorrents = (remove: boolean) => {
        const ids = seeding().map(id => parseInt(id, 10));
        console.log('Removing torrents:', ids, 'Remove:', remove);
        postTorrentRemove({ ids, remove })
            .then();
    }

    return <div class="flex flex-col h-full">
        <Switch fallback={<div class="flex justify-center items-center"><p>...no downloads [ yet! ]...</p></div>}>
            <Match when={torrents.torrents.length}>
                <div class={`divide-y divide-dashed divide-gray-300 dark:divide-gray-500 mx-2 ${spaceY}`}>
                    <For each={torrents.torrents}>
                        {torrent =>
                            <DownloadItem torrent={torrent} onInfoClick={onTorrentClick} />
                        }
                    </For>
                </div>
                {seeding().length > 0 &&
                    <>
                        <Divider />
                        <div class="flex items-center justify-center gap-2">
                            <LinkButton
                                onClick={() => onDeleteCompleteTorrents(false)}>
                                Remove Complete
                            </LinkButton>
                            <LinkButton
                                onClick={() => onDeleteCompleteTorrents(true)}>
                                Delete Complete
                            </LinkButton>
                        </div>
                    </>
                }
            </Match>
        </Switch>
    </div>
}

export default DownloadsView;