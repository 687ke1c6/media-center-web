import { ParentProps, createEffect, lazy, onCleanup } from "solid-js";
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import { SocketProvider, useSocketConnectedContext } from "./providers/socket.provider";
import NavBar from "./components/nav-bar/NavBar";
import { Route, HashRouter } from "@solidjs/router";
import { TorrentsStreamInfoProvider, useTorrentsStreamInfoContext } from "./providers/torrents-stream-info-provider";

const SearchView = lazy(() => import("./views/search-view/search-view"));
const DownloadsView = lazy(() => import('./views/downloads-view/downloads-view'));
const UsefulLinksView = lazy(() => import('./views/services-view/services-view'));

const queryClient = new QueryClient();

const Root = (props: ParentProps) => {
    const infoObservable = useTorrentsStreamInfoContext();

    createEffect(() => {
        const sub = infoObservable.subscribe((info) => {
            document.title = info.downloads ? `(${info.downloads}) Downloader` : 'Downloader';
        });
        onCleanup(() => sub.unsubscribe());
    });
    return <div class="container m-auto px-4">
        <NavBar links={[
            { title: 'Home', path: '/' },
            { title: 'Downloads', path: '/downloads' },
            { title: 'Services', path: '/useful-links' }
        ]} />
        {props.children}
    </div>
}

const App = () => {
    const { connected } = useSocketConnectedContext();

    return <QueryClientProvider client={queryClient}>
        <SocketProvider>
            <TorrentsStreamInfoProvider>
                {!connected() &&
                    <div class="bg-red-500 h-2 items-center justify-center absolute top-0 left-0 w-full z-50" />}
                <HashRouter root={Root}>
                    <Route path='/' component={SearchView} />
                    <Route path={'/downloads'} component={DownloadsView} />
                    <Route path={'/useful-links'} component={UsefulLinksView} />
                </HashRouter>
            </TorrentsStreamInfoProvider>
        </SocketProvider>
    </QueryClientProvider>
}

export default App;