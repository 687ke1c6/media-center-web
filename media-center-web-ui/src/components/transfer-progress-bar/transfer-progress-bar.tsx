import { ParentProps, createEffect, createSignal } from "solid-js";
import { Session } from "../../models/session.model";

type Props = {
    torrent: Session['arguments']['torrents'][number];
}

const TransferProgressBar = (props: ParentProps<Props>) => {

    const [pct, setPct] = createSignal(0);

    createEffect(() => {
        const downloaded = parseInt(props.torrent?.sizeWhenDone ?? '0', 10) - parseInt(props.torrent?.leftUntilDone ?? '0', 10);
        if (props.torrent) {
            const percentage = downloaded / parseInt(props.torrent.sizeWhenDone, 10) * 100;
            setPct(isNaN(percentage) ? 0 : percentage);
        }
    });

    return <div class="flex w-full">
        <progress class="md:w-12 w-full md:ms-2 h-1 md:h-4" max={100} value={pct()}></progress>
    </div>
}

export default TransferProgressBar;