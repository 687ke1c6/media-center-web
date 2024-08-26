import { Session } from "./session.model";

export type SearchResultItem = {
    added: string;
    category: string;
    id: string;
    imdb: string;
    info_hash: string;
    leechers: string;
    name: string;
    num_files: string;
    seeders: string;
    size: string;
    status: string;
    username: string;
}

export type ApiSearchResult = {
    response: SearchResultItem[];
    dirs: string[];
}

export type SearchResultSessionItem = {
    item: SearchResultItem;
    meta: {
        badges: string[];
        dirs: string[];
    },
    session?: Session['arguments']['torrents'][number];
}