import { For, ParentProps, createSignal, onMount } from "solid-js";
import { SearchResultSessionItem } from "../../models/search.model";
import Button from "../../components/button/button";
import _ from 'lodash';
import { toCategory, toDate, toSize } from "../../utils/data.utils";
import { clickOutsideBehaviour } from "../../behaviours/clicked-outside";
import { DownloadIcon } from "../../components/ux/download-icon/download-icon";
import RollButton from "../../components/button/roll-button";

const localStorageCatagoriesKey = 'catagories';

type Props = {
    searchItem: SearchResultSessionItem;
    onClose?: () => void;
    onDownload?: (item: SearchResultSessionItem, downloadDir: string) => void;
};

const itemConfiguration: Record<string, (val: string) => string> = {
    size: toSize,
    added: toDate,
    category: toCategory
}

const TorrentItemView = (props: ParentProps<Props>) => {
    const [folder, setFolder] = createSignal('');

    onMount(() => {
        const catagories: Record<string, string> = JSON.parse(localStorage.getItem(localStorageCatagoriesKey) ?? "{}");
        console.log(catagories);
        const folderForCatagory = catagories[props.searchItem.item.category];
        if (folderForCatagory) {
            setFolder(folderForCatagory);
        }
    })

    const onSubmit: HTMLFormElement['onsubmit'] = (e) => {
        e.preventDefault();
        props.onDownload?.(props.searchItem, folder());
        const catagories: Record<string, string> = JSON.parse(localStorage.getItem(localStorageCatagoriesKey) ?? "{}");
        catagories[props.searchItem.item.category] = folder();
        localStorage.setItem(localStorageCatagoriesKey, JSON.stringify(catagories));
    }

    return <>
        {props.searchItem &&
            <form class="m-4 rounded"
                ref={clickOutsideBehaviour(() => props.onClose?.())}
                onsubmit={onSubmit}>
                <For each={Object.entries(props.searchItem.item ?? {}).map(([key, value]) => ({ key, value: itemConfiguration[key]?.(value) ?? value }))}>
                    {(item) =>
                        <div class="text-sm">
                            <label for={`val-${item.key}`} class="text-gray-500">{`${_.capitalize(item.key)}:`}</label>
                            <div id={`val-${item.key}`} class="truncate">{item.value}</div>
                        </div>}
                </For>
                <hr class="mt-2 mb-2 opacity-50" />
                <div class="flex gap-2 justify-end">
                    {!props.searchItem.session && <>
                        <RollButton type="button" options={props.searchItem.meta.dirs} selectedValue={folder} onSelected={(_, item) => setFolder(item!)} itemRenderer={(i) => i ?? ''}  />
                        <Button type="submit">
                            <div class="flex items-center">
                                <DownloadIcon />
                                <span>Download</span>
                            </div>
                        </Button>
                    </>
                    }
                    <Button onclick={() => props.onClose?.()} type="button" variant="secondary">Close</Button>
                </div>
            </form>
        }
    </>
}

export default TorrentItemView;