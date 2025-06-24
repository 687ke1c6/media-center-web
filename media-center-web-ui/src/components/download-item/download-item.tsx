import { ParentProps, createSignal, onCleanup } from "solid-js";
import { Session, Torrent } from "../../models/session.model";
import TransferRatesPanel from "../transfer-rate-panel/transfer-rate-panel";
import TransferProgressBar from "../transfer-progress-bar/transfer-progress-bar";
import styles from './download-item.module.css';
import { resizeBehaviour } from "../../behaviours/resize";
import { multi } from "../../behaviours/multi";
import { clickOutsideBehaviour } from "../../behaviours/clicked-outside";
import { postTorrentRemove, torrentStart, torrentStop } from "../../services/api-service";

type Props = {
    torrent: Torrent;
    onInfoClick: (torrent: Torrent) => void;
}

const DownloadItem = (props: ParentProps<Props>) => {
    const [isToggled, setIsToggled] = createSignal(false);

    return <>
        <div class="border-gray-700">
            <div ref={multi(resizeBehaviour('--relative-width'), clickOutsideBehaviour(() => setIsToggled(false)))} onClick={() => setIsToggled(t => !t)}
                class="relative cursor-pointer overflow-x-hidden">
                <div class={`${styles.downloadItem} justify-between space-y-1 md:flex md:items-center md:space-y-0`}
                    classList={{ [styles.slideIn]: isToggled() }}>
                    <div class="truncate">{props.torrent.name}</div>
                    <div class="md:flex items-center space-y-1 md:space-y-0">
                        <TransferRatesPanel torrent={props.torrent} />
                        {props.torrent.status === 'Downloading' &&
                            <TransferProgressBar torrent={props.torrent} />}
                    </div>
                </div>
                <div ref={resizeBehaviour('--panel-width')}
                    classList={{ [styles.slideIn]: isToggled() }}
                    class={`${styles.slider} absolute bg-black flex w-fit inset-y-0 *:text-xs *:w-[88px] select-none`}>
                    {props.torrent.status === 'Downloading' &&
                        <button class="dark:bg-gray-700 bg-gray-300 hover:font-bold" onClick={() => torrentStop({ ids: [parseInt(props.torrent.id, 10)] })}>Stop</button>}
                    {props.torrent.status === 'Stopped' &&
                        <button class="dark:bg-green-700 bg-green-400 hover:font-bold" onClick={() => torrentStart({ ids: [parseInt(props.torrent.id, 10)] })}>Start</button>}
                    <button class="dark:bg-rose-500 bg-rose-200 hover:font-bold" onClick={() => postTorrentRemove({ ids: [parseInt(props.torrent.id, 10)], remove: false })}>Remove</button>
                    <button class="dark:bg-rose-700 bg-rose-400 hover:font-bold" onClick={() => postTorrentRemove({ ids: [parseInt(props.torrent.id, 10)], remove: true })}>Delete</button>
                </div>
            </div>
        </div>
    </>
}

export default DownloadItem;