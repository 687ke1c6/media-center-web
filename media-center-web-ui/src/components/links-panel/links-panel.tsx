import { createEffect, ParentProps } from "solid-js";
import Link from "../link/Link";
import { ProwlarrIcon } from "../ux/prowlarr-icon";
import { RadarrIcon } from "../ux/radarr-icon";
import { getEnv } from "../../services/api-service";

export const LinksPanel = (props: ParentProps) => {
    createEffect(() => {
        // Fetch and display links dynamically if needed
        getEnv().then((env) => {
            console.log("Environment Variables:", env);
        });
    });
    return (
        <div class="flex gap-5 items-center justify-center flex w-full h-full">
            <Link classNames="flex gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white" to="/downloads">
                <ProwlarrIcon width={24} height={24} />
                <span>Prowlarr</span>
            </Link>
            <Link classNames="flex gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white" to="/downloads">
                <RadarrIcon width={24} height={24} />
                <span>Radarr</span>
            </Link>
        </div>
    );
}