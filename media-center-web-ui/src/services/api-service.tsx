import { SearchResultItem } from '../models/search.model';
import {postJson} from './fetch-service';

export const postSearch = (searchTerm: string) =>
    postJson<SearchResultItem[]>('/api/search', {search_term: searchTerm});

export const postRemote = (data: any) =>
    postJson<any>('/api/remote', data);

export const postTorrentAdd = (data: SearchResultItem) =>
    postJson<any>('/api/torrent-add', data);