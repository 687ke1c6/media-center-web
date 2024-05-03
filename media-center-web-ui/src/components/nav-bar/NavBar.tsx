import Link from '../link/Link';
import { For, ParentProps, createSignal } from 'solid-js';
import JellyfinIcon from '../ux/jellyfin-icon.tsx/jellyfin-icon';
import { MenuIcon } from '../ux/menu-icon/menu-icon';

type Props = {
    appName: string;
    links?: {
        title: string;
        path: string;
    }[]
}

const NavBar = (props: ParentProps<Props>) => {
    const [menuToggle, setMenuToggle] = createSignal(false);
    return (
        <nav class="flex flex-col md:items-center md:flex-row  p-6 relative">
            <Link classNames="flex items-center text-white" to="/">
                <JellyfinIcon width={30} />
                <span class="font-semibold text-xl tracking-tight uppercase ms-2">{props.appName}</span>
            </Link>

            <button class="md:hidden absolute mt-1 right-4" onClick={() => setMenuToggle(!menuToggle())}>
                <MenuIcon width={'1.5rem'} height={'1.5rem'} />
            </button>
            <div class="md:ml-6 md:flex-grow items-center w-auto md:block text-sm" classList={{ 'hidden': !menuToggle() }}>
                <For each={props.links}>
                    {(item, _index) =>
                        <Link classNames="md:inline-block block mt-2 md:mt-0 text-teal-200 hover:text-white mr-4" to={item.path}>
                            {item.title}
                        </Link>}
                </For>
            </div>
        </nav>);
}

export default NavBar;