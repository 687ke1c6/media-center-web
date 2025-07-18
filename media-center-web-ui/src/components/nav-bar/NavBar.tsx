import Link from '../link/Link';
import { For, ParentProps, createEffect, createSignal, onCleanup } from 'solid-js';
import JellyfinIcon from '../ux/jellyfin-icon/jellyfin-icon';
import { MenuIcon } from '../ux/menu-icon/menu-icon';
import { getIpInfo } from '../../services/api-service';
import { useTorrentsStreamInfoContext } from '../../providers/torrents-stream-info-provider';

type Props = {
    links?: {
        title: string;
        path: string;
    }[]
}

const NavBar = (props: ParentProps<Props>) => {
    const [menuToggle, setMenuToggle] = createSignal(false);
    const [numSeeding, setNumSeeding] = createSignal(0);
    const [numTotal, setNumTotal] = createSignal(0);
    const [numDownloads, setNumDownloads] = createSignal(0);
    const [ipInfo, setIpInfo] = createSignal<Awaited<ReturnType<typeof getIpInfo>> | null>(null);
    const infoObservable = useTorrentsStreamInfoContext();

    createEffect(() => {
        getIpInfo().then((data) => {
            setIpInfo(data);
        }).catch((error) => {
            console.error('Error fetching IP info:', error);
        });
        const infoSub = infoObservable.subscribe((info) => {
            setNumSeeding(info.seeding);
            setNumTotal(info.total);
            setNumDownloads(info.downloads);
        });
        onCleanup(() => infoSub.unsubscribe());
    })
    return (
        <nav class="flex flex-col md:items-center md:flex-row py-6 relative">
            <div>
                <Link classNames="flex items-center dark:text-white w-fit" to="/">
                    <JellyfinIcon width={30} />
                    <span class="font-semibold text-xl tracking-tight uppercase ms-2">Downloader</span>
                    <span class='text-sm ml-2'>[{numSeeding()}/{numTotal()}]</span>
                </Link>
            </div>

            {ipInfo() &&
                <a href={`https://ipinfo.io/${ipInfo()!.ip}`} 
                    target="_blank" 
                    class="md:absolute mt-2 md:mt-0 md:right-4 text-xs items-center w-auto text-sm text-gray-500 dark:text-gray-400 w-fit">
                    <span >
                        <span>{ipInfo()!.city}, </span>
                        <span>{ipInfo()!.country}</span>
                        <span class="md:hidden"> - [ {ipInfo()!.ip} ]</span>
                    </span>
                </a>}

            <button class="md:hidden absolute mt-1 right-4" onClick={() => setMenuToggle(!menuToggle())}>
                <MenuIcon width={'1.5rem'} height={'1.5rem'} />
            </button>
            <div class="md:ml-6 md:flex-grow items-center w-auto md:block text-sm" classList={{ 'hidden': !menuToggle() }}>
                <For each={props.links}>
                    {(item, _index) =>
                        <Link classNames="md:inline-block block mt-2 md:mt-0 text-teal-700 w-fit hover:text-teal-500 dark:text-teal-200 dark:hover:text-white mr-4" to={item.path}>
                            <span>{item.title}</span>
                            {item.title === 'Downloads' && numDownloads() > 0 && <span> ({numDownloads()})</span>}
                        </Link>}
                </For>
            </div>
        </nav>);
}

export default NavBar;