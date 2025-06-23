import { Session } from "./session.model";

export type SearchResultItem = {
    added: string;
    category: string;
    id: string;
    imdb: string;
    infoHash: string;
    leechers: string;
    title: string;
    num_files: string;
    seeders: string;
    size: string;
    status: string;
    username: string;
}

export type ApiSearchResult = {
    response: SearchResultItem[];
}

export type SearchResultSessionItem = {
    item: SearchResultItem;
    meta: {
        badges: string[];
    },
    session?: Session['arguments']['torrents'][number];
}