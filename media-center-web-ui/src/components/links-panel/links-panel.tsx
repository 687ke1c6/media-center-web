import { createEffect, createSignal, ParentProps } from "solid-js";
import Link from "../link/Link";
import { ProwlarrIcon } from "../ux/prowlarr-icon";
import { RadarrIcon } from "../ux/radarr-icon";
import { getCommit, getEnv } from "../../services/api-service";
import { SonarrIcon } from "../ux/sonarr-icon";
import JellyfinIcon from "../ux/jellyfin-icon/jellyfin-icon";
import Divider from "../divider/divider";


// cached env and commit results
const envResult = getEnv();
const commitResult = getCommit();

const LinkBadge = (props: ParentProps<{ to: string }>) => {
    return (
        <Link newTab classNames="flex md:text-gray-500 md:dark:text-gray-400 hover:text-gray-700 dark:hover:text-white" to={props.to}>
            <div style={`box-shadow: var(--shadow-elevation-medium)`} class="p-4 w-40 rounded flex items-center justify-center bg-white dark:bg-gray-800">
                {props.children}
            </div>
        </Link>);
}

export const LinksPanel = (_props: ParentProps) => {
    const protocolAndHostWithoutPort = `${window.location.protocol}//${window.location.hostname}`.replace(/:$/, "");
    const [env, setEnv] = createSignal<Record<string, string>>({});
    const [commit, setCommit] = createSignal<Awaited<ReturnType<typeof getCommit>> | undefined>(undefined);

    envResult.then((env) => setEnv(env));
    commitResult.then((commit) => {
        setCommit(commit);
    });

    return (
        <div class="flex flex-col">
            <div class="flex flex-col md:flex-row gap-5 items-center justify-center flex w-full h-full">
                <LinkBadge to={`${protocolAndHostWithoutPort}:${env().JELLYFIN_PORT || 8096}`}>
                    <div class="flex items-center space-x-2">
                        <JellyfinIcon width={24} height={24} />
                        <span>Jellyfin</span>
                    </div>
                </LinkBadge>
                <LinkBadge to={`${protocolAndHostWithoutPort}:${env().SONARR_PORT || 8989}`}>
                    <div class="flex items-center space-x-2">
                        <SonarrIcon width={24} height={24} />
                        <span>Sonarr</span>
                    </div>
                </LinkBadge>
                <LinkBadge to={`${protocolAndHostWithoutPort}:${env().RADARR_PORT || 7878}`}>
                    <div class="flex items-center space-x-2">
                        <RadarrIcon width={24} height={24} />
                        <span>Radarr</span>
                    </div>
                </LinkBadge>
                <LinkBadge to={`${protocolAndHostWithoutPort}:${env().PROWLARR_PORT || 9696}`}>
                    <div class="flex items-center space-x-2">
                        <ProwlarrIcon width={24} height={24} />
                        <span>Prowlarr</span>
                    </div>
                </LinkBadge>
            </div>
            <Divider />
            {commit() &&
                <div class="text-center text-xs text-gray-500 dark:text-gray-400">
                    <span>Commit: {commit()!.commit} by {commit()!.author} on {new Date(commit()!.date).toLocaleDateString()}</span>
                    <br />
                    <span class="text-xs">Message: {commit()?.message}</span>
                </div>}
        </div>
    );
}