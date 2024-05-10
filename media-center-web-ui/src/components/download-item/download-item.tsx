import { ParentProps, createSignal, onCleanup } from "solid-js";
import { Session, Torrent } from "../../models/session.model";
import TransferRatesPanel from "../transfer-rate-panel/transfer-rate-panel";
import TransferProgressBar from "../transfer-progress-bar/transfer-progress-bar";
import styles from './download-item.module.css';
import { resizeBehaviour } from "../../behaviours/resize";
import { multi } from "../../behaviours/multi";
import { clickOutsideBehaviour } from "../../behaviours/clicked-outside";
import { postTorrentRemove } from "../../services/api-service";

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
                        <div class="flex">
                            <TransferRatesPanel torrent={props.torrent} />
                        </div>
                        {props.torrent.status === 'Downloading' &&
                            <TransferProgressBar torrent={props.torrent} />}
                    </div>
                </div>
                <div ref={resizeBehaviour('--panel-width')}
                    classList={{ [styles.slideIn]: isToggled() }}
                    class={`${styles.slider} absolute bg-black flex w-fit inset-y-0 *:text-xs *:w-[88px]`}>
                    <button class="bg-gray-700 hover:font-bold" onClick={() => props.onInfoClick(props.torrent)}>Info</button>
                    <button class="bg-rose-500 hover:font-bold" onClick={() => postTorrentRemove({ ids: [parseInt(props.torrent.id, 10)], remove: false })}>Remove</button>
                    <button class="bg-rose-700 hover:font-bold" onClick={() => postTorrentRemove({ ids: [parseInt(props.torrent.id, 10)], remove: true })}>Delete</button>
                </div>
            </div>
        </div>
    </>
}

export default DownloadItem;