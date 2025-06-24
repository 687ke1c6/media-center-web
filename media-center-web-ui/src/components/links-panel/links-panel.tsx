import { createEffect, createSignal, ParentProps } from "solid-js";
import Link from "../link/Link";
import { ProwlarrIcon } from "../ux/prowlarr-icon";
import { RadarrIcon } from "../ux/radarr-icon";
import { getEnv } from "../../services/api-service";
import { SonarrIcon } from "../ux/sonarr-icon";

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
    createEffect(() => {
        getEnv().then((env) => setEnv(env));
    });
    return (
        <div class="flex flex-col md:flex-row gap-5 items-center justify-center flex w-full h-full">
            {env().PROWLARR_IPV4 &&
                <LinkBadge to={`${protocolAndHostWithoutPort}:${env().PROWLARR_PORT || 9696}`}>
                    <ProwlarrIcon width={24} height={24} />
                    <span>Prowlarr</span>
                </LinkBadge>}
            {env().RADARR_IPV4 &&
                <LinkBadge to={`${protocolAndHostWithoutPort}:${env().RADARR_PORT || 7878}`}>
                    <RadarrIcon width={24} height={24} />
                    <span>Radarr</span>
                </LinkBadge>}
            {env().SONARR_IPV4 &&
                <LinkBadge to={`${protocolAndHostWithoutPort}:${env().SONARR_PORT || 8989}`}>
                    <SonarrIcon width={24} height={24} />
                    <span>Sonarr</span>
                </LinkBadge>}
        </div>
    );
}