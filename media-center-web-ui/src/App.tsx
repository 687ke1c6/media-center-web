import { ParentProps, createEffect, lazy, onCleanup } from "solid-js";
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import { SocketProvider, useSocketConnectedContext, useSocketContext } from "./contexts/socket-context";
import NavBar from "./components/nav-bar/NavBar";
import { Route, HashRouter } from "@solidjs/router";

const SearchView = lazy(() => import("./views/search-view/search-view"));
const DownloadsView = lazy(() => import('./views/downloads-view/downloads-view'));

const queryClient = new QueryClient();

const Root = (props: ParentProps) =>
    <>
        <NavBar appName="Downloader" links={[{ title: 'Home', path: '/' }, { title: 'Downloads', path: '/downloads' }]} />
        <div class="container m-auto">
            {props.children}
        </div>
    </>

const App = () => {
    const { connected } = useSocketConnectedContext();
    const { webSocket } = useSocketContext();

    // Subscribe to the WebSocket connection to ensure it is established
    createEffect(() => {
        const sub = webSocket.subscribe();
        onCleanup(() => sub.unsubscribe());
    });

    return <QueryClientProvider client={queryClient}>
        <SocketProvider>
            {!connected() &&
                <div class="bg-red-500 h-2 items-center justify-center absolute top-0 left-0 w-full z-50" />}
            <HashRouter root={Root}>
                <Route path='/' component={SearchView} />
                <Route path={'/downloads'} component={DownloadsView} />
            </HashRouter>
        </SocketProvider>
    </QueryClientProvider>
}

export default App;