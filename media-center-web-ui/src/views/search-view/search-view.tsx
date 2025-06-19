import { Match, Switch, createSignal, onMount, onCleanup, type JSX, useContext, For } from "solid-js";
import { createStore } from 'solid-js/store';
import { postSearch, postTorrentAdd } from "../../services/api-service";
import { SearchResultSessionItem } from "../../models/search.model";
import { createQuery } from "@tanstack/solid-query";
import { spaceY } from "../../utils/tailwind.utils";
import Button from "../../components/button/button";
import SearchBar from "../../components/search-bar/SearchBar";
import Dialog from "../../components/dialog/dialog";
import TorrentItemView from "../torrent-item-view/torrent-item-view";
import {SocketContext} from "../../contexts/socket-context";
import SearchItem from "../../components/search-item/search-item";

const SearchView = () => {
  const { torrentsObservable, webSocket } = useContext(SocketContext);
  const [input, setInput] = createSignal('');
  const [selectedItem, setSelectedItem] = createSignal<SearchResultSessionItem>();
  const [results, setResults] = createStore<SearchResultSessionItem[]>([]);

  const searchQuery = createQuery(() => ({
    queryKey: ['searchQuery', input()],
    enabled: false,
    retry: false,
    queryFn: ({ signal }) =>
      postSearch(input(), { signal })
        .then(searchResults =>
          searchResults.response.map(searchResult => ({
            item: searchResult,
            meta: {
              badges: Object.entries({
                h264: searchResult.title.toLowerCase().includes('h264'),
                x264: searchResult.title.toLowerCase().includes('x264'),
                x265: searchResult.title.toLowerCase().includes('x265'),
                h265: searchResult.title.toLowerCase().includes('h265'),
                hvec: searchResult.title.toLowerCase().includes('hvec'),
                p1080: searchResult.title.toLowerCase().includes('1080p'),
                p720: searchResult.title.toLowerCase().includes('720p')
              }).filter(([, include]) => include)
                .map(([key]) => key),
              dirs: searchResults.dirs
            }
          }))
        )
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
    // const disposable = torrentsObservable.subscribe(session => {
    //   session.arguments.torrents.forEach(torrent => {
    //     setResults(
    //       result => torrent.hashString.toLowerCase() === result.item.infoHash.toLowerCase(),
    //       searchItem => ({
    //         ...searchItem,
    //         session: session.arguments.torrents.find(t => t.hashString.toLowerCase() === searchItem.item.infoHash.toLowerCase())
    //       }));
    //   });
    // });

    const ws = webSocket.subscribe(session => {
      session.arguments.torrents.forEach(torrent => {
        setResults(
          result => torrent.hashString.toLowerCase() === result.item.infoHash.toLowerCase(),
          searchItem => ({
            ...searchItem,
            session: session.arguments.torrents.find(t => t.hashString.toLowerCase() === searchItem.item.infoHash.toLowerCase())
          }));
      });
    });

    // webSocket.next('hello there')

    onCleanup(() => ws.unsubscribe());
    // onCleanup(() => disposable.unsubscribe());
  });

  const onClicked = async (searchItem: SearchResultSessionItem) => {
    setSelectedItem(searchItem);
  }

  const onSubmit: JSX.EventHandler<HTMLFormElement, SubmitEvent> = (e) => {
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
