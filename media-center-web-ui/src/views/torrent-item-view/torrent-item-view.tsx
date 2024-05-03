import { For, ParentProps, createSignal } from "solid-js";
import { SearchResultSessionItem } from "../../models/search.model";
import Button from "../../components/button/button";
import _ from 'lodash';
import { toCategory, toDate, toSize } from "../../utils/data.utils";
import { clickOutsideBehaviour } from "../../behaviours/clicked-outside";
import Select from "../../components/select/select";
import { DownloadIcon } from "../../components/ux/download-icon/download-icon";

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
    const [folder, setFolder] = createSignal(props.searchItem.item.category === "208" ? 'Shows' : 'Movies');

    const onSubmit: HTMLFormElement['onsubmit'] = (e) => {
        e.preventDefault();
        props.onDownload?.(props.searchItem, folder());
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
                        <Select items={['Movies', 'Shows']} value={folder()} onChange={(selection) => setFolder(selection)} />
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