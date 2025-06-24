import { ParentProps } from "solid-js";
import { Session } from "../../models/session.model";
import { toFsSize, toTime } from "../../utils/data.utils";
import { ArrowBottomLeftThick } from "../ux/arrow-icon/arrow-icon";

type Props = {
    torrent: Session['arguments']['torrents'][number];
}

const TransferRatesPanel = (props: ParentProps<Props>) => {
    return <div class="flex items-center text-xs text-gray-400 space-x-2">
        <span class="">[{props.torrent.status}]</span>
        {props.torrent.status === 'Downloading' && 
            <div class="flex items-center">
                <ArrowBottomLeftThick />
                <span>{toFsSize(props.torrent.rateDownload)}/s</span>
            </div>
        }
        <div class="flex items-center">
            <ArrowBottomLeftThick class="rotate-180" />
            <span>{toFsSize(props.torrent.rateUpload)}/s</span>
        </div>
        {props.torrent.status === 'Downloading' && 
            <span>{toTime(props.torrent.eta)}</span> }
    </div>
}

export default TransferRatesPanel;