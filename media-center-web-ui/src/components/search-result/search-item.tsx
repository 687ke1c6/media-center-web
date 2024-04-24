import { ParentProps } from "solid-js";
import { SearchResultItem } from "../../models/search.model";

type Props = {
    item: SearchResultItem;
    onDownload: (item: SearchResultItem) => void;
}

const SearchItem = (props: ParentProps<Props>) => {
    const onDownloadClicked = (e: MouseEvent) => {
        props.onDownload(props.item);
    }

    return <div class="flex items-center text-lg md:text-sm mb-2 mt-2 md:mb-0 md:mt-0">        
        <span class="">{props.item.name}</span>
        <span class="hidden md:inline ms-2">
            <button onclick={onDownloadClicked} class="flex"><span class="material-symbols-outlined">download</span></button>
        </span>
    </div> 
}

export default SearchItem;