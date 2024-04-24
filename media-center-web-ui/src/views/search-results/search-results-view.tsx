import { For, ParentProps } from "solid-js";
import { SearchResultItem } from "../../models/search.model";
import SearchItem from "../../components/search-result/search-item";

type Props = {
    searchResults: SearchResultItem[];
    onDownload: (item: SearchResultItem) => void;
};

const SearchResultsView = (props: ParentProps<Props>) => {
    return <>        
        <For each={props.searchResults}>
            {(item) =>
                <SearchItem onDownload={props.onDownload} item={item} />}
        </For>
    </>
}

export default SearchResultsView;