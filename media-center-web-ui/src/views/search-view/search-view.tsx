import { Match, Switch, createSignal, type JSX } from "solid-js";
import Button from "../../components/button/button";
import SearchBar from "../../components/search-bar/SearchBar";
import { postSearch, postTorrentAdd } from "../../services/api-service";
import { SearchResultItem } from "../../models/search.model";
import SearchResultsView from "../search-results/search-results-view";
import { createQuery } from "@tanstack/solid-query";

const SearchView = () => {
  const [input, setInput] = createSignal('');

  const searchQuery = createQuery<SearchResultItem[]>(() => ({
    queryKey: ['searchQuery', input()],
    enabled: false,
    queryFn: () => {
      // return postSearch(input())
      return Promise.resolve(sampleData)
    }
  }))
  
  const onDownload = async (item: SearchResultItem) => {
    const response = await postTorrentAdd(item);
    alert(`${item.name} downloading`)
  }

  const onSubmit: JSX.EventHandler<HTMLFormElement, SubmitEvent> = (e: Event) => {
    e.preventDefault();
    searchQuery.refetch();
  }

  return <form onSubmit={onSubmit}>
    <div class="flex gap-4 flex-col w-full items-center mt-4">
      <SearchBar placeHolder="search" onInput={e => setInput(e.currentTarget.value)} />
      {!searchQuery.isLoading ?
        <>
          {input().length &&
            <Button type='submit'>Search</Button>}
        </> :
        <span>...loading...</span>
      }
    </div>
    <Switch>
      <Match when={searchQuery.status === 'error'}>
        <span>Error: {(searchQuery.error as Error).message}</span>
      </Match>
      <Match when={searchQuery.data}>
        <hr class="mt-4 mb-1 opacity-50" />
        <SearchResultsView onDownload={onDownload} searchResults={searchQuery.data!} />
      </Match>
    </Switch>
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
  }  
];