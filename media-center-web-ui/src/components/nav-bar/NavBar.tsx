import Link from '../link/Link';
import { For, ParentProps, createSignal } from 'solid-js';

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
        <nav class="flex flex-col md:items-center md:flex-row bg-teal-500 p-6 relative">
            <Link classNames="flex items-center text-white" to="/">
                <svg class="fill-current h-8 w-8 mr-2" width="54" height="54" viewBox="0 0 54 54" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13.5 22.1c1.8-7.2 6.3-10.8 13.5-10.8 10.8 0 12.15 8.1 17.55 9.45 3.6.9 6.75-.45 9.45-4.05-1.8 7.2-6.3 10.8-13.5 10.8-10.8 0-12.15-8.1-17.55-9.45-3.6-.9-6.75.45-9.45 4.05zM0 38.3c1.8-7.2 6.3-10.8 13.5-10.8 10.8 0 12.15 8.1 17.55 9.45 3.6.9 6.75-.45 9.45-4.05-1.8 7.2-6.3 10.8-13.5 10.8-10.8 0-12.15-8.1-17.55-9.45-3.6-.9-6.75.45-9.45 4.05z" /></svg>
                <span class="font-semibold text-xl tracking-tight uppercase">{props.appName}</span>
            </Link>
            <button class="md:hidden absolute mt-1 right-4" onClick={() => setMenuToggle(!menuToggle())}>
                <span class="material-symbols-outlined">menu</span>
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