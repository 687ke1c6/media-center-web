import Link from '../link/Link';
import { For, ParentProps, createEffect, createSignal } from 'solid-js';
import JellyfinIcon from '../ux/jellyfin-icon.tsx/jellyfin-icon';
import { MenuIcon } from '../ux/menu-icon/menu-icon';
import { getIpInfo } from '../../services/api-service';

type Props = {
    appName: string;
    links?: {
        title: string;
        path: string;
    }[]
}

const NavBar = (props: ParentProps<Props>) => {
    const [menuToggle, setMenuToggle] = createSignal(false);
    const [ipInfo, setIpInfo] = createSignal<Awaited<ReturnType<typeof getIpInfo>> | null>(null);
    createEffect(() => {
        getIpInfo().then((data) => {
            setIpInfo(data);
        }).catch((error) => {
            console.error('Error fetching IP info:', error);
        });
    })
    return (
        <nav class="flex flex-col md:items-center md:flex-row p-6 relative">
            <div>
                <Link classNames="flex items-center dark:text-white" to="/">
                    <JellyfinIcon width={30} />
                    <span class="font-semibold text-xl tracking-tight uppercase ms-2">{props.appName}</span>
                </Link>
            </div>

            {ipInfo() &&
                <a href={`https://ipinfo.io/${ipInfo()!.ip}`} 
                    target="_blank" 
                    class="md:absolute mt-2 md:mt-0 md:right-4 text-xs items-center w-auto text-sm text-gray-500 dark:text-gray-400">
                    <span >
                        <span>{ipInfo()!.city}, </span>
                        <span>({ipInfo()!.country})</span>
                        <span class="md:hidden"> - [ {ipInfo()!.ip} ]</span>
                    </span>
                </a>}

            <button class="md:hidden absolute mt-1 right-4" onClick={() => setMenuToggle(!menuToggle())}>
                <MenuIcon width={'1.5rem'} height={'1.5rem'} />
            </button>
            <div class="md:ml-6 md:flex-grow items-center w-auto md:block text-sm" classList={{ 'hidden': !menuToggle() }}>
                <For each={props.links}>
                    {(item, _index) =>
                        <Link classNames="md:inline-block block mt-2 md:mt-0 text-teal-700 hover:text-teal-500 dark:text-teal-200 dark:hover:text-white mr-4" to={item.path}>
                            {item.title}
                        </Link>}
                </For>
            </div>
        </nav>);
}

export default NavBar;