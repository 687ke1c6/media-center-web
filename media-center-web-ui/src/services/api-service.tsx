import { ApiSearchResult, SearchResultItem } from '../models/search.model';
import { Session } from '../models/session.model';
import {getJson, postJson, postJsonOnly} from './fetch-service';

export const postSearch = (searchTerm: string, init: Parameters<(typeof fetch)>[1] = {}) =>
    postJson<ApiSearchResult>('/api/search', init)({search_term: searchTerm});

export const postTorrentAdd = (data: SearchResultItem & {downloadDir: string}) =>
    postJsonOnly('/api/torrent-add', data);

export const postTorrentGet = () =>
    postJson<Session>('/api/torrent-get')({});

export const postTorrentRemove = (data: {ids: number[], remove: boolean}) =>
    postJsonOnly('/api/torrent-remove', data);

export const postTorrentInfo = (data: {id: string}) =>
    postJson('/api/torrent-info')(data);

type IpInfo = {
    ip: string;
    country: string;
    city: string;
    region: string; // e.g. "California"
    timezone: string; // e.g. "America/Los_Angeles",
    loc: string;
    org: string;
    postal: string; // e.g. "94043"
    readme: string; // e.g. "https://ipinfo.io/missingauth
};
export const getIpInfo = () =>
    getJson<IpInfo>('/api/ipinfo')
export const getEnv = () =>
    getJson<Record<string, string>>('/api/env');