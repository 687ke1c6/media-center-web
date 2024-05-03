import { Match, Switch, createSignal, onMount, onCleanup, type JSX, useContext, For, createEffect } from "solid-js";
import { createStore } from 'solid-js/store';
import Button from "../../components/button/button";
import SearchBar from "../../components/search-bar/SearchBar";
import { postSearch, postTorrentAdd } from "../../services/api-service";
import { SearchResultSessionItem } from "../../models/search.model";
import { createQuery } from "@tanstack/solid-query";
import Dialog from "../../components/dialog/dialog";
import TorrentItemView from "../torrent-item-view/torrent-item-view";
import SocketContext from "../../contexts/socket-context";
import SearchItem from "../../components/search-item/search-item";
import { resolveAfter } from "../../utils/promise.utils";
import { spaceY } from "../../utils/tailwind.utils";

const SearchView = () => {
    const { torrentsObservable } = useContext(SocketContext);
    const [input, setInput] = createSignal('');
    const [selectedItem, setSelectedItem] = createSignal<SearchResultSessionItem>();
    const [results, setResults] = createStore<SearchResultSessionItem[]>([]);

    const searchQuery = createQuery(() => ({
        queryKey: ['searchQuery', input()],
        enabled: false,
        queryFn: () =>
            (import.meta.env.VITE_SAMPLE_DATA ?
                resolveAfter(sampleData, 1000) :
                postSearch(input()))
                .then(searchResults =>
                    searchResults.map(searchResult => ({
                        item: searchResult,
                        meta: {
                            badges: Object.entries({
                                h264: searchResult.name.toLowerCase().includes('h264'),
                                h265: searchResult.name.toLowerCase().includes('h265'),
                                hvec: searchResult.name.toLowerCase().includes('hvec'),
                                p1080: searchResult.name.toLowerCase().includes('1080p'),
                                p720: searchResult.name.toLowerCase().includes('720p')
                            }).filter(([, include]) => include)
                                .map(([key]) => key)
                        }
                    })))
                .then(searchResults => {
                    setResults(searchResults);
                    return searchResults;
                })
    }))

    const onDownload = async (searchItem: SearchResultSessionItem, downloadDir: string) => {
        try {
            
            await postTorrentAdd({ ...searchItem.item, downloadDir });
            setSelectedItem(undefined);
        } catch (e) {
            alert(`${e}`);
        }
    }

    onMount(() => {
        const disposable = torrentsObservable.subscribe(session => {
            console.log(session);
            session.arguments.torrents.forEach(torrent => {
                setResults(
                    result => torrent.hashString.toLowerCase() === result.item.info_hash.toLowerCase(),
                    searchItem => ({
                        ...searchItem,
                        session: session.arguments.torrents.find(t => t.hashString.toLowerCase() === searchItem.item.info_hash.toLowerCase())
                    }));
            });
        })
        onCleanup(() => disposable.unsubscribe());
    });

    const onClicked = async (searchItem: SearchResultSessionItem) => {
        setSelectedItem(searchItem);
    }

    const onSubmit: JSX.EventHandler<HTMLFormElement, SubmitEvent> = (e: Event) => {
        e.preventDefault();
        searchQuery.refetch();
    }

    return <form onSubmit={onSubmit}>
        <div class="flex gap-4 flex-col w-full items-center mt-4">
            <SearchBar placeHolder="Search" onInput={e => setInput(e.currentTarget.value)} />
            {!searchQuery.isLoading ?
                <>
                    {input().length &&
                        <Button type='submit'>Search</Button>}
                </> :
                <span class="animate-pulse">loading...</span>
            }
        </div>
        <Switch>
            <Match when={searchQuery.status === 'error'}>
                <span>Error: {(searchQuery.error as Error).message}</span>
            </Match>
            <Match when={searchQuery.isSuccess}>
                <hr class="mt-4 mb-1 opacity-50" />
                <div class={`divide-y divide-dashed mx-2 md:mx-0 ${spaceY}`}>
                    <For each={results}>
                        {data =>
                            <SearchItem onClicked={onClicked} searchItem={data} />}
                    </For>
                </div>
            </Match>
        </Switch>
        <Dialog open={!!selectedItem()} onClose={() => setSelectedItem(undefined)}>
            {selectedItem() && <TorrentItemView onDownload={(item, dir) => onDownload(item, dir)} onClose={() => setSelectedItem(undefined)} searchItem={selectedItem()!} />}
        </Dialog>
    </form>
}

export default SearchView;

const sampleData = [
    {
        "added": "1709788801",
        "category": "208",
        "id": "74799069",
        "imdb": "tt0182576",
        "info_hash": "317A2567CBF5190AAB315CE6CC791D469F408346",
        "leechers": "980",
        "name": "Family Guy S22E10 1080p WEB h264-BAE",
        "num_files": "0",
        "seeders": "1566",
        "size": "548117358",
        "status": "vip",
        "username": "jajaja"
    },
    {
        "added": "1711590601",
        "category": "208",
        "id": "74943042",
        "imdb": "tt0182576",
        "info_hash": "3D671EC3D6EF86D50B1B8CAAB13E3A8A9DFD935E",
        "leechers": "741",
        "name": "Family Guy S22E13 1080p WEB H264-SuccessfulCrab",
        "num_files": "0",
        "seeders": "609",
        "size": "531291402",
        "status": "vip",
        "username": "jajaja"
    },
    {
        "added": "1711590601",
        "category": "208",
        "id": "74943042",
        "imdb": "tt0182576",
        "info_hash": "3D671EC3D6EF86D50B1B8CAAB13E3A8A9DFD935E",
        "leechers": "741",
        "name": "Family.Guy.S22E13.720p.WEB.x264.SuccessfulCrabsadfaeiea.asfkoeuiwelerelrelerere",
        "num_files": "0",
        "seeders": "609",
        "size": "531291402",
        "status": "vip",
        "username": "jajaja"
    }
];