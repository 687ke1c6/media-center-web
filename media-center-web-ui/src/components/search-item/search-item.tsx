import { For, ParentProps, createEffect, createSignal } from "solid-js";
import { SearchResultSessionItem } from "../../models/search.model";
import Badge from "../badge/badge";
import TransferRatesPanel from "../transfer-rate-panel/transfer-rate-panel";
import TransferProgressBar from "../transfer-progress-bar/transfer-progress-bar";

type Props = {
    searchItem: SearchResultSessionItem;
    onDownload?: (item: SearchResultSessionItem) => void;
    onClicked: (item: SearchResultSessionItem) => void;
}

const SearchItem = (props: ParentProps<Props>) => {

    return <>
        <div class="md:flex relative border-gray-700 cursor-pointer items-center justify-between" onclick={() => props.onClicked(props.searchItem)}>
            <div class="md:flex items-center">
                <div class="truncate">{props.searchItem.item.name}</div>
                <div class="text-xs text-gray-400 md:ms-2">
                    <span class="">[{props.searchItem.item.seeders} | {props.searchItem.item.leechers}]</span>
                    <span class="ms-2">{Math.floor(parseInt(props.searchItem.item.size, 10) / 1024 / 1024 / 1024 * 100) / 100}Gb</span>
                </div>
                <div class="flex gap-2 mt-2 md:mt-0 md:ms-2">
                    <For each={props.searchItem.meta.badges}>
                        {badge => <Badge text={badge} />}
                    </For>
                </div>
            </div>
            {props.searchItem.session && <>
                {props.searchItem.session.status === 'Downloading' ?
                    <div class="flex items-center mt-2 md:mt-0 text-xs text-gray-400 space-x-2">
                        <TransferRatesPanel torrent={props.searchItem.session} />
                        <TransferProgressBar torrent={props.searchItem.session} />
                    </div> :
                    <div class="flex items-center mt-2 md:mt-0 text-xs text-gray-400 space-x-2">
                        Seeding
                    </div>
                }
            </>
            }
        </div>
    </>
}

export default SearchItem;