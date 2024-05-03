import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import NavBar from "./components/nav-bar/NavBar";
import SocketContext from "./contexts/socket-context";
import { Route, HashRouter } from "@solidjs/router";
import { ParentProps, lazy } from "solid-js";

const SearchView = lazy(() => import("./views/search-view/search-view"));
const DownloadsView = lazy(() => import('./views/downloads-view/downloads-view'));

const queryClient = new QueryClient();

const Root = (props: ParentProps) =>
    <>
        <NavBar appName="Downloader" links={[{ title: 'Home', path: '/' }, {title: 'Downloads', path: '/downloads'}]} />
        <div class="container m-auto">
            {props.children}
        </div>
    </>

const App = () =>
    <QueryClientProvider client={queryClient}>
        <SocketContext.Provider value={SocketContext.defaultValue}>
            <HashRouter root={Root}>
                <Route path='/' component={SearchView} />
                <Route path={'/downloads'} component={DownloadsView} />
            </HashRouter>
        </SocketContext.Provider>
    </QueryClientProvider>

export default App;